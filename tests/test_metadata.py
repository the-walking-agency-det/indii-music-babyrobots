import pytest
import os
from fastapi.testclient import TestClient
from uuid import uuid4
from pathlib import Path

@pytest.fixture
def test_audio_file(tmp_path):
    """Create a dummy MP3 file for testing."""
    from pydub.generators import Sine
    from pydub.utils import mediainfo

    # Generate a simple sine wave
    sine = Sine(440).to_audio_segment(duration=1000)
    
    # Save as MP3
    file_path = tmp_path / "test.mp3"
    sine.export(str(file_path), format="mp3", 
               tags={
                   "title": "Test Song",
                   "artist": "Test Artist",
                   "album": "Test Album",
                   "date": "2023"
               })
    
    return str(file_path)

def test_get_metadata(client: TestClient, auth_header, test_audio_file):
    # First create a track
    track_id = str(uuid4())
    track_data = {
        "id": track_id,
        "title": "Test Track",
        "artist": "Test Artist",
        "file_path": test_audio_file,
        "file_format": "mp3",
        "duration_seconds": 1
    }
    
    response = client.post("/tracks/", headers=auth_header, json=track_data)
    assert response.status_code == 201
    
    # Get metadata
    response = client.get(f"/metadata/{track_id}", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    
    assert data["title"] == "Test Song"
    assert data["artist"] == "Test Artist"
    assert data["album"] == "Test Album"
    assert data["release_year"] == 2023
    assert data["audio_metadata"]["duration_seconds"] > 0

def test_update_metadata(client: TestClient, auth_header, test_audio_file):
    # First create a track
    track_id = str(uuid4())
    track_data = {
        "id": track_id,
        "title": "Test Track",
        "artist": "Test Artist",
        "file_path": test_audio_file,
        "file_format": "mp3",
        "duration_seconds": 1
    }
    
    response = client.post("/tracks/", headers=auth_header, json=track_data)
    assert response.status_code == 201
    
    # Get current metadata
    response = client.get(f"/metadata/{track_id}", headers=auth_header)
    metadata = response.json()
    
    # Update metadata
    metadata["title"] = "Updated Title"
    metadata["artist"] = "Updated Artist"
    metadata["album"] = "Updated Album"
    
    response = client.put(f"/metadata/{track_id}", headers=auth_header, json=metadata)
    assert response.status_code == 200
    
    # Verify updates
    response = client.get(f"/metadata/{track_id}", headers=auth_header)
    updated_data = response.json()
    assert updated_data["title"] == "Updated Title"
    assert updated_data["artist"] == "Updated Artist"
    assert updated_data["album"] == "Updated Album"

def test_get_metadata_nonexistent_track(client: TestClient, auth_header):
    response = client.get(f"/metadata/{uuid4()}", headers=auth_header)
    assert response.status_code == 404

def test_update_metadata_nonexistent_track(client: TestClient, auth_header):
    metadata = {
        "title": "Test",
        "artist": "Test",
        "audio_metadata": {
            "duration_seconds": 1.0,
            "sample_rate": 44100,
            "channels": 2,
            "codec": "mp3"
        }
    }
    response = client.put(f"/metadata/{uuid4()}", headers=auth_header, json=metadata)
    assert response.status_code == 404
