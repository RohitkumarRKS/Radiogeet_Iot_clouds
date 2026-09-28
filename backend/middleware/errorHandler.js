const errorHandler = (err, req, res, next) => {
  // Handle malformed JSON body errors from body-parser gracefully
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON payload. Please verify JSON format and quotes escaping.',
    });
  }

  // Log full error details server-side (always)
  console.error('Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message || 'Internal server error'),
  });
};

module.exports = errorHandler;

