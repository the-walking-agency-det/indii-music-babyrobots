import React, { useState, useEffect } from 'react';
import { useUserType } from '../ui/UserTypeDetector';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Save, Upload, User, Music, Headphones, Briefcase } from 'lucide-react';

/**
 * UNIVERSAL PROFILE SYSTEM - YOLO CONSOLIDATION
 * 
 * This replaces:
 * - ArtistProfileForm.jsx
 * - FanProfileForm.jsx
 * - LicensorProfileForm.jsx
 * - ServiceProviderProfileForm.jsx
 * - ProfileManager.jsx
 * - ProfileImageUpload.jsx
 * 
 * One profile form to rule them all!
 */

const UniversalProfile = ({ 
  initialData = {},
  onSave = () => {},
  onCancel = () => {},
  mode = 'view', // 'view', 'edit', 'create'
  userType = null,
  className = ""
}) => {
  const { userType: contextUserType } = useUserType();
  const effectiveUserType = userType || contextUserType || 'artist';
  
  const [formData, setFormData] = useState(() => ({
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
    ...getDefaultFieldsForUserType(effectiveUserType),
    ...initialData
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(formData.avatar);

  const handleSave = async () => {
    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    Object.entries(formData).forEach(([field, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subfield, subvalue]) => {
          const fullField = `${field}.${subfield}`;
          const error = validateField(fullField, subvalue);
          if (error) {
            newErrors[fullField] = error;
            hasErrors = true;
          }
        });
      } else {
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      setTouched(Object.keys(newErrors).reduce((acc, key) => ({...acc, [key]: true}), {}));
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...initialData });
    onCancel();
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = (field, value) => {
    if (!value && isFieldRequired(field, effectiveUserType)) {
      return 'This field is required';
    }
    
    if (field === 'email' && value && !validateEmail(value)) {
      return 'Please enter a valid email address';
    }

    if ((field.includes('website') || field.includes('url') || field.startsWith('socialLinks.')) 
        && value && !validateUrl(value)) {
      return 'Please enter a valid URL';
    }

    return '';
  };

  const handleInputChange = (field, value) => {
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

    // Validate field on change
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setAvatarPreview(dataUrl);
        handleInputChange('avatar', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const getUserTypeIcon = (type) => {
    const icons = {
      artist: Music,
      listener: Headphones,
      manager: Briefcase,
      fan: Headphones,
      licensor: Briefcase,
      provider: Briefcase
    };
    return icons[type] || User;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      artist: 'purple',
      listener: 'blue',
      manager: 'green',
      fan: 'blue',
      licensor: 'yellow',
      provider: 'red'
    };
    return colors[type] || 'gray';
  };

  const Icon = getUserTypeIcon(effectiveUserType);
  const color = getUserTypeColor(effectiveUserType);

  return (
    <div className={`universal-profile ${className}`}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`w-12 h-12 bg-${color}-500 rounded-full flex items-center justify-center text-white`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getProfileTitle(effectiveUserType)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getProfileSubtitle(effectiveUserType)}
              </p>
            </div>
          </div>
          
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              className="ml-auto"
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={avatarPreview || '/default-avatar.png'} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload-input"
                    data-testid="avatar-upload-input"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <ProfileField 
                label="Name"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                isEditing={isEditing}
                required
                errors={errors}
                fieldName="name"
                touched={touched}
              />
            </div>
          </div>

          {/* Universal Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label="Email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              isEditing={isEditing}
              type="email"
              required
              errors={errors}
              fieldName="email"
              touched={touched}
            />
            <ProfileField 
              label="Location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="location"
              touched={touched}
            />
            <ProfileField 
              label="Website"
              value={formData.website}
              onChange={(value) => handleInputChange('website', value)}
              isEditing={isEditing}
              type="url"
              errors={errors}
              fieldName="website"
              touched={touched}
            />
          </div>

          <ProfileField 
            label="Bio"
            value={formData.bio}
            onChange={(value) => handleInputChange('bio', value)}
            isEditing={isEditing}
            type="textarea"
            rows={4}
            errors={errors}
            fieldName="bio"
            touched={touched}
          />

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.socialLinks).map(([platform, url]) => (
                <ProfileField 
                    key={platform}
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    value={url}
                    onChange={(value) => handleInputChange(`socialLinks.${platform}`, value)}
                    isEditing={isEditing}
                    type="url"
                    errors={errors}
                    fieldName={`socialLinks.${platform}`}
                    touched={touched}
                  />
              ))}
            </div>
          </div>

          {/* User Type Specific Fields */}
          <UserTypeSpecificFields 
            userType={effectiveUserType}
            formData={formData}
            onChange={handleInputChange}
            isEditing={isEditing}
            errors={errors}
            touched={touched}
          />

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Profile field component
const ProfileField = ({
  label,
  value,
  onChange,
  isEditing,
  type = 'text',
  required = false,
  rows = 1,
  options = [],
  errors,
  fieldName,
  touched,
  id // Add id prop
}) => {
  const inputId = id || `profile-field-${fieldName}`;

  if (!isEditing) {
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div className="text-gray-900 dark:text-gray-100 min-h-[1.5rem]">
          {value || <span className="text-gray-400 italic">Not specified</span>}
        </div>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label id={`${inputId}-label`} htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div>
        <Input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)} 
          className={`w-full ${errors && fieldName && errors[fieldName] ? 'border-red-500' : ''}`}
          required={required}
          aria-labelledby={`${inputId}-label`}
        />
        {errors && fieldName && touched && touched[fieldName] && (
          <span className="text-red-500 text-sm mt-1">{errors[fieldName]}</span>
        )}
      </div>
    </div>
  );
};

// User type specific fields
const UserTypeSpecificFields = ({ userType, formData, onChange, isEditing, errors, touched }) => {
  switch (userType) {
    case 'artist':
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Artist Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label="Stage Name"
              value={formData.stageName}
              onChange={(value) => onChange('stageName', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="stageName"
              touched={touched}
            />
            <ProfileField 
              label="Primary Genre"
              value={formData.primaryGenre}
              onChange={(value) => onChange('primaryGenre', value)}
              isEditing={isEditing}
              type="select"
              options={[
                { value: 'pop', label: 'Pop' },
                { value: 'rock', label: 'Rock' },
                { value: 'hip-hop', label: 'Hip-Hop' },
                { value: 'electronic', label: 'Electronic' },
                { value: 'country', label: 'Country' },
                { value: 'jazz', label: 'Jazz' },
                { value: 'classical', label: 'Classical' },
                { value: 'indie', label: 'Indie' },
                { value: 'folk', label: 'Folk' },
                { value: 'other', label: 'Other' }
              ]}
              errors={errors}
              fieldName="primaryGenre"
              touched={touched}
            />
            <ProfileField 
              label="Years Active"
              value={formData.yearsActive}
              onChange={(value) => onChange('yearsActive', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="yearsActive"
              touched={touched}
            />
            <ProfileField 
              label="Record Label"
              value={formData.recordLabel}
              onChange={(value) => onChange('recordLabel', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="recordLabel"
              touched={touched}
            />
          </div>
        </div>
      );
    
    case 'listener':
    case 'fan':
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Music Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label="Favorite Genres"
              value={formData.favoriteGenres}
              onChange={(value) => onChange('favoriteGenres', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="favoriteGenres"
              touched={touched}
            />
            <ProfileField 
              label="Favorite Artists"
              value={formData.favoriteArtists}
              onChange={(value) => onChange('favoriteArtists', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="favoriteArtists"
              touched={touched}
            />
            <ProfileField 
              label="Listening Hours per Week"
              value={formData.listeningHours}
              onChange={(value) => onChange('listeningHours', value)}
              isEditing={isEditing}
              type="number"
              errors={errors}
              fieldName="listeningHours"
              touched={touched}
            />
            <ProfileField 
              label="Preferred Streaming Platform"
              value={formData.streamingPlatform}
              onChange={(value) => onChange('streamingPlatform', value)}
              isEditing={isEditing}
              type="select"
              options={[
                { value: 'spotify', label: 'Spotify' },
                { value: 'apple-music', label: 'Apple Music' },
                { value: 'youtube-music', label: 'YouTube Music' },
                { value: 'amazon-music', label: 'Amazon Music' },
                { value: 'tidal', label: 'Tidal' },
                { value: 'soundcloud', label: 'SoundCloud' },
                { value: 'other', label: 'Other' }
              ]}
              errors={errors}
              fieldName="streamingPlatform"
              touched={touched}
            />
          </div>
        </div>
      );
    
    case 'manager':
    case 'licensor':
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label="Company"
              value={formData.company}
              onChange={(value) => onChange('company', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="company"
              touched={touched}
            />
            <ProfileField 
              label="Role/Position"
              value={formData.role}
              onChange={(value) => onChange('role', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="role"
              touched={touched}
            />
            <ProfileField 
              label="Years of Experience"
              value={formData.experience}
              onChange={(value) => onChange('experience', value)}
              isEditing={isEditing}
              type="number"
              errors={errors}
              fieldName="experience"
              touched={touched}
            />
            <ProfileField 
              label="Specializations"
              value={formData.specializations}
              onChange={(value) => onChange('specializations', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="specializations"
              touched={touched}
            />
          </div>
        </div>
      );
    
    case 'provider':
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Service Provider Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label="Services Offered"
              value={formData.services}
              onChange={(value) => onChange('services', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="services"
              touched={touched}
            />
            <ProfileField 
              label="Pricing Structure"
              value={formData.pricing}
              onChange={(value) => onChange('pricing', value)}
              isEditing={isEditing}
              errors={errors}
              fieldName="pricing"
              touched={touched}
            />
            <ProfileField 
              label="Portfolio URL"
              value={formData.portfolioUrl}
              onChange={(value) => onChange('portfolioUrl', value)}
              isEditing={isEditing}
              type="url"
              errors={errors}
              fieldName="portfolioUrl"
              touched={touched}
            />
            <ProfileField 
              label="Availability"
              value={formData.availability}
              onChange={(value) => onChange('availability', value)}
              isEditing={isEditing}
              type="select"
              options={[
                { value: 'available', label: 'Available Now' },
                { value: 'limited', label: 'Limited Availability' },
                { value: 'booked', label: 'Fully Booked' },
                { value: 'not-available', label: 'Not Available' }
              ]}
              errors={errors}
              fieldName="availability"
              touched={touched}
            />
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

// Helper functions
// Required fields by user type
const REQUIRED_FIELDS = {
  artist: ['name', 'email', 'stageName', 'primaryGenre'],
  fan: ['name', 'email', 'favoriteGenres'],
  listener: ['name', 'email', 'favoriteGenres'],
  manager: ['name', 'email', 'company', 'role'],
  licensor: ['name', 'email', 'company', 'role'],
  provider: ['name', 'email', 'services']
};

// Helper function to check if a field is required
function isFieldRequired(field, userType) {
  const requiredFields = REQUIRED_FIELDS[userType] || [];
  if (field.includes('.')) {
    // Handle nested fields like socialLinks.twitter
    const [parent, child] = field.split('.');
    return false; // Social links are optional
  }
  return requiredFields.includes(field);
}

function getDefaultFieldsForUserType(userType) {
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
}

function getProfileTitle(userType) {
  const titles = {
    artist: 'Artist Profile',
    listener: 'Listener Profile',
    fan: 'Fan Profile',
    manager: 'Manager Profile',
    licensor: 'Licensor Profile',
    provider: 'Service Provider Profile'
  };
  return titles[userType] || 'Profile';
}

function getProfileSubtitle(userType) {
  const subtitles = {
    artist: 'Showcase your musical journey',
    listener: 'Share your music preferences',
    fan: 'Connect with your favorite artists',
    manager: 'Manage your music business',
    licensor: 'License music for projects',
    provider: 'Offer your services to the music industry'
  };
  return subtitles[userType] || 'Complete your profile';
}

export default UniversalProfile;
