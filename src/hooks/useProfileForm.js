import { useState, useCallback, useMemo } from 'react';
import { isValidEmail, isValidUrl } from '../lib/validation';

const REQUIRED_FIELDS = {
  artist: ['name', 'email', 'stageName', 'primaryGenre'],
  fan: ['name', 'email', 'favoriteGenres'],
  listener: ['name', 'email', 'favoriteGenres'],
  manager: ['name', 'email', 'company', 'role'],
  licensor: ['name', 'email', 'company', 'role'],
  provider: ['name', 'email', 'services']
};

const getDefaultFieldsForUserType = (userType) => {
  const defaults = {
    artist: {
      stageName: '',
      primaryGenre: '',
      yearsActive: '',
      recordLabel: ''
    },
    listener: {
      favoriteGenres: '',
      favoriteArtists: '',
      listeningHours: '',
      streamingPlatform: ''
    },
    fan: {
      favoriteGenres: '',
      favoriteArtists: '',
      listeningHours: '',
      streamingPlatform: ''
    },
    manager: {
      company: '',
      role: '',
      experience: '',
      specializations: ''
    },
    licensor: {
      company: '',
      role: '',
      experience: '',
      specializations: ''
    },
    provider: {
      services: '',
      pricing: '',
      portfolioUrl: '',
      availability: ''
    }
  };
  
  return defaults[userType] || {};
};

const getInitialFormData = (userType, initialData = {}) => ({
  // Universal fields
  name: '',
  email: '',
  bio: '',
  avatar: '',
  location: '',
  website: '',
  socialLinks: {
    twitter: '',
    instagram: '',
    facebook: '',
    youtube: '',
    spotify: '',
    soundcloud: ''
  },
  ...getDefaultFieldsForUserType(userType),
  ...initialData
});

const validateField = (field, value, userType) => {
  // Handle required fields
  if (!value && isFieldRequired(field, userType)) {
    return 'This field is required';
  }
  
  // Handle email validation
  if (field === 'email' && value && !isValidEmail(value)) {
    return 'Please enter a valid email address';
  }

  // Handle URL validation
  if ((field.includes('website') || field.includes('url') || field.startsWith('socialLinks.')) 
      && value && !isValidUrl(value)) {
    return 'Please enter a valid URL';
  }

  return '';
};

const isFieldRequired = (field, userType) => {
  const requiredFields = REQUIRED_FIELDS[userType] || [];
  if (field.includes('.')) {
    // Handle nested fields like socialLinks.twitter
    return false; // Social links are optional
  }
  return requiredFields.includes(field);
};

const useProfileForm = (userType, initialData = {}, mode = 'view') => {
  // Form data state
  const [formData, setFormData] = useState(() => getInitialFormData(userType, initialData));
  
  // Track touched fields
  const [touched, setTouched] = useState({});
  
  // Track edit mode
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  
  // Track save operation
  const [isSaving, setIsSaving] = useState(false);
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const errors = {};
    let hasErrors = false;

    // Helper to add error
    const addError = (field, value) => {
      const error = validateField(field, value, userType);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    };

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subfield, subvalue]) => {
          const fullField = `${field}.${subfield}`;
          addError(fullField, subvalue);
        });
      } else {
        addError(field, value);
      }
    });

    return { errors, hasErrors };
  }, [formData, userType]);

  // Computed validation state
  const { errors, isValid } = useMemo(() => {
    const { errors, hasErrors } = validateForm();
    return {
      errors,
      isValid: !hasErrors
    };
  }, [validateForm]);

  // Handle field changes
  const handleInputChange = useCallback((field, value) => {
    setTouched(prev => ({...prev, [field]: true}));
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = useCallback((dataUrl) => {
    handleInputChange('avatar', dataUrl);
  }, [handleInputChange]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData(userType, initialData));
    setTouched({});
  }, [userType, initialData]);

  // Handle save
  const handleSave = useCallback(async (onSave) => {
    const { hasErrors } = validateForm();
    if (hasErrors) {
      // Mark all fields as touched to show errors
      const allFields = Object.keys(formData).reduce((acc, key) => {
        if (typeof formData[key] === 'object') {
          Object.keys(formData[key]).forEach(subKey => {
            acc[`${key}.${subKey}`] = true;
          });
        } else {
          acc[key] = true;
        }
        return acc;
      }, {});
      
      setTouched(allFields);
      return false;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    resetForm();
  }, [resetForm]);

  return {
    formData,
    touched,
    errors,
    isValid,
    isEditing,
    isSaving,
    handleInputChange,
    handleAvatarUpload,
    handleSave,
    handleCancel,
    setIsEditing,
    resetForm
  };
};

export default useProfileForm;
