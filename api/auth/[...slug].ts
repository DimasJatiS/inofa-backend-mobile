import type { VercelRequest, VercelResponse } from '@vercel/node';
import authRoutes from '../../src/routes/auth.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', authRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
