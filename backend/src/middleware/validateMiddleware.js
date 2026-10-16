const ApiResponse = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body && req.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query && req.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params && req.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message
      }));
      return ApiResponse.badRequest(res, 'Validation failed', formattedErrors);
    }
    return ApiResponse.badRequest(res, error.message);
  }
};

module.exports = validate;
