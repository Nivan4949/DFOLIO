"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSnag = exports.updateSnag = exports.getSnagById = exports.getSnags = exports.createSnag = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
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
        orderBy: { createdAt: 'desc' },
    },
};
const createSnag = async (req, res) => {
    try {
        const { title, description, priority, status, dueDate, deadline, roomId, taskId, assignedToId, photoUrl, } = req.body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ error: 'Missing required field: title' });
        }
        if (!roomId) {
            return res.status(400).json({ error: 'Missing required field: roomId' });
        }
        const room = await prisma_1.default.room.findUnique({
            where: { id: roomId },
            include: { floor: { select: { projectId: true } } },
        });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const createdById = req.user?.id || (await prisma_1.default.user.findFirst())?.id;
        if (!createdById) {
            return res.status(400).json({ error: 'User missing' });
        }
        const targetDueDate = dueDate || deadline;
        const snag = await prisma_1.default.snag.create({
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
            await prisma_1.default.photo.create({
                data: {
                    url: photoUrl,
                    caption: `Snag photo: ${snag.title}`,
                    snagId: snag.id,
                    uploadedById: createdById,
                },
            });
        }
        const finalSnag = await prisma_1.default.snag.findUnique({
            where: { id: snag.id },
            include: SNAG_INCLUDES,
        });
        res.status(201).json(finalSnag);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create snag' });
    }
};
exports.createSnag = createSnag;
const getSnags = async (req, res) => {
    try {
        const { projectId, roomId, taskId, status, priority, assignedToId } = req.query;
        const snags = await prisma_1.default.snag.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve snags' });
    }
};
exports.getSnags = getSnags;
const getSnagById = async (req, res) => {
    try {
        const { id } = req.params;
        const snag = await prisma_1.default.snag.findUnique({
            where: { id },
            include: SNAG_INCLUDES,
        });
        if (!snag) {
            return res.status(404).json({ error: 'Snag not found' });
        }
        res.json(snag);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve snag details' });
    }
};
exports.getSnagById = getSnagById;
const updateSnag = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, dueDate, deadline, roomId, taskId, assignedToId, } = req.body;
        const targetDueDate = dueDate || deadline;
        const snag = await prisma_1.default.snag.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update snag' });
    }
};
exports.updateSnag = updateSnag;
const deleteSnag = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.snag.delete({ where: { id } });
        res.json({ message: 'Snag deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete snag' });
    }
};
exports.deleteSnag = deleteSnag;
