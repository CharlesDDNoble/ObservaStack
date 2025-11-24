import sys
import random
import logging
from asyncio import sleep
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Union

from config.observability import tracer
from config.settings import CONFIG

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

# --- Helper Functions ---

def fib(n: int) -> int:
    """Calculates the nth Fibonacci number."""
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# --- Routes ---

@router.get(
    "/status", 
    name="/status",
    summary="Status Check",
    description="Basic health check endpoint that returns server status."
)
async def get_status():
    return {"message": "The server is up and running."}

@router.get(
    "/delay/{delay}", 
    name="/delay",
    summary="Delayed Response",
    description="Returns a response after a configurable delay (1-10000ms)."
)
async def get_delay(delay: int):
    if delay > 10000 or delay < 1:
        raise HTTPException(status_code=400, detail="Invalid delay. Delay must be between 1-10000ms.")
    await sleep(delay / 1000.0)
    return {"message": f"The server waited {delay} ms."}

@router.get(
    "/code/{code}", 
    name="/code",
    summary="Status Code Response",
    description="Returns a response with a specific HTTP status code (100-599)."
)
async def get_code(code: int):
    if code > 599 or code < 100:
        raise HTTPException(status_code=400, detail="Invalid status code.")
    if code == 200:
        return {"message": "The server is up and running."}
    raise HTTPException(status_code=code, detail=f"The server returned a {code} error.")

@router.get(
    "/fib/{n}", 
    name="/fib",
    summary="Fibonacci Sequence",
    description="Returns the nth number in the Fibonacci sequence or its length for large n."
)
def get_fib(n: int):
    if n < 0 or n > 1000000:
        raise HTTPException(status_code=400, detail="Invalid input. n must be a non-negative integer.")
    
    result = None
    with tracer.start_as_current_span("calculate_fibonacci"):
        result = fib(n)

    if n > 20500:
        # Increase string conversion limit for large integers
        sys.set_int_max_str_digits(0) 
        return {"message": f"Fibonacci({n}) is {len(str(result))} digits long."}
        
    return {"message": f"Fibonacci({n}) is {result}."}


@router.get(
    "/complex", 
    name="/complex",
    summary="Complex Request",
    description="Endpoint with multiple simulated downstream calls to demonstrate distributed tracing."
)
async def get_complex():
    """Endpoint with multiple simulated downstream calls to demonstrate distributed tracing."""
    response: Dict[str, Union[str, List[str]]] = {
        "message": "",
        "user_id": "",
        "recommendations": [],
    }

    with tracer.start_as_current_span("process.user"):
        with tracer.start_as_current_span("authenticate"):
            await sleep(0.025 + random.uniform(0, 0.015))
            response["user_id"] = "user_12345"

        with tracer.start_as_current_span("db.client.statement") as span:
            span.set_attribute("db.system", "postgresql")
            span.set_attribute("db.name", "user_db")
            span.set_attribute("db.operation", "query")
            await sleep(0.030 + random.uniform(0, 0.03))
        
        with tracer.start_as_current_span("enrich"):
            await sleep(0.015 + random.uniform(0, 0.010))
    
    with tracer.start_as_current_span("process.recommendations"):
        with tracer.start_as_current_span("rpc.client") as span:
            span.set_attribute("rpc.service", "recommendations")
            await sleep(0.050 + random.uniform(0, 0.030))
        
        with tracer.start_as_current_span("parse"):
            await sleep(0.010 + random.uniform(0, 0.005))
            response["recommendations"] = ["item1", "item2", "item3"]

    with tracer.start_as_current_span("build.response"):
        response["message"] = "Successfully fetched complex data."
    
    return response

@router.get(
    "/config",
    name="/config",
    summary="Configuration Details",
    description="Returns the current application configuration."
)
async def get_config():
    return CONFIG