import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: result.array().map(({ path, msg }) => ({
      field: path,
      message: msg,
    })),
  });
};

export default validate;
