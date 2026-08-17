"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLogs = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getActivityLogs = async (req, res) => {
    try {
        const { projectId, limit } = req.query;
        const take = limit ? parseInt(limit, 10) : 30;
        const where = {};
        if (projectId && typeof projectId === 'string') {
            where.projectId = projectId;
        }
        const logs = await prisma_1.default.activityLog.findMany({
            where,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        email: true,
                    },
                },
            },
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};
exports.getActivityLogs = getActivityLogs;
