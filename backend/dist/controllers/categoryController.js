"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Missing required field: name' });
        }
        const trimmedName = name.trim();
        const existing = await prisma_1.default.category.findUnique({
            where: { name: trimmedName },
        });
        if (existing) {
            return res.status(400).json({ error: `Category '${trimmedName}' already exists.` });
        }
        const category = await prisma_1.default.category.create({
            data: { name: trimmedName },
            include: {
                _count: { select: { subWorks: true } },
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            include: {
                subWorks: { select: { id: true, name: true } },
                _count: { select: { subWorks: true } },
            },
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve categories' });
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma_1.default.category.findUnique({
            where: { id },
            include: {
                subWorks: { orderBy: { name: 'asc' } },
            },
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve category details' });
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Category name cannot be empty' });
        }
        const trimmedName = name.trim();
        const existing = await prisma_1.default.category.findFirst({
            where: {
                name: trimmedName,
                NOT: { id },
            },
        });
        if (existing) {
            return res.status(400).json({ error: `Another category named '${trimmedName}' already exists.` });
        }
        const category = await prisma_1.default.category.update({
            where: { id },
            data: { name: trimmedName },
            include: {
                _count: { select: { subWorks: true } },
            },
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update category' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.category.delete({ where: { id } });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete category' });
    }
};
exports.deleteCategory = deleteCategory;
