from asyncio import sleep
from fastapi import FastAPI, HTTPException
import logging
from prometheus_fastapi_instrumentator import Instrumentator, metrics
from contextlib import asynccontextmanager

instrumentator = Instrumentator()
instrumentator.add(
    metrics.latency(  # type: ignore
        buckets=(0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 20.0, 30.0, 60.0, float("inf"))
    )
)
instrumentator.add(metrics.requests()) # type: ignore

@asynccontextmanager
async def lifespan(app: FastAPI):
    instrumentator.expose(app)
    yield

app = FastAPI(lifespan=lifespan)
instrumentator.instrument(app)

@app.get("/hello")
async def get_hello():
    logging.info("/hello endpoint called.")
    return {"message": "Hello from Python!"}

@app.get("/hello/delay/short")
async def get_hello_delay_short():
    logging.info("/hello/delay/short endpoint called.")
    await sleep(1)
    return {"message": "Hello from Python!"}

@app.get("/hello/delay/long")
async def get_hello_delay_long():
    logging.info("/hello/delay/long endpoint called.")
    await sleep(5)
    return {"message": "Hello from Python!"}

@app.get("/hello/error/client")
async def get_hello_error_client():
    logging.info("/hello/error/client endpoint called.")
    raise HTTPException(status_code=404, detail="Hello not found!")

@app.get("/hello/error/server")
async def get_hello_error_server():
    logging.info("/hello/error/server endpoint called.")
    raise HTTPException(status_code=500, detail="Server unavailable!")