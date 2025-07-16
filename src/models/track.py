from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4

class Track(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., min_length=1, max_length=100)
    artist: str = Field(..., min_length=1, max_length=100)
    duration_seconds: int = Field(..., gt=0)
    genre: Optional[str] = Field(None, max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    file_path: str = Field(..., min_length=1)
    file_format: str = Field(..., pattern="^(mp3|wav|ogg|m4a)$")
