"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRole = exports.getStatus = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const schemas_1 = require("../schemas");
const zod_1 = require("zod");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || '';
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, { expiresIn: '7d' });
}
function makeErrorId() {
    // Avoid requiring Node crypto; keep it simple and stable across runtimes.
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function mapPrismaError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
            return { status: 409, message: 'Email already registered' };
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
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
const register = async (req, res) => {
    try {
        if (!JWT_SECRET) {
            res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
            return;
        }
        const { email, password, role } = schemas_1.registerSchema.parse(req.body);
        // Check if email already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        // Create user
        const newUser = await prisma_1.prisma.user.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.register = register;
const login = async (req, res) => {
    try {
        if (!JWT_SECRET) {
            res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
            return;
        }
        const { email, password } = schemas_1.loginSchema.parse(req.body);
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }
};
exports.getMe = getMe;
const getStatus = async (req, res) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        console.error('Status error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.getStatus = getStatus;
const setRole = async (req, res) => {
    try {
        if (!JWT_SECRET) {
            res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing' });
            return;
        }
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const bodySchema = zod_1.z.object({
            role: zod_1.z.enum(['developer', 'client']),
        });
        const { role } = bodySchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
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
        const updated = await prisma_1.prisma.user.update({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.setRole = setRole;
