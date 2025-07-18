import { isValidEmail, isStrongPassword, isValidUrl, validateProfileData } from '../validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@domain.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(isStrongPassword('StrongP@ss123')).toBe(true);
      expect(isStrongPassword('C0mpl3x!Pass')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('nospecial123')).toBe(false);
      expect(isStrongPassword('NoNumbers!')).toBe(false);
      expect(isStrongPassword('no-upper-1!')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://sub.domain.com/path')).toBe(true);
      expect(isValidUrl('https://site.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('http:/missing-slash')).toBe(false);
      expect(isValidUrl('ftp://')).toBe(true);
    });
  });

  describe('validateProfileData', () => {
    describe('Artist Profile', () => {
      const validArtistProfile = {
        email: 'artist@example.com',
        stageName: 'Stage Name',
        genres: ['rock', 'pop'],
        website: 'https://artist.com',
        socialLinks: {
          twitter: 'https://twitter.com/artist',
          instagram: 'https://instagram.com/artist'
        }
      };

      it('should validate a correct artist profile', () => {
        const result = validateProfileData('artist', validArtistProfile);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch missing required fields', () => {
        const result = validateProfileData('artist', {
          email: 'artist@example.com'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Artist profile requires a stage name.');
        expect(result.errors).toContain('At least one genre must be selected.');
      });

      it('should validate social links', () => {
        const result = validateProfileData('artist', {
          ...validArtistProfile,
          socialLinks: {
            twitter: 'not-a-url',
            instagram: 'https://instagram.com/artist'
          }
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid twitter URL provided.');
      });
    });

    describe('Fan Profile', () => {
      const validFanProfile = {
        email: 'fan@example.com',
        displayName: 'Fan Name',
        favoriteGenres: ['rock', 'jazz']
      };

      it('should validate a correct fan profile', () => {
        const result = validateProfileData('fan', validFanProfile);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch missing display name', () => {
        const result = validateProfileData('fan', {
          email: 'fan@example.com',
          favoriteGenres: ['rock']
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Fan profile requires a display name.');
      });
    });

    describe('Licensor Profile', () => {
      const validLicensorProfile = {
        email: 'licensor@example.com',
        businessEmail: 'business@example.com',
        companyName: 'Licensing Co',
        licenseTypes: ['sync', 'mechanical'],
        website: 'https://licensing.com'
      };

      it('should validate a correct licensor profile', () => {
        const result = validateProfileData('licensor', validLicensorProfile);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch missing business details', () => {
        const result = validateProfileData('licensor', {
          email: 'licensor@example.com'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Licensor profile requires a company name.');
        expect(result.errors).toContain('A valid business email is required.');
        expect(result.errors).toContain('Please select at least one license type.');
      });
    });

    describe('Service Provider Profile', () => {
      const validServiceProfile = {
        email: 'provider@example.com',
        businessEmail: 'business@example.com',
        businessName: 'Service Co',
        services: ['mastering', 'mixing'],
        website: 'https://service.com'
      };

      it('should validate a correct service provider profile', () => {
        const result = validateProfileData('service_provider', validServiceProfile);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch missing service details', () => {
        const result = validateProfileData('service_provider', {
          email: 'provider@example.com'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Service Provider profile requires a business name.');
        expect(result.errors).toContain('Please select at least one service you provide.');
        expect(result.errors).toContain('A valid business email is required.');
      });
    });

    it('should reject invalid profile types', () => {
      const result = validateProfileData('invalid_type', {});
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid profile type.');
    });

    it('should validate common fields across all profiles', () => {
      const result = validateProfileData('artist', {
        stageName: 'Artist',
        genres: ['rock'],
        website: 'not-a-valid-url'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A valid email address is required.');
      expect(result.errors).toContain('Website URL must be valid.');
    });
  });
});
