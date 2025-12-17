"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = exports.getAllProjects = exports.getMyProjects = exports.deleteProject = exports.updateProject = exports.createProject = void 0;
const prisma_1 = require("../lib/prisma");
const schemas_1 = require("../schemas");
const zod_1 = require("zod");
const createProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const data = schemas_1.createProjectSchema.parse(req.body);
        const project = await prisma_1.prisma.project.create({
            data: {
                userId,
                title: data.title,
                description: data.description || null,
                budget: data.budget || null,
                skillRequirements: data.skillRequirements
                    ? JSON.parse(JSON.stringify(data.skillRequirements))
                    : null,
                constraints: data.constraints || null,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: {
                ...project,
                skillRequirements: project.skillRequirements,
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
        console.error('Create project error:', error);
        res.status(500).json({ success: false, message: 'Failed to create project' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const projectId = parseInt(req.params.id);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const data = schemas_1.updateProjectSchema.parse(req.body);
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        if (project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        const updatedProject = await prisma_1.prisma.project.update({
            where: { id: projectId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.budget !== undefined && { budget: data.budget }),
                ...(data.skillRequirements && {
                    skillRequirements: JSON.parse(JSON.stringify(data.skillRequirements)),
                }),
                ...(data.constraints !== undefined && { constraints: data.constraints }),
                ...(data.status && { status: data.status }),
            },
        });
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: {
                ...updatedProject,
                skillRequirements: updatedProject.skillRequirements,
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
        console.error('Update project error:', error);
        res.status(500).json({ success: false, message: 'Failed to update project' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const projectId = parseInt(req.params.id);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        if (project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        await prisma_1.prisma.project.delete({
            where: { id: projectId },
        });
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
};
exports.deleteProject = deleteProject;
const getMyProjects = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const projects = await prisma_1.prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            success: true,
            data: projects.map((p) => ({
                ...p,
                skillRequirements: p.skillRequirements,
            })),
        });
    }
    catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
};
exports.getMyProjects = getMyProjects;
const getAllProjects = async (req, res) => {
    try {
        const projects = await prisma_1.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
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
        res.status(200).json({
            success: true,
            data: projects.map((p) => ({
                ...p,
                skillRequirements: p.skillRequirements,
            })),
        });
    }
    catch (error) {
        console.error('Get all projects error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                user: {
                    select: {
                        email: true,
                        profile: {
                            select: {
                                name: true,
                                whatsapp: true,
                            },
                        },
                    },
                },
            },
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...project,
                skillRequirements: project.skillRequirements,
            },
        });
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
};
exports.getProjectById = getProjectById;
