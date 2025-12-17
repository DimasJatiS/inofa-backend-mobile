import type { VercelRequest, VercelResponse } from '@vercel/node';
import portfolioRoutes from '../../src/routes/portfolio.routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', portfolioRoutes);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
