import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(' ') || [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token required',
      errors: [],
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set in the environment');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, secret);
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid or expired',
      errors: [],
    });
  }

  if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid or expired',
      errors: [],
    });
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user no longer exists',
      errors: [],
    });
  }

  req.user = user;
  return next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
      errors: [],
    });
  }

  return next();
};
