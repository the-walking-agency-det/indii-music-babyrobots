import { Request, Response } from 'express';
import { validateRequest, validationRules } from '../../middleware/validation';
import { ValidationError } from '../../utils/errors/types';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('validateRequest', () => {
    it('should pass validation for valid data', async () => {
      const schema = {
        email: validationRules.email,
        password: validationRules.password
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const middleware = validateRequest(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should fail validation for invalid email', async () => {
      const schema = {
        email: validationRules.email
      };

      mockRequest.body = {
        email: 'invalid-email'
      };

      const middleware = validateRequest(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
    });

    it('should fail validation for invalid password', async () => {
      const schema = {
        password: validationRules.password
      };

      mockRequest.body = {
        password: 'short'  // Too short and missing number
      };

      const middleware = validateRequest(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
    });

    it('should handle custom validation rules', async () => {
      const schema = {
        age: {
          type: 'number',
          required: true,
          min: 18,
          max: 100,
          custom: (value: number) => value % 1 === 0  // Must be an integer
        }
      };

      // Test valid age
      mockRequest.body = { age: 25 };
      await validateRequest(schema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith();

      // Test invalid age (decimal)
      mockRequest.body = { age: 25.5 };
      await validateRequest(schema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
    });

    it('should handle enum validation', async () => {
      const schema = {
        role: {
          type: 'string',
          required: true,
          enum: ['admin', 'user', 'guest']
        }
      };

      // Test valid role
      mockRequest.body = { role: 'admin' };
      await validateRequest(schema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith();

      // Test invalid role
      mockRequest.body = { role: 'superuser' };
      await validateRequest(schema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
    });

    it('should handle optional fields', async () => {
      const schema = {
        name: {
          type: 'string',
          required: false,
          min: 2
        }
      };

      // Test with field omitted
      mockRequest.body = {};
      await validateRequest(schema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith();

      // Test with field included but invalid
      mockRequest.body = { name: 'a' };  // Too short
      await validateRequest(schema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
    });
  });

  describe('validationRules', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@.com',
        'user@domain.'
      ];

      validEmails.forEach(email => {
        expect(validationRules.email.pattern.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(validationRules.email.pattern.test(email)).toBe(false);
      });
    });

    it('should validate password format', () => {
      const validPasswords = [
        'Password123',
        'abcd1234',
        'SuperSecure2'
      ];

      const invalidPasswords = [
        'short1',
        'nonnumbers',
        '12345678',
        'sh1'
      ];

      validPasswords.forEach(password => {
        expect(validationRules.password.pattern.test(password)).toBe(true);
      });

      invalidPasswords.forEach(password => {
        expect(validationRules.password.pattern.test(password)).toBe(false);
      });
    });

    it('should validate UUID format', () => {
      const validUUIDs = [
        '123e4567-e89b-4d3c-a456-426614174000',
        '987fcdeb-51a2-4d3c-a456-426614174000'
      ];

      const invalidUUIDs = [
        '123e4567',
        'not-a-uuid',
        '123e4567-e89b-1d3c-a456-426614174000',  // Version 1 UUID
        '123e4567-e89b-4d3c-x456-426614174000'   // Invalid character
      ];

      validUUIDs.forEach(uuid => {
        expect(validationRules.uuid.pattern.test(uuid)).toBe(true);
      });

      invalidUUIDs.forEach(uuid => {
        expect(validationRules.uuid.pattern.test(uuid)).toBe(false);
      });
    });
  });
});
