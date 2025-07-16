from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Annotated
from uuid import UUID

from models.playlist import Playlist, PlaylistCreate, PlaylistUpdate
from models.user import UserResponse
from services.playlist_service import PlaylistService
from utils.auth import get_current_active_user

router = APIRouter(prefix="/playlists", tags=["playlists"])

@router.post("/", response_model=Playlist, status_code=status.HTTP_201_CREATED)
async def create_playlist(
    playlist: PlaylistCreate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    return await PlaylistService.create_playlist(playlist, current_user.id)

@router.get("/", response_model=List[Playlist])
async def list_playlists(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    return await PlaylistService.list_playlists(current_user.id)

@router.get("/{playlist_id}", response_model=Playlist)
async def get_playlist(
    playlist_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    playlist = await PlaylistService.get_playlist(playlist_id)
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Playlist with ID {playlist_id} not found"
        )
    if playlist.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this playlist"
        )
    return playlist

@router.put("/{playlist_id}", response_model=Playlist)
async def update_playlist(
    playlist_id: UUID,
    playlist: PlaylistUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    updated_playlist = await PlaylistService.update_playlist(
        playlist_id, playlist, current_user.id
    )
    if not updated_playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Playlist with ID {playlist_id} not found or not authorized"
        )
    return updated_playlist

@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_playlist(
    playlist_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    deleted = await PlaylistService.delete_playlist(playlist_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Playlist with ID {playlist_id} not found or not authorized"
        )

@router.post("/{playlist_id}/tracks/{track_id}", response_model=Playlist)
async def add_track_to_playlist(
    playlist_id: UUID,
    track_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    updated_playlist = await PlaylistService.add_track_to_playlist(
        playlist_id, track_id, current_user.id
    )
    if not updated_playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist or track not found, or not authorized"
        )
    return updated_playlist

@router.delete("/{playlist_id}/tracks/{track_id}", response_model=Playlist)
async def remove_track_from_playlist(
    playlist_id: UUID,
    track_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    updated_playlist = await PlaylistService.remove_track_from_playlist(
        playlist_id, track_id, current_user.id
    )
    if not updated_playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found or not authorized"
        )
    return updated_playlist
