import { Request, Response, NextFunction } from 'express';
import { IndiiError } from '../utils/errors/types';
import { loggerService } from '../services/logger';

// List of fields that should be redacted in logs
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
 * Recursively redact sensitive information from an object
 */
function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      result[key] = redactSensitiveData(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

interface ErrorResponse {
  status: string;
  code: string;
  message: string;
  timestamp: string;
  requestId?: string;
  details?: any;
}

/**
 * Centralized error handling middleware
 * Catches all errors and formats them into a consistent response structure
 */
export const errorHandler = (
  err: Error | IndiiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default status code
  let statusCode = 500;
  
  // Create base error response
  const errorResponse: ErrorResponse = {
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string
  };

  // Handle IndiiError instances
  if (err instanceof IndiiError) {
    statusCode = getHttpStatusCode(err);
    errorResponse.code = err.code;
    errorResponse.message = err.message;
    
    // Add additional context if available
    if (err.context) {
      errorResponse.details = err.context;
    }
  } 
  // Handle standard Error instances
  else if (err instanceof Error) {
    errorResponse.message = err.message;
    
    // In development, include stack trace
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        stack: err.stack
      };
    }
  }

  // Prepare context for logging
  const logContext = {
    requestId: errorResponse.requestId,
    path: req.path,
    method: req.method,
    body: redactSensitiveData(req.body),
    query: redactSensitiveData(req.query),
    params: redactSensitiveData(req.params),
    timestamp: errorResponse.timestamp
  };

  // Log error with sanitized context
  loggerService.error(err, logContext);

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Maps internal error codes to HTTP status codes
 */
function getHttpStatusCode(error: Error | IndiiError): number {
  if (error instanceof IndiiError) {
    const statusCodeMap: { [key: string]: number } = {
      VALIDATION_ERROR: 400,
      AUTHENTICATION_ERROR: 401,
      AUTHORIZATION_ERROR: 403,
      NOT_FOUND_ERROR: 404,
      RATE_LIMIT_ERROR: 429,
      AI_PROCESSING_ERROR: 422,
      AUDIO_PROCESSING_ERROR: 422,
      NETWORK_ERROR: 502,
      SYSTEM_ERROR: 500
    };

    return statusCodeMap[error.code] || 500;
  }
  return 500;
}

/**
 * Async error wrapper to catch unhandled promise rejections
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
