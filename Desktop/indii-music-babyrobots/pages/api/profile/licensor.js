import { db } from '../../../lib/db.js';

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
        SELECT lp.*, u.email, u.username, u.first_name, u.last_name
        FROM licensor_profiles lp
        JOIN users u ON lp.user_id = u.id
        WHERE lp.user_id = ?
      `).get(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Licensor profile not found' });
      }

      res.status(200).json(profile);
    } 
    else if (method === 'POST') {
      const { 
        userId, 
        companyName, 
        contactPerson, 
        industry, 
        budgetRange, 
        licensingNeeds 
      } = req.body;

      if (!userId || !companyName) {
        return res.status(400).json({ message: 'User ID and company name are required' });
      }

      // Check if user exists
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if profile already exists
      const existingProfile = db.prepare('SELECT id FROM licensor_profiles WHERE user_id = ?').get(userId);
      if (existingProfile) {
        return res.status(409).json({ message: 'Licensor profile already exists for this user' });
      }

      const insertProfile = db.prepare(`
        INSERT INTO licensor_profiles (
          user_id, company_name, contact_person, industry_focus, website, phone, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertProfile.run(
        userId,
        companyName,
        contactPerson || null,
        industry || null,
        null, // website - can be added later
        null, // phone - can be added later
        null  // address - can be added later
      );

      const newProfile = db.prepare(`
        SELECT lp.*, u.email, u.username, u.first_name, u.last_name
        FROM licensor_profiles lp
        JOIN users u ON lp.user_id = u.id
        WHERE lp.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json(newProfile);
    } 
    else if (method === 'PUT') {
      const { 
        userId, 
        companyName, 
        contactPerson, 
        industry, 
        budgetRange, 
        licensingNeeds 
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if profile exists
      const existingProfile = db.prepare('SELECT id FROM licensor_profiles WHERE user_id = ?').get(userId);
      if (!existingProfile) {
        return res.status(404).json({ message: 'Licensor profile not found' });
      }

      const updateProfile = db.prepare(`
        UPDATE licensor_profiles 
        SET company_name = ?, contact_person = ?, industry_focus = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      updateProfile.run(
        companyName || null,
        contactPerson || null,
        industry || null,
        userId
      );

      const updatedProfile = db.prepare(`
        SELECT lp.*, u.email, u.username, u.first_name, u.last_name
        FROM licensor_profiles lp
        JOIN users u ON lp.user_id = u.id
        WHERE lp.user_id = ?
      `).get(userId);

      res.status(200).json(updatedProfile);
    } 
    else if (method === 'DELETE') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const deleteProfile = db.prepare('DELETE FROM licensor_profiles WHERE user_id = ?');
      const result = deleteProfile.run(userId);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Licensor profile not found' });
      }

      res.status(200).json({ message: 'Licensor profile deleted successfully' });
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Licensor profile API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}