import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define custom log levels and colors
export const LOG_LEVELS = {
  error: 0,   // Errors that need immediate attention
  warn: 1,    // Warning conditions
  info: 2,    // General informational messages
  http: 3,    // HTTP request logging
  debug: 4,   // Debug messages
  trace: 5    // Detailed debugging (method entry/exit, variables)
};

// Custom colors for each log level
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'blue',
  trace: 'magenta'
};

// Add colors to Winston
winston.addColors(LOG_COLORS);

// Get log directory path
const LOG_DIR = path.join(process.cwd(), 'logs');

// Base format
const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Development format adds colors
const developmentFormat = winston.format.colorize();

// Production format is the base format
const productionFormat = baseFormat;

// Configure transports
const transports = {
  // Console transport (development only)
  console: new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
    format: developmentFormat
  }),

  // Error log file
  error: new DailyRotateFile({
    level: 'error',
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: productionFormat
  }),

  // Combined log file
  combined: new DailyRotateFile({
    filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: productionFormat
  }),

  // HTTP request log file
  http: new DailyRotateFile({
    level: 'http',
    filename: path.join(LOG_DIR, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: productionFormat
  })
};

// Create Winston configuration
export const loggerConfig = {
  levels: LOG_LEVELS,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
  exitOnError: false,
  transports: [
    transports.console,
    transports.error,
    transports.combined,
    transports.http
  ]
};
