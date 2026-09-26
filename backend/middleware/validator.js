/**
 * Validation middleware factory.
 * Validates request body fields against simple rules.
 */
function validate(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = req.body[field];

      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (fieldRules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
          errors.push(`${field} must be at least ${fieldRules.minLength} characters`);
        }
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
          errors.push(`${field} must be at most ${fieldRules.maxLength} characters`);
        }
        if (fieldRules.enum && !fieldRules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${fieldRules.enum.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
}

module.exports = { validate };
