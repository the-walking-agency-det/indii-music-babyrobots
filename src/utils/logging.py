import logging
import json
from datetime import datetime
from typing import Any, Dict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

# Configure structlog
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.PrintLoggerFactory(),
    wrapper_class=structlog.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = datetime.utcnow()
        
        # Extract request details
        request_details = {
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host,
            "user_agent": request.headers.get("user-agent"),
        }
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Calculate request duration
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Log successful request
            logger.info(
                "request_processed",
                status_code=response.status_code,
                duration=duration,
                **request_details
            )
            
            return response
            
        except Exception as e:
            # Calculate duration for failed requests
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Log error
            logger.error(
                "request_failed",
                error=str(e),
                duration=duration,
                **request_details
            )
            raise

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid4()))
        
        # Bind request context
        ctx = structlog.contextvars.bind_contextvars(
            request_id=request_id,
            user_id=request.headers.get("X-User-ID"),
        )
        
        response = await call_next(request)
        return response

def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    """Log an error with additional context."""
    error_details = {
        "error_type": type(error).__name__,
        "error_message": str(error),
    }
    if context:
        error_details.update(context)
    
    logger.error("application_error", **error_details)

def log_audit(action: str, user_id: str, resource_type: str, resource_id: str, details: Dict[str, Any] = None) -> None:
    """Log an audit event."""
    audit_data = {
        "action": action,
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": resource_id,
    }
    if details:
        audit_data["details"] = details
    
    logger.info("audit_event", **audit_data)
