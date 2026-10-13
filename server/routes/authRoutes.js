import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.js';
import { loginValidator, registerValidator } from '../validators/authValidators.js';

const router = Router();

router.post('/register', registerValidator, validate, asyncHandler(register));
router.post('/login', loginValidator, validate, asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

export default router;
