import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { mockArtistData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import { AuthProvider } from '../../contexts/AuthContext'
import { LoginForm, SecureRoute, DataProtection } from '../../components/security'

jest.mock('../../services/apiService', () => apiService)

describe('Security Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Authentication', () => {
    test('validates session tokens', async () => {
      const mockToken = 'valid-jwt-token'
      apiService.auth.validateToken.mockResolvedValueOnce({ valid: true })

      render(
        <AuthProvider>
          <SecureRoute>
            <div>Protected Content</div>
          </SecureRoute>
        </AuthProvider>
      )

      // Should redirect to login when no token
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
      expect(screen.getByText(/login required/i)).toBeInTheDocument()

      // Add token and verify access
      await act(async () => {
        localStorage.setItem('authToken', mockToken)
        fireEvent.click(screen.getByText(/retry/i))
      })

      expect(await screen.findByText(/protected content/i)).toBeInTheDocument()
    })

    test('handles token expiration', async () => {
      const expiredToken = 'expired-token'
      apiService.auth.validateToken.mockRejectedValueOnce(
        new Error('Token expired')
      )

      render(
        <AuthProvider>
          <SecureRoute>
            <div>Protected Content</div>
          </SecureRoute>
        </AuthProvider>
      )

      // Add expired token
      localStorage.setItem('authToken', expiredToken)

      // Should show refresh prompt
      expect(await screen.findByText(/session expired/i)).toBeInTheDocument()
      expect(screen.getByText(/refresh session/i)).toBeInTheDocument()
    })
  })

  describe('Authorization', () => {
    test('enforces role-based access control', async () => {
      render(
        <AuthProvider>
          <SecureRoute requiredRole="admin">
            <div>Admin Only</div>
          </SecureRoute>
        </AuthProvider>
      )

      // Mock user with insufficient role
      await act(async () => {
        apiService.auth.getCurrentUser.mockResolvedValueOnce({
          role: 'user'
        })
      })

      expect(screen.queryByText(/admin only/i)).not.toBeInTheDocument()
      expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument()
    })

    test('validates permission boundaries', async () => {
      render(
        <AuthProvider>
          <SecureRoute requiredPermissions={['edit_royalties']}>
            <div>Edit Royalties</div>
          </SecureRoute>
        </AuthProvider>
      )

      // Mock user with correct permission
      await act(async () => {
        apiService.auth.getCurrentUser.mockResolvedValueOnce({
          permissions: ['view_royalties', 'edit_royalties']
        })
      })

      expect(await screen.findByText(/edit royalties/i)).toBeInTheDocument()
    })
  })

  describe('Data Protection', () => {
    test('sanitizes user input', async () => {
      const maliciousInput = '<script>alert("xss")</script>'
      
      render(<DataProtection />)
      
      const input = screen.getByLabelText(/artist name/i)
      fireEvent.change(input, { target: { value: maliciousInput } })
      fireEvent.click(screen.getByText(/save/i))

      // Verify sanitization
      const savedValue = await screen.findByText(/saved value/i)
      expect(savedValue).not.toContainHTML(maliciousInput)
    })

    test('protects sensitive information', async () => {
      render(<DataProtection />)

      // Try to access sensitive data
      const bankInfo = screen.getByLabelText(/bank account/i)
      expect(bankInfo).toHaveValue('************1234')

      // Verify masked SSN
      const ssnField = screen.getByLabelText(/ssn/i)
      expect(ssnField).toHaveValue('XXX-XX-1234')
    })
  })

  describe('Form Security', () => {
    test('prevents CSRF attacks', async () => {
      render(<LoginForm />)

      // Verify CSRF token in form
      const form = screen.getByRole('form')
      const csrfToken = form.querySelector('input[name="csrf_token"]')
      expect(csrfToken).toBeInTheDocument()

      // Submit form and verify token validation
      fireEvent.click(screen.getByText(/submit/i))
      expect(apiService.auth.login).toHaveBeenCalledWith(
        expect.objectContaining({
          csrf_token: expect.any(String)
        })
      )
    })

    test('implements rate limiting', async () => {
      render(<LoginForm />)

      // Attempt multiple rapid logins
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText(/submit/i))
      }

      // Verify rate limit message
      expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument()
      expect(screen.getByText(/try again in \d+ seconds/i)).toBeInTheDocument()
    })
  })
})
