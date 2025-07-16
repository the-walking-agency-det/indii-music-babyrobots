import winston from 'winston';
import { IndiiError } from '../utils/errors/types';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

/**
 * Custom format for structured logging
 */
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
});

/**
 * Logger configuration
 */
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Error logger interface
 */
export interface ErrorLogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  body?: any;
  query?: any;
  params?: any;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Formats error details for logging
 */
function formatErrorDetails(error: Error | IndiiError, context: ErrorLogContext = {}) {
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
 * Logger service for consistent error logging
 */
export const loggerService = {
  error(error: Error | IndiiError, context: ErrorLogContext = {}) {
    logger.error(formatErrorDetails(error, context));
  },

  warn(message: string, context: ErrorLogContext = {}) {
    logger.warn({ message, ...context });
  },

  info(message: string, context: ErrorLogContext = {}) {
    logger.info({ message, ...context });
  },

  debug(message: string, context: ErrorLogContext = {}) {
    logger.debug({ message, ...context });
  },

  /**
   * Log API request details
   */
  logRequest(req: any, context: ErrorLogContext = {}) {
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: {
        'user-agent': req.get('user-agent'),
        'x-request-id': req.get('x-request-id')
      },
      ...context
    });
  },

  /**
   * Log API response details
   */
  logResponse(req: any, res: any, responseTime: number, context: ErrorLogContext = {}) {
    logger.info('API Response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ...context
    });
  }
};
