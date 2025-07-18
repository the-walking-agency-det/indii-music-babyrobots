from prometheus_client import Counter, Histogram, Info, Gauge, Summary
from fastapi import Request
from typing import Callable
import time
import psutil
import os

# System metrics
SYSTEM_CPU_USAGE = Gauge(
    "system_cpu_usage_percent",
    "Current CPU usage percentage"
)

SYSTEM_MEMORY_USAGE = Gauge(
    "system_memory_usage_bytes",
    "Current memory usage in bytes",
    ["type"]
)

SYSTEM_DISK_USAGE = Gauge(
    "system_disk_usage_bytes",
    "Current disk usage in bytes",
    ["type", "mount_point"]
)

# API metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
)

REQUEST_SIZE = Summary(
    "http_request_size_bytes",
    "HTTP request size in bytes",
    ["method", "endpoint"]
)

ERROR_COUNT = Counter(
    "error_total",
    "Total number of errors",
    ["type", "location", "severity"]
)

ACTIVE_USERS = Gauge(
    "active_users",
    "Number of currently active users",
    ["user_type"]
)

API_INFO = Info(
    "api_info",
    "Information about the API"
)
API_INFO.info({
    "version": "1.0.0",
    "environment": os.getenv("ENVIRONMENT", "development"),
    "python_version": os.getenv("PYTHON_VERSION", "3.9")
})

def collect_system_metrics():
    """Collect and update system metrics"""
    try:
        # CPU metrics
        SYSTEM_CPU_USAGE.set(psutil.cpu_percent(interval=1))

        # Memory metrics
        mem = psutil.virtual_memory()
        SYSTEM_MEMORY_USAGE.labels(type="total").set(mem.total)
        SYSTEM_MEMORY_USAGE.labels(type="available").set(mem.available)
        SYSTEM_MEMORY_USAGE.labels(type="used").set(mem.used)

        # Disk metrics
        for partition in psutil.disk_partitions(all=False):
            if partition.fstype:
                usage = psutil.disk_usage(partition.mountpoint)
                SYSTEM_DISK_USAGE.labels(type="total", mount_point=partition.mountpoint).set(usage.total)
                SYSTEM_DISK_USAGE.labels(type="used", mount_point=partition.mountpoint).set(usage.used)
                SYSTEM_DISK_USAGE.labels(type="free", mount_point=partition.mountpoint).set(usage.free)
    except Exception as e:
        record_error("system_metrics_collection", "metrics.py", "error")

# Middleware for collecting metrics
async def metrics_middleware(request: Request, call_next: Callable):
    start_time = time.time()
    
    try:
        # Collect system metrics before processing request
        collect_system_metrics()
        
        # Record request size if content-length is available
        content_length = request.headers.get("content-length")
        if content_length:
            REQUEST_SIZE.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(float(content_length))
        
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
    except Exception as e:
        record_error("middleware_error", "metrics.py", "critical")
        raise e

def record_error(error_type: str, location: str, severity: str = "error") -> None:
    """Record an error occurrence with severity level"""
    ERROR_COUNT.labels(
        type=error_type,
        location=location,
        severity=severity
    ).inc()

def update_active_users(user_type: str, count: int):
    """Update the count of active users by type"""
    ACTIVE_USERS.labels(user_type=user_type).set(count)
