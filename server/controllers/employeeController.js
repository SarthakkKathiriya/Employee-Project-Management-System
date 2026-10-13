import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import { parseDdMmYyyy } from '../utils/dateFormat.js';

const searchableFields = [
  'name',
  'email',
  'designation',
  'department',
  'joiningDate',
  'status',
  'createdAt',
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureValidId = (id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error('Invalid employee ID');
    error.statusCode = 400;
    throw error;
  }
};

const ensureEmployeeExists = (employee) => {
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const handleDuplicateEmail = (error) => {
  if (error.code === 11000) {
    const duplicateError = new Error(
      'An employee with this email address already exists',
    );
    duplicateError.statusCode = 409;
    throw duplicateError;
  }

  throw error;
};

export const getEmployees = async (req, res) => {
  const {
    search = '',
    department,
    status,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    100,
  );

  const filter = {};

  if (search) {
    const searchExpression = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: searchExpression }, { email: searchExpression }];
  }

  if (department) {
    filter.department = department;
  }

  if (status) {
    filter.status = status;
  }

  const safeSortBy = searchableFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = order === 'asc' ? 1 : -1;
  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort({ [safeSortBy]: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Employees retrieved successfully',
    data: employees,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
};

export const getDepartments = async (req, res) => {
  const departments = await Employee.distinct('department');
  departments.sort((first, second) => first.localeCompare(second));

  return res.status(200).json({
    success: true,
    message: 'Departments retrieved successfully',
    data: departments,
  });
};

export const getEmployeeById = async (req, res) => {
  ensureValidId(req.params.id);
  const employee = ensureEmployeeExists(await Employee.findById(req.params.id));

  return res.status(200).json({
    success: true,
    message: 'Employee retrieved successfully',
    data: employee,
  });
};

export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({
      ...req.body,
      joiningDate: parseDdMmYyyy(req.body.joiningDate),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    handleDuplicateEmail(error);
  }
};

export const updateEmployee = async (req, res) => {
  ensureValidId(req.params.id);

  try {
    const employee = ensureEmployeeExists(
      await Employee.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          joiningDate: parseDdMmYyyy(req.body.joiningDate),
        },
        { new: true, runValidators: true },
      ),
    );

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    handleDuplicateEmail(error);
  }
};

export const deleteEmployee = async (req, res) => {
  ensureValidId(req.params.id);
  const employee = ensureEmployeeExists(
    await Employee.findByIdAndDelete(req.params.id),
  );
  await Project.updateMany(
    { assignedEmployees: employee._id },
    { $pull: { assignedEmployees: employee._id } },
  );

  return res.status(200).json({
    success: true,
    message: 'Employee deleted successfully',
    data: employee,
  });
};
