import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/stats', protect, asyncHandler(getDashboardStats));

export default router;
