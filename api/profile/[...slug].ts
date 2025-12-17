import type { VercelRequest, VercelResponse } from '@vercel/node';
import profileRoutes from '../../src/routes/profile.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', profileRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
