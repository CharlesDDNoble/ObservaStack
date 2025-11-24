#!/usr/bin/env python3
"""
ObservaStack Load Testing Runner

A cross-platform Python script to run Locust load tests with various configurations.
"""

import sys
import subprocess
import argparse
import time
import json
from pathlib import Path
import webbrowser
from typing import Dict, List, TypedDict, Any, Optional

class TestConfig(TypedDict, total=False):
    name: str
    description: str
    users: int
    spawn_rate: int
    run_time: str
    class_name: str
    distributed: bool
    workers: int
    host: Optional[str]
    requires_confirmation: bool

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

class LoadTestRunner:
    def __init__(self, host: str = "http://localhost"):
        self.base_dir = Path(__file__).parent
        self.results_dir = self.base_dir / "results"
        self.configs_dir = self.base_dir / "configs"
        self.locust_file = self.base_dir / "loadtest.py"
        self.default_host = host
        
        # Get Python executable path
        self.python_exe = sys.executable
        
        # Ensure directories exist
        self.results_dir.mkdir(exist_ok=True)
        self.configs_dir.mkdir(exist_ok=True)
        
        # Load test configurations from JSON files
        self.test_configs: Dict[str, TestConfig] = self._load_configs()

    def _load_configs(self) -> Dict[str, TestConfig]:
        """Load test configurations from JSON files in configs directory"""
        configs: Dict[str, TestConfig] = {}
        
        if not self.configs_dir.exists():
            print(f"{Colors.YELLOW}⚠ No configs directory found at {self.configs_dir}{Colors.END}")
            return configs
        
        # Load all .json files from configs directory
        for config_file in sorted(self.configs_dir.glob("*.json")):
            try:
                with open(config_file, 'r') as f:
                    config_data = json.load(f)
                    
                # Validate required fields
                required_fields = ["name", "description", "users", "spawn_rate", "run_time", "class_name"]
                missing_fields = [field for field in required_fields if field not in config_data]
                
                if missing_fields:
                    print(f"{Colors.YELLOW}⚠ Skipping {config_file.name}: missing fields {missing_fields}{Colors.END}")
                    continue
                
                # Use filename (without .json) as key
                config_key = config_file.stem
                configs[config_key] = config_data
                
            except json.JSONDecodeError as e:
                print(f"{Colors.RED}✗ Error parsing {config_file.name}: {e}{Colors.END}")
            except Exception as e:
                print(f"{Colors.RED}✗ Error loading {config_file.name}: {e}{Colors.END}")
        
        if not configs:
            print(f"{Colors.YELLOW}⚠ No valid test configurations found in {self.configs_dir}{Colors.END}")
        
        return configs

    def _get_host(self, config: TestConfig) -> str:
        """Get the host to use for a test (config overrides default)"""
        return config.get("host") or self.default_host

    def print_banner(self):
        """Print the application banner"""
        print(f"{Colors.CYAN}{Colors.BOLD}")
        print("ObservaStack Load Testing Suite")
        print("=" * 40)
        print(f"Default Host: {self.default_host}")
        print(f"Loaded {len(self.test_configs)} test configuration(s)")
        print(f"{Colors.END}")

    def check_prerequisites(self) -> bool:
        """Check if required files and dependencies exist"""
        issues: List[str] = []
        
        # Check if locust is installed
        try:
            result = subprocess.run([self.python_exe, "-m", "locust", "--version"], 
                                  capture_output=True, text=True, check=True)
            print(f"{Colors.GREEN}✓ Locust installed: {result.stdout.strip()}{Colors.END}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            issues.append("Locust is not installed. Run: pip install locust") # type: ignore
        
        # Check if loadtest.py exists
        if not self.locust_file.exists():
            issues.append(f"Locust file not found: {self.locust_file}") # type: ignore
        else:
            print(f"{Colors.GREEN}✓ Locust file found: {self.locust_file}{Colors.END}")
        
        # Check if configs directory exists and has configs
        if not self.configs_dir.exists() or not self.test_configs:
            issues.append(f"No test configurations found in {self.configs_dir}") # type: ignore
            print(f"{Colors.YELLOW}⚠ No test configurations loaded{Colors.END}")
        else:
            print(f"{Colors.GREEN}✓ Loaded {len(self.test_configs)} test configuration(s){Colors.END}")
        
        # Optional: Check if backend is accessible (non-blocking)
        try:
            import requests
            response = requests.get(f"{self.default_host}/hello", timeout=5)
            print(f"{Colors.GREEN}✓ Backend accessible at {self.default_host} (status: {response.status_code}){Colors.END}")
        except Exception:
            print(f"{Colors.YELLOW}⚠ Backend not accessible at {self.default_host} (this is OK if testing remotely){Colors.END}")
        
        if issues:
            print(f"{Colors.RED}Issues found:{Colors.END}")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        return True

    def show_menu(self):
        """Display the interactive menu"""
        print(f"\n{Colors.BOLD}Available Tests:{Colors.END}")
        
        for i, (_, config) in enumerate(self.test_configs.items(), 1):
            print(f"{Colors.CYAN}{i}. {config['name']}{Colors.END}")
            print(f"   {config['description']}")
        
        print(f"{Colors.CYAN}{len(self.test_configs) + 1}. Web UI Mode{Colors.END}")
        print("   Interactive web interface at http://localhost:8089")
        
        print(f"{Colors.CYAN}{len(self.test_configs) + 2}. Custom Test{Colors.END}")
        print("   Configure your own test parameters")
        
        print(f"{Colors.CYAN}{len(self.test_configs) + 3}. Exit{Colors.END}")

    def run_test(self, config: TestConfig, test_name: str, num_workers: Optional[int] = None):
        """Run a load test with distributed workers"""
        host = self._get_host(config)
        workers = num_workers or config.get("workers", 2)
        
        print(f"\n{Colors.YELLOW}Starting {config['name']}...{Colors.END}")
        print(f"Target: {host}")
        print(f"Users: {config['users']}, Spawn Rate: {config['spawn_rate']}, Duration: {config['run_time']}")
        print(f"Workers: {workers} (distributed load generation)")
        
        processes = []
        
        try:
            # Start master process (headless)
            master_cmd = [
                self.python_exe, "-m", "locust",
                "-f", str(self.locust_file),
                "-H", host,
                "--master",
                "--headless",
                "--expect-workers", str(workers),
                "--users", str(config['users']),
                "--spawn-rate", str(config['spawn_rate']),
                "--run-time", config['run_time'],
                "--csv", str(self.results_dir / test_name),
                "--html", str(self.results_dir / f"{test_name}.html")
            ]
            
            print(f"{Colors.BLUE}Starting master process...{Colors.END}")
            master = subprocess.Popen(master_cmd)
            processes.append(master)
            time.sleep(2)  # Give master time to start
            
            # Start worker processes
            for i in range(workers):
                worker_cmd = [
                    self.python_exe, "-m", "locust",
                    "-f", str(self.locust_file),
                    "-H", host,
                    "--worker"
                ]
                print(f"{Colors.BLUE}Starting worker {i+1}/{workers}...{Colors.END}")
                worker = subprocess.Popen(worker_cmd, 
                                         stdout=subprocess.DEVNULL,
                                         stderr=subprocess.DEVNULL)
                processes.append(worker)
                time.sleep(0.5)
            
            print(f"{Colors.GREEN}All workers started. Test running...{Colors.END}")
            
            # Wait for master to finish
            master.wait()
            
            print(f"\n{Colors.GREEN}✓ Test completed successfully!{Colors.END}")
            print(f"Results saved to: {self.results_dir}")
            
            # Open results in browser
            html_file = self.results_dir / f"{test_name}.html"
            if html_file.exists():
                try:
                    webbrowser.open(f"file://{html_file.absolute()}")
                    print(f"{Colors.GREEN}Results opened in browser{Colors.END}")
                except Exception:
                    print(f"Results HTML: {html_file}")
            
            return True
            
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Test interrupted by user{Colors.END}")
            return False
        finally:
            # Clean up all processes
            if processes:
                print(f"{Colors.YELLOW}Stopping all processes...{Colors.END}")
                for p in processes:
                    try:
                        p.terminate()
                        p.wait(timeout=5)
                    except Exception:
                        p.kill()

    def run_web_ui(self, num_workers: int = 2, host: Optional[str] = None):
        """Start the Locust web UI"""
        target_host = host or self.default_host
        
        print(f"\n{Colors.YELLOW}Starting Locust Web UI...{Colors.END}")
        print(f"{Colors.GREEN}Open http://localhost:8089 in your browser{Colors.END}")
        print(f"Default target: {target_host}")
        print(f"{Colors.CYAN}Workers: {num_workers} (distributed load generation){Colors.END}")
        
        processes = []
        
        try:
            # Start master with web UI
            master_cmd = [
                self.python_exe, "-m", "locust",
                "-f", str(self.locust_file),
                "--class-picker",
                "-H", target_host,
                "--master"
            ]
            
            print(f"{Colors.BLUE}Starting master process with web UI...{Colors.END}")
            master = subprocess.Popen(master_cmd)
            processes.append(master)
            time.sleep(2)  # Give master time to start
            
            # Start worker processes
            for i in range(num_workers):
                worker_cmd = [
                    self.python_exe, "-m", "locust",
                    "-f", str(self.locust_file),
                    "-H", target_host,
                    "--worker"
                ]
                print(f"{Colors.BLUE}Starting worker {i+1}/{num_workers}...{Colors.END}")
                worker = subprocess.Popen(worker_cmd,
                                        stdout=subprocess.DEVNULL,
                                        stderr=subprocess.DEVNULL)
                processes.append(worker)
                time.sleep(0.5)
            
            print(f"{Colors.GREEN}All workers started. Web UI ready at http://localhost:8089{Colors.END}")
            
            # Try to open browser
            try:
                webbrowser.open("http://localhost:8089")
            except Exception:
                pass
            
            # Wait for master to finish
            master.wait()
                
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Web UI stopped{Colors.END}")
        finally:
            # Clean up all processes
            print(f"{Colors.YELLOW}Stopping all processes...{Colors.END}")
            for p in processes:
                try:
                    p.terminate()
                    p.wait(timeout=5)
                except Exception:
                    p.kill()

    def interactive_mode(self):
        """Run the interactive menu system"""
        if not self.check_prerequisites():
            print(f"\n{Colors.RED}Please fix the issues above before running tests{Colors.END}")
            return
        
        while True:
            self.show_menu()
            
            try:
                choice = input(f"\n{Colors.BOLD}Enter choice: {Colors.END}").strip()
                
                if not choice:
                    continue
                
                choice_num = int(choice)
                config_keys = list(self.test_configs.keys())
                
                if 1 <= choice_num <= len(config_keys):
                    # Run predefined test
                    key = config_keys[choice_num - 1]
                    config = self.test_configs[key]
                    self.run_test(config, key, config.get("workers", 2))
                
                elif choice_num == len(config_keys) + 1:
                    # Web UI mode
                    num_workers = int(input(f"Number of worker processes (default 2): ") or "2")
                    self.run_web_ui(num_workers=num_workers)
                
                elif choice_num == len(config_keys) + 2:
                    # Exit
                    print(f"{Colors.GREEN}Goodbye!{Colors.END}")
                    break
                
                else:
                    print(f"{Colors.RED}Invalid choice{Colors.END}")
                    
            except (ValueError, KeyboardInterrupt):
                print(f"\n{Colors.YELLOW}Exiting...{Colors.END}")
                break

    def run_cli_test(self, test_name: str, num_workers: Optional[int] = None, host: Optional[str] = None, **kwargs: Any):
        """Run a test from command line arguments with optional overrides"""
        if test_name in self.test_configs:
            config = self.test_configs[test_name].copy()
            
            # Override with any provided kwargs (users, spawn_rate, run_time, etc.)
            for key, value in kwargs.items():
                if value is not None:
                    config[key] = value  # type: ignore
            
            # Override host if provided
            if host:
                config['host'] = host
            
            # Show what overrides were applied
            overrides = []
            if kwargs.get('users'):
                overrides.append(f"users={kwargs['users']}")
            if kwargs.get('spawn_rate'):
                overrides.append(f"spawn_rate={kwargs['spawn_rate']}")
            if kwargs.get('run_time'):
                overrides.append(f"run_time={kwargs['run_time']}")
            if host:
                overrides.append(f"host={host}")
            if num_workers:
                overrides.append(f"workers={num_workers}")
            
            if overrides:
                print(f"{Colors.YELLOW}Applying overrides: {', '.join(overrides)}{Colors.END}")
            
            return self.run_test(config, test_name, num_workers)
        else:
            print(f"{Colors.RED}Unknown test: {test_name}{Colors.END}")
            print(f"Available tests: {', '.join(self.test_configs.keys())}")
            return False

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="ObservaStack Load Testing Runner")
    parser.add_argument("--test", "-t", help="Run a specific test (name of config file without .json)")
    parser.add_argument("--config", "-c", help="Path to a custom config JSON file")
    parser.add_argument("--users", "-u", type=int, help="Number of users (overrides config)")
    parser.add_argument("--spawn-rate", "-s", type=int, help="Spawn rate (overrides config)")
    parser.add_argument("--run-time", "-r", help="Run time (overrides config, e.g. 60s, 5m)")
    parser.add_argument("--host", "-H", default="http://localhost", help="Target host URL (default: http://localhost)")
    parser.add_argument("--web-ui", "-w", action="store_true", help="Start web UI")
    parser.add_argument("--workers", type=int, default=2, help="Number of worker processes (default: 2)")
    parser.add_argument("--list", "-l", action="store_true", help="List available tests")
    
    args = parser.parse_args()
    runner = LoadTestRunner(host=args.host)
    
    runner.print_banner()
    
    if args.list:
        print("Available tests:")
        for key, config in runner.test_configs.items():
            workers = config.get("workers", 2)
            print(f"  {key}: {config['description']} (workers: {workers})")
        return
    
    if args.config:
        # Load custom config file
        try:
            with open(args.config, 'r') as f:
                config = json.load(f)
            test_name = Path(args.config).stem
            
            # Override with command-line args
            overrides = []
            if args.users:
                config['users'] = args.users
                overrides.append(f"users={args.users}")
            if args.spawn_rate:
                config['spawn_rate'] = args.spawn_rate
                overrides.append(f"spawn_rate={args.spawn_rate}")
            if args.run_time:
                config['run_time'] = args.run_time
                overrides.append(f"run_time={args.run_time}")
            if args.host and args.host != "http://localhost":
                config['host'] = args.host
                overrides.append(f"host={args.host}")
            if args.workers != 2:
                overrides.append(f"workers={args.workers}")
            
            if overrides:
                print(f"{Colors.YELLOW}Applying overrides: {', '.join(overrides)}{Colors.END}")
            
            success = runner.run_test(config, test_name, num_workers=args.workers)
            sys.exit(0 if success else 1)
        except FileNotFoundError:
            print(f"{Colors.RED}Config file not found: {args.config}{Colors.END}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"{Colors.RED}Invalid JSON in config file: {e}{Colors.END}")
            sys.exit(1)
    
    if args.web_ui:
        runner.run_web_ui(num_workers=args.workers, host=args.host)
        return
    
    if args.test:
        kwargs = {}
        if args.users:
            kwargs['users'] = args.users
        if args.spawn_rate:
            kwargs['spawn_rate'] = args.spawn_rate
        if args.run_time:
            kwargs['run_time'] = args.run_time
        
        # Pass host separately (can be from CLI or default)
        test_host = args.host if args.host != "http://localhost" else None
            
        success = runner.run_cli_test(args.test, num_workers=args.workers, host=test_host, **kwargs)
        sys.exit(0 if success else 1)
    
    # No arguments provided, run interactive mode
    runner.interactive_mode()

if __name__ == "__main__":
    main()