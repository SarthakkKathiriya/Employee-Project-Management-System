import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set in the environment');
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const formatUser = (user) => {
  const { _id, name, email, role, createdAt, updatedAt } = user;

  return { id: _id, name, email, role, createdAt, updatedAt };
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    const token = createToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { token, user: formatUser(user) },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        errors: [],
      });
    }

    throw error;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      errors: [],
    });
  }

  const token = createToken(user._id.toString());

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { token, user: formatUser(user) },
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: { user: formatUser(req.user) },
  });
};
