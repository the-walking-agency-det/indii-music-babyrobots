import { createArtistProfile, getArtistProfileByUserId, updateArtistProfile, deleteArtistProfile } from '../../../src/lib/db.js';

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
        return await handleCreateArtistProfile(req, res, userId);
      case 'GET':
        return await handleGetArtistProfile(req, res, userId);
      case 'PUT':
        return await handleUpdateArtistProfile(req, res, userId);
      case 'DELETE':
        return await handleDeleteArtistProfile(req, res, userId);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Artist profile API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleCreateArtistProfile(req, res, userId) {
  const { stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl } = req.body;
  
  if (!stageName) {
    return res.status(400).json({ message: 'Stage name is required to create an artist profile.' });
  }

  try {
    const profileId = createArtistProfile(
      userId,
      stageName,
      legalName,
      bio,
      website,
      proAffiliation,
      ipiNumber,
      socialLinks,
      profileImageUrl
    );
    
    return res.status(201).json({
      message: 'Artist profile created successfully!',
      profileId
    });
  } catch (error) {
    console.error('Error creating artist profile:', error);
    return res.status(500).json({ message: 'Failed to create artist profile' });
  }
}

async function handleGetArtistProfile(req, res, userId) {
  try {
    const profile = getArtistProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Artist profile not found.' });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error getting artist profile:', error);
    return res.status(500).json({ message: 'Failed to get artist profile' });
  }
}

async function handleUpdateArtistProfile(req, res, userId) {
  const { stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl } = req.body;
  
  try {
    const changes = updateArtistProfile(
      userId,
      stageName,
      legalName,
      bio,
      website,
      proAffiliation,
      ipiNumber,
      socialLinks,
      profileImageUrl
    );
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Artist profile not found or no changes made.' });
    }
    
    return res.status(200).json({ message: 'Artist profile updated successfully!' });
  } catch (error) {
    console.error('Error updating artist profile:', error);
    return res.status(500).json({ message: 'Failed to update artist profile' });
  }
}

async function handleDeleteArtistProfile(req, res, userId) {
  try {
    const changes = deleteArtistProfile(userId);
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Artist profile not found.' });
    }
    
    return res.status(200).json({ message: 'Artist profile deleted successfully!' });
  } catch (error) {
    console.error('Error deleting artist profile:', error);
    return res.status(500).json({ message: 'Failed to delete artist profile' });
  }
}
