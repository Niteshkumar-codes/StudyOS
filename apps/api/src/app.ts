import dotenv from 'dotenv';
// Load environment variables immediately before other imports
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './config/db';
import { globalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';


const app: Express = express();

// Connect to MongoDB Database
connectDB();

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Apply global rate limiting
app.use(globalLimiter);

// Base diagnostic endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StudyOS Backend API',
  });
});

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
   
  console.error('💥 Unhandled Exception:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
  });
});

export default app;
