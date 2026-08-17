import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

// Get all system users
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.query;
    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedTasks: true,
            assignedSnags: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create a new user (Admin / PM function)
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role || 'SITE_ENGINEER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: user.id,
        details: `Created new user account "${user.name}" (${user.role}).`,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
};

// Update user role or profile details
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) dataToUpdate.role = role;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'USER_UPDATED',
        entityType: 'USER',
        entityId: updatedUser.id,
        details: `Updated user account "${updatedUser.name}".`,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user account
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own active admin account.' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
};
