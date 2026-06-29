import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { calculateSM2 } from '@studyos/utils';
import type { Settings } from '@studyos/types';

// Load environment variables
dotenv.config();

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());

// Base diagnostic endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StudyOS Backend API',
  });
});

// Boilerplate routes demonstrating types and utils integration
app.get('/api/diagnostic', (_req: Request, res: Response) => {
  const dummySettings: Settings = {
    id: 's_01',
    userId: 'u_01',
    theme: 'dark',
    dailyTargetHours: 4,
    emailDigestEnabled: true,
    pushNotificationsEnabled: false,
  };

  const sm2Calculation = calculateSM2(5, 2, 2.6, 6);

  res.status(200).json({
    message: 'Backend API successfully linked with packages/utils and packages/types!',
    settingsTemplate: dummySettings,
    spacedRepetitionMockResult: sm2Calculation,
  });
});

export default app;
