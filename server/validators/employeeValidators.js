import { body } from 'express-validator';
import { parseDdMmYyyy } from '../utils/dateFormat.js';

const employeeFields = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('phone')
    .matches(/^\d{10}$/)
    .withMessage('Phone must contain exactly 10 digits'),
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('joiningDate')
    .notEmpty()
    .withMessage('Joining date is required')
    .bail()
    .custom((value) => {
      if (!parseDdMmYyyy(value)) {
        throw new Error('Joining date must use the DD-MM-YYYY format');
      }

      return true;
    }),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage("Status must be either 'Active' or 'Inactive'"),
];

export const createEmployeeValidator = employeeFields;
export const updateEmployeeValidator = employeeFields;
