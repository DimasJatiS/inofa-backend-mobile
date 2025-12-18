"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeveloperById = exports.getAllDevelopers = void 0;
const prisma_1 = require("../lib/prisma");
const getAllDevelopers = async (req, res) => {
    try {
        const developers = await prisma_1.prisma.user.findMany({
            where: {
                role: 'developer',
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: {
                    select: {
                        name: true,
                        photoUrl: true,
                        bio: true,
                        location: true,
                        skills: true,
                        whatsapp: true,
                    },
                },
                portfolios: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        link: true,
                        imageUrl: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({
            success: true,
            data: developers.map((dev) => ({
                ...dev,
                profile: dev.profile
                    ? {
                        ...dev.profile,
                        skills: dev.profile.skills,
                    }
                    : null,
            })),
        });
    }
    catch (error) {
        console.error('Get developers error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch developers' });
    }
};
exports.getAllDevelopers = getAllDevelopers;
const getDeveloperById = async (req, res) => {
    try {
        const developerId = parseInt(req.params.id, 10);
        if (!Number.isFinite(developerId)) {
            res.status(400).json({ success: false, message: 'Invalid developer id' });
            return;
        }
        const developer = await prisma_1.prisma.user.findFirst({
            where: {
                id: developerId,
                role: 'developer',
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: {
                    select: {
                        name: true,
                        photoUrl: true,
                        bio: true,
                        location: true,
                        skills: true,
                        whatsapp: true,
                    },
                },
                portfolios: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        link: true,
                        imageUrl: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!developer) {
            res.status(404).json({ success: false, message: 'Developer not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...developer,
                profile: developer.profile
                    ? {
                        ...developer.profile,
                        skills: developer.profile.skills,
                    }
                    : null,
            },
        });
    }
    catch (error) {
        console.error('Get developer error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch developer' });
    }
};
exports.getDeveloperById = getDeveloperById;
