import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileImageUpload from '../../src/components/ProfileImageUpload';

// Mock fetch API
global.fetch = jest.fn();

describe('ProfileImageUpload', () => {
  const mockOnImageUploadSuccess = jest.fn();
  const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

  beforeEach(() => {
    fetch.mockClear();
    mockOnImageUploadSuccess.mockClear();
  });

  it('renders upload form correctly', () => {
    render(<ProfileImageUpload onImageUploadSuccess={mockOnImageUploadSuccess} />);
    
    expect(screen.getByText(/Upload Profile Image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Image/i })).toBeDisabled();
  });

  it('enables upload button when file is selected', async () => {
    render(<ProfileImageUpload onImageUploadSuccess={mockOnImageUploadSuccess} />);
    
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    expect(uploadButton).toBeDisabled();

    const fileInput = screen.getByLabelText(/Choose File/i);
    await userEvent.upload(fileInput, file);
    
    expect(uploadButton).toBeEnabled();
  });

  it('handles successful file upload', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ fileUrl: 'https://example.com/image.jpg' }) };
    fetch.mockImplementationOnce(() => Promise.resolve(mockResponse));

    render(<ProfileImageUpload onImageUploadSuccess={mockOnImageUploadSuccess} />);

    const fileInput = screen.getByLabelText(/Choose File/i);
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/upload/image', expect.any(Object));
      expect(mockOnImageUploadSuccess).toHaveBeenCalledWith('https://example.com/image.jpg');
      expect(screen.getByText(/Upload successful!/i)).toBeInTheDocument();
    });
  });

  it('handles upload failure', async () => {
    const errorMessage = 'Upload failed';
    fetch.mockImplementationOnce(() => 
      Promise.resolve({ 
        ok: false, 
        json: () => Promise.resolve({ error: errorMessage }) 
      })
    );

    render(<ProfileImageUpload onImageUploadSuccess={mockOnImageUploadSuccess} />);

    const fileInput = screen.getByLabelText(/Choose File/i);
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
      expect(mockOnImageUploadSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles network errors gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    render(<ProfileImageUpload onImageUploadSuccess={mockOnImageUploadSuccess} />);

    const fileInput = screen.getByLabelText(/Choose File/i);
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Error uploading file/i)).toBeInTheDocument();
      expect(mockOnImageUploadSuccess).not.toHaveBeenCalled();
    });
  });

  it('shows preview when image is uploaded successfully', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ fileUrl: 'https://example.com/image.jpg' }) };
    fetch.mockImplementationOnce(() => Promise.resolve(mockResponse));

    render(<ProfileImageUpload onImageUploadSuccess={mockOnImageUploadSuccess} />);

    const fileInput = screen.getByLabelText(/Choose File/i);
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Uploaded Image Preview/i)).toBeInTheDocument();
      expect(screen.getByAltText(/Profile Preview/i)).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });
});
