import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UniversalProfile from '../../src/components/forms/UniversalProfile';

/**
 * UNIVERSAL PROFILE TESTS
 * 
 * This test suite replaces:
 * - ArtistProfileForm.test.js
 * - FanProfileForm.test.js
 * - LicensorProfileForm.test.js
 * - ServiceProviderProfileForm.test.js
 * - ProfileImageUpload.test.js
 * - ProfileManager.test.js
 */

// Mock the UserTypeDetector
jest.mock('../../src/components/ui/UserTypeDetector', () => ({
  useUserType: () => ({ userType: 'artist' })
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Save: () => <span data-testid="save-icon">Save</span>,
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Music: () => <span data-testid="music-icon">Music</span>,
  Headphones: () => <span data-testid="headphones-icon">Headphones</span>,
  Briefcase: () => <span data-testid="briefcase-icon">Briefcase</span>,
}));

// Mock Card components
jest.mock('../../src/components/ui/card', () => ({
  Card: ({ children, className }) => <div className={`card ${className}`}>{children}</div>,
  CardContent: ({ children, className }) => <div className={`card-content ${className}`}>{children}</div>,
  CardHeader: ({ children, className }) => <div className={`card-header ${className}`}>{children}</div>,
}));

// Mock Button and Input
jest.mock('../../src/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`btn ${variant || ''} ${className || ''}`}
      type="button"
    >
      {children}
    </button>
  )
}));

jest.mock('../../src/components/ui/input', () => ({
  Input: ({ value, onChange, type, className, required, id, 'aria-labelledby': ariaLabelledby }) => (
    <input 
      value={value} 
      onChange={onChange} 
      type={type} 
      className={`input ${className || ''}`}
      required={required}
      id={id}
      aria-labelledby={ariaLabelledby}
    />
  )
}));

describe('UniversalProfile', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    mode: 'view',
    userType: 'artist',
    initialData: {
      socialLinks: {
        twitter: '',
        instagram: '',
        facebook: '',
        youtube: '',
        spotify: '',
        soundcloud: ''
      }
    }
  };

  describe('Basic Rendering', () => {
    test('renders artist profile by default', () => {
      render(<UniversalProfile {...defaultProps} />);
      
      expect(screen.getByText('Artist Profile')).toBeInTheDocument();
      expect(screen.getByText('Showcase your musical journey')).toBeInTheDocument();
      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
    });

    test('renders different user types correctly', () => {
      const userTypes = [
        { type: 'fan', title: 'Fan Profile', subtitle: 'Connect with your favorite artists' },
        { type: 'listener', title: 'Listener Profile', subtitle: 'Share your music preferences' },
        { type: 'manager', title: 'Manager Profile', subtitle: 'Manage your music business' },
        { type: 'licensor', title: 'Licensor Profile', subtitle: 'License music for projects' },
        { type: 'provider', title: 'Service Provider Profile', subtitle: 'Offer your services to the music industry' }
      ];

      userTypes.forEach(({ type, title, subtitle }) => {
        const { rerender } = render(
          <UniversalProfile {...defaultProps} userType={type} />
        );
        
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(subtitle)).toBeInTheDocument();
        
        rerender(<div />); // Clear the component
      });
    });

    test('shows edit button in view mode', () => {
      render(<UniversalProfile {...defaultProps} mode="view" />);
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    test('shows save and cancel buttons in edit mode', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      expect(screen.getByText('Save Profile')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('switches to edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="view" />);
      
      const editButton = screen.getByText('Edit Profile');
      await user.click(editButton);
      
      expect(screen.getByText('Save Profile')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Test Artist');

      const emailInput = screen.getByRole('textbox', { name: 'Email *' });
      await user.type(emailInput, 'test@example.com');
      
      const stageNameInput = screen.getByLabelText('Stage Name');
      await user.type(stageNameInput, 'Test Stage');

      const primaryGenreSelect = screen.getByLabelText('Primary Genre');
      await user.selectOptions(primaryGenreSelect, 'pop');

      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalled();
    });

    test('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('updates form data when inputs change', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Test Artist');
      
      expect(nameInput.value).toBe('Test Artist');
    });
  });

  describe('User Type Specific Fields', () => {
    test('shows artist-specific fields for artist profile', () => {
      render(<UniversalProfile {...defaultProps} userType="artist" mode="edit" />);
      
      expect(screen.getByText('Artist Information')).toBeInTheDocument();
      expect(screen.getByText('Stage Name')).toBeInTheDocument();
      expect(screen.getByText('Primary Genre')).toBeInTheDocument();
      expect(screen.getByText('Years Active')).toBeInTheDocument();
      expect(screen.getByText('Record Label')).toBeInTheDocument();
    });

    test('shows fan-specific fields for fan profile', () => {
      render(<UniversalProfile {...defaultProps} userType="fan" mode="edit" />);
      
      expect(screen.getByText('Music Preferences')).toBeInTheDocument();
      expect(screen.getByText('Favorite Genres')).toBeInTheDocument();
      expect(screen.getByText('Favorite Artists')).toBeInTheDocument();
      expect(screen.getByText('Listening Hours per Week')).toBeInTheDocument();
      expect(screen.getByText('Preferred Streaming Platform')).toBeInTheDocument();
    });

    test('shows manager-specific fields for manager profile', () => {
      render(<UniversalProfile {...defaultProps} userType="manager" mode="edit" />);
      
      expect(screen.getByText('Professional Information')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Role/Position')).toBeInTheDocument();
      expect(screen.getByText('Years of Experience')).toBeInTheDocument();
      expect(screen.getByText('Specializations')).toBeInTheDocument();
    });

    test('shows provider-specific fields for provider profile', () => {
      render(<UniversalProfile {...defaultProps} userType="provider" mode="edit" />);
      
      expect(screen.getByText('Service Provider Information')).toBeInTheDocument();
      expect(screen.getByText('Services Offered')).toBeInTheDocument();
      expect(screen.getByText('Pricing Structure')).toBeInTheDocument();
      expect(screen.getByText('Portfolio URL')).toBeInTheDocument();
      expect(screen.getByText('Availability')).toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    test('renders all social link fields', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      expect(screen.getByText('Social Links')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Youtube')).toBeInTheDocument();
      expect(screen.getByText('Spotify')).toBeInTheDocument();
      expect(screen.getByText('Soundcloud')).toBeInTheDocument();
    });
  });

  describe('Avatar Upload', () => {
    test('shows avatar upload option in edit mode', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    test('handles avatar file selection', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      const fileInput = screen.getByTestId('avatar-upload-input');
      
      await user.upload(fileInput, file);
      
      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files[0]).toBe(file);
    });
  });

  describe('Data Persistence', () => {
    test('displays initial data correctly', () => {
      const initialData = {
        name: 'Test Artist',
        email: 'test@example.com',
        bio: 'Test bio',
        stageName: 'Test Stage Name'
      };
      
      render(
        <UniversalProfile 
          {...defaultProps} 
          initialData={initialData} 
          mode="view" 
        />
      );
      
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
    });

    test('saves form data with correct structure', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue();
      
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Test Artist');

      const emailInput = screen.getByRole('textbox', { name: 'Email *' });
      await user.type(emailInput, 'test@example.com');
      
      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Artist',
          email: 'test@example.com',
          bio: '',
          socialLinks: expect.objectContaining({
            twitter: '',
            instagram: '',
            facebook: '',
            youtube: '',
            spotify: '',
            soundcloud: ''
          })
        })
      );
    });
  });

  describe('Loading States', () => {
    test('shows loading state when saving', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    test('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSave.mockRejectedValue(new Error('Save failed'));
      
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error saving profile:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Validation', () => {
    test('shows required field indicators', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      // Required fields by user type
      const requiredFields = {
        artist: ['Name', 'Email', 'Stage Name', 'Primary Genre'],
        fan: ['Name', 'Email', 'Favorite Genres'],
        manager: ['Name', 'Email', 'Company', 'Role/Position'],
        provider: ['Name', 'Email', 'Services Offered']
      };

      const userType = defaultProps.userType;
      requiredFields[userType].forEach(field => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      
      const emailInput = screen.getByRole('textbox', { name: 'Email *' });
      await user.type(emailInput, 'invalid-email');
      
      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('validates social media URLs', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const twitterInput = screen.getByRole('textbox', { name: 'Twitter' });
      await user.type(twitterInput, 'not-a-url');
      
      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    test('shows not specified for empty fields in view mode', () => {
      render(<UniversalProfile {...defaultProps} mode="view" />);
      
      const notSpecifiedElements = screen.getAllByText('Not specified');
      expect(notSpecifiedElements.length).toBeGreaterThan(0);
    });

    test('validates required fields before save', async () => {
      const user = userEvent.setup();
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      // Try to save without filling required fields
      const saveButton = screen.getByText('Save Profile');
      await user.click(saveButton);
      
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive grid classes', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const gridElements = screen.getAllByText('', { selector: '.grid-cols-1.md\\:grid-cols-2' });
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
      expect(screen.getByText('Bio')).toBeInTheDocument();
    });

    test('has proper button roles and labels', () => {
      render(<UniversalProfile {...defaultProps} mode="edit" />);
      
      const saveButton = screen.getByText('Save Profile');
      const cancelButton = screen.getByText('Cancel');
      
      expect(saveButton).toHaveProperty('type', 'button');
      expect(cancelButton).toHaveProperty('type', 'button');
    });
  });
});
