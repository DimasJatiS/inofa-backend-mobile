"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = exports.updatePortfolioSchema = exports.createPortfolioSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['developer', 'client']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Profile schemas
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    whatsapp: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
});
// Portfolio schemas
exports.createPortfolioSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional(),
    link: zod_1.z.string().url('Invalid URL').optional(),
    imageUrl: zod_1.z.string().optional(),
});
exports.updatePortfolioSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    description: zod_1.z.string().optional(),
    link: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal('')),
    imageUrl: zod_1.z.string().optional(),
});
// Project schemas
exports.createProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional(),
    budget: zod_1.z.number().positive('Budget must be positive').optional(),
    skillRequirements: zod_1.z.array(zod_1.z.string()).optional(),
    constraints: zod_1.z.string().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    description: zod_1.z.string().optional(),
    budget: zod_1.z.number().positive('Budget must be positive').optional(),
    skillRequirements: zod_1.z.array(zod_1.z.string()).optional(),
    constraints: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'accepted', 'rejected', 'done']).optional(),
});
