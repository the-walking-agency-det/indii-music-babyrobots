import pytest
from fastapi.testclient import TestClient
from uuid import UUID

def test_create_playlist(client: TestClient, auth_header):
    response = client.post(
        "/playlists/",
        headers=auth_header,
        json={
            "name": "My Test Playlist",
            "description": "A playlist for testing"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My Test Playlist"
    assert data["description"] == "A playlist for testing"
    assert len(data["tracks"]) == 0

def test_get_playlist(client: TestClient, auth_header):
    # Create a playlist first
    create_response = client.post(
        "/playlists/",
        headers=auth_header,
        json={
            "name": "My Test Playlist",
            "description": "A playlist for testing"
        }
    )
    playlist_id = create_response.json()["id"]
    
    # Get the playlist
    response = client.get(f"/playlists/{playlist_id}", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Test Playlist"
    assert data["description"] == "A playlist for testing"

def test_list_playlists(client: TestClient, auth_header):
    # Create a couple of playlists
    client.post(
        "/playlists/",
        headers=auth_header,
        json={
            "name": "Playlist 1",
            "description": "First playlist"
        }
    )
    client.post(
        "/playlists/",
        headers=auth_header,
        json={
            "name": "Playlist 2",
            "description": "Second playlist"
        }
    )
    
    response = client.get("/playlists/", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert any(p["name"] == "Playlist 1" for p in data)
    assert any(p["name"] == "Playlist 2" for p in data)

def test_update_playlist(client: TestClient, auth_header):
    # Create a playlist
    create_response = client.post(
        "/playlists/",
        headers=auth_header,
        json={
            "name": "Original Name",
            "description": "Original description"
        }
    )
    playlist_id = create_response.json()["id"]
    
    # Update the playlist
    response = client.put(
        f"/playlists/{playlist_id}",
        headers=auth_header,
        json={
            "name": "Updated Name",
            "description": "Updated description"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated description"

def test_delete_playlist(client: TestClient, auth_header):
    # Create a playlist
    create_response = client.post(
        "/playlists/",
        headers=auth_header,
        json={
            "name": "To Be Deleted",
            "description": "This playlist will be deleted"
        }
    )
    playlist_id = create_response.json()["id"]
    
    # Delete the playlist
    response = client.delete(f"/playlists/{playlist_id}", headers=auth_header)
    assert response.status_code == 204
    
    # Verify it's gone
    get_response = client.get(f"/playlists/{playlist_id}", headers=auth_header)
    assert get_response.status_code == 404

@pytest.fixture
def auth_header(client: TestClient):
    # Register a user
    client.post(
        "/auth/register",
        json={
            "email": "playlist_test@example.com",
            "username": "playlist_tester",
            "password": "testpass123",
            "full_name": "Playlist Tester"
        }
    )
    
    # Login
    response = client.post(
        "/auth/token",
        data={
            "username": "playlist_test@example.com",
            "password": "testpass123"
        }
    )
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
