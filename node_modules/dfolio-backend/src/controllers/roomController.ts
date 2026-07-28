import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { floorId, name } = req.body;

    if (!floorId || !name) {
      return res.status(400).json({ error: 'Missing required fields: floorId, name' });
    }

    const floor = await prisma.floor.findUnique({ where: { id: floorId } });
    if (!floor) {
      return res.status(404).json({ error: 'Associated floor not found' });
    }

    const room = await prisma.room.create({
      data: {
        floorId,
        name,
      },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
            project: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create room' });
  }
};

export const getRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { floorId, projectId } = req.query;

    const rooms = await prisma.room.findMany({
      where: {
        ...(floorId ? { floorId: String(floorId) } : {}),
        ...(projectId ? { floor: { projectId: String(projectId) } } : {}),
      },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
            project: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            tasks: true,
            snags: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve rooms' });
  }
};

export const getRoomById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
            project: { select: { id: true, name: true } },
          },
        },
        tasks: true,
        snags: true,
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve room details' });
  }
};

export const updateRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, floorId } = req.body;

    if (floorId) {
      const floor = await prisma.floor.findUnique({ where: { id: floorId } });
      if (!floor) {
        return res.status(404).json({ error: 'Target floor not found' });
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        floorId,
      },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
            project: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update room' });
  }
};

export const deleteRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.room.delete({ where: { id } });

    res.json({ message: 'Room deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete room' });
  }
};
