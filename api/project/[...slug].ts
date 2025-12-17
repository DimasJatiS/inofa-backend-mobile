import type { VercelRequest, VercelResponse } from '@vercel/node';
import projectRoutes from '../../src/routes/project.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', projectRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
