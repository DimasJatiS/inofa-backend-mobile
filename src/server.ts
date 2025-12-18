import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import portfolioRoutes from './routes/portfolio.routes';
import projectRoutes from './routes/project.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import developerRoutes from './routes/developer.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Versioned health check
app.get('/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/project', projectRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/developer', developerRoutes);
app.use('/upload', uploadRoutes);

// Versioned routes (/v1/*)
app.use('/v1/auth', authRoutes);
app.use('/v1/profile', profileRoutes);
app.use('/v1/portfolio', portfolioRoutes);
app.use('/v1/project', projectRoutes);
app.use('/v1/whatsapp', whatsappRoutes);
app.use('/v1/developer', developerRoutes);
app.use('/v1/upload', uploadRoutes);

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;

