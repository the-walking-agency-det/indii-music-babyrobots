import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArtistProfileForm from '../../src/components/ArtistProfileForm';
import { faker } from '@faker-js/faker';

// Mock the Toast component with proper functionality
const mockAddToast = jest.fn();
jest.mock('../../src/components/ui/Toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock the ProfileImageUpload component
jest.mock('../../src/components/ProfileImageUpload', () => {
  return function MockProfileImageUpload({ onImageUploadSuccess }) {
    return (
      <button
        onClick={() => onImageUploadSuccess('https://example.com/mock-image.jpg')}
        data-testid="mock-image-upload"
      >
        Upload Image
      </button>
    );
  };
});

// Mock the fetch API globally, but allow for specific overrides per test
global.fetch = jest.fn();

describe('ArtistProfileForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockAddToast.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

it('renders the create profile form correctly', async () => {
    // Mock fetch to return 404 for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) })
    );

    await act(async () => {
      render(<ArtistProfileForm userId={1} />);
    });

    // Check form elements
    expect(screen.getByRole('heading', { name: /Create Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Stage Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Legal Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Website:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PRO Affiliation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IPI Number:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Social Links/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-image-upload')).toBeInTheDocument();

    // Verify API call
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `/api/profile/artist?userId=${1}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );

    // Verify toast message
    expect(mockAddToast).toHaveBeenCalledWith(
      'No existing profile found. You can create a new one below.',
      'info'
    );
  });

  it('renders the edit profile form correctly when profile exists', async () => {
    const mockProfile = {
      id: 101,
      stage_name: 'Existing Artist',
      legal_name: faker.person.lastName(),
      bio: faker.lorem.sentence(),
      website: faker.internet.url(),
      pro_affiliation: faker.company.name(),
      ipi_number: faker.string.numeric(5),
      social_links: JSON.stringify({ twitter: faker.internet.username() }),
      profile_image_url: faker.image.avatar(),
    };
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      })
    );

    await act(async () => {
      render(<ArtistProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Artist Profile/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Stage Name:/i)).toHaveValue('Existing Artist');
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
  });

it('handles profile creation successfully', async () => {
    // Mock fetch to return 404 for GET first, then success for POST
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) }));
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Artist profile created successfully!', profileId: 102 }) }));

    await act(async () => {
      render(<ArtistProfileForm userId={2} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Artist Profile/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Stage Name:/i), 'New Artist');
    await userEvent.type(screen.getByLabelText(/Legal Name:/i), 'New Legal');
    await fireEvent.click(screen.getByRole('button', { name: /Create Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + POST
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/artist',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            stage_name: 'New Artist',
            legal_name: 'New Legal',
            bio: '',
            website: '',
            pro_affiliation: '',
            ipi_number: '',
            social_links: null,
            profile_image_url: '',
            user_id: 2
          }),
        })
      );
    });

    expect(mockAddToast).toHaveBeenCalledWith('Profile created successfully!', 'success');
  });

  it('handles profile update successfully', async () => {
    const mockProfile = {
      id: 101,
      stage_name: 'Existing Artist',
      legal_name: faker.person.lastName(),
      bio: faker.lorem.sentence(),
      website: faker.internet.url(),
      pro_affiliation: faker.company.name(),
      ipi_number: faker.string.numeric(5),
      social_links: JSON.stringify({ twitter: faker.internet.username() }),
      profile_image_url: faker.image.avatar(),
    };
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      })
    );
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Artist profile updated successfully!' }) }));

    await act(async () => {
      render(<ArtistProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Artist Profile/i })).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Bio:/i));
    const updatedBio = faker.lorem.sentence();
    await userEvent.type(screen.getByLabelText(/Bio:/i), updatedBio);
    await fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + PUT
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/artist',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            stage_name: 'Existing Artist',
            legal_name: mockProfile.legal_name,
            bio: updatedBio,
            website: mockProfile.website,
            pro_affiliation: mockProfile.pro_affiliation,
            ipi_number: mockProfile.ipi_number,
            social_links: mockProfile.social_links,
            profile_image_url: mockProfile.profile_image_url,
            user_id: 1
          }),
        })
      );
      expect(mockAddToast).toHaveBeenCalledWith('Profile updated successfully!', 'success');
    });
  });
});
