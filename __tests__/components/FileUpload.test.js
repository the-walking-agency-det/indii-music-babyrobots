import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileUpload from '../../components/FileUpload'

// Mock file data
const validImageFile = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' })
const invalidFile = new File(['x'], 'virus.exe', { type: 'application/x-msdownload' })
const largeFile = new File(['x'.repeat(5242880)], 'large.jpg', { type: 'image/jpeg' })

describe('File Upload System', () => {
  const mockOnUpload = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('handles various file types', async () => {
    render(
      <FileUpload 
        acceptedTypes={['image/png', 'image/jpeg']}
        onUpload={mockOnUpload}
        onError={mockOnError}
      />
    )

    const input = screen.getByLabelText(/choose file/i)

    // Test valid file
    fireEvent.change(input, { target: { files: [validImageFile] } })
    expect(screen.getByText(/cool.png/)).toBeInTheDocument()
    expect(mockOnError).not.toHaveBeenCalled()

    // Clear and test invalid file
    fireEvent.change(input, { target: { files: [invalidFile] } })
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('file type not allowed') })
    )
  })

  test('validates file size/type', async () => {
    render(
      <FileUpload 
        maxSizeMB={5}
        acceptedTypes={['image/jpeg', 'image/png']}
        onUpload={mockOnUpload}
        onError={mockOnError}
      />
    )

    const input = screen.getByLabelText(/choose file/i)

    // Test oversized file
    fireEvent.change(input, { target: { files: [largeFile] } })
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('file too large') })
    )
    expect(screen.getByText(/maximum size: 5mb/i)).toBeInTheDocument()
  })

  test('shows upload progress', async () => {
    // Mock XMLHttpRequest
    const xhrMock = {
      upload: {
        addEventListener: jest.fn()
      },
      addEventListener: jest.fn(),
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn()
    }
    window.XMLHttpRequest = jest.fn(() => xhrMock)

    render(
      <FileUpload 
        onUpload={mockOnUpload}
        onError={mockOnError}
        showProgress
      />
    )

    const input = screen.getByLabelText(/choose file/i)
    fireEvent.change(input, { target: { files: [validImageFile] } })

    // Simulate upload progress
    const progressEvent = { lengthComputable: true, loaded: 50, total: 100 }
    xhrMock.upload.addEventListener.mock.calls[0][1](progressEvent)

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50')
    })
  })

  test('handles upload errors gracefully', async () => {
    // Mock failed upload
    const mockError = new Error('Network error')
    const failedXHR = {
      upload: {
        addEventListener: jest.fn()
      },
      addEventListener: jest.fn(),
      open: jest.fn(),
      send: jest.fn(() => {
        throw mockError
      }),
      setRequestHeader: jest.fn()
    }
    window.XMLHttpRequest = jest.fn(() => failedXHR)

    render(
      <FileUpload 
        onUpload={mockOnUpload}
        onError={mockOnError}
      />
    )

    const input = screen.getByLabelText(/choose file/i)
    fireEvent.change(input, { target: { files: [validImageFile] } })

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(mockError)
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })

    // Verify retry button appears
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()

    // Test retry functionality
    fireEvent.click(retryButton)
    expect(failedXHR.send).toHaveBeenCalledTimes(2)
  })
})
