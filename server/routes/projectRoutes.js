import { Router } from 'express';
import {createProject,deleteProject,getProjectById,getProjects,updateProject,
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createProjectValidator,
  updateProjectValidator,
} from '../validators/projectValidators.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(asyncHandler(getProjects))
  .post(
    authorize('admin'),
    createProjectValidator,
    validate,
    asyncHandler(createProject),
  );
router
  .route('/:id')
  .get(asyncHandler(getProjectById))
  .put(
    authorize('admin'),
    updateProjectValidator,
    validate,
    asyncHandler(updateProject),
  )
  .delete(authorize('admin'), asyncHandler(deleteProject));

export default router;
