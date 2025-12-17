import type { VercelRequest, VercelResponse } from '@vercel/node';
import uploadRoutes from '../../src/routes/upload.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', uploadRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
