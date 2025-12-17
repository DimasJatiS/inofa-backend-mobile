import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllDevelopers = async (req: Request, res: Response): Promise<void> => {
  try {
    const developers = await prisma.user.findMany({
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
              skills: dev.profile.skills as string[] | null,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Get developers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch developers' });
  }
};

export const getDeveloperById = async (req: Request, res: Response): Promise<void> => {
  try {
    const developerId = parseInt(req.params.id);

    const developer = await prisma.user.findFirst({
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
              skills: developer.profile.skills as string[] | null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get developer error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch developer' });
  }
};
