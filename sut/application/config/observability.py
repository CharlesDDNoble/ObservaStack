import os
from fastapi import Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest, CollectorRegistry, multiprocess, Histogram
from opentelemetry import trace
from opentelemetry.trace import Tracer
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased
import pyroscope

# Histogram for request duration with endpoint, method, and status_code labels
REQUEST_DURATION = Histogram(
    'http_request_duration_ms',
    'HTTP request duration in milliseconds',
    ['endpoint', 'method', 'status_code'],
    buckets=[0] + [x * 10 for x in range(1, 10)] + [x * 100 for x in range(1, 11)] + [1000 + x * 250 for x in range(1, 41)] + [float('inf')]
)

async def get_metrics() -> Response:
    """Multiprocess-compatible metrics endpoint for Prometheus."""
    registry = get_multiprocess_registry()
    data = generate_latest(registry)
    # Using Response from FastAPI is correct for route handler
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

def get_multiprocess_registry() -> CollectorRegistry:
    """Creates and configures a Prometheus registry for multiprocess."""
    registry = CollectorRegistry()
    # Correctly collecting metrics from all processes
    multiprocess.MultiProcessCollector(registry)
    return registry

# --- OpenTelemetry Configuration ---
def configure_opentelemetry() -> Tracer:
    """Configures and returns the global tracer for OpenTelemetry."""
    # Configure OTLP exporter to send to Tempo
    otlp_exporter = OTLPSpanExporter(
        endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://tempo:4317"),
        insecure=True 
    )

    # Configure OpenTelemetry
    span_processor = BatchSpanProcessor(otlp_exporter)
    sampling_rate = float(os.getenv("OTEL_TRACING_SAMPLING_RATE", 1.0))
    sampler = TraceIdRatioBased(sampling_rate) 
    
    resource = Resource.create({"service.name": "observastack-backend"})
    provider = TracerProvider(
        resource=resource, 
        sampler=sampler
    )
    provider.add_span_processor(span_processor)
    trace.set_tracer_provider(provider)
    
    return trace.get_tracer(__name__)

# Global Tracer
tracer: Tracer = configure_opentelemetry()

# --- Pyroscope Configuration ---
def configure_pyroscope():
    """Configures the Pyroscope continuous profiling client."""
    pyroscope.configure(
        application_name="observastack-backend",
        server_address=os.getenv("PYROSCOPE_SERVER_ADDRESS", "http://pyroscope:4040"),
        tags={
            "env": os.getenv("APP_ENV", "production"),
        },
    )

# Run Pyroscope configuration on module load
configure_pyroscope()

__all__ = ["REQUEST_DURATION", "tracer", "get_multiprocess_registry", "get_metrics"] 