/**
 * Shared validation utilities for API endpoint parameters
 */

/**
 * Validate a single parameter against its schema
 * @param {Object} param - Parameter definition with name, type, required, min, max
 * @param {any} value - Value to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateParameter = (param, value) => {
  if (param.required && (value === undefined || value === null || value === '')) {
    return `${param.name} is required`;
  }

  if (value !== undefined && value !== null && value !== '') {
    const numValue = Number(value);
    
    if (param.type === 'number' && isNaN(numValue)) {
      return `${param.name} must be a number`;
    } else if (param.type === 'number') {
      if (param.min !== undefined && numValue < param.min) {
        return `${param.name} must be at least ${param.min}`;
      }
      if (param.max !== undefined && numValue > param.max) {
        return `${param.name} must be at most ${param.max}`;
      }
    }
  }

  return null;
};

/**
 * Validate all parameters for an endpoint
 * @param {Array} parameters - Array of parameter definitions
 * @param {Object} values - Object mapping parameter names to values
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateParameters = (parameters, values) => {
  const errors = [];
  
  if (!parameters || parameters.length === 0) {
    return { valid: true, errors: [] };
  }
  
  parameters.forEach(param => {
    const error = validateParameter(param, values[param.name]);
    if (error) {
      errors.push(error);
    }
  });
  
  return { valid: errors.length === 0, errors };
};
