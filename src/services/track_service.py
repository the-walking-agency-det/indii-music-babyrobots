from typing import List, Optional
from uuid import UUID
from datetime import datetime
from ..models.track import Track

# Temporary in-memory storage until we set up the database
tracks_db: dict[UUID, Track] = {}

class TrackService:
    @staticmethod
    async def create_track(track: Track) -> Track:
        tracks_db[track.id] = track
        return track

    @staticmethod
    async def get_track(track_id: UUID) -> Optional[Track]:
        return tracks_db.get(track_id)

    @staticmethod
    async def list_tracks() -> List[Track]:
        return list(tracks_db.values())

    @staticmethod
    async def update_track(track_id: UUID, track_data: Track) -> Optional[Track]:
        if track_id not in tracks_db:
            return None
        track_data.id = track_id
        track_data.updated_at = datetime.utcnow()
        tracks_db[track_id] = track_data
        return track_data

    @staticmethod
    async def delete_track(track_id: UUID) -> bool:
        if track_id not in tracks_db:
            return False
        del tracks_db[track_id]
        return True
