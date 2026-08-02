/**
 * middleware/validate.js
 * Returns middleware that validates req.body against a Zod schema.
 * On failure, calls next() with a ZodError-like object that the error handler
 * knows how to format.
 */

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = new Error('Validation failed');
      err.name = 'ZodError';
      err.errors = result.error.errors;
      err.status = 400;
      return next(err);
    }
    req.body = result.data; // Replace with parsed+defaulted values.
    next();
  };
}

module.exports = { validate };
