import logging
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request model
class TestConfig(BaseModel):
    users: int
    spawn_rate: int
    run_time: str
    host: str = "http://sut-gateway"
    class_name: str = "BasicUser"
    workers: int = 1

app = FastAPI(
    title="TestOrchestrator API",
    description="API for triggering test scenarios.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

http_client = httpx.AsyncClient(timeout=30.0)

@app.get(
    "/status", 
    name="/status",
    summary="Status Check",
    description="Basic health check endpoint that returns server status."
)
async def get_status():
    return {"message": "The server is up and running."}


@app.get(
    "/control/status", 
    name="/control/status",
    summary="Control Status Check",
    description="Basic health check endpoint that returns server status."
)
async def get_control_status() -> dict[str, str | int]:
    try:
        response: httpx.Response = await http_client.get(
            "http://secure-gateway/control/status",
        )
        response.raise_for_status()
        return {
            "status": response.status_code,
            "message": response.json().get("message", "")
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"/control/status request failed: {str(e)}")

@app.get(
    "/load/status", 
    name="/load/status",
    summary="Load Status Check",
    description="Basic health check endpoint that returns server status."
)
async def get_load_status() -> dict[str, str | int]:
    try:
        response: httpx.Response = await http_client.get(
            "http://load-generator/status",
        )
        response.raise_for_status()
        return {
            "status": response.status_code,
            "message": response.json().get("message", "")
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"/load/status request failed: {str(e)}")

@app.post(
    "/load/test", 
    name="/load/test",
    summary="Start Load Test",
    description="Start a load test with the specified configuration."
)
async def post_load_test(config: TestConfig) -> dict[str, str | int]:
    """Forward test config to load-generator"""
    try:
        response: httpx.Response = await http_client.post(
            "http://load-generator/test",
            json=config.model_dump()
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Error forwarding /load/test request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"/load/test request failed: {str(e)}")