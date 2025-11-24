import logging
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from app.routes import router
from app.middleware import metrics_middleware
from config.observability import get_metrics

# Set up base logging
logging.basicConfig(level=logging.INFO)

def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""
    
    app = FastAPI(
        title="ObservaStack API",
        description="API for testing observability features with configurable endpoints",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # Add Middleware
    app.middleware("http")(metrics_middleware)

    # Instrument FastAPI with OpenTelemetry
    FastAPIInstrumentor.instrument_app(app) # type: ignore[reportUnknownMemberType]

    # Include Routes
    app.include_router(router)

    # Add the /metrics endpoint manually (outside of the main router)
    app.add_api_route("/metrics", get_metrics, name="/metrics")

    return app