import logging
from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="ControlAgent API",
    description="API for controlling and monitoring the System Under Test (SUT).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

@app.get(
    "/status", 
    name="/status",
    summary="Status Check",
    description="Basic health check endpoint that returns server status."
)
async def get_status():
    return {"message": "The server is up and running."}
