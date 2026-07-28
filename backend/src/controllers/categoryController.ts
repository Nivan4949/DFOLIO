import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const trimmedName = name.trim();

    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return res.status(400).json({ error: `Category '${trimmedName}' already exists.` });
    }

    const category = await prisma.category.create({
      data: { name: trimmedName },
      include: {
        _count: { select: { subWorks: true } },
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create category' });
  }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subWorks: { select: { id: true, name: true } },
        _count: { select: { subWorks: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve categories' });
  }
};

export const getCategoryById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subWorks: { orderBy: { name: 'asc' } },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve category details' });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Category name cannot be empty' });
    }

    const trimmedName = name.trim();

    const existing = await prisma.category.findFirst({
      where: {
        name: trimmedName,
        NOT: { id },
      },
    });

    if (existing) {
      return res.status(400).json({ error: `Another category named '${trimmedName}' already exists.` });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: trimmedName },
      include: {
        _count: { select: { subWorks: true } },
      },
    });

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete category' });
  }
};
