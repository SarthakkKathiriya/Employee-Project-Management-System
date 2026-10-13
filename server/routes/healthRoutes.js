import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      data: { status: 'ok' },
    });
  }),
);

export default router;
