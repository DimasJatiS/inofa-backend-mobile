import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createProjectSchema, updateProjectSchema } from '../schemas';
import { z } from 'zod';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const data = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
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
        skillRequirements: project.skillRequirements as string[] | null,
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
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.id);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const data = updateProjectSchema.parse(req.body);

    const project = await prisma.project.findUnique({
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

    const updatedProject = await prisma.project.update({
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
        skillRequirements: updatedProject.skillRequirements as string[] | null,
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
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.id);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const project = await prisma.project.findUnique({
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

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

export const getMyProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: projects.map((p) => ({
        ...p,
        skillRequirements: p.skillRequirements as string[] | null,
      })),
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
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
        skillRequirements: p.skillRequirements as string[] | null,
      })),
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findUnique({
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
        skillRequirements: project.skillRequirements as string[] | null,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
};
