import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
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
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
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
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Failed to login' });
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
