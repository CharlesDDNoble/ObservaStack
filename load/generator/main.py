from typing import Any, Dict, List

import asyncio
import json
import logging
import os
import signal
import subprocess
import sys
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path
import threading

import psutil
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Directories
STATE_DIR = Path("/mnt/state")
STATE_DIR.mkdir(exist_ok=True)
RESULTS_DIR = Path("/mnt/results")
RESULTS_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="Locust Manager API",
    description="Locust Manager API for running load for test scenarios.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Request model
class TestConfig(BaseModel):
    users: int
    spawn_rate: int
    run_time: str
    host: str = "http://sut-gateway"
    class_name: str = "BasicUser"
    workers: int = 1

# Helper functions
def parse_run_time(run_time_str: str) -> int:
    """Parse run_time string (e.g., '10m', '5h', '30s') to seconds."""
    try:
        unit = run_time_str[-1].lower()
        value = int(run_time_str[:-1])
        
        if unit == 's':
            return value
        elif unit == 'm':
            return value * 60
        elif unit == 'h':
            return value * 3600
        else:
            logger.warning(f"Unknown time unit: {unit}, defaulting to seconds")
            return int(run_time_str)
    except (ValueError, IndexError) as e:
        logger.error(f"Failed to parse run_time '{run_time_str}': {e}")
        return 300  # Default to 5 minutes

def delete_active_test() -> dict[str, bool]:
    """Delete the active test process if one is running."""
    result = {"found": False, "deleted": False}
    state_file = STATE_DIR / "state.json"
    if state_file.exists():
        try:
            old_state = json.loads(state_file.read_text())
            old_pids = old_state.get("pids", [old_state.get("pid")]) if old_state.get("pid") else []
            
            if old_pids:
                result["found"] = True
                for pid in old_pids:
                    if pid:
                        try:
                            os.kill(pid, signal.SIGTERM)
                            logger.info(f"Killed test process PID {pid}")
                        except ProcessLookupError:
                            logger.info(f"Test process PID {pid} already dead")
                
                state_file.unlink()
                logger.info("Removed state file.")
                result["deleted"] = True
        except Exception as e:
            logger.warning(f"Error cleaning up old test: {str(e)}")
    return result

async def check_test_state():
    """Background task that monitors active tests and cleans up expired ones."""
    wait_time = 5  # seconds
    while True:
        try:
            await asyncio.sleep(wait_time)
            
            state_file = STATE_DIR / "state.json"
            if not state_file.exists():
                continue
            
            try:
                state = json.loads(state_file.read_text())
                test_id = state.get("test_id")
                pid = state.get("pid")
                timestamp_str = state.get("timestamp")
                config = state.get("config", {})
                run_time_str = config.get("run_time", "5m")
                
                if not timestamp_str:
                    logger.warning(f"Test {test_id} has no timestamp, skipping validation")
                    continue
                
                # Parse timestamp and run_time
                start_time = datetime.fromisoformat(timestamp_str.rstrip('Z'))
                run_time_seconds = parse_run_time(run_time_str)
                expected_end_time = start_time + timedelta(seconds=run_time_seconds)
                current_time = datetime.utcnow()
                
                # Add 60 second grace period for cleanup
                grace_period = timedelta(seconds=60)
                
                if current_time > (expected_end_time + grace_period):
                    logger.info(f"Test {test_id} exceeded runtime ({run_time_str}), cleaning up")
                    logger.info(f"  Start: {start_time}, Expected End: {expected_end_time}, Current: {current_time}")
                    
                    # Use the shared delete function
                    delete_active_test()
                    
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse state file: {e}")
            except Exception as e:
                logger.error(f"Error checking test state: {e}")
                
        except Exception as e:
            logger.error(f"Error in state checker background task: {e}")

@app.on_event("startup")
async def startup_event():
    """Start background tasks on application startup."""
    asyncio.create_task(check_test_state())
    logger.info("Started background state checker task")

# Asynchronous handlers

@app.get(
    "/status", 
    name="/status",
    summary="Status Check",
    description="Basic health check endpoint that returns server status."
)
async def get_status():
    return {"message": "The server is up and running."}

@app.get(
    "/processes",
    name="/processes",
    summary="List Locust Processes",
    description="List all running Locust processes to detect zombies or orphaned tests."
)
async def get_processes() -> Dict[str, Any]:
    """List all running Locust processes."""
    try:
        processes: List[Dict[str, Any]] = []
        
        # Iterate through all processes and find Locust ones
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'status', 'cpu_percent', 'memory_percent', 'create_time']):
            try:
                cmdline = proc.info.get('cmdline') or []
                cmdline_str = ' '.join(cmdline)
                
                # Check if this is a Locust process
                if 'locust' in cmdline_str.lower():
                    # Get process status
                    status = proc.info.get('status', 'unknown')
                    is_zombie = (status == psutil.STATUS_ZOMBIE)
                    
                    # Calculate runtime
                    create_time = proc.info.get('create_time', 0)
                    runtime_seconds = time.time() - create_time if create_time else 0
                    
                    processes.append({
                        "pid": proc.info['pid'],
                        "name": proc.info.get('name', 'unknown'),
                        "status": status,
                        "cpu_percent": round(proc.info.get('cpu_percent', 0.0), 2),
                        "memory_percent": round(proc.info.get('memory_percent', 0.0), 2),
                        "runtime_seconds": int(runtime_seconds),
                        "command": cmdline_str[:200],  # Truncate long commands
                        "is_zombie": is_zombie
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                # Process disappeared or we don't have access
                continue
        
        # Get state file info for comparison
        state_file = STATE_DIR / "state.json"
        state_pids = []
        state_test_id = None
        
        if state_file.exists():
            try:
                state = json.loads(state_file.read_text())
                # Support both old (single pid) and new (pids array) format
                state_pids = state.get("pids", [state.get("pid")]) if state.get("pid") else []
                state_test_id = state.get("test_id")
            except Exception:
                pass
        
        # Mark processes as orphaned if they don't match state
        for proc in processes:
            proc["is_tracked"] = (proc["pid"] in state_pids)
        
        return {
            "total_processes": len(processes),
            "tracked_pids": state_pids,
            "tracked_test_id": state_test_id,
            "processes": processes
        }
        
    except Exception as e:
        logger.error(f"Error querying processes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Synchronous handlers

@app.post(
    "/test", 
    name="/test",
    summary="Run Load Test",
    description="Run a load test with the specified configuration."
)
def post_test(config: TestConfig) -> dict[str, str | int]:
    """Spawn Locust and store state to volume"""
    test_id = str(uuid.uuid4())
    state_file = STATE_DIR / f"state.json"
    
    # Validate and ensure host is set
    host = config.host or "http://sut-gateway/"
    
    # There's a race condition here between deleting the old state, 
    # spawning a worker, and writing the new state. It's minimal, 
    # accept it that for now. The state checker function will clean it up.
    try:
        # Delete any active test before starting new one
        _ = delete_active_test()
        
        # Build Locust command
        locust_cmd = [
            sys.executable, "-m", "locust",
            "-f", "/mnt/locust/loadtest.py",
            "--headless",
            "-H", host,
            "--users", str(config.users),
            "--spawn-rate", str(config.spawn_rate),
            "--run-time", config.run_time,
            "--csv", f"/mnt/results/{test_id}",
            "--html", f"/mnt/results/{test_id}.html"
        ]
        
        processes = []
        
        # Handle distributed mode if workers > 1
        if config.workers > 1:
            # Start master process
            master_cmd = locust_cmd + ["--master", "--expect-workers", str(config.workers)]
            logger.info(f"Starting Locust MASTER: {' '.join(master_cmd)}")
            
            master_process = subprocess.Popen(
                master_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            processes.append(("master", master_process))
            
            # Give master time to start
            time.sleep(2)
            
            # Start worker processes
            for i in range(config.workers):
                worker_cmd = [
                    sys.executable, "-m", "locust",
                    "-f", "/mnt/locust/loadtest.py",
                    "--worker",
                    "--master-host", "localhost"
                ]
                logger.info(f"Starting Locust WORKER {i+1}: {' '.join(worker_cmd)}")
                
                worker_process = subprocess.Popen(
                    worker_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1
                )
                processes.append((f"worker-{i+1}", worker_process))
            
            # Use master as the main process for tracking
            process = master_process
        else:
            # Single process mode
            logger.info(f"Starting Locust SINGLE: {' '.join(locust_cmd)}")
            process = subprocess.Popen(
                locust_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            processes.append(("single", process))
        
        # Log subprocess output in background (non-blocking) for all processes
        def log_subprocess_output(proc_name, proc):
            try:
                for line in iter(proc.stdout.readline, ''):
                    if line:
                        logger.info(f"[Locust {test_id} {proc_name}] {line.rstrip()}")
            except Exception as e:
                logger.error(f"Error reading subprocess output from {proc_name}: {e}")
        
        for proc_name, proc in processes:
            output_thread = threading.Thread(
                target=log_subprocess_output, 
                args=(proc_name, proc),
                daemon=True
            )
            output_thread.start()

        # Write state (config + PIDs) to volume
        all_pids = [p.pid for _, p in processes]
        state_file.write_text(json.dumps({
            "test_id": test_id,
            "pid": process.pid,  # Master or single process
            "pids": all_pids,  # All processes (master + workers or just single)
            "config": config.model_dump(),
            "status": "running",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }))
        
        logger.info(f"Started test {test_id} with PIDs {all_pids}")
        
        return {
            "test_id": test_id,
            "pid": process.pid,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error starting test: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test", name="/test")
def get_test() -> dict[str, Any]:
    """Get active test config from volume."""
    state_file = STATE_DIR / f"state.json"
    
    if not state_file.exists():
        raise HTTPException(status_code=404, detail="Test not found")
    
    return json.loads(state_file.read_text())

@app.delete("/test", name="/test")
def delete_test():
    """Delete the active test and its state if it exists."""
    result = {"found": False, "deleted": False}
    try:
        result = delete_active_test()
    except Exception as e:
        logger.error(f"Error deleting test: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    return {"result": result}

@app.get("/results", name="/results")
def get_results() -> dict[str, Any]:
    """Get the latest test results (CSV summary)."""
    try:
        # Find the most recent stats CSV file (with underscore prefix)
        csv_files = list(RESULTS_DIR.glob("*_stats.csv"))
        
        if not csv_files:
            raise HTTPException(status_code=404, detail="No test results found")
        
        # Get the most recent file
        latest_csv = max(csv_files, key=lambda p: p.stat().st_mtime)
        test_id = latest_csv.stem.replace("_stats", "")
        
        # Read the CSV file
        stats_content = latest_csv.read_text()
        lines = stats_content.strip().split('\n')
        
        # Parse CSV into list of dicts
        if len(lines) < 2:
            raise HTTPException(status_code=400, detail="Invalid results file")
        
        headers = lines[0].split(',')
        results = []
        
        for line in lines[1:]:
            values = line.split(',')
            if len(values) == len(headers):
                result_dict = dict(zip(headers, values))
                results.append(result_dict)
        
        return {
            "test_id": test_id,
            "file_path": str(latest_csv),
            "stats": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{test_id}", name="/results-by-id")
def get_results_by_id(test_id: str) -> dict[str, Any]:
    """Get test results for a specific test ID."""
    try:
        csv_file = RESULTS_DIR / f"{test_id}_stats.csv"
        
        if not csv_file.exists():
            raise HTTPException(status_code=404, detail=f"No results found for test {test_id}")
        
        # Read the CSV file
        stats_content = csv_file.read_text()
        lines = stats_content.strip().split('\n')
        
        # Parse CSV into list of dicts
        if len(lines) < 2:
            raise HTTPException(status_code=400, detail="Invalid results file")
        
        headers = lines[0].split(',')
        results = []
        
        for line in lines[1:]:
            values = line.split(',')
            if len(values) == len(headers):
                result_dict = dict(zip(headers, values))
                results.append(result_dict)
        
        # Check if HTML report exists
        html_file = RESULTS_DIR / f"{test_id}.html"
        html_available = html_file.exists()
        
        return {
            "test_id": test_id,
            "file_path": str(csv_file),
            "html_available": html_available,
            "html_path": str(html_file) if html_available else None,
            "stats": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading results for {test_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))