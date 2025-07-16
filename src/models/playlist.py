from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID, uuid4

class PlaylistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class PlaylistCreate(PlaylistBase):
    pass

class Playlist(PlaylistBase):
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    tracks: List[UUID] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PlaylistUpdate(PlaylistBase):
    tracks: Optional[List[UUID]] = None
