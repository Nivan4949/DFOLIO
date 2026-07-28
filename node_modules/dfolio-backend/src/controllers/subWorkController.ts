import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createSubWork = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryId, name } = req.body;

    if (!categoryId || !name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Missing required fields: categoryId, name' });
    }

    const trimmedName = name.trim();

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: 'Parent Category not found' });
    }

    const subWork = await prisma.subWork.create({
      data: {
        categoryId,
        name: trimmedName,
      },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json(subWork);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create sub work' });
  }
};

export const getSubWorks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryId } = req.query;

    const subWorks = await prisma.subWork.findMany({
      where: categoryId ? { categoryId: String(categoryId) } : undefined,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(subWorks);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve sub works' });
  }
};

export const getSubWorkById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subWork = await prisma.subWork.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        tasks: true,
      },
    });

    if (!subWork) {
      return res.status(404).json({ error: 'Sub Work not found' });
    }

    res.json(subWork);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve sub work details' });
  }
};

export const updateSubWork = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Sub Work name cannot be empty' });
    }

    const trimmedName = name.trim();

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(404).json({ error: 'Target parent category not found' });
      }
    }

    const subWork = await prisma.subWork.update({
      where: { id },
      data: {
        name: trimmedName,
        categoryId: categoryId || undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    });

    res.json(subWork);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update sub work' });
  }
};

export const deleteSubWork = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.subWork.delete({ where: { id } });

    res.json({ message: 'Sub Work deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete sub work' });
  }
};
