"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.updateRoom = exports.getRoomById = exports.getRooms = exports.createRoom = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createRoom = async (req, res) => {
    try {
        const { floorId, name } = req.body;
        if (!floorId || !name) {
            return res.status(400).json({ error: 'Missing required fields: floorId, name' });
        }
        const floor = await prisma_1.default.floor.findUnique({ where: { id: floorId } });
        if (!floor) {
            return res.status(404).json({ error: 'Associated floor not found' });
        }
        const room = await prisma_1.default.room.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create room' });
    }
};
exports.createRoom = createRoom;
const getRooms = async (req, res) => {
    try {
        const { floorId, projectId } = req.query;
        const rooms = await prisma_1.default.room.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve rooms' });
    }
};
exports.getRooms = getRooms;
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await prisma_1.default.room.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve room details' });
    }
};
exports.getRoomById = getRoomById;
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, floorId } = req.body;
        if (floorId) {
            const floor = await prisma_1.default.floor.findUnique({ where: { id: floorId } });
            if (!floor) {
                return res.status(404).json({ error: 'Target floor not found' });
            }
        }
        const room = await prisma_1.default.room.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update room' });
    }
};
exports.updateRoom = updateRoom;
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.room.delete({ where: { id } });
        res.json({ message: 'Room deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete room' });
    }
};
exports.deleteRoom = deleteRoom;
