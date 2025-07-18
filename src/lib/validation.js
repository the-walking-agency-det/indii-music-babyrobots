export const isValidEmail = (email) => {
  // Basic email regex for format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
  // Password must be at least 8 characters long
  // Contain at least one uppercase letter
  // Contain at least one lowercase letter
  // Contain at least one number
  // Contain at least one special character
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
  return strongRegex.test(password);
};

export const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    // Check for common protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    // Ensure there's a host
    if (!parsedUrl.host) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const validateProfileData = (role, profile) => {
  const errors = [];
  
  // Common validations for all profiles
  if (!profile.email || !isValidEmail(profile.email)) {
    errors.push('A valid email address is required.');
  }

  if (profile.website && !isValidUrl(profile.website)) {
    errors.push('Website URL must be valid.');
  }

  // Role-specific validations
  switch (role) {
    case 'artist':
      if (!profile.stageName?.trim()) {
        errors.push('Artist profile requires a stage name.');
      }
      if (!profile.genres || profile.genres.length === 0) {
        errors.push('At least one genre must be selected.');
      }
      if (profile.socialLinks) {
        Object.entries(profile.socialLinks).forEach(([platform, url]) => {
          if (url && !isValidUrl(url)) {
            errors.push(`Invalid ${platform} URL provided.`);
          }
        });
      }
      break;

    case 'fan':
      if (!profile.displayName?.trim()) {
        errors.push('Fan profile requires a display name.');
      }
      if (profile.favoriteGenres && profile.favoriteGenres.length === 0) {
        errors.push('Please select at least one favorite genre.');
      }
      break;

    case 'licensor':
      if (!profile.companyName?.trim()) {
        errors.push('Licensor profile requires a company name.');
      }
      if (!profile.businessEmail || !isValidEmail(profile.businessEmail)) {
        errors.push('A valid business email is required.');
      }
      if (!profile.licenseTypes || profile.licenseTypes.length === 0) {
        errors.push('Please select at least one license type.');
      }
      break;

    case 'service_provider':
      if (!profile.businessName?.trim()) {
        errors.push('Service Provider profile requires a business name.');
      }
      if (!profile.services || profile.services.length === 0) {
        errors.push('Please select at least one service you provide.');
      }
      if (!profile.businessEmail || !isValidEmail(profile.businessEmail)) {
        errors.push('A valid business email is required.');
      }
      break;

    default:
      return { isValid: false, message: 'Invalid profile type.' };
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(' '),
    errors: errors // Include full error array for detailed feedback
  };
};
