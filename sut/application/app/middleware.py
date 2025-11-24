import time
import logging
from typing import Callable, Awaitable
from fastapi import Request
from fastapi.responses import Response
from config.observability import REQUEST_DURATION, tracer

# Set up logging for this file
logger = logging.getLogger(__name__)

async def metrics_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    """
    Middleware for Prometheus metrics and OpenTelemetry tracing.
    
    1. Traces the request with OpenTelemetry.
    2. Records the request duration in Prometheus.
    """
    start_time = time.perf_counter()
    method = request.method
    status_code = 500
    endpoint = "Unknown" # Default

    # Start OpenTelemetry Tracing
    with tracer.start_as_current_span(f"http.server.request") as span:
        span.set_attribute("http.method", method)
        span.set_attribute("http.url", str(request.url))

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = getattr(e, 'status_code', 500)
            logger.error(f"Exception in processing request at endpoint {request.url.path}: {e}")
            raise e
        finally:
            # Route is set only after routing is done (after call_next), so we get the endpoint here
            route = request.scope.get("route")
            if route and hasattr(route, 'name'):
                endpoint = route.name
            
            # Set trace attributes based on final state
            span.set_attribute("http.route", endpoint)
            span.set_attribute("http.status_code", status_code)
            
            # Record Metrics
            duration_ms = (time.perf_counter() - start_time) * 1000
            REQUEST_DURATION.labels(
                endpoint=endpoint,
                method=method,
                status_code=str(status_code)
            ).observe(duration_ms)

    return response
