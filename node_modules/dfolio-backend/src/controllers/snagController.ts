import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const SNAG_INCLUDES = {
  project: { select: { id: true, name: true } },
  room: { select: { id: true, name: true, floor: { select: { id: true, name: true } } } },
  task: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true } },
  photos: { select: { id: true, url: true, caption: true, createdAt: true } },
  notes: {
    select: {
      id: true,
      content: true,
      attachmentUrl: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

export const createSnag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      deadline,
      roomId,
      taskId,
      assignedToId,
      photoUrl,
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    if (!roomId) {
      return res.status(400).json({ error: 'Missing required field: roomId' });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { floor: { select: { projectId: true } } },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const createdById = req.user?.id || (await prisma.user.findFirst())?.id;
    if (!createdById) {
      return res.status(400).json({ error: 'User missing' });
    }

    const targetDueDate = dueDate || deadline;

    const snag = await prisma.snag.create({
      data: {
        title: title.trim(),
        description: description || null,
        priority: priority || 'MEDIUM',
        status: status || 'OPEN',
        dueDate: targetDueDate ? new Date(targetDueDate) : null,
        projectId: room.floor.projectId,
        roomId,
        taskId: taskId || null,
        assignedToId: assignedToId || null,
        createdById,
      },
      include: SNAG_INCLUDES,
    });

    // Save initial photo if provided
    if (photoUrl) {
      await prisma.photo.create({
        data: {
          url: photoUrl,
          caption: `Snag photo: ${snag.title}`,
          snagId: snag.id,
          uploadedById: createdById,
        },
      });
    }

    const finalSnag = await prisma.snag.findUnique({
      where: { id: snag.id },
      include: SNAG_INCLUDES,
    });

    res.status(201).json(finalSnag);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create snag' });
  }
};

export const getSnags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, roomId, taskId, status, priority, assignedToId } = req.query;

    const snags = await prisma.snag.findMany({
      where: {
        ...(projectId ? { projectId: String(projectId) } : {}),
        ...(roomId ? { roomId: String(roomId) } : {}),
        ...(taskId ? { taskId: String(taskId) } : {}),
        ...(status ? { status: String(status) } : {}),
        ...(priority ? { priority: String(priority) } : {}),
        ...(assignedToId ? { assignedToId: String(assignedToId) } : {}),
      },
      include: SNAG_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });

    res.json(snags);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve snags' });
  }
};

export const getSnagById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const snag = await prisma.snag.findUnique({
      where: { id },
      include: SNAG_INCLUDES,
    });

    if (!snag) {
      return res.status(404).json({ error: 'Snag not found' });
    }

    res.json(snag);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve snag details' });
  }
};

export const updateSnag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      deadline,
      roomId,
      taskId,
      assignedToId,
    } = req.body;

    const targetDueDate = dueDate || deadline;

    const snag = await prisma.snag.update({
      where: { id },
      data: {
        title: title || undefined,
        description,
        priority,
        status,
        dueDate: targetDueDate ? new Date(targetDueDate) : undefined,
        roomId: roomId || undefined,
        taskId: taskId === null ? null : taskId || undefined,
        assignedToId: assignedToId === null ? null : assignedToId || undefined,
      },
      include: SNAG_INCLUDES,
    });

    res.json(snag);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update snag' });
  }
};

export const deleteSnag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.snag.delete({ where: { id } });

    res.json({ message: 'Snag deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete snag' });
  }
};
