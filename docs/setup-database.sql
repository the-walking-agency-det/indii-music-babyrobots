-- SUPABASE DATABASE SETUP SQL
-- Run this in your Supabase SQL Editor
-- Copy and paste the entire contents of this file and run it

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'artist' CHECK (role IN ('artist', 'fan', 'licensor', 'provider', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  legal_name TEXT,
  bio TEXT,
  website TEXT,
  pro_affiliation TEXT,
  ipi_number TEXT,
  social_links JSONB DEFAULT '{}',
  profile_image_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fan profiles table
CREATE TABLE IF NOT EXISTS fan_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  music_preferences JSONB DEFAULT '{}',
  listening_history JSONB DEFAULT '{}',
  favorite_genres TEXT[],
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create licensor profiles table
CREATE TABLE IF NOT EXISTS licensor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  industry TEXT,
  budget_range TEXT,
  licensing_needs TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service provider profiles table
CREATE TABLE IF NOT EXISTS service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  service_categories TEXT[],
  skills TEXT[],
  experience_years INTEGER,
  portfolio_urls TEXT[],
  rates JSONB DEFAULT '{}',
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'busy', 'unavailable')),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  album_title TEXT,
  genre TEXT,
  mood_tags TEXT[],
  instrumentation TEXT[],
  tempo_bpm INTEGER,
  key_signature TEXT,
  duration_seconds INTEGER,
  isrc TEXT,
  iswc TEXT,
  explicit_content BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  release_date DATE,
  original_release_date DATE,
  copyright_holder TEXT,
  ai_tags JSONB DEFAULT '{}',
  file_url TEXT,
  cover_art_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_art_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  role TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_fan_profiles_user_id ON fan_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_licensor_profiles_user_id ON licensor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_service_provider_profiles_user_id ON service_provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON tracks(status);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(is_public);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_bucket ON file_uploads(bucket_name);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fan_profiles_updated_at BEFORE UPDATE ON fan_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_licensor_profiles_updated_at BEFORE UPDATE ON licensor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_provider_profiles_updated_at BEFORE UPDATE ON service_provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create useful database functions
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE(
  user_data JSONB,
  profile_data JSONB,
  profile_type TEXT
) AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM users WHERE id = user_uuid;
  
  -- Return user data and appropriate profile
  RETURN QUERY
  SELECT 
    to_jsonb(u.*) as user_data,
    CASE 
      WHEN user_role = 'artist' THEN to_jsonb(ap.*)
      WHEN user_role = 'fan' THEN to_jsonb(fp.*)
      WHEN user_role = 'licensor' THEN to_jsonb(lp.*)
      WHEN user_role = 'provider' THEN to_jsonb(spp.*)
      ELSE NULL
    END as profile_data,
    user_role as profile_type
  FROM users u
  LEFT JOIN artist_profiles ap ON u.id = ap.user_id AND user_role = 'artist'
  LEFT JOIN fan_profiles fp ON u.id = fp.user_id AND user_role = 'fan'
  LEFT JOIN licensor_profiles lp ON u.id = lp.user_id AND user_role = 'licensor'
  LEFT JOIN service_provider_profiles spp ON u.id = spp.user_id AND user_role = 'provider'
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment track play count
CREATE OR REPLACE FUNCTION increment_play_count(track_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE tracks 
  SET play_count = play_count + 1 
  WHERE id = track_uuid
  RETURNING play_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search tracks
CREATE OR REPLACE FUNCTION search_tracks(search_query TEXT)
RETURNS TABLE(
  track_id UUID,
  title TEXT,
  artist_name TEXT,
  genre TEXT,
  duration_seconds INTEGER,
  play_count INTEGER,
  cover_art_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as track_id,
    t.title,
    ap.stage_name as artist_name,
    t.genre,
    t.duration_seconds,
    t.play_count,
    t.cover_art_url
  FROM tracks t
  JOIN artist_profiles ap ON t.artist_id = ap.id
  WHERE 
    t.status = 'published' AND
    (
      t.title ILIKE '%' || search_query || '%' OR
      ap.stage_name ILIKE '%' || search_query || '%' OR
      t.genre ILIKE '%' || search_query || '%' OR
      search_query = ANY(t.mood_tags)
    )
  ORDER BY t.play_count DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

