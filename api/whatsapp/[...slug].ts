import type { VercelRequest, VercelResponse } from '@vercel/node';
import whatsappRoutes from '../../src/routes/whatsapp.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', whatsappRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
