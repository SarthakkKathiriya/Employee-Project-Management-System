import { Router } from 'express';
import {createEmployee,deleteEmployee,getDepartments,getEmployeeById,getEmployees,updateEmployee,} from '../controllers/employeeController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import {createEmployeeValidator,updateEmployeeValidator,} from '../validators/employeeValidators.js';

const router = Router();

router.use(protect);

router.get('/departments', asyncHandler(getDepartments));
router
  .route('/')
  .get(asyncHandler(getEmployees))
  .post(
    authorize('admin'),
    createEmployeeValidator,
    validate,
    asyncHandler(createEmployee),
  );
router
  .route('/:id')
  .get(asyncHandler(getEmployeeById))
  .put(
    authorize('admin'),
    updateEmployeeValidator,
    validate,
    asyncHandler(updateEmployee),
  )
  .delete(authorize('admin'), asyncHandler(deleteEmployee));

export default router;
