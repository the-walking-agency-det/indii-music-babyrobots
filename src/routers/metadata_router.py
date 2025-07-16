from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

from models.metadata import MusicMetadata
from models.user import UserResponse
from services.metadata_service import MetadataService
from services.track_service import TrackService
from utils.auth import get_current_active_user

router = APIRouter(prefix="/metadata", tags=["metadata"])

@router.get("/{track_id}", response_model=MusicMetadata)
async def get_track_metadata(
    track_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    track = await TrackService.get_track(track_id)
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track with ID {track_id} not found"
        )
    
    metadata = await MetadataService.extract_metadata(track.file_path)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract metadata from file"
        )
    
    return metadata

@router.put("/{track_id}", response_model=MusicMetadata)
async def update_track_metadata(
    track_id: str,
    metadata: MusicMetadata,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    track = await TrackService.get_track(track_id)
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track with ID {track_id} not found"
        )
    
    success = await MetadataService.update_metadata(track.file_path, metadata)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not update metadata"
        )
    
    return metadata
