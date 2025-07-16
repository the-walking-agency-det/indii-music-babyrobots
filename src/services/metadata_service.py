from typing import Optional
import mutagen
from mutagen.easyid3 import EasyID3
from mutagen.mp3 import MP3
from pathlib import Path

from models.metadata import MusicMetadata, AudioMetadata

class MetadataService:
    @staticmethod
    async def extract_metadata(file_path: str) -> Optional[MusicMetadata]:
        path = Path(file_path)
        if not path.exists():
            return None

        try:
            audio = mutagen.File(file_path)
            if not audio:
                return None

            # Extract basic audio metadata
            audio_metadata = AudioMetadata(
                duration_seconds=audio.info.length,
                sample_rate=audio.info.sample_rate,
                channels=audio.info.channels,
                bit_rate=getattr(audio.info, "bitrate", None),
                codec=audio.mime[0].split("/")[1] if audio.mime else "unknown"
            )

            # Try to get ID3 tags if available
            if isinstance(audio, MP3):
                tags = EasyID3(file_path)
                metadata = MusicMetadata(
                    title=tags.get("title", ["Unknown"])[0],
                    artist=tags.get("artist", ["Unknown"])[0],
                    album=tags.get("album", [None])[0],
                    release_year=int(tags.get("date", ["0"])[0].split("-")[0]) 
                        if "date" in tags else None,
                    genre=tags.get("genre", [None])[0],
                    composer=tags.get("composer", [None])[0],
                    audio_metadata=audio_metadata,
                    tags=tags.get("genre", [])
                )
                return metadata

            # Generic metadata for other formats
            return MusicMetadata(
                title=path.stem,
                artist="Unknown",
                audio_metadata=audio_metadata
            )

        except Exception as e:
            print(f"Error extracting metadata: {str(e)}")
            return None

    @staticmethod
    async def update_metadata(file_path: str, metadata: MusicMetadata) -> bool:
        try:
            audio = MP3(file_path, ID3=EasyID3)
            
            # Update ID3 tags
            if isinstance(audio, MP3):
                tags = EasyID3(file_path)
                
                tags["title"] = metadata.title
                tags["artist"] = metadata.artist
                if metadata.album:
                    tags["album"] = metadata.album
                if metadata.release_year:
                    tags["date"] = str(metadata.release_year)
                if metadata.genre:
                    tags["genre"] = metadata.genre
                if metadata.composer:
                    tags["composer"] = metadata.composer
                
                tags.save()
                return True
                
            return False

        except Exception as e:
            print(f"Error updating metadata: {str(e)}")
            return False
