import { createFanProfile, getFanProfileByUserId, updateFanProfile, deleteFanProfile } from '../../../src/lib/db.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // Get userId from body for POST/PUT/DELETE or from query for GET
    const userId = req.body?.userId || req.query?.userId;
    
    // Check if userId is provided
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID missing.' });
    }

    switch (method) {
      case 'POST':
        return await handleCreateFanProfile(req, res, userId);
      case 'GET':
        return await handleGetFanProfile(req, res, userId);
      case 'PUT':
        return await handleUpdateFanProfile(req, res, userId);
      case 'DELETE':
        return await handleDeleteFanProfile(req, res, userId);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Fan profile API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleCreateFanProfile(req, res, userId) {
  const { displayName, musicPreferences, listeningHistory } = req.body;
  
  if (!displayName) {
    return res.status(400).json({ message: 'Display name is required to create a fan profile.' });
  }

  try {
    const profileId = createFanProfile(
      userId,
      displayName,
      musicPreferences ? JSON.stringify(musicPreferences) : null,
      listeningHistory ? JSON.stringify(listeningHistory) : null
    );
    
    return res.status(201).json({
      message: 'Fan profile created successfully!',
      profileId
    });
  } catch (error) {
    console.error('Error creating fan profile:', error);
    return res.status(500).json({ message: 'Failed to create fan profile' });
  }
}

async function handleGetFanProfile(req, res, userId) {
  try {
    const profile = getFanProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Fan profile not found.' });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error getting fan profile:', error);
    return res.status(500).json({ message: 'Failed to get fan profile' });
  }
}

async function handleUpdateFanProfile(req, res, userId) {
  const { displayName, musicPreferences, listeningHistory } = req.body;
  
  try {
    const changes = updateFanProfile(
      userId,
      displayName,
      musicPreferences ? JSON.stringify(musicPreferences) : null,
      listeningHistory ? JSON.stringify(listeningHistory) : null
    );
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Fan profile not found or no changes made.' });
    }
    
    return res.status(200).json({ message: 'Fan profile updated successfully!' });
  } catch (error) {
    console.error('Error updating fan profile:', error);
    return res.status(500).json({ message: 'Failed to update fan profile' });
  }
}

async function handleDeleteFanProfile(req, res, userId) {
  try {
    const changes = deleteFanProfile(userId);
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Fan profile not found.' });
    }
    
    return res.status(200).json({ message: 'Fan profile deleted successfully!' });
  } catch (error) {
    console.error('Error deleting fan profile:', error);
    return res.status(500).json({ message: 'Failed to delete fan profile' });
  }
}
