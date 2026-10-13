import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { ensureAdminAccount } from './bootstrapAdmin.js';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await ensureAdminAccount();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
