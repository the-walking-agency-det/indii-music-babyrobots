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
        SELECT sp.*, u.email, u.username, u.first_name, u.last_name
        FROM service_provider_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = ?
      `).get(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Service provider profile not found' });
      }

      res.status(200).json(profile);
    } 
    else if (method === 'POST') {
      const { 
        userId, 
        companyName, 
        serviceType, 
        description, 
        website, 
        contactEmail, 
        phone, 
        pricingInfo 
      } = req.body;

      if (!userId || !companyName || !serviceType) {
        return res.status(400).json({ message: 'User ID, company name, and service type are required' });
      }

      // Check if user exists
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if profile already exists
      const existingProfile = db.prepare('SELECT id FROM service_provider_profiles WHERE user_id = ?').get(userId);
      if (existingProfile) {
        return res.status(409).json({ message: 'Service provider profile already exists for this user' });
      }

      const insertProfile = db.prepare(`
        INSERT INTO service_provider_profiles (
          user_id, company_name, service_type, description, website, 
          contact_email, phone, pricing_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertProfile.run(
        userId,
        companyName,
        serviceType,
        description || null,
        website || null,
        contactEmail || null,
        phone || null,
        pricingInfo || null
      );

      const newProfile = db.prepare(`
        SELECT sp.*, u.email, u.username, u.first_name, u.last_name
        FROM service_provider_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json(newProfile);
    } 
    else if (method === 'PUT') {
      const { 
        userId, 
        companyName, 
        serviceType, 
        description, 
        website, 
        contactEmail, 
        phone, 
        pricingInfo 
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if profile exists
      const existingProfile = db.prepare('SELECT id FROM service_provider_profiles WHERE user_id = ?').get(userId);
      if (!existingProfile) {
        return res.status(404).json({ message: 'Service provider profile not found' });
      }

      const updateProfile = db.prepare(`
        UPDATE service_provider_profiles 
        SET company_name = ?, service_type = ?, description = ?, website = ?, 
            contact_email = ?, phone = ?, pricing_info = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      updateProfile.run(
        companyName || null,
        serviceType || null,
        description || null,
        website || null,
        contactEmail || null,
        phone || null,
        pricingInfo || null,
        userId
      );

      const updatedProfile = db.prepare(`
        SELECT sp.*, u.email, u.username, u.first_name, u.last_name
        FROM service_provider_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = ?
      `).get(userId);

      res.status(200).json(updatedProfile);
    } 
    else if (method === 'DELETE') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const deleteProfile = db.prepare('DELETE FROM service_provider_profiles WHERE user_id = ?');
      const result = deleteProfile.run(userId);

      if (result.changes === 0) {
        return res.status(404).json({ message: 'Service provider profile not found' });
      }

      res.status(200).json({ message: 'Service provider profile deleted successfully' });
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Service provider profile API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}