import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['developer', 'client']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  whatsapp: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

// Portfolio schemas
export const createPortfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  link: z.string().url('Invalid URL').optional(),
  imageUrl: z.string().optional(),
});

export const updatePortfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageUrl: z.string().optional(),
});

// Project schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  skillRequirements: z.array(z.string()).optional(),
  constraints: z.string().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  skillRequirements: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'done']).optional(),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
