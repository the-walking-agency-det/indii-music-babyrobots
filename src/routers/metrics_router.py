from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.responses import PlainTextResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry, REGISTRY
from typing import Annotated
import secrets
import os

from src.models.user import UserResponse
from src.utils.auth import get_current_active_user

router = APIRouter(tags=["metrics"])
security = HTTPBasic()

def get_metrics_credentials(credentials: HTTPBasicCredentials = Security(security)):
    """Verify prometheus scraper credentials"""
    correct_username = os.getenv("PROMETHEUS_USERNAME", "prometheus")
    correct_password = os.getenv("PROMETHEUS_PASSWORD", "prometheus-password")
    
    is_correct_user = secrets.compare_digest(credentials.username, correct_username)
    is_correct_pass = secrets.compare_digest(credentials.password, correct_password)
    
    if not (is_correct_user and is_correct_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials

@router.get("/metrics", response_class=PlainTextResponse)
async def metrics(
    credentials: HTTPBasicCredentials = Security(get_metrics_credentials)
):
    """
    Get Prometheus metrics. This endpoint is protected with basic auth
    specifically for Prometheus scraping.
    """
    try:
        # Use default registry
        registry = REGISTRY
        metrics_data = generate_latest(registry)
        
        return PlainTextResponse(
            metrics_data,
            media_type=CONTENT_TYPE_LATEST,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating metrics: {str(e)}"
        )
