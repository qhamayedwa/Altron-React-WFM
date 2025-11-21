import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'WFM24/7 Backend'
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import timeAttendanceRoutes from './routes/time-attendance.routes';
import leaveRoutes from './routes/leave.routes';
import schedulingRoutes from './routes/scheduling.routes';
import usersRoutes from './routes/users.routes';
import organizationRoutes from './routes/organization.routes';
import notificationsRoutes from './routes/notifications.routes';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/time-attendance', timeAttendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Altron WFM24/7 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      timeAttendance: '/api/time-attendance',
      leave: '/api/leave',
      scheduling: '/api/scheduling',
      payroll: '/api/payroll',
      organization: '/api/organization',
      notifications: '/api/notifications'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Altron WFM24/7 Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
