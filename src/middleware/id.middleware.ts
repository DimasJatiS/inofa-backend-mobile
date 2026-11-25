import { RequestParamHandler } from 'express';

// Kolom id di Postgres bertipe int4; nilai lain membuat Prisma melempar error (500).
export const requireIntId: RequestParamHandler = (req, res, next, value) => {
  if (!/^\d{1,10}$/.test(value) || Number(value) > 2147483647) {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }
  next();
};
