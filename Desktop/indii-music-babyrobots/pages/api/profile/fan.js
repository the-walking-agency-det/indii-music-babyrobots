import { initializeDatabase, db } from '../../../lib/db.js';

// Initialize database
initializeDatabase();

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const profile = db.prepare(`
        SELECT fp.*, u.email, u.username, u.first_name, u.last_name
        FROM fan_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.user_id = ?
      `).get(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Fan profile not found' });
      }

      res.status(200).json(profile);
    } 
    else if (method === 'POST') {
      const { 
        userId, 
        displayName, 
        musicPreferences, 
        listeningHistory 
      } = req.body;

      if (!userId || !displayName) {
        return res.status(400).json({ message: 'User ID and display name are required' });
      }

      // Check if user exists
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if profile already exists
      const existingProfile = db.prepare('SELECT id FROM fan_profiles WHERE user_id = ?').get(userId);
      if (existingProfile) {
        return res.status(409).json({ message: 'Fan profile already exists for this user' });
      }

      const insertProfile = db.prepare(`
        INSERT INTO fan_profiles (
          user_id, display_name, favorite_genres, location, bio
        ) VALUES (?, ?, ?, ?, ?)
      `);

      const result = insertProfile.run(
        userId,
        displayName,
        musicPreferences || null,
        null, // location - can be added later
        null // bio - can be added later
      );

      const newProfile = db.prepare(`
        SELECT fp.*, u.email, u.username, u.first_name, u.last_name
        FROM fan_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json(newProfile);
    } 
    else if (method === 'PUT') {
      const { 
        userId, 
        displayName, 
        musicPreferences, 
        listeningHistory 
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if profile exists
      const existingProfile = db.prepare('SELECT id FROM fan_profiles WHERE user_id = ?').get(userId);
      if (!existingProfile) {
        return res.status(404).json({ message: 'Fan profile not found' });
      }

      const updateProfile = db.prepare(`
        UPDATE fan_profiles 
        SET display_name = ?, favorite_genres = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      updateProfile.run(
        displayName || null,
        musicPreferences || null,
        userId
      );

      const updatedProfile = db.prepare(`
        SELECT fp.*, u.email, u.username, u.first_name, u.last_name
        FROM fan_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.user_id = ?
      `).get(userId);

      res.status(200).json(updatedProfile);
    } 
    else if (method === 'DELETE') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const deleteProfile = db.prepare('DELETE FROM fan_profiles WHERE user_id = ?');
      const result = deleteProfile.run(userId);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Fan profile not found' });
      }

      res.status(200).json({ message: 'Fan profile deleted successfully' });
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Fan profile API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}