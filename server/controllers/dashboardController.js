import Employee from '../models/Employee.js';
import Project from '../models/Project.js';

export const getDashboardStats = async (req, res) => {
  const [
    totalEmployees,
    totalProjects,
    projectsInProgress,
    completedProjects,
  ] = await Promise.all([
    Employee.countDocuments(),
    Project.countDocuments(),
    Project.countDocuments({ status: 'In Progress' }),
    Project.countDocuments({ status: 'Completed' }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: {
      totalEmployees,
      totalProjects,
      projectsInProgress,
      completedProjects,
    },
  });
};
