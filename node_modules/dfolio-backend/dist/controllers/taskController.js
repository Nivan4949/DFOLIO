"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const TASK_INCLUDES = {
    project: { select: { id: true, name: true } },
    room: { select: { id: true, name: true, floor: { select: { id: true, name: true } } } },
    subWork: { select: { id: true, name: true, category: { select: { id: true, name: true } } } },
    contractor: { select: { id: true, name: true, email: true, role: true } },
    supervisor: { select: { id: true, name: true, email: true, role: true } },
    assignedTo: { select: { id: true, name: true, email: true, role: true } },
    createdBy: { select: { id: true, name: true } },
    dependsOnTask: { select: { id: true, name: true, status: true, progress: true } },
};
// Helper: Calculate progress from status or vice versa
const resolveStatusAndProgress = (status, inputProgress) => {
    let finalStatus = status || 'NOT_STARTED';
    let finalProgress = typeof inputProgress === 'number' ? inputProgress : 0;
    if (status && inputProgress === undefined) {
        switch (status) {
            case 'NOT_STARTED':
                finalProgress = 0;
                break;
            case 'IN_PROGRESS':
                finalProgress = 50;
                break;
            case 'HOLD': break; // keep existing progress
            case 'INSPECTION':
                finalProgress = 90;
                break;
            case 'COMPLETED':
                finalProgress = 100;
                break;
        }
    }
    else if (inputProgress !== undefined && !status) {
        if (inputProgress === 0)
            finalStatus = 'NOT_STARTED';
        else if (inputProgress > 0 && inputProgress < 90)
            finalStatus = 'IN_PROGRESS';
        else if (inputProgress >= 90 && inputProgress < 100)
            finalStatus = 'INSPECTION';
        else if (inputProgress >= 100)
            finalStatus = 'COMPLETED';
    }
    return { status: finalStatus, progress: finalProgress };
};
const createTask = async (req, res) => {
    try {
        const { name, title, description, priority, status, startDate, endDate, progress, projectId, roomId, subWorkId, contractorId, supervisorId, labourCount, assignedToId, dependsOnTaskId, } = req.body;
        const taskName = name || title;
        if (!taskName || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required fields: title/name, startDate, endDate' });
        }
        // Default to first project if not provided
        let targetProjectId = projectId;
        if (!targetProjectId) {
            const firstProject = await prisma_1.default.project.findFirst();
            if (firstProject) {
                targetProjectId = firstProject.id;
            }
            else {
                return res.status(400).json({ error: 'No project exists to attach this task to. Please create a project first.' });
            }
        }
        const createdById = req.user?.id || (await prisma_1.default.user.findFirst())?.id;
        if (!createdById) {
            return res.status(400).json({ error: 'No user exists to set as createdBy' });
        }
        const resolved = resolveStatusAndProgress(status, progress);
        const task = await prisma_1.default.task.create({
            data: {
                name: taskName,
                description: description || null,
                priority: priority || 'MEDIUM',
                status: resolved.status,
                progress: resolved.progress,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                projectId: targetProjectId,
                roomId: roomId || null,
                subWorkId: subWorkId || null,
                contractorId: contractorId || null,
                supervisorId: supervisorId || null,
                labourCount: typeof labourCount === 'number' ? labourCount : (parseInt(labourCount) || 1),
                createdById,
                assignedToId: assignedToId || null,
                dependsOnTaskId: dependsOnTaskId || null,
            },
            include: TASK_INCLUDES,
        });
        const startMs = new Date(task.startDate).getTime();
        const endMs = new Date(task.endDate).getTime();
        const estimatedDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
        res.status(201).json({
            ...task,
            title: task.name,
            estimatedDays,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create task' });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const { projectId, roomId, subWorkId, categoryId, contractorId, supervisorId, status, priority } = req.query;
        const tasks = await prisma_1.default.task.findMany({
            where: {
                ...(projectId ? { projectId: String(projectId) } : {}),
                ...(roomId ? { roomId: String(roomId) } : {}),
                ...(subWorkId ? { subWorkId: String(subWorkId) } : {}),
                ...(categoryId ? { subWork: { categoryId: String(categoryId) } } : {}),
                ...(contractorId ? { contractorId: String(contractorId) } : {}),
                ...(supervisorId ? { supervisorId: String(supervisorId) } : {}),
                ...(status ? { status: String(status) } : {}),
                ...(priority ? { priority: String(priority) } : {}),
            },
            include: TASK_INCLUDES,
            orderBy: { startDate: 'asc' },
        });
        const formattedTasks = tasks.map((t) => {
            const startMs = new Date(t.startDate).getTime();
            const endMs = new Date(t.endDate).getTime();
            const estimatedDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
            return {
                ...t,
                title: t.name,
                estimatedDays,
            };
        });
        res.json(formattedTasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve tasks' });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma_1.default.task.findUnique({
            where: { id },
            include: {
                ...TASK_INCLUDES,
                photos: true,
                notes: true,
            },
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const startMs = new Date(task.startDate).getTime();
        const endMs = new Date(task.endDate).getTime();
        const estimatedDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
        res.json({
            ...task,
            title: task.name,
            estimatedDays,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve task details' });
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, description, priority, status, startDate, endDate, progress, roomId, subWorkId, contractorId, supervisorId, labourCount, assignedToId, dependsOnTaskId, } = req.body;
        const taskName = name || title;
        let resolvedStatus = status;
        let resolvedProgress = progress;
        if (status !== undefined || progress !== undefined) {
            const resVal = resolveStatusAndProgress(status, progress);
            if (status !== undefined)
                resolvedStatus = resVal.status;
            if (progress !== undefined)
                resolvedProgress = resVal.progress;
        }
        const task = await prisma_1.default.task.update({
            where: { id },
            data: {
                name: taskName || undefined,
                description,
                priority,
                status: resolvedStatus,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                progress: typeof resolvedProgress === 'number' ? resolvedProgress : undefined,
                roomId: roomId === null ? null : roomId || undefined,
                subWorkId: subWorkId === null ? null : subWorkId || undefined,
                contractorId: contractorId === null ? null : contractorId || undefined,
                supervisorId: supervisorId === null ? null : supervisorId || undefined,
                labourCount: labourCount !== undefined ? (typeof labourCount === 'number' ? labourCount : parseInt(labourCount) || 1) : undefined,
                assignedToId: assignedToId === null ? null : assignedToId || undefined,
                dependsOnTaskId: dependsOnTaskId === null ? null : dependsOnTaskId || undefined,
            },
            include: TASK_INCLUDES,
        });
        const startMs = new Date(task.startDate).getTime();
        const endMs = new Date(task.endDate).getTime();
        const estimatedDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
        res.json({
            ...task,
            title: task.name,
            estimatedDays,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update task' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.task.delete({ where: { id } });
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete task' });
    }
};
exports.deleteTask = deleteTask;
