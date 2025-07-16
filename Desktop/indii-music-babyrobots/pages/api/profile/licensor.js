import { createLicensorProfile, getLicensorProfileByUserId, updateLicensorProfile, deleteLicensorProfile } from '../../../src/lib/db.js';

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
        return await handleCreateLicensorProfile(req, res, userId);
      case 'GET':
        return await handleGetLicensorProfile(req, res, userId);
      case 'PUT':
        return await handleUpdateLicensorProfile(req, res, userId);
      case 'DELETE':
        return await handleDeleteLicensorProfile(req, res, userId);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Licensor profile API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleCreateLicensorProfile(req, res, userId) {
  const { companyName, contactPerson, industry, budgetRange, licensingNeeds } = req.body;
  
  if (!companyName) {
    return res.status(400).json({ message: 'Company name is required to create a licensor profile.' });
  }

  try {
    const profileId = createLicensorProfile(
      userId,
      companyName,
      contactPerson,
      industry,
      budgetRange,
      licensingNeeds
    );
    
    return res.status(201).json({
      message: 'Licensor profile created successfully!',
      profileId
    });
  } catch (error) {
    console.error('Error creating licensor profile:', error);
    return res.status(500).json({ message: 'Failed to create licensor profile' });
  }
}

async function handleGetLicensorProfile(req, res, userId) {
  try {
    const profile = getLicensorProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Licensor profile not found.' });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error getting licensor profile:', error);
    return res.status(500).json({ message: 'Failed to get licensor profile' });
  }
}

async function handleUpdateLicensorProfile(req, res, userId) {
  const { companyName, contactPerson, industry, budgetRange, licensingNeeds } = req.body;
  
  try {
    const changes = updateLicensorProfile(
      userId,
      companyName,
      contactPerson,
      industry,
      budgetRange,
      licensingNeeds
    );
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Licensor profile not found or no changes made.' });
    }
    
    return res.status(200).json({ message: 'Licensor profile updated successfully!' });
  } catch (error) {
    console.error('Error updating licensor profile:', error);
    return res.status(500).json({ message: 'Failed to update licensor profile' });
  }
}

async function handleDeleteLicensorProfile(req, res, userId) {
  try {
    const changes = deleteLicensorProfile(userId);
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Licensor profile not found.' });
    }
    
    return res.status(200).json({ message: 'Licensor profile deleted successfully!' });
  } catch (error) {
    console.error('Error deleting licensor profile:', error);
    return res.status(500).json({ message: 'Failed to delete licensor profile' });
  }
}
