"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createProject = async (req, res) => {
    try {
        const { name, description, location, startDate, endDate, status } = req.body;
        if (!name || !startDate) {
            return res.status(400).json({ error: 'Missing required fields: name, startDate' });
        }
        const project = await prisma_1.default.project.create({
            data: {
                name,
                description,
                location,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status: status || 'PLANNING',
            },
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create project' });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            include: {
                _count: {
                    select: {
                        tasks: true,
                        snags: true,
                        floors: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve projects' });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.default.project.findUnique({
            where: { id },
            include: {
                floors: {
                    include: {
                        rooms: true,
                    },
                },
                tasks: { orderBy: { startDate: 'asc' } },
                snags: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve project details' });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, location, startDate, endDate, status } = req.body;
        const project = await prisma_1.default.project.update({
            where: { id },
            data: {
                name,
                description,
                location,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : endDate === null ? null : undefined,
                status,
            },
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update project' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.project.delete({ where: { id } });
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
};
exports.deleteProject = deleteProject;
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        // 1. Tasks Aggregations
        const allTasks = await prisma_1.default.task.findMany({
            include: {
                room: { select: { name: true, floor: { select: { name: true, project: { select: { name: true } } } } } },
                subWork: { select: { name: true, category: { select: { name: true } } } },
                contractor: { select: { name: true } },
                supervisor: { select: { name: true } },
            },
        });
        const totalTasksCount = allTasks.length;
        const overallProgress = totalTasksCount > 0
            ? Math.round(allTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasksCount)
            : 0;
        // Today's Tasks
        const todayTasksList = allTasks.filter((t) => {
            const start = new Date(t.startDate);
            const end = new Date(t.endDate);
            return (start <= endOfToday && end >= startOfToday);
        });
        // Delayed Tasks (Status DELAYED or past endDate with progress < 100)
        const delayedTasksCount = allTasks.filter((t) => {
            const isPast = new Date(t.endDate) < startOfToday;
            return t.status === 'HOLD' || t.status === 'DELAYED' || (isPast && t.progress < 100);
        }).length;
        // Status Breakdown
        const statusBreakdown = {
            NOT_STARTED: allTasks.filter((t) => t.status === 'NOT_STARTED').length,
            IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
            HOLD: allTasks.filter((t) => t.status === 'HOLD').length,
            INSPECTION: allTasks.filter((t) => t.status === 'INSPECTION').length,
            COMPLETED: allTasks.filter((t) => t.status === 'COMPLETED').length,
        };
        // 2. Pending Snags Count
        const pendingSnagsCount = await prisma_1.default.snag.count({
            where: {
                status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
        });
        // 3. Recent Photos
        const recentPhotos = await prisma_1.default.photo.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: {
                uploadedBy: { select: { name: true } },
            },
        });
        // 4. Category Breakdown
        const categories = await prisma_1.default.category.findMany({
            include: {
                subWorks: {
                    include: {
                        tasks: true,
                    },
                },
            },
        });
        const categoryBreakdown = categories.map((c) => {
            const categoryTasks = c.subWorks.flatMap((sw) => sw.tasks);
            const taskCount = categoryTasks.length;
            const avgProgress = taskCount > 0
                ? Math.round(categoryTasks.reduce((acc, t) => acc + t.progress, 0) / taskCount)
                : 0;
            return {
                id: c.id,
                name: c.name,
                taskCount,
                progress: avgProgress,
            };
        });
        res.json({
            overallProgress,
            todayTasksCount: todayTasksList.length,
            todayTasks: todayTasksList.slice(0, 5),
            pendingSnagsCount,
            delayedTasksCount,
            statusBreakdown,
            categoryBreakdown,
            recentPhotos,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
