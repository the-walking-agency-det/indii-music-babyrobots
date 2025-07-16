import { Request, Response, NextFunction } from 'express';
import { loggerService } from '../services/logger';

// List of headers that should be redacted
const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'cookie',
  'set-cookie'
];

/**
 * Sanitize request headers for logging
 */
function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  
  for (const header of SENSITIVE_HEADERS) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Middleware to log all incoming requests and their responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Get start time
  const startTime = Date.now();
  
  try {
    // Log request with sanitized data
    const sanitizedReq = {
      ...req,
      headers: sanitizeHeaders(req.headers)
    };
    loggerService.logRequest(sanitizedReq);
  } catch (error) {
    // Log error but don't interrupt request processing
    console.error('Error logging request:', error);
  }

  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log response
  res.end = function(chunk?: any, encoding?: string | undefined, callback?: (() => void) | undefined): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    try {
      // Log response
      loggerService.logResponse(req, res, responseTime);
    } catch (error) {
      // Log error but don't interrupt response
      console.error('Error logging response:', error);
    }
    
    // Call original end function with exactly the same arguments
    if (arguments.length === 0) {
      return originalEnd.call(this);
    } else if (arguments.length === 1) {
      return originalEnd.call(this, chunk);
    } else if (arguments.length === 2) {
      return originalEnd.call(this, chunk, encoding);
    } else {
      return originalEnd.call(this, chunk, encoding, callback);
    }
  };

  next();
};
