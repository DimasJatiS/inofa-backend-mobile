import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { registerSchema, loginSchema } from '../schemas';
import { z } from 'zod';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || '';

interface JWTPayload {
  id: number;
  email: string;
  role: string | null;
}

function generateToken(user: JWTPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function makeErrorId(): string {
  // Avoid requiring Node crypto; keep it simple and stable across runtimes.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapPrismaError(error: unknown): { status: number; message: string } | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return { status: 409, message: 'Email already registered' };
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { status: 500, message: 'Database connection failed' };
  }

  if (error instanceof Error) {
    if (error.message.includes('Environment variable not found: DATABASE_URL')) {
      return { status: 500, message: 'Server misconfigured: DATABASE_URL is missing' };
    }

    // Common when schema was never pushed/migrated
    if (/(relation|table)\s+"?users"?\s+does not exist/i.test(error.message)) {
      return { status: 500, message: 'Database not initialized (run Prisma schema push/migrations)' };
    }
  }

  return null;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
      return;
    }

    const { email, password, role } = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || null,
      },
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    const mapped = mapPrismaError(error);
    const errorId = makeErrorId();
    console.error('Register error:', { errorId, error });

    if (mapped) {
      res.status(mapped.status).json({ success: false, message: mapped.message, errorId });
      return;
    }

    res.status(500).json({ success: false, message: 'Failed to register user', errorId });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
      return;
    }

    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    const mapped = mapPrismaError(error);
    const errorId = makeErrorId();
    console.error('Login error:', { errorId, error });

    if (mapped) {
      res.status(mapped.status).json({ success: false, message: mapped.message, errorId });
      return;
    }

    res.status(500).json({ success: false, message: 'Failed to login', errorId });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
};

export const getStatus = async (req: Request, res: Response): Promise<void> => {
  // Public endpoint: returns API status.
  // If Authorization header is present, it also validates the token and returns the current user's role status.
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(200).json({ success: true, status: 'ok' });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid token format' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        user: {
          ...user,
          hasRole: !!user.role,
        },
      },
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const setRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
      return;
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bodySchema = z.object({
      role: z.enum(['developer', 'client']),
    });

    const { role } = bodySchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.role) {
      res.status(409).json({ success: false, message: 'Role already set' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    const token = generateToken({
      id: updated.id,
      email: updated.email,
      role: updated.role,
    });

    res.status(200).json({
      success: true,
      message: 'Role set successfully',
      data: {
        user: updated,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    const mapped = mapPrismaError(error);
    const errorId = makeErrorId();
    console.error('SetRole error:', { errorId, error });

    if (mapped) {
      res.status(mapped.status).json({ success: false, message: mapped.message, errorId });
      return;
    }

    res.status(500).json({ success: false, message: 'Failed to set role', errorId });
  }
};
