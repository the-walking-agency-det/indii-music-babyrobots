from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AudioMetadata(BaseModel):
    duration_seconds: float
    sample_rate: int
    channels: int
    bit_depth: Optional[int] = None
    bit_rate: Optional[int] = None
    codec: str

class MusicMetadata(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    artist: str = Field(..., min_length=1, max_length=200)
    album: Optional[str] = Field(None, max_length=200)
    release_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    track_number: Optional[int] = Field(None, ge=1)
    total_tracks: Optional[int] = Field(None, ge=1)
    genre: Optional[str] = Field(None, max_length=100)
    composer: Optional[str] = Field(None, max_length=200)
    lyrics: Optional[str] = None
    bpm: Optional[int] = Field(None, ge=20, le=400)
    key: Optional[str] = Field(None, max_length=10)
    audio_metadata: AudioMetadata
    tags: List[str] = Field(default_factory=list)
