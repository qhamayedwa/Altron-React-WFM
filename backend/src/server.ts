import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and replit domains
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3001',
      /\.replit\.dev$/,
      /\.replit\.app$/,
      /\.repl\.co$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TimeLogic AI Backend'
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import timeAttendanceRoutes from './routes/time-attendance.routes';
import timeRoutes from './routes/time.routes';
import leaveRoutes from './routes/leave.routes';
import schedulingRoutes from './routes/scheduling.routes';
import usersRoutes from './routes/users.routes';
import organizationRoutes from './routes/organization.routes';
import notificationsRoutes from './routes/notifications.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportsRoutes from './routes/reports.routes';
import payrollRoutes from './routes/payroll.routes';
import payRulesRoutes from './routes/pay-rules.routes';
import payCodesRoutes from './routes/pay-codes.routes';
import automationRoutes from './routes/automation.routes';
import aiRoutes from './routes/ai.routes';
import pulseSurveyRoutes from './routes/pulse-survey.routes';
import tenantRoutes from './routes/tenant.routes';
import integrationsRoutes from './routes/integrations.routes';
import timecardRollupRoutes from './routes/timecard-rollup.routes';
import employeeImportRoutes from './routes/employee-import.routes';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/time-attendance', timeAttendanceRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/v1/leave', leaveRoutes); // Support v1 prefix for frontend compatibility
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/v1/organization', organizationRoutes); // Support v1 prefix for frontend compatibility
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/pay-rules', payRulesRoutes);
app.use('/api/pay-codes', payCodesRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pulse-survey', pulseSurveyRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/timecard-rollup', timecardRollupRoutes);
app.use('/api/employee-import', employeeImportRoutes);

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'TimeLogic AI API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      timeAttendance: '/api/time-attendance',
      leave: '/api/leave',
      scheduling: '/api/scheduling',
      payroll: '/api/payroll',
      organization: '/api/organization',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard',
      reports: '/api/reports'
    }
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
  console.log(`🚀 TimeLogic AI Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
