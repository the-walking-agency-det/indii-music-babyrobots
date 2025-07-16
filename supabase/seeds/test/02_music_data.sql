-- Test Seed Data for Music Content and Projects

-- Insert test tracks
INSERT INTO tracks (artist_id, title, duration, genre, mood, bpm, key_signature, description, tags, is_public, play_count, created_at, updated_at)
SELECT 
    u.id,
    title,
    duration,
    genre,
    mood,
    bpm,
    key_signature,
    description,
    tags,
    is_public,
    play_count,
    created_at,
    updated_at
FROM users u
CROSS JOIN (
    VALUES 
        ('Summer Breeze', 180, 'Pop', 'Upbeat', 128, 'C Major', 'A fresh summer pop track', 'pop,summer,upbeat', true, 1500, NOW() - INTERVAL '30 days', NOW()),
        ('Midnight Jazz', 240, 'Jazz', 'Relaxed', 95, 'Dm', 'Smooth jazz for late nights', 'jazz,smooth,night', true, 800, NOW() - INTERVAL '25 days', NOW()),
        ('Electronic Dreams', 195, 'Electronic', 'Energetic', 140, 'F Minor', 'High-energy electronic track', 'electronic,dance,energy', true, 2000, NOW() - INTERVAL '20 days', NOW()),
        ('Acoustic Stories', 210, 'Folk', 'Mellow', 85, 'G Major', 'Storytelling through acoustic guitar', 'folk,acoustic,story', true, 1200, NOW() - INTERVAL '15 days', NOW())
) AS t(title, duration, genre, mood, bpm, key_signature, description, tags, is_public, play_count, created_at, updated_at)
WHERE u.email = 'test.artist@indii.music';

-- Insert test split sheets
INSERT INTO split_sheets (track_id, description, created_at)
SELECT 
    t.id,
    'Revenue sharing agreement for ' || t.title,
    NOW()
FROM tracks t;

-- Insert test split sheet contributors
INSERT INTO split_sheet_contributors (split_sheet_id, name, role, percentage)
SELECT
    s.id,
    name,
    role,
    percentage
FROM split_sheets s
CROSS JOIN (
    VALUES
        ('Main Artist', 'Artist', 50),
        ('Producer', 'Producer', 30),
        ('Sound Engineer', 'Engineer', 10),
        ('Session Musician', 'Musician', 10)
) AS c(name, role, percentage);

-- Insert test project workspaces
INSERT INTO project_workspaces (user_id, name, description, created_at)
SELECT
    u.id,
    name,
    description,
    created_at
FROM users u
CROSS JOIN (
    VALUES
        ('Summer Album Project', 'Production workspace for upcoming summer album', NOW() - INTERVAL '60 days'),
        ('Remix Collection', 'Collaborative space for remix projects', NOW() - INTERVAL '45 days'),
        ('Live Performance Prep', 'Preparation for upcoming live shows', NOW() - INTERVAL '30 days')
) AS w(name, description, created_at)
WHERE u.email = 'test.artist@indii.music';

-- Insert test workspace files
INSERT INTO workspace_files (workspace_id, filename, file_path)
SELECT
    w.id,
    filename,
    '/test/workspace/' || w.id || '/' || filename
FROM project_workspaces w
CROSS JOIN (
    VALUES
        ('track_final_mix.wav'),
        ('vocals_raw.wav'),
        ('drums_processed.wav'),
        ('project_notes.txt'),
        ('artwork_draft.png')
) AS f(filename);

-- Insert test workspace tasks
INSERT INTO workspace_tasks (workspace_id, title, description, due_date, is_completed)
SELECT
    w.id,
    title,
    description,
    NOW() + INTERVAL '7 days',
    is_completed
FROM project_workspaces w
CROSS JOIN (
    VALUES
        ('Record final vocals', 'Complete vocal recording for chorus section', false),
        ('Mix drums', 'Process and mix drum tracks', true),
        ('Master track', 'Prepare final master for distribution', false),
        ('Design cover art', 'Create artwork for single release', false),
        ('Plan promotion', 'Develop social media promotion strategy', false)
) AS t(title, description, is_completed);

-- Insert test audio files
INSERT INTO audio_files (user_id, filename, original_name, file_path, file_size, mime_type, duration, created_at)
SELECT
    u.id,
    filename,
    original_name,
    '/test/audio/' || filename,
    file_size,
    mime_type,
    duration,
    NOW() - INTERVAL '1 day' * ROUND(RANDOM() * 30)
FROM users u
CROSS JOIN (
    VALUES
        ('track1_master.wav', 'Summer_Breeze_Master.wav', 5242880, 'audio/wav', 180),
        ('track2_master.wav', 'Midnight_Jazz_Master.wav', 6291456, 'audio/wav', 240),
        ('track3_stems.zip', 'Electronic_Dreams_Stems.zip', 10485760, 'application/zip', NULL),
        ('track4_mix.wav', 'Acoustic_Stories_Mix.wav', 4194304, 'audio/wav', 210)
) AS f(filename, original_name, file_size, mime_type, duration)
WHERE u.email = 'test.artist@indii.music';

-- Insert test chat sessions
INSERT INTO chat_sessions (user_id, session_id, role, created_at, last_activity, context_json)
SELECT
    u.id,
    uuid_generate_v4()::text,
    'mastering',
    NOW() - INTERVAL '1 day' * ROUND(RANDOM() * 7),
    NOW(),
    '{"project": "Summer Album", "track": "Summer Breeze", "stage": "mastering"}'
FROM users u
WHERE u.email IN ('test.artist@indii.music', 'test.producer@indii.music');

-- Insert test chat messages
INSERT INTO chat_messages (session_id, message, response, role, created_at)
SELECT
    cs.session_id,
    message,
    response,
    'mastering',
    NOW() - INTERVAL '1 minute' * row_number() OVER (ORDER BY cs.created_at)
FROM chat_sessions cs
CROSS JOIN (
    VALUES
        ('How does the low end sound in the mix?', 'The bass frequencies look balanced. I notice a slight bump around 60Hz that we might want to address.'),
        ('Should we adjust the compression?', 'The current compression ratio of 4:1 seems appropriate. We could try reducing the attack time slightly.'),
        ('What about the overall loudness?', 'The track peaks at -1 dB LUFS. We have room to push it a bit while maintaining dynamics.'),
        ('Can you enhance the stereo width?', 'I can apply some mid-side processing to widen the mix while keeping the low frequencies centered.')
) AS m(message, response);

-- Insert test tasks
INSERT INTO tasks (
    title, description, priority, category, status, 
    due_date, assigned_to, user_id, tags, 
    created_at, updated_at
)
SELECT 
    title,
    description,
    priority::task_priority,
    category,
    status::task_status,
    NOW() + INTERVAL '1 day' * days_due,
    CASE 
        WHEN assigned_role = 'artist' THEN (SELECT id FROM users WHERE email = 'test.artist@indii.music')
        WHEN assigned_role = 'producer' THEN (SELECT id FROM users WHERE email = 'test.producer@indii.music')
        ELSE NULL
    END,
    (SELECT id FROM users WHERE email = 'test.artist@indii.music'),
    tags,
    NOW(),
    NOW()
FROM (
    VALUES
        ('Complete final mix', 'Finish mixing all tracks for the album', 'high', 'production', 'in_progress', 7, 'producer', 'mixing,production'),
        ('Design album artwork', 'Create cover art for album release', 'medium', 'design', 'pending', 14, 'artist', 'design,artwork'),
        ('Schedule mastering session', 'Book mastering engineer for album', 'high', 'production', 'pending', 5, 'producer', 'mastering,scheduling'),
        ('Plan release strategy', 'Develop marketing and release timeline', 'medium', 'marketing', 'pending', 21, 'artist', 'marketing,planning'),
        ('Record backing vocals', 'Complete all backing vocal sessions', 'medium', 'recording', 'in_progress', 3, 'artist', 'recording,vocals')
) AS t(title, description, priority, category, status, days_due, assigned_role, tags);
