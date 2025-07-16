import { db } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const profile = db.prepare(`
        SELECT ap.*, u.email, u.username, u.first_name, u.last_name
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.id
        WHERE ap.user_id = ?
      `).get(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Artist profile not found' });
      }

      res.status(200).json(profile);
    } 
    else if (method === 'POST') {
      const { 
        userId, 
        stageName, 
        legalName, 
        bio, 
        website, 
        proAffiliation, 
        ipiNumber, 
        socialLinks, 
        profileImageUrl 
      } = req.body;

      if (!userId || !stageName) {
        return res.status(400).json({ message: 'User ID and stage name are required' });
      }

      // Check if user exists
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if profile already exists
      const existingProfile = db.prepare('SELECT id FROM artist_profiles WHERE user_id = ?').get(userId);
      if (existingProfile) {
        return res.status(409).json({ message: 'Artist profile already exists for this user' });
      }

      const insertProfile = db.prepare(`
        INSERT INTO artist_profiles (
          user_id, artist_name, bio, genre, location, website, 
          spotify_url, soundcloud_url, instagram_url, twitter_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Parse social links if provided
      let socialLinksData = {};
      if (socialLinks) {
        try {
          socialLinksData = JSON.parse(socialLinks);
        } catch (e) {
          socialLinksData = {};
        }
      }

      const result = insertProfile.run(
        userId,
        stageName,
        bio || null,
        null, // genre - can be added later
        null, // location - can be added later
        website || null,
        socialLinksData.spotify || null,
        socialLinksData.soundcloud || null,
        socialLinksData.instagram || null,
        socialLinksData.twitter || null
      );

      const newProfile = db.prepare(`
        SELECT ap.*, u.email, u.username, u.first_name, u.last_name
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.id
        WHERE ap.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json(newProfile);
    } 
    else if (method === 'PUT') {
      const { 
        userId, 
        stageName, 
        legalName, 
        bio, 
        website, 
        proAffiliation, 
        ipiNumber, 
        socialLinks, 
        profileImageUrl 
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if profile exists
      const existingProfile = db.prepare('SELECT id FROM artist_profiles WHERE user_id = ?').get(userId);
      if (!existingProfile) {
        return res.status(404).json({ message: 'Artist profile not found' });
      }

      // Parse social links if provided
      let socialLinksData = {};
      if (socialLinks) {
        try {
          socialLinksData = JSON.parse(socialLinks);
        } catch (e) {
          socialLinksData = {};
        }
      }

      const updateProfile = db.prepare(`
        UPDATE artist_profiles 
        SET artist_name = ?, bio = ?, website = ?, 
            spotify_url = ?, soundcloud_url = ?, instagram_url = ?, twitter_url = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      updateProfile.run(
        stageName || null,
        bio || null,
        website || null,
        socialLinksData.spotify || null,
        socialLinksData.soundcloud || null,
        socialLinksData.instagram || null,
        socialLinksData.twitter || null,
        userId
      );

      const updatedProfile = db.prepare(`
        SELECT ap.*, u.email, u.username, u.first_name, u.last_name
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.id
        WHERE ap.user_id = ?
      `).get(userId);

      res.status(200).json(updatedProfile);
    } 
    else if (method === 'DELETE') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const deleteProfile = db.prepare('DELETE FROM artist_profiles WHERE user_id = ?');
      const result = deleteProfile.run(userId);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Artist profile not found' });
      }

      res.status(200).json({ message: 'Artist profile deleted successfully' });
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Artist profile API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}