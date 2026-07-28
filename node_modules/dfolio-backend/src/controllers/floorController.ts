import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createFloor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, name, number } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ error: 'Missing required fields: projectId, name' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    const floor = await prisma.floor.create({
      data: {
        projectId,
        name,
        number: typeof number === 'number' ? number : 0,
      },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { rooms: true } },
      },
    });

    res.status(201).json(floor);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create floor' });
  }
};

export const getFloors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.query;

    const floors = await prisma.floor.findMany({
      where: projectId ? { projectId: String(projectId) } : undefined,
      include: {
        project: { select: { id: true, name: true } },
        rooms: { select: { id: true, name: true } },
        _count: { select: { rooms: true } },
      },
      orderBy: { number: 'asc' },
    });

    res.json(floors);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve floors' });
  }
};

export const getFloorById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        rooms: { orderBy: { name: 'asc' } },
      },
    });

    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    res.json(floor);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve floor details' });
  }
};

export const updateFloor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, number } = req.body;

    const floor = await prisma.floor.update({
      where: { id },
      data: {
        name,
        number: typeof number === 'number' ? number : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    res.json(floor);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update floor' });
  }
};

export const deleteFloor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.floor.delete({ where: { id } });

    res.json({ message: 'Floor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete floor' });
  }
};
