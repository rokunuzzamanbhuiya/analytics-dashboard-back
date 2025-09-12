/**
 * Validation Middleware
 */

/**
 * Validate required fields in request body
 * @param {Array} fields - Array of required field names
 * @returns {Function} Express middleware function
 */
const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          missingFields,
          requiredFields: fields
        }
      });
    }

    next();
  };
};

/**
 * Validate query parameters
 * @param {Object} schema - Validation schema for query parameters
 * @returns {Function} Express middleware function
 */
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const errors = [];

    Object.keys(schema).forEach(param => {
      const value = req.query[param];
      const rules = schema[param];

      // Check if required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${param} is required`);
        return;
      }

      // Skip validation if value is not provided and not required
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Type validation
      if (rules.type === 'number') {
        if (isNaN(value)) {
          errors.push(`${param} must be a number`);
        }
      } else if (rules.type === 'boolean') {
        if (value !== 'true' && value !== 'false') {
          errors.push(`${param} must be true or false`);
        }
      } else if (rules.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${param} must be a valid date`);
        }
      }

      // Range validation for numbers
      if (rules.type === 'number' && !isNaN(value)) {
        const numValue = parseFloat(value);
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${param} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`${param} must be at most ${rules.max}`);
        }
      }

      // Length validation for strings
      if (rules.type === 'string' || !rules.type) {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${param} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${param} must be at most ${rules.maxLength} characters`);
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${param} must be one of: ${rules.enum.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: errors
      });
    }

    next();
  };
};

/**
 * Validate ID parameter
 * @param {string} paramName - Name of the ID parameter (default: 'id')
 * @returns {Function} Express middleware function
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({
        success: false,
        error: `${paramName} parameter is required`
      });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: `${paramName} must be a valid positive number`
      });
    }

    // Add parsed ID to request for use in controllers
    req.params[paramName] = parseInt(id);
    next();
  };
};

/**
 * Validate pagination parameters
 * @returns {Function} Express middleware function
 */
const validatePagination = () => {
  return validateQueryParams({
    limit: {
      type: 'number',
      min: 1,
      max: 250,
      required: false
    },
    page_info: {
      type: 'string',
      required: false
    }
  });
};

/**
 * Validate date range parameters
 * @returns {Function} Express middleware function
 */
const validateDateRange = () => {
  return validateQueryParams({
    start_date: {
      type: 'date',
      required: false
    },
    end_date: {
      type: 'date',
      required: false
    }
  });
};

/**
 * Sanitize input to prevent XSS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      Object.keys(obj).forEach(key => {
        sanitized[key] = sanitize(obj[key]);
      });
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

module.exports = {
  validateRequiredFields,
  validateQueryParams,
  validateId,
  validatePagination,
  validateDateRange,
  sanitizeInput
};
