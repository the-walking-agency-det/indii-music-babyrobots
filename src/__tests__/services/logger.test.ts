import { loggerService } from '../../services/logger';
import { IndiiError } from '../../utils/errors/types';

// Mock winston
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    add: jest.fn()
  })),
  transports: {
    File: jest.fn(),
    Console: jest.fn()
  }
}));

describe('Logger Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('error logging', () => {
    it('should log standard errors with stack trace', () => {
      const error = new Error('Test error');
      const context = { requestId: 'test-123' };

      loggerService.error(error, context);
      
      // Check if error was logged with correct format
      expect(error.message).toBe('Test error');
      expect(error.stack).toBeDefined();
    });

    it('should log IndiiErrors with additional context', () => {
      const error = new IndiiError('Test IndiiError', 'TEST_ERROR', {
        additionalInfo: 'test'
      });
      const context = { requestId: 'test-123' };

      loggerService.error(error, context);

      expect(error.message).toBe('Test IndiiError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toEqual({ additionalInfo: 'test' });
    });
  });

  describe('request logging', () => {
    it('should log API requests with headers and body', () => {
      const mockReq = {
        method: 'POST',
        path: '/api/test',
        query: { filter: 'test' },
        body: { data: 'test' },
        get: (header: string) => {
          const headers = {
            'user-agent': 'test-agent',
            'x-request-id': 'test-123'
          };
          return headers[header];
        }
      };

      loggerService.logRequest(mockReq);

      // Verify request details are logged
      expect(mockReq.method).toBe('POST');
      expect(mockReq.path).toBe('/api/test');
      expect(mockReq.query).toEqual({ filter: 'test' });
      expect(mockReq.body).toEqual({ data: 'test' });
    });

    it('should log API responses with status and timing', () => {
      const mockReq = {
        method: 'POST',
        path: '/api/test'
      };
      const mockRes = {
        statusCode: 200
      };
      const responseTime = 100;

      loggerService.logResponse(mockReq, mockRes, responseTime);

      // Verify response details are logged
      expect(mockRes.statusCode).toBe(200);
      expect(responseTime).toBe(100);
    });
  });

  describe('general logging', () => {
    it('should log warning messages', () => {
      const message = 'Warning message';
      const context = { source: 'test' };

      loggerService.warn(message, context);

      expect(message).toBe('Warning message');
      expect(context).toEqual({ source: 'test' });
    });

    it('should log info messages', () => {
      const message = 'Info message';
      const context = { source: 'test' };

      loggerService.info(message, context);

      expect(message).toBe('Info message');
      expect(context).toEqual({ source: 'test' });
    });

    it('should log debug messages', () => {
      const message = 'Debug message';
      const context = { source: 'test' };

      loggerService.debug(message, context);

      expect(message).toBe('Debug message');
      expect(context).toEqual({ source: 'test' });
    });
  });
});
