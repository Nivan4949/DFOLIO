"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPhotos = exports.deletePhoto = exports.getTaskPhotos = exports.uploadPhoto = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const supabase_1 = require("../config/supabase");
const uploadPhoto = async (req, res) => {
    try {
        const { taskId, caption, base64Image } = req.body;
        const file = req.file;
        if (!taskId) {
            return res.status(400).json({ error: 'Missing required field: taskId' });
        }
        const task = await prisma_1.default.task.findUnique({ where: { id: taskId } });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const uploadedById = req.user?.id || (await prisma_1.default.user.findFirst())?.id;
        if (!uploadedById) {
            return res.status(400).json({ error: 'User missing' });
        }
        let publicUrl = '';
        const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (file) {
            if (!allowedImageMimes.includes(file.mimetype)) {
                return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.' });
            }
            const rawExt = file.originalname.split('.').pop()?.toLowerCase();
            const fileExtension = rawExt && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg';
            const fileName = `tasks/${taskId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
            // 1. Upload Multer Memory Buffer to Supabase Storage
            const { data, error: uploadError } = await supabase_1.supabase.storage
                .from(supabase_1.BUCKET_NAME)
                .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });
            if (uploadError) {
                console.warn('Supabase storage direct upload notice:', uploadError.message);
                // Fallback to data URI if bucket permissions require initialization
                publicUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            }
            else {
                const { data: urlData } = supabase_1.supabase.storage.from(supabase_1.BUCKET_NAME).getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
            }
        }
        else if (base64Image) {
            // 2. Base64 payload upload
            const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const buffer = Buffer.from(matches[2], 'base64');
                const mimeType = matches[1];
                const base64FileName = `tasks/${taskId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const { error: uploadError } = await supabase_1.supabase.storage
                    .from(supabase_1.BUCKET_NAME)
                    .upload(base64FileName, buffer, { contentType: mimeType, upsert: true });
                if (!uploadError) {
                    const { data: urlData } = supabase_1.supabase.storage.from(supabase_1.BUCKET_NAME).getPublicUrl(base64FileName);
                    publicUrl = urlData.publicUrl;
                }
                else {
                    publicUrl = base64Image;
                }
            }
            else {
                publicUrl = base64Image;
            }
        }
        else {
            return res.status(400).json({ error: 'No image file or base64 data provided' });
        }
        // 3. Save Photo Record in PostgreSQL via Prisma
        const photo = await prisma_1.default.photo.create({
            data: {
                url: publicUrl,
                caption: caption || null,
                taskId,
                uploadedById,
            },
            include: {
                uploadedBy: { select: { id: true, name: true } },
            },
        });
        res.status(201).json(photo);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to upload photo' });
    }
};
exports.uploadPhoto = uploadPhoto;
const getTaskPhotos = async (req, res) => {
    try {
        const { taskId } = req.params;
        const photos = await prisma_1.default.photo.findMany({
            where: { taskId },
            include: {
                uploadedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(photos);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve task photos' });
    }
};
exports.getTaskPhotos = getTaskPhotos;
const deletePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const photo = await prisma_1.default.photo.findUnique({ where: { id } });
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        // Try deleting file from Supabase Storage if URL points to Supabase
        if (photo.url.includes('supabase.co')) {
            const urlParts = photo.url.split(`${supabase_1.BUCKET_NAME}/`);
            if (urlParts.length > 1) {
                const pathInBucket = urlParts[1];
                await supabase_1.supabase.storage.from(supabase_1.BUCKET_NAME).remove([pathInBucket]);
            }
        }
        // Delete record from PostgreSQL
        await prisma_1.default.photo.delete({ where: { id } });
        res.json({ message: 'Photo deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete photo' });
    }
};
exports.deletePhoto = deletePhoto;
const getAllPhotos = async (req, res) => {
    try {
        const photos = await prisma_1.default.photo.findMany({
            include: {
                uploadedBy: { select: { id: true, name: true } },
                task: {
                    select: {
                        name: true,
                        room: { select: { name: true, floor: { select: { name: true } } } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(photos);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve all photos' });
    }
};
exports.getAllPhotos = getAllPhotos;
