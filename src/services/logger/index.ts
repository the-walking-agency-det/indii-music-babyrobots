import winston from 'winston';
import { loggerConfig } from './config';
import { Request } from 'express';
import { IndiiError } from '../../utils/errors/types';

// Create Winston logger instance
const winstonLogger = winston.createLogger(loggerConfig);

// List of sensitive fields to redact
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'creditCard',
  'ssn'
];

/**
 * Redacts sensitive information from objects
 */
function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result = Array.isArray(data) ? [] : {};

  for (const key in data) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object') {
      result[key] = redactSensitiveData(data[key]);
    } else {
      result[key] = data[key];
    }
  }

  return result;
}

/**
 * Formats error details for logging
 */
function formatErrorDetails(error: Error | IndiiError, context: Record<string, any> = {}) {
  const errorDetails: any = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context
  };

  if (error instanceof IndiiError) {
    errorDetails.code = error.code;
    errorDetails.context = error.context;
    errorDetails.operational = error.operational;
  }

  return errorDetails;
}

/**
 * Enhanced logger service with context management and security features
 */
export const logger = {
  /**
   * Logs error messages with full context
   */
  error(error: Error | IndiiError, context: Record<string, any> = {}) {
    const sanitizedContext = redactSensitiveData(context);
    winstonLogger.error(formatErrorDetails(error, sanitizedContext));
  },

  /**
   * Logs warning messages
   */
  warn(message: string, context: Record<string, any> = {}) {
    const sanitizedContext = redactSensitiveData(context);
    winstonLogger.warn({ message, ...sanitizedContext });
  },

  /**
   * Logs informational messages
   */
  info(message: string, context: Record<string, any> = {}) {
    const sanitizedContext = redactSensitiveData(context);
    winstonLogger.info({ message, ...sanitizedContext });
  },

  /**
   * Logs HTTP requests with sanitized data
   */
  http(req: Request, context: Record<string, any> = {}) {
    const sanitizedReq = {
      method: req.method,
      path: req.path,
      query: redactSensitiveData(req.query),
      body: redactSensitiveData(req.body),
      headers: redactSensitiveData(req.headers),
      ip: req.ip,
      userId: req.user?.id, // Assuming user is attached to request
      ...redactSensitiveData(context)
    };

    winstonLogger.log('http', sanitizedReq);
  },

  /**
   * Logs debug messages with optional context
   */
  debug(message: string, context: Record<string, any> = {}) {
    const sanitizedContext = redactSensitiveData(context);
    winstonLogger.debug({ message, ...sanitizedContext });
  },

  /**
   * Logs detailed trace messages for debugging
   */
  trace(message: string, context: Record<string, any> = {}) {
    const sanitizedContext = redactSensitiveData(context);
    winstonLogger.log('trace', { message, ...sanitizedContext });
  },

  /**
   * Logs performance metrics
   */
  performance(operation: string, durationMs: number, context: Record<string, any> = {}) {
    winstonLogger.info({
      type: 'performance',
      operation,
      durationMs,
      ...redactSensitiveData(context)
    });
  },

  /**
   * Logs security events
   */
  security(event: string, context: Record<string, any> = {}) {
    winstonLogger.warn({
      type: 'security',
      event,
      ...redactSensitiveData(context)
    });
  },

  /**
   * Creates a child logger with additional default context
   */
  child(defaultContext: Record<string, any>) {
    const childLogger = { ...this };
    const sanitizedDefaultContext = redactSensitiveData(defaultContext);

    // Override logging methods to include default context
    Object.keys(childLogger).forEach(method => {
      if (typeof childLogger[method] === 'function') {
        childLogger[method] = (message: any, context = {}) => {
          this[method](message, {
            ...sanitizedDefaultContext,
            ...context
          });
        };
      }
    });

    return childLogger;
  }
};

// Export the Winston logger for advanced use cases
export const winstonInstance = winstonLogger;
