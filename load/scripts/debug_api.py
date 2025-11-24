#!/usr/bin/env python3
"""
Debug script for querying the Locust Manager API.

Usage:
    python debug_api.py status
    python debug_api.py start --users 100 --spawn-rate 10 --run-time 5m
    python debug_api.py get
    python debug_api.py stop
"""

import argparse
import json
import sys

import requests


# API base URL
API_BASE_URL = "http://localhost:8080"  # Load generator via Docker port mapping
# Or direct container hostname from within Docker network:
# API_BASE_URL = "http://load-generator"


def print_response(response: requests.Response, title: str = "Response") -> None:
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except requests.exceptions.JSONDecodeError:
        print(f"Raw: {response.text}")
    print()


def status() -> None:
    """Check load generator health."""
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=5)
        print_response(response, "Load Generator Status")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        sys.exit(1)


def processes() -> None:
    """List all running Locust processes."""
    try:
        response = requests.get(f"{API_BASE_URL}/processes", timeout=5)
        print_response(response, "Running Locust Processes")
        
        if response.status_code == 200:
            data = response.json()
            total = data.get("total_processes", 0)
            tracked_pids = data.get("tracked_pids", [])
            processes_list = data.get("processes", [])
            
            print(f"Total Locust processes: {total}")
            print(f"Tracked PIDs: {tracked_pids or 'None'}\n")
            
            if processes_list:
                print("Process Details:")
                for proc in processes_list:
                    status_flags = []
                    if proc.get("is_tracked"):
                        status_flags.append("TRACKED")
                    else:
                        status_flags.append("ORPHANED")
                    if proc.get("is_zombie"):
                        status_flags.append("ZOMBIE")
                    
                    status_str = " | ".join(status_flags)
                    runtime_min = proc.get('runtime_seconds', 0) // 60
                    
                    print(f"  PID {proc['pid']}: [{status_str}]")
                    print(f"    Status: {proc.get('status', 'unknown')} | CPU: {proc.get('cpu_percent', 0)}% | MEM: {proc.get('memory_percent', 0)}%")
                    print(f"    Runtime: {runtime_min} min | Name: {proc.get('name', 'unknown')}")
                    print(f"    Command: {proc.get('command', 'N/A')}")
                    print()
            else:
                print("✓ No Locust processes found")
                
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        sys.exit(1)


def start(
    users: int = 50,
    spawn_rate: int = 10,
    run_time: str = "5m",
    host: str = "http://sut-gateway/",
    class_name: str = "BasicUser",
    workers: int = 1,
) -> None:
    """Start a load test."""
    payload = {
        "users": users,
        "spawn_rate": spawn_rate,
        "run_time": run_time,
        "host": host,
        "class_name": class_name,
        "workers": workers,
    }
    
    print(f"Starting load test with config:")
    print(json.dumps(payload, indent=2))
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/test",
            json=payload,
            timeout=10,
        )
        print_response(response, "Test Started")
        
        if response.status_code == 200:
            data = response.json()
            test_id = data.get("test_id")
            pid = data.get("pid")
            print(f"✓ Test ID: {test_id}")
            print(f"✓ PID: {pid}")
        else:
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        sys.exit(1)


def get() -> None:
    """Get active test config."""
    try:
        response = requests.get(f"{API_BASE_URL}/test", timeout=5)
        
        if response.status_code == 404:
            print("No active test running")
            return
        
        print_response(response, "Active Test")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        sys.exit(1)


def stop() -> None:
    """Stop active test."""
    print("Stopping active test...")
    
    try:
        response = requests.delete(f"{API_BASE_URL}/test", timeout=5)
        print_response(response, "Test Stopped")
        
        if response.status_code == 200:
            data = response.json()
            result = data.get("result", {})
            
            if result.get("found"):
                print(f"✓ Found and killed test process")
            if result.get("deleted"):
                print(f"✓ Removed state file")
            if not result.get("found"):
                print(f"ℹ No active test was running")
        else:
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        sys.exit(1)


def results(test_id: str | None = None) -> None:
    """Get test results."""
    try:
        if test_id:
            url = f"{API_BASE_URL}/results/{test_id}"
            title = f"Results for Test {test_id}"
        else:
            url = f"{API_BASE_URL}/results"
            title = "Latest Test Results"
        
        response = requests.get(url, timeout=5)
        print_response(response, title)
        
        if response.status_code == 200:
            data = response.json()
            test_id = data.get("test_id")
            stats = data.get("stats", [])
            
            print(f"Test ID: {test_id}")
            print(f"Stats entries: {len(stats)}\n")
            
            if stats:
                # Print summary stats (look for "Aggregated" or "Total")
                print("Summary:")
                for stat in stats:
                    if stat.get("Name") in ["Aggregated", "Total"]:
                        request_count = stat.get('Request Count', 'N/A')
                        failures = stat.get('Failure Count', 'N/A')
                        median = stat.get('Median Response Time', 'N/A')
                        p95 = stat.get('95%', 'N/A')
                        
                        print(f"  Total Requests: {request_count}")
                        print(f"  Failures: {failures}")
                        print(f"  Median Response Time: {median}ms")
                        print(f"  95th Percentile: {p95}ms")
                        
                        # Show warning if no data yet
                        if request_count == "0":
                            print(f"\n  ⚠ Test just started - no data collected yet")
                        break
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        sys.exit(1)


def main() -> None:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Debug script for Locust Manager API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python debug_api.py status
  python debug_api.py processes
  python debug_api.py start --users 100 --spawn-rate 10 --run-time 5m
  python debug_api.py start --users 500 --spawn-rate 20 --run-time 10m --workers 4
  python debug_api.py get
  python debug_api.py results
  python debug_api.py results --test-id 12345678-1234-1234-1234-123456789abc
  python debug_api.py stop
        """,
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Status command
    subparsers.add_parser("status", help="Check load generator health")
    
    # Processes command
    subparsers.add_parser("processes", help="List running Locust processes (check for zombies)")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start a load test")
    start_parser.add_argument("--users", type=int, default=50, help="Number of users (default: 50)")
    start_parser.add_argument("--spawn-rate", type=int, default=10, help="Spawn rate (default: 10)")
    start_parser.add_argument("--run-time", type=str, default="5m", help="Run time (default: 5m)")
    start_parser.add_argument("--host", type=str, default="http://sut-gateway", help="Target host")
    start_parser.add_argument("--class-name", type=str, default="BasicUser", help="Locust user class")
    start_parser.add_argument("--workers", type=int, default=1, help="Number of workers for distributed mode")
    
    # Get command
    subparsers.add_parser("get", help="Get active test config")
    
    # Stop command
    subparsers.add_parser("stop", help="Stop active test")
    
    # Results command
    results_parser = subparsers.add_parser("results", help="Get test results")
    results_parser.add_argument("--test-id", type=str, default=None, help="Specific test ID (optional, shows latest if omitted)")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(0)
    
    if args.command == "status":
        status()
    elif args.command == "processes":
        processes()
    elif args.command == "start":
        start(
            users=args.users,
            spawn_rate=args.spawn_rate,
            run_time=args.run_time,
            host=args.host,
            class_name=args.class_name,
            workers=args.workers,
        )
    elif args.command == "get":
        get()
    elif args.command == "stop":
        stop()
    elif args.command == "results":
        results(args.test_id)


if __name__ == "__main__":
    main()
