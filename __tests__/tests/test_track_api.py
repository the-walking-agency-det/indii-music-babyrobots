import pytest
from fastapi.testclient import TestClient
from uuid import UUID

def test_create_track(client: TestClient):
    track_data = {
        "title": "Test Track",
        "artist": "Test Artist",
        "duration_seconds": 180,
        "genre": "Test Genre",
        "file_path": "/music/test.mp3",
        "file_format": "mp3"
    }
    
    response = client.post("/tracks/", json=track_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == track_data["title"]
    assert data["artist"] == track_data["artist"]
    assert UUID(data["id"])  # Ensure valid UUID is returned

def test_get_nonexistent_track(client: TestClient):
    response = client.get(f"/tracks/{UUID('00000000-0000-0000-0000-000000000000')}")
    assert response.status_code == 404

def test_create_invalid_track(client: TestClient):
    # Missing required fields
    track_data = {
        "title": "Test Track"
    }
    response = client.post("/tracks/", json=track_data)
    assert response.status_code == 422

def test_create_track_invalid_format(client: TestClient):
    track_data = {
        "title": "Test Track",
        "artist": "Test Artist",
        "duration_seconds": 180,
        "genre": "Test Genre",
        "file_path": "/music/test.mp3",
        "file_format": "invalid"  # Invalid format
    }
    response = client.post("/tracks/", json=track_data)
    assert response.status_code == 422

def test_update_track(client: TestClient):
    # First create a track
    track_data = {
        "title": "Test Track",
        "artist": "Test Artist",
        "duration_seconds": 180,
        "genre": "Test Genre",
        "file_path": "/music/test.mp3",
        "file_format": "mp3"
    }
    
    create_response = client.post("/tracks/", json=track_data)
    assert create_response.status_code == 201
    track_id = create_response.json()["id"]
    
    # Update the track
    updated_data = track_data.copy()
    updated_data["title"] = "Updated Track"
    
    update_response = client.put(f"/tracks/{track_id}", json=updated_data)
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Track"

def test_delete_track(client: TestClient):
    # First create a track
    track_data = {
        "title": "Test Track",
        "artist": "Test Artist",
        "duration_seconds": 180,
        "genre": "Test Genre",
        "file_path": "/music/test.mp3",
        "file_format": "mp3"
    }
    
    create_response = client.post("/tracks/", json=track_data)
    assert create_response.status_code == 201
    track_id = create_response.json()["id"]
    
    # Delete the track
    delete_response = client.delete(f"/tracks/{track_id}")
    assert delete_response.status_code == 204
    
    # Verify track is deleted
    get_response = client.get(f"/tracks/{track_id}")
    assert get_response.status_code == 404
