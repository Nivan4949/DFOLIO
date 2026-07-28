"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const globalSearch = async (req, res) => {
    try {
        const query = req.query.q ? String(req.query.q).trim() : '';
        if (!query || query.length < 2) {
            return res.json({
                projects: [],
                tasks: [],
                snags: [],
                rooms: [],
                categories: [],
                photos: [],
            });
        }
        const [projects, tasks, snags, rooms, categories, photos] = await Promise.all([
            // 1. Projects
            prisma_1.default.project.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { location: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
            }),
            // 2. Tasks
            prisma_1.default.task.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: {
                    room: { select: { name: true } },
                    subWork: { select: { name: true, category: { select: { name: true } } } },
                },
                take: 5,
            }),
            // 3. Snags
            prisma_1.default.snag.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: {
                    room: { select: { name: true } },
                    assignedTo: { select: { name: true } },
                },
                take: 5,
            }),
            // 4. Rooms
            prisma_1.default.room.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' },
                },
                include: {
                    floor: { select: { name: true, project: { select: { name: true } } } },
                },
                take: 5,
            }),
            // 5. Categories
            prisma_1.default.category.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' },
                },
                include: {
                    subWorks: { select: { id: true, name: true } },
                },
                take: 5,
            }),
            // 6. Photos
            prisma_1.default.photo.findMany({
                where: {
                    caption: { contains: query, mode: 'insensitive' },
                },
                include: {
                    uploadedBy: { select: { name: true } },
                },
                take: 5,
            }),
        ]);
        res.json({
            query,
            results: {
                projects,
                tasks,
                snags,
                rooms,
                categories,
                photos,
            },
            totalMatches: projects.length +
                tasks.length +
                snags.length +
                rooms.length +
                categories.length +
                photos.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to perform global search' });
    }
};
exports.globalSearch = globalSearch;
