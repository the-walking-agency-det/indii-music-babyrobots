import { Request, Response } from 'express';
import { requestLogger } from '../../middleware/request-logger';
import { loggerService } from '../../services/logger';

// Mock logger service
jest.mock('../../services/logger', () => ({
  loggerService: {
    logRequest: jest.fn(),
    logResponse: jest.fn()
  }
}));

describe('Request Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      query: {},
      body: {},
      headers: {
        'user-agent': 'test-agent',
        'x-request-id': 'test-123',
        'authorization': 'Bearer token123',
        'x-api-key': 'secret-api-key',
        'cookie': 'session=abc123'
      },
      get: (header: string) => mockRequest.headers?.[header]
    };

    mockResponse = {
      statusCode: 200,
      end: jest.fn()
    };

    nextFunction = jest.fn();
  });

  it('should log request on incoming request', () => {
    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

const expectedRequest = {
  ...mockRequest,
  headers: {
    'user-agent': 'test-agent',
    'x-request-id': 'test-123',
    'authorization': '[REDACTED]',
    'x-api-key': '[REDACTED]',
    'cookie': '[REDACTED]'
  }
};
expect(loggerService.logRequest).toHaveBeenCalledWith(expectedRequest);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should log response when request ends', () => {
    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Simulate request completion
    const chunk = 'response data';
    (mockResponse.end as jest.Mock)(chunk);

    expect(loggerService.logResponse).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      expect.any(Number)
    );
  });

  it('should preserve original response.end functionality', () => {
    const originalEnd = mockResponse.end;
    
    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    const chunk = 'response data';
    (mockResponse.end as jest.Mock)(chunk);

    expect(originalEnd).toHaveBeenCalledWith(chunk);
  });

  it('should calculate response time correctly', done => {
    const delay = 100;

    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Simulate delayed response
    setTimeout(() => {
      (mockResponse.end as jest.Mock)();

      expect(loggerService.logResponse).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        expect.any(Number)
      );

      const responseTime = (loggerService.logResponse as jest.Mock).mock.calls[0][2];
      expect(responseTime).toBeGreaterThanOrEqual(delay);

      done();
    }, delay);
  });

  it('should handle errors in logging gracefully', () => {
    // Mock logger to throw error
    (loggerService.logRequest as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Logging error');
    });

    expect(() => {
      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
    }).not.toThrow();

    expect(nextFunction).toHaveBeenCalled();
  });

  describe('Header Sanitization', () => {
    it('should redact sensitive headers', () => {
      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      const expectedSanitizedReq = expect.objectContaining({
        headers: expect.objectContaining({
          'user-agent': 'test-agent',
          'x-request-id': 'test-123',
          'authorization': '[REDACTED]',
          'x-api-key': '[REDACTED]',
          'cookie': '[REDACTED]'
        })
      });

      expect(loggerService.logRequest).toHaveBeenCalledWith(expectedSanitizedReq);
    });

    it('should preserve non-sensitive headers', () => {
      mockRequest.headers = {
        'user-agent': 'test-agent',
        'accept': 'application/json',
        'content-type': 'application/json'
      };

      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      const expectedSanitizedReq = expect.objectContaining({
        headers: expect.objectContaining({
          'user-agent': 'test-agent',
          'accept': 'application/json',
          'content-type': 'application/json'
        })
      });

      expect(loggerService.logRequest).toHaveBeenCalledWith(expectedSanitizedReq);
    });

    it('should handle missing headers gracefully', () => {
      delete mockRequest.headers;

      expect(() => {
        requestLogger(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).not.toThrow();

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
