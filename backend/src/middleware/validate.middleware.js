const ApiError = require("../utils/ApiError");

/**
 * Joi schema validation middleware factory.
 * Usage: router.post("/route", validate(schema), controller)
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return next(ApiError.badRequest("Validation failed", errors));
  }

  next();
};

module.exports = validate;