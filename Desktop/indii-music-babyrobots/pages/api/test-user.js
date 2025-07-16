import { db } from '../../lib/db.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'POST') {
      // Create test user
      const { email, username, profile_type } = req.body;
      
      const insertUser = db.prepare(`
        INSERT INTO users (email, password_hash, username, profile_type)
        VALUES (?, ?, ?, ?)
      `);

      const result = insertUser.run(
        email || 'test@indiimusic.com',
        'test_hash_123',
        username || 'testuser',
        profile_type || 'artist'
      );

      res.status(201).json({
        message: 'Test user created',
        userId: result.lastInsertRowid,
        email: email || 'test@indiimusic.com'
      });
    } 
    else if (method === 'GET') {
      // Get all users
      const getUsers = db.prepare('SELECT id, email, username, profile_type, created_at FROM users');
      const users = getUsers.all();
      
      res.status(200).json({
        message: 'Users retrieved',
        count: users.length,
        users: users
      });
    }
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Test user API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}