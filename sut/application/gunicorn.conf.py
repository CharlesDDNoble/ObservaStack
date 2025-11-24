"""
Gunicorn configuration for ObservaStack FastAPI API Server.
"""
import os
from typing import Any
from prometheus_client import multiprocess

PROMETHEUS_MULTIPROC_DIR = os.getenv("PROMETHEUS_MULTIPROC_DIR", "/tmp/prometheus_multiproc")
if not os.path.exists(PROMETHEUS_MULTIPROC_DIR):
    os.makedirs(PROMETHEUS_MULTIPROC_DIR)

def child_exit(_: Any, worker: Any) -> None:
    """Clean up metrics when worker process exits"""
    multiprocess.mark_process_dead(worker.pid)  # type: ignore[arg-type]

# Gunicorn configuration
bind = "0.0.0.0:80"

# Log configuration
# accesslog = "-" # Log to stdout
errorlog = "-"  # Log to stderr

# Worker configuration
worker_class = "uvicorn.workers.UvicornWorker"
workers = int(os.getenv("GUNICORN_WORKERS") or "5")  # Rule of thumb 
                                                     # (2 x CPU cores) + 1 for I/O bound work 
                                                     # (1 x CPU cores) + 1 for CPU-bound work
worker_connections = 1000    # Max concurrent connections per worker
backlog = 2000               # Listen queue size for pending connections
keepalive = 75               # Keep connections alive for 75s (exceeds nginx's 60s to prevent premature closure)
timeout = 120                # Worker timeout 
graceful_timeout = 10        # Graceful shutdown timeout
max_requests = 0             # Restart workers after this many requests to prevent memory leaks (0 = never)
# max_requests_jitter = 1000   # Add randomness to prevent all workers restarting simultaneously