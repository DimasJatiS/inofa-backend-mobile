import type { VercelRequest, VercelResponse } from '@vercel/node';
import developerRoutes from '../../src/routes/developer.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', developerRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
