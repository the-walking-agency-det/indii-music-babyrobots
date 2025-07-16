import { Request, Response } from 'express';
import { errorHandler } from '../../middleware/error-handler';
import { IndiiError, ValidationError, AuthenticationError } from '../../utils/errors/types';
import { loggerService } from '../../services/logger';

// Mock logger service
jest.mock('../../services/logger', () => ({
  loggerService: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {
        'x-request-id': 'test-request-id'
      },
      path: '/api/test',
      method: 'POST',
      body: {},
      query: {},
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should handle IndiiError correctly', () => {
    const error = new ValidationError('Invalid input', {
      field: 'email',
      value: 'invalid-email'
    });

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: {
        field: 'email',
        value: 'invalid-email'
      },
      requestId: 'test-request-id'
    }));
  });

  it('should handle standard Error correctly', () => {
    const error = new Error('Something went wrong');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
      requestId: 'test-request-id'
    }));
  });

  it('should map different error types to correct HTTP status codes', () => {
    // Test ValidationError
    const validationError = new ValidationError('Invalid input');
    errorHandler(
      validationError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);

    // Reset mocks
    jest.clearAllMocks();

    // Test AuthenticationError
    const authError = new AuthenticationError('Unauthorized', 'AUTHENTICATION_ERROR');
    errorHandler(
      authError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });

  it('should include stack trace in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Development error');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          stack: expect.any(String)
        })
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  describe('Sensitive Data Handling', () => {
    it('should redact sensitive information in request body', () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'secret123',
        data: {
          apiKey: 'abc123',
          description: 'test'
        }
      };

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          body: {
            username: 'testuser',
            password: '[REDACTED]',
            data: {
              apiKey: '[REDACTED]',
              description: 'test'
            }
          }
        })
      );
    });

    it('should redact sensitive information in query parameters', () => {
      mockRequest.query = {
        token: 'abc123',
        filter: 'active'
      };

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          query: {
            token: '[REDACTED]',
            filter: 'active'
          }
        })
      );
    });

    it('should handle nested sensitive data', () => {
      mockRequest.body = {
        user: {
          profile: {
            name: 'Test User',
            creditCard: '4111111111111111',
            settings: {
              apiKey: 'xyz789'
            }
          }
        }
      };

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          body: {
            user: {
              profile: {
                name: 'Test User',
                creditCard: '[REDACTED]',
                settings: {
                  apiKey: '[REDACTED]'
                }
              }
            }
          }
        })
      );
    });

    it('should handle arrays containing sensitive data', () => {
      mockRequest.body = {
        users: [
          { id: 1, apiKey: 'key1' },
          { id: 2, apiKey: 'key2' }
        ]
      };

      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          body: {
            users: [
              { id: 1, apiKey: '[REDACTED]' },
              { id: 2, apiKey: '[REDACTED]' }
            ]
          }
        })
      );
    });
  });
});
