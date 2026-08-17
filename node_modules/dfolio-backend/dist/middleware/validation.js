"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSnagInput = exports.validateTaskInput = exports.validateProjectInput = exports.validateBody = void 0;
// Generic validation helper function
const validateBody = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Validation Error: Missing required fields: [${missingFields.join(', ')}]`,
            });
        }
        next();
    };
};
exports.validateBody = validateBody;
// Validate project input
const validateProjectInput = (req, res, next) => {
    const { name, startDate } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Validation Error: Project name is required and must be a string.' });
    }
    if (startDate && isNaN(Date.parse(startDate))) {
        return res.status(400).json({ error: 'Validation Error: Invalid startDate date format.' });
    }
    next();
};
exports.validateProjectInput = validateProjectInput;
// Validate task input
const validateTaskInput = (req, res, next) => {
    const { name, projectId, startDate, endDate, progress, priority, status } = req.body;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Validation Error: Task name is required.' });
    }
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ error: 'Validation Error: projectId is required.' });
    }
    if (startDate && isNaN(Date.parse(startDate))) {
        return res.status(400).json({ error: 'Validation Error: Invalid startDate format.' });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
        return res.status(400).json({ error: 'Validation Error: Invalid endDate format.' });
    }
    if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
        return res.status(400).json({ error: 'Validation Error: Progress must be a number between 0 and 100.' });
    }
    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'HOLD', 'INSPECTION', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Validation Error: Invalid task status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ error: `Validation Error: Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }
    next();
};
exports.validateTaskInput = validateTaskInput;
// Validate snag input
const validateSnagInput = (req, res, next) => {
    const { title, projectId, roomId, priority, status } = req.body;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Validation Error: Snag title is required.' });
    }
    if (!projectId || !roomId) {
        return res.status(400).json({ error: 'Validation Error: projectId and roomId are required.' });
    }
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Validation Error: Invalid snag status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ error: `Validation Error: Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }
    next();
};
exports.validateSnagInput = validateSnagInput;
