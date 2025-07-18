import pytest
from fastapi.testclient import TestClient
from jose import jwt
from src.utils.auth import SECRET_KEY, ALGORITHM

def test_register_user(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "full_name": "Test User"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "password" not in data

def test_register_existing_user(client: TestClient):
    # Register first user
    client.post(
        "/auth/register",
        json={
            "email": "existing@example.com",
            "username": "existinguser",
            "password": "testpass123",
            "full_name": "Existing User"
        },
    )
    
    # Try to register with same email
    response = client.post(
        "/auth/register",
        json={
            "email": "existing@example.com",
            "username": "newuser",
            "password": "testpass123",
            "full_name": "New User"
        },
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_user(client: TestClient):
    # Register user first
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "testpass123",
            "full_name": "Login User"
        },
    )
    
    # Login
    response = client.post(
        "/auth/token",
        data={
            "username": "login@example.com",
            "password": "testpass123"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Verify token
    token = data["access_token"]
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert "sub" in payload

def test_login_wrong_password(client: TestClient):
    # Register user first
    client.post(
        "/auth/register",
        json={
            "email": "wrong@example.com",
            "username": "wronguser",
            "password": "testpass123",
            "full_name": "Wrong User"
        },
    )
    
    # Try to login with wrong password
    response = client.post(
        "/auth/token",
        data={
            "username": "wrong@example.com",
            "password": "wrongpass123"
        },
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_current_user(client: TestClient):
    # Register and login user
    client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "username": "meuser",
            "password": "testpass123",
            "full_name": "Me User"
        },
    )
    
    login_response = client.post(
        "/auth/token",
        data={
            "username": "me@example.com",
            "password": "testpass123"
        },
    )
    
    token = login_response.json()["access_token"]
    
    # Get current user
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["username"] == "meuser"
