import { body } from 'express-validator';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import { parseDdMmYyyy } from '../utils/dateFormat.js';

const assignedEmployeesValidator = body('assignedEmployees')
  .isArray()
  .withMessage('Assigned employees must be an array')
  .bail()
  .custom(async (employeeIds) => {
    if (!employeeIds.every((id) => mongoose.isObjectIdOrHexString(id))) {
      throw new Error('Assigned employees must contain valid employee IDs');
    }

    const uniqueIds = [...new Set(employeeIds)];
    const existingCount = await Employee.countDocuments({
      _id: { $in: uniqueIds },
    });

    if (existingCount !== uniqueIds.length) {
      throw new Error('One or more assigned employees do not exist');
    }

    return true;
  });

const projectFields = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .bail()
    .custom((value) => {
      if (!parseDdMmYyyy(value)) {
        throw new Error('Start date must use the DD-MM-YYYY format');
      }

      return true;
    }),
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .bail()
    .custom((value) => {
      if (!parseDdMmYyyy(value)) {
        throw new Error('Deadline must use the DD-MM-YYYY format');
      }

      return true;
    })
    .bail()
    .custom((deadline, { req }) => {
      const startDate = parseDdMmYyyy(req.body.startDate);
      const deadlineDate = parseDdMmYyyy(deadline);

      if (startDate && deadlineDate < startDate) {
        throw new Error('Deadline cannot be before the start date');
      }

      return true;
    }),
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),
  assignedEmployeesValidator,
];

export const createProjectValidator = projectFields;
export const updateProjectValidator = projectFields;
