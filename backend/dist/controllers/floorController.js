"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFloor = exports.updateFloor = exports.getFloorById = exports.getFloors = exports.createFloor = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createFloor = async (req, res) => {
    try {
        const { projectId, name, number } = req.body;
        if (!projectId || !name) {
            return res.status(400).json({ error: 'Missing required fields: projectId, name' });
        }
        const project = await prisma_1.default.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ error: 'Associated project not found' });
        }
        const floor = await prisma_1.default.floor.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create floor' });
    }
};
exports.createFloor = createFloor;
const getFloors = async (req, res) => {
    try {
        const { projectId } = req.query;
        const floors = await prisma_1.default.floor.findMany({
            where: projectId ? { projectId: String(projectId) } : undefined,
            include: {
                project: { select: { id: true, name: true } },
                rooms: { select: { id: true, name: true } },
                _count: { select: { rooms: true } },
            },
            orderBy: { number: 'asc' },
        });
        res.json(floors);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve floors' });
    }
};
exports.getFloors = getFloors;
const getFloorById = async (req, res) => {
    try {
        const { id } = req.params;
        const floor = await prisma_1.default.floor.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve floor details' });
    }
};
exports.getFloorById = getFloorById;
const updateFloor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, number } = req.body;
        const floor = await prisma_1.default.floor.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update floor' });
    }
};
exports.updateFloor = updateFloor;
const deleteFloor = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.floor.delete({ where: { id } });
        res.json({ message: 'Floor deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete floor' });
    }
};
exports.deleteFloor = deleteFloor;
