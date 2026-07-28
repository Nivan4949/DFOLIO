"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubWork = exports.updateSubWork = exports.getSubWorkById = exports.getSubWorks = exports.createSubWork = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createSubWork = async (req, res) => {
    try {
        const { categoryId, name } = req.body;
        if (!categoryId || !name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Missing required fields: categoryId, name' });
        }
        const trimmedName = name.trim();
        const category = await prisma_1.default.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ error: 'Parent Category not found' });
        }
        const subWork = await prisma_1.default.subWork.create({
            data: {
                categoryId,
                name: trimmedName,
            },
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { tasks: true } },
            },
        });
        res.status(201).json(subWork);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create sub work' });
    }
};
exports.createSubWork = createSubWork;
const getSubWorks = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const subWorks = await prisma_1.default.subWork.findMany({
            where: categoryId ? { categoryId: String(categoryId) } : undefined,
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { tasks: true } },
            },
            orderBy: { name: 'asc' },
        });
        res.json(subWorks);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve sub works' });
    }
};
exports.getSubWorks = getSubWorks;
const getSubWorkById = async (req, res) => {
    try {
        const { id } = req.params;
        const subWork = await prisma_1.default.subWork.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true } },
                tasks: true,
            },
        });
        if (!subWork) {
            return res.status(404).json({ error: 'Sub Work not found' });
        }
        res.json(subWork);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve sub work details' });
    }
};
exports.getSubWorkById = getSubWorkById;
const updateSubWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryId, name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Sub Work name cannot be empty' });
        }
        const trimmedName = name.trim();
        if (categoryId) {
            const category = await prisma_1.default.category.findUnique({ where: { id: categoryId } });
            if (!category) {
                return res.status(404).json({ error: 'Target parent category not found' });
            }
        }
        const subWork = await prisma_1.default.subWork.update({
            where: { id },
            data: {
                name: trimmedName,
                categoryId: categoryId || undefined,
            },
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { tasks: true } },
            },
        });
        res.json(subWork);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update sub work' });
    }
};
exports.updateSubWork = updateSubWork;
const deleteSubWork = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.subWork.delete({ where: { id } });
        res.json({ message: 'Sub Work deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete sub work' });
    }
};
exports.deleteSubWork = deleteSubWork;
