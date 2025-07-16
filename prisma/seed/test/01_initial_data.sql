-- Test Seed Data for Indii Music Platform

-- Clear existing test data
TRUNCATE roles, users, user_roles CASCADE;

-- Insert roles
INSERT INTO roles (name, display_name, level, created_at, updated_at) VALUES
('admin', 'Administrator', 100, NOW(), NOW()),
('artist', 'Artist', 50, NOW(), NOW()),
('producer', 'Producer', 40, NOW(), NOW()),
('listener', 'Listener', 10, NOW(), NOW());

-- Insert test users with hashed passwords
INSERT INTO users (email, username, password_hash, profile_type, created_at, updated_at) VALUES
('test.admin@indii.music', 'testadmin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NMWVg.Kve', 'service_provider', NOW(), NOW()),
('test.artist@indii.music', 'testartist', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NMWVg.Kve', 'artist', NOW(), NOW()),
('test.producer@indii.music', 'testproducer', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NMWVg.Kve', 'service_provider', NOW(), NOW()),
('test.listener@indii.music', 'testlistener', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NMWVg.Kve', 'fan', NOW(), NOW());

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
SELECT u.id, r.id, NOW(), NOW()
FROM users u
CROSS JOIN roles r
WHERE 
    (u.email = 'test.admin@indii.music' AND r.name = 'admin') OR
    (u.email = 'test.artist@indii.music' AND r.name = 'artist') OR
    (u.email = 'test.producer@indii.music' AND r.name = 'producer') OR
    (u.email = 'test.listener@indii.music' AND r.name = 'listener');

-- Create test profiles

-- Artist profiles
INSERT INTO artist_profiles (user_id, artist_name, bio, genre, created_at, updated_at)
SELECT 
    u.id,
    'Test Artist',
    'Test artist account for development',
    'Electronic',
    NOW(),
    NOW()
FROM users u
WHERE u.profile_type = 'artist';

-- Fan profiles
INSERT INTO fan_profiles (user_id, display_name, bio, favorite_genres, created_at, updated_at)
SELECT 
    u.id,
    'Test Listener',
    'Test listener account for development',
    'Electronic, Pop',
    NOW(),
    NOW()
FROM users u
WHERE u.profile_type = 'fan';

-- Service provider profiles
INSERT INTO service_provider_profiles (user_id, company_name, service_type, description, created_at, updated_at)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'test.admin@indii.music' THEN 'Admin Services'
        ELSE 'Producer Services'
    END,
    CASE 
        WHEN u.email = 'test.admin@indii.music' THEN 'admin'
        ELSE 'producer'
    END,
    CASE 
        WHEN u.email = 'test.admin@indii.music' THEN 'Test administrator service provider'
        ELSE 'Test producer service provider'
    END,
    NOW(),
    NOW()
FROM users u
WHERE u.profile_type = 'service_provider';

-- Set up test security logs
INSERT INTO security_logs (user_id, action, details, created_at)
SELECT 
    u.id,
    'account_created',
    json_build_object('email', u.email, 'profile_type', u.profile_type),
    NOW()
FROM users u;
