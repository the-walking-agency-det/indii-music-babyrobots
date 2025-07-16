from typing import List, Optional
from uuid import UUID
from datetime import datetime

from models.playlist import Playlist, PlaylistCreate, PlaylistUpdate
from services.track_service import TrackService

# Temporary in-memory storage
playlists_db: dict[UUID, Playlist] = {}

class PlaylistService:
    @staticmethod
    async def create_playlist(playlist: PlaylistCreate, user_id: UUID) -> Playlist:
        playlist_data = playlist.model_dump()
        playlist_data["user_id"] = user_id
        db_playlist = Playlist(**playlist_data)
        playlists_db[db_playlist.id] = db_playlist
        return db_playlist

    @staticmethod
    async def get_playlist(playlist_id: UUID) -> Optional[Playlist]:
        return playlists_db.get(playlist_id)

    @staticmethod
    async def list_playlists(user_id: Optional[UUID] = None) -> List[Playlist]:
        if user_id:
            return [p for p in playlists_db.values() if p.user_id == user_id]
        return list(playlists_db.values())

    @staticmethod
    async def update_playlist(
        playlist_id: UUID, 
        playlist_data: PlaylistUpdate,
        user_id: UUID
    ) -> Optional[Playlist]:
        existing_playlist = playlists_db.get(playlist_id)
        if not existing_playlist or existing_playlist.user_id != user_id:
            return None

        update_data = playlist_data.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(existing_playlist, key, value)
        
        existing_playlist.updated_at = datetime.utcnow()
        playlists_db[playlist_id] = existing_playlist
        return existing_playlist

    @staticmethod
    async def delete_playlist(playlist_id: UUID, user_id: UUID) -> bool:
        playlist = playlists_db.get(playlist_id)
        if not playlist or playlist.user_id != user_id:
            return False
        del playlists_db[playlist_id]
        return True

    @staticmethod
    async def add_track_to_playlist(
        playlist_id: UUID,
        track_id: UUID,
        user_id: UUID
    ) -> Optional[Playlist]:
        playlist = playlists_db.get(playlist_id)
        if not playlist or playlist.user_id != user_id:
            return None

        # Verify track exists
        track = await TrackService.get_track(track_id)
        if not track:
            return None

        if track_id not in playlist.tracks:
            playlist.tracks.append(track_id)
            playlist.updated_at = datetime.utcnow()
            playlists_db[playlist_id] = playlist

        return playlist

    @staticmethod
    async def remove_track_from_playlist(
        playlist_id: UUID,
        track_id: UUID,
        user_id: UUID
    ) -> Optional[Playlist]:
        playlist = playlists_db.get(playlist_id)
        if not playlist or playlist.user_id != user_id:
            return None

        if track_id in playlist.tracks:
            playlist.tracks.remove(track_id)
            playlist.updated_at = datetime.utcnow()
            playlists_db[playlist_id] = playlist

        return playlist
