"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioById = exports.getUserPortfolios = exports.getMyPortfolios = exports.deletePortfolio = exports.updatePortfolio = exports.createPortfolio = void 0;
const prisma_1 = require("../lib/prisma");
const schemas_1 = require("../schemas");
const zod_1 = require("zod");
const createPortfolio = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const data = schemas_1.createPortfolioSchema.parse(req.body);
        // Check if profile exists
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            res.status(400).json({
                success: false,
                message: 'Complete your profile before adding portfolio',
            });
            return;
        }
        const portfolio = await prisma_1.prisma.portfolio.create({
            data: {
                userId,
                title: data.title,
                description: data.description || null,
                link: data.link || null,
                imageUrl: data.imageUrl || null,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Portfolio created successfully',
            data: portfolio,
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
        console.error('Create portfolio error:', error);
        res.status(500).json({ success: false, message: 'Failed to create portfolio' });
    }
};
exports.createPortfolio = createPortfolio;
const updatePortfolio = async (req, res) => {
    try {
        const userId = req.user?.id;
        const portfolioId = parseInt(req.params.id);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const data = schemas_1.updatePortfolioSchema.parse(req.body);
        // Check if portfolio exists and belongs to user
        const portfolio = await prisma_1.prisma.portfolio.findUnique({
            where: { id: portfolioId },
        });
        if (!portfolio) {
            res.status(404).json({ success: false, message: 'Portfolio not found' });
            return;
        }
        if (portfolio.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        const updatedPortfolio = await prisma_1.prisma.portfolio.update({
            where: { id: portfolioId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.link !== undefined && { link: data.link || null }),
                ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            },
        });
        res.status(200).json({
            success: true,
            message: 'Portfolio updated successfully',
            data: updatedPortfolio,
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
        console.error('Update portfolio error:', error);
        res.status(500).json({ success: false, message: 'Failed to update portfolio' });
    }
};
exports.updatePortfolio = updatePortfolio;
const deletePortfolio = async (req, res) => {
    try {
        const userId = req.user?.id;
        const portfolioId = parseInt(req.params.id);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const portfolio = await prisma_1.prisma.portfolio.findUnique({
            where: { id: portfolioId },
        });
        if (!portfolio) {
            res.status(404).json({ success: false, message: 'Portfolio not found' });
            return;
        }
        if (portfolio.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        await prisma_1.prisma.portfolio.delete({
            where: { id: portfolioId },
        });
        res.status(200).json({
            success: true,
            message: 'Portfolio deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete portfolio' });
    }
};
exports.deletePortfolio = deletePortfolio;
const getMyPortfolios = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const portfolios = await prisma_1.prisma.portfolio.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            success: true,
            data: portfolios,
        });
    }
    catch (error) {
        console.error('Get portfolios error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch portfolios' });
    }
};
exports.getMyPortfolios = getMyPortfolios;
const getUserPortfolios = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);
        const portfolios = await prisma_1.prisma.portfolio.findMany({
            where: { userId: targetUserId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            success: true,
            data: portfolios,
        });
    }
    catch (error) {
        console.error('Get user portfolios error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch portfolios' });
    }
};
exports.getUserPortfolios = getUserPortfolios;
const getPortfolioById = async (req, res) => {
    try {
        const portfolioId = parseInt(req.params.id);
        const portfolio = await prisma_1.prisma.portfolio.findUnique({
            where: { id: portfolioId },
            include: {
                user: {
                    select: {
                        email: true,
                        profile: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!portfolio) {
            res.status(404).json({ success: false, message: 'Portfolio not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: portfolio,
        });
    }
    catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch portfolio' });
    }
};
exports.getPortfolioById = getPortfolioById;
