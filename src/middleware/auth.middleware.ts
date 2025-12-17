import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

interface JWTPayload {
  id: number;
  email: string;
  role: string | null;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ success: false, message: 'Invalid token format' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
