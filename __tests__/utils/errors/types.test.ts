import {
  IndiiError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AIProcessingError,
  AudioProcessingError,
  SystemError
} from '../../../src/utils/errors/types';

describe('Error Types', () => {
  describe('IndiiError', () => {
    it('should create a base error with all properties', () => {
      const context = { userId: '123' };
      const error = new IndiiError('Test error', 'TEST_ERROR', context);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(IndiiError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toBe(context);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error', () => {
      const context = { field: 'email' };
      const error = new ValidationError('Invalid email', context);

      expect(error).toBeInstanceOf(IndiiError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context).toBe(context);
    });
  });

  describe('NetworkError', () => {
    it('should create a network error', () => {
      const context = { url: 'https://api.example.com' };
      const error = new NetworkError('API request failed', context);

      expect(error).toBeInstanceOf(IndiiError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('API request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.context).toBe(context);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error', () => {
      const context = { userId: '123' };
      const error = new AuthenticationError('Invalid token', context);

      expect(error).toBeInstanceOf(IndiiError);
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Invalid token');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.context).toBe(context);
    });
  });

  describe('AIProcessingError', () => {
    it('should create an AI processing error', () => {
      const context = { model: 'gpt-4' };
      const error = new AIProcessingError('Model failed to respond', context);

      expect(error).toBeInstanceOf(IndiiError);
      expect(error).toBeInstanceOf(AIProcessingError);
      expect(error.message).toBe('Model failed to respond');
      expect(error.code).toBe('AI_PROCESSING_ERROR');
      expect(error.context).toBe(context);
    });
  });

  describe('AudioProcessingError', () => {
    it('should create an audio processing error', () => {
      const context = { format: 'mp3' };
      const error = new AudioProcessingError('Failed to decode audio', context);

      expect(error).toBeInstanceOf(IndiiError);
      expect(error).toBeInstanceOf(AudioProcessingError);
      expect(error.message).toBe('Failed to decode audio');
      expect(error.code).toBe('AUDIO_PROCESSING_ERROR');
      expect(error.context).toBe(context);
    });
  });

  describe('SystemError', () => {
    it('should create a system error marked as non-operational', () => {
      const context = { component: 'database' };
      const error = new SystemError('Database connection lost', context);

      expect(error).toBeInstanceOf(IndiiError);
      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe('Database connection lost');
      expect(error.code).toBe('SYSTEM_ERROR');
      expect(error.context).toBe(context);
      expect(error.isOperational).toBe(false); // System errors are non-operational by default
    });
  });
});
