import { logger } from '../../../services/logger';
import { IndiiError } from '../../../utils/errors/types';
import { Request } from 'express';

// Import the mocked Winston logger from setup
const mockWinstonLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn()
};

describe('Logger Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Logging', () => {
    it('should log standard errors with stack trace', () => {
      const error = new Error('Test error');
      const context = { requestId: 'test-123' };

      logger.error(error, context);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Error',
          message: 'Test error',
          stack: expect.any(String),
          requestId: 'test-123'
        })
      );
    });

    it('should log IndiiErrors with additional context', () => {
      const error = new IndiiError('Test error', 'TEST_ERROR', {
        additionalInfo: 'test'
      });
      const context = { requestId: 'test-123' };

      logger.error(error, context);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'IndiiError',
          message: 'Test error',
          code: 'TEST_ERROR',
          context: { additionalInfo: 'test' },
          requestId: 'test-123'
        })
      );
    });
  });

  describe('Request Logging', () => {
    it('should log HTTP requests with sanitized data', () => {
      const mockRequest = {
        method: 'POST',
        path: '/api/test',
        query: { filter: 'test' },
        body: {
          username: 'testuser',
          password: 'secret123'
        },
        headers: {
          'authorization': 'Bearer token123',
          'user-agent': 'test-agent'
        },
        ip: '127.0.0.1',
        user: { id: 'user123' }
      } as Partial<Request>;

      logger.http(mockRequest as Request);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'http',
        expect.objectContaining({
          method: 'POST',
          path: '/api/test',
          query: { filter: 'test' },
          body: {
            username: 'testuser',
            password: '[REDACTED]'
          },
          headers: {
            'authorization': '[REDACTED]',
            'user-agent': 'test-agent'
          },
          ip: '127.0.0.1',
          userId: 'user123'
        })
      );
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      logger.performance('database_query', 150, {
        query: 'SELECT * FROM users',
        rows: 100
      });

      expect(mockWinstonLogger.info).toHaveBeenCalledWith({
        type: 'performance',
        operation: 'database_query',
        durationMs: 150,
        query: 'SELECT * FROM users',
        rows: 100
      });
    });
  });

  describe('Security Logging', () => {
    it('should log security events with sanitized data', () => {
      logger.security('failed_login_attempt', {
        username: 'testuser',
        password: 'wrong_password',
        ip: '127.0.0.1'
      });

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith({
        type: 'security',
        event: 'failed_login_attempt',
        username: 'testuser',
        password: '[REDACTED]',
        ip: '127.0.0.1'
      });
    });
  });

  describe('Child Loggers', () => {
    it('should create child logger with default context', () => {
      const childLogger = logger.child({
        component: 'UserService',
        apiKey: 'secret123'
      });

      childLogger.info('User created', { userId: '123' });

      expect(mockWinstonLogger.info).toHaveBeenCalledWith({
        message: 'User created',
        component: 'UserService',
        apiKey: '[REDACTED]',
        userId: '123'
      });
    });

    it('should allow overriding default context', () => {
      const childLogger = logger.child({
        component: 'UserService',
        environment: 'test'
      });

      childLogger.info('Component initialized', {
        component: 'AuthService',
        status: 'ready'
      });

      expect(mockWinstonLogger.info).toHaveBeenCalledWith({
        message: 'Component initialized',
        component: 'AuthService',
        environment: 'test',
        status: 'ready'
      });
    });
  });

  describe('Log Levels', () => {
    it('should log at different levels', () => {
      logger.error(new Error('Error message'));
      logger.warn('Warning message');
      logger.info('Info message');
      logger.debug('Debug message');
      logger.trace('Trace message');

      expect(mockWinstonLogger.error).toHaveBeenCalled();
      expect(mockWinstonLogger.warn).toHaveBeenCalled();
      expect(mockWinstonLogger.info).toHaveBeenCalled();
      expect(mockWinstonLogger.debug).toHaveBeenCalled();
      expect(mockWinstonLogger.log).toHaveBeenCalledWith('trace', expect.any(Object));
    });
  });
});
