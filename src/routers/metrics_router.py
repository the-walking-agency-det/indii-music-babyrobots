from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from typing import Annotated

from models.user import UserResponse
from utils.auth import get_current_active_user

router = APIRouter(tags=["metrics"])

@router.get("/metrics", response_class=PlainTextResponse)
async def metrics(current_user: Annotated[UserResponse, Depends(get_current_active_user)]):
    """
    Get Prometheus metrics. This endpoint is protected and requires authentication
    to prevent unauthorized access to system metrics.
    """
    return PlainTextResponse(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )
