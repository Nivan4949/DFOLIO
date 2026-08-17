import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getActivityLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, limit } = req.query;
    const take = limit ? parseInt(limit as string, 10) : 30;

    const where: any = {};
    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }

    const logs = await prisma.activityLog.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
    });

    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};
