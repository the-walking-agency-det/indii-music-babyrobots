from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Annotated
from uuid import UUID
from models.track import Track
from models.user import UserResponse
from services.track_service import TrackService
from utils.auth import get_current_active_user

router = APIRouter(prefix="/tracks", tags=["tracks"])

@router.post("/", response_model=Track, status_code=status.HTTP_201_CREATED)
async def create_track(
    track: Track,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    return await TrackService.create_track(track)

@router.get("/{track_id}", response_model=Track)
async def get_track(
    track_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    track = await TrackService.get_track(track_id)
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track with ID {track_id} not found"
        )
    return track

@router.get("/", response_model=List[Track])
async def list_tracks(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    return await TrackService.list_tracks()

@router.put("/{track_id}", response_model=Track)
async def update_track(
    track_id: UUID,
    track: Track,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    updated_track = await TrackService.update_track(track_id, track)
    if not updated_track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track with ID {track_id} not found"
        )
    return updated_track

@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_track(
    track_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    deleted = await TrackService.delete_track(track_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track with ID {track_id} not found"
        )
