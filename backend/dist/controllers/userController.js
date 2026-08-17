"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get all system users
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const where = {};
        if (role && typeof role === 'string') {
            where.role = role;
        }
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
// Create a new user (Admin / PM function)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const assignedRole = role || 'SITE_ENGINEER';
        const user = await prisma_1.default.user.create({
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
        await prisma_1.default.activityLog.create({
            data: {
                userId: req.user?.id,
                action: 'USER_CREATED',
                entityType: 'USER',
                entityId: user.id,
                details: `Created new user account "${user.name}" (${user.role}).`,
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user account' });
    }
};
exports.createUser = createUser;
// Update user role or profile details
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        const dataToUpdate = {};
        if (name)
            dataToUpdate.name = name;
        if (email)
            dataToUpdate.email = email;
        if (role)
            dataToUpdate.role = role;
        if (password) {
            dataToUpdate.password = await bcryptjs_1.default.hash(password, 10);
        }
        const updatedUser = await prisma_1.default.user.update({
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
        await prisma_1.default.activityLog.create({
            data: {
                userId: req.user?.id,
                action: 'USER_UPDATED',
                entityType: 'USER',
                entityId: updatedUser.id,
                details: `Updated user account "${updatedUser.name}".`,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
// Delete user account
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent self-deletion
        if (req.user?.id === id) {
            return res.status(400).json({ error: 'You cannot delete your own active admin account.' });
        }
        await prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'User account deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user account' });
    }
};
exports.deleteUser = deleteUser;
