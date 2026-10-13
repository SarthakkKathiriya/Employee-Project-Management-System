import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { parseDdMmYyyy } from '../utils/dateFormat.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const assignedEmployeesFields = 'name email designation';

const ensureValidId = (id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error('Invalid project ID');
    error.statusCode = 400;
    throw error;
  }
};

const ensureProjectExists = (project) => {
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

const projectData = (body, userId) => ({
  ...body,
  startDate: parseDdMmYyyy(body.startDate),
  deadline: parseDdMmYyyy(body.deadline),
  createdBy: userId,
});

export const getProjects = async (req, res) => {
  const { status, search = '' } = req.query;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    100,
  );
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.name = new RegExp(escapeRegex(search), 'i');
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('assignedEmployees', assignedEmployeesFields)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Projects retrieved successfully',
    data: projects,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
};

export const getProjectById = async (req, res) => {
  ensureValidId(req.params.id);
  const project = ensureProjectExists(
    await Project.findById(req.params.id).populate(
      'assignedEmployees',
      assignedEmployeesFields,
    ),
  );

  return res.status(200).json({
    success: true,
    message: 'Project retrieved successfully',
    data: project,
  });
};

export const createProject = async (req, res) => {
  const project = await Project.create(projectData(req.body, req.user._id));
  await project.populate('assignedEmployees', assignedEmployeesFields);

  return res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
};

export const updateProject = async (req, res) => {
  ensureValidId(req.params.id);

  const project = ensureProjectExists(
    await Project.findById(req.params.id),
  );
  Object.assign(project, projectData(req.body, project.createdBy));
  await project.save();
  await project.populate('assignedEmployees', assignedEmployeesFields);

  return res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
};

export const deleteProject = async (req, res) => {
  ensureValidId(req.params.id);
  const project = ensureProjectExists(
    await Project.findByIdAndDelete(req.params.id),
  );

  return res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
    data: project,
  });
};
