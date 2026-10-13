export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const statusCode =
    error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: Array.isArray(error.errors) ? error.errors : [],
  });
};

export default errorHandler;
