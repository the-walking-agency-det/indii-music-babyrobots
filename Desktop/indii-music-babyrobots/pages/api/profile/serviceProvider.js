import { createServiceProviderProfile, getServiceProviderProfileByUserId, updateServiceProviderProfile, deleteServiceProviderProfile } from '../../../src/lib/db.js';

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
        return await handleCreateServiceProviderProfile(req, res, userId);
      case 'GET':
        return await handleGetServiceProviderProfile(req, res, userId);
      case 'PUT':
        return await handleUpdateServiceProviderProfile(req, res, userId);
      case 'DELETE':
        return await handleDeleteServiceProviderProfile(req, res, userId);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Service provider profile API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleCreateServiceProviderProfile(req, res, userId) {
  const { businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus } = req.body;
  
  if (!businessName) {
    return res.status(400).json({ message: 'Business name is required to create a service provider profile.' });
  }

  try {
    const profileId = createServiceProviderProfile(
      userId,
      businessName,
      serviceCategories ? JSON.stringify(serviceCategories) : null,
      skills ? JSON.stringify(skills) : null,
      experienceYears,
      portfolioUrls ? JSON.stringify(portfolioUrls) : null,
      rates ? JSON.stringify(rates) : null,
      availabilityStatus
    );
    
    return res.status(201).json({
      message: 'Service provider profile created successfully!',
      profileId
    });
  } catch (error) {
    console.error('Error creating service provider profile:', error);
    return res.status(500).json({ message: 'Failed to create service provider profile' });
  }
}

async function handleGetServiceProviderProfile(req, res, userId) {
  try {
    const profile = getServiceProviderProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Service provider profile not found.' });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error getting service provider profile:', error);
    return res.status(500).json({ message: 'Failed to get service provider profile' });
  }
}

async function handleUpdateServiceProviderProfile(req, res, userId) {
  const { businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus } = req.body;
  
  try {
    const changes = updateServiceProviderProfile(
      userId,
      businessName,
      serviceCategories ? JSON.stringify(serviceCategories) : null,
      skills ? JSON.stringify(skills) : null,
      experienceYears,
      portfolioUrls ? JSON.stringify(portfolioUrls) : null,
      rates ? JSON.stringify(rates) : null,
      availabilityStatus
    );
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Service provider profile not found or no changes made.' });
    }
    
    return res.status(200).json({ message: 'Service provider profile updated successfully!' });
  } catch (error) {
    console.error('Error updating service provider profile:', error);
    return res.status(500).json({ message: 'Failed to update service provider profile' });
  }
}

async function handleDeleteServiceProviderProfile(req, res, userId) {
  try {
    const changes = deleteServiceProviderProfile(userId);
    
    if (changes === 0) {
      return res.status(404).json({ message: 'Service provider profile not found.' });
    }
    
    return res.status(200).json({ message: 'Service provider profile deleted successfully!' });
  } catch (error) {
    console.error('Error deleting service provider profile:', error);
    return res.status(500).json({ message: 'Failed to delete service provider profile' });
  }
}
