from prometheus_client import Counter, Histogram, Info
from fastapi import Request
from typing import Callable
import time

# Define metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

ERROR_COUNT = Counter(
    "error_total",
    "Total number of errors",
    ["type", "location"]
)

API_INFO = Info(
    "api_info",
    "Information about the API"
)
API_INFO.info({"version": "1.0.0"})

# Middleware for collecting metrics
async def metrics_middleware(request: Request, call_next: Callable):
    start_time = time.time()
    
    response = await call_next(request)
    
    # Record request duration
    duration = time.time() - start_time
    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    # Count requests
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    return response

def record_error(error_type: str, location: str) -> None:
    """Record an error occurrence."""
    ERROR_COUNT.labels(
        type=error_type,
        location=location
    ).inc()
