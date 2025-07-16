import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors/types';

interface ValidationSchema {
  [key: string]: {
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean | Promise<boolean>;
  };
}

/**
 * Creates a validation middleware based on a schema
 */
export const validateRequest = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationErrors: string[] = [];
      
      // Validate each field against the schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];
        
        // Check required fields
        if (rules.required && (value === undefined || value === null || value === '')) {
          validationErrors.push(`${field} is required`);
          continue;
        }
        
        // Skip validation for optional empty fields
        if (!rules.required && !value) {
          continue;
        }
        
        // Type validation
        if (rules.type && typeof value !== rules.type) {
          validationErrors.push(`${field} must be of type ${rules.type}`);
        }
        
        // Min/Max validation for numbers and strings
        if (rules.type === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            validationErrors.push(`${field} must be greater than or equal to ${rules.min}`);
          }
          if (rules.max !== undefined && value > rules.max) {
            validationErrors.push(`${field} must be less than or equal to ${rules.max}`);
          }
        } else if (rules.type === 'string') {
          if (rules.min !== undefined && value.length < rules.min) {
            validationErrors.push(`${field} must be at least ${rules.min} characters long`);
          }
          if (rules.max !== undefined && value.length > rules.max) {
            validationErrors.push(`${field} must be no more than ${rules.max} characters long`);
          }
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          validationErrors.push(`${field} has an invalid format`);
        }
        
        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
          validationErrors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
        
        // Custom validation
        if (rules.custom) {
          const isValid = await Promise.resolve(rules.custom(value));
          if (!isValid) {
            validationErrors.push(`${field} is invalid`);
          }
        }
      }
      
      // If there are validation errors, throw a ValidationError
      if (validationErrors.length > 0) {
        throw new ValidationError('Validation failed', {
          errors: validationErrors
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Predefined validation rules for common fields
 */
export const validationRules = {
  email: {
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true
  },
  password: {
    type: 'string',
    min: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    required: true
  },
  uuid: {
    type: 'string',
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  }
};
