/**
 * Base error class for all Indii.Music errors
 * Extends Error with additional context and metadata
 */
export class IndiiError extends Error {
  public readonly code: string;
  public readonly context: Record<string, any>;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, context: Record<string, any> = {}, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ValidationError - For data/input validation failures
 */
export class ValidationError extends IndiiError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

/**
 * NetworkError - For API/network related failures
 */
export class NetworkError extends IndiiError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'NETWORK_ERROR', context);
  }
}

/**
 * AuthenticationError - For authentication/authorization failures
 */
export class AuthenticationError extends IndiiError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'AUTHENTICATION_ERROR', context);
  }
}

/**
 * AIProcessingError - For AI/ML processing failures
 */
export class AIProcessingError extends IndiiError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'AI_PROCESSING_ERROR', context);
  }
}

/**
 * AudioProcessingError - For audio processing failures
 */
export class AudioProcessingError extends IndiiError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'AUDIO_PROCESSING_ERROR', context);
  }
}

/**
 * SystemError - For critical system-level failures
 */
export class SystemError extends IndiiError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'SYSTEM_ERROR', context, false); // Non-operational error
  }
}
