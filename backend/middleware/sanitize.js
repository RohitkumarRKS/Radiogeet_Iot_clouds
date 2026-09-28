/**
 * Input Sanitization Middleware
 * Strips potentially dangerous HTML/XSS content from all incoming request body strings.
 * Uses the 'xss' library to neutralize script injection before data reaches controllers.
 */
let xss;
try {
  xss = require('xss');
} catch (e) {
  // Fallback: basic HTML entity escaping if xss package is not installed
  xss = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  const cleaned = {};
  for (const key of Object.keys(obj)) {
    cleaned[key] = sanitizeValue(obj[key]);
  }
  return cleaned;
}

function sanitizeInput(req, res, next) {
  // Skip sanitization for telemetry push endpoints (raw device data)
  if (req.path.includes('/telemetry') && req.method !== 'GET') {
    return next();
  }

  if (req.body && typeof req.body === 'object') {
    // Don't sanitize password fields (they may intentionally contain special chars)
    const passwordFields = ['password', 'currentPassword', 'newPassword'];
    const savedPasswords = {};

    for (const field of passwordFields) {
      if (req.body[field] !== undefined) {
        savedPasswords[field] = req.body[field];
      }
    }

    req.body = sanitizeObject(req.body);

    // Restore password fields without sanitization
    for (const [field, value] of Object.entries(savedPasswords)) {
      req.body[field] = value;
    }
  }

  next();
}

module.exports = sanitizeInput;
