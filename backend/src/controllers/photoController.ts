import { Response } from 'express';
import prisma from '../config/prisma';
import { supabase, BUCKET_NAME } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

export const uploadPhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, caption, base64Image } = req.body;
    const file = req.file;

    if (!taskId) {
      return res.status(400).json({ error: 'Missing required field: taskId' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const uploadedById = req.user?.id || (await prisma.user.findFirst())?.id;
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
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.warn('Supabase storage direct upload notice:', uploadError.message);
        // Fallback to data URI if bucket permissions require initialization
        publicUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      } else {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }
    } else if (base64Image) {
      // 2. Base64 payload upload
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const mimeType = matches[1];
        const base64FileName = `tasks/${taskId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(base64FileName, buffer, { contentType: mimeType, upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(base64FileName);
          publicUrl = urlData.publicUrl;
        } else {
          publicUrl = base64Image;
        }
      } else {
        publicUrl = base64Image;
      }
    } else {
      return res.status(400).json({ error: 'No image file or base64 data provided' });
    }

    // 3. Save Photo Record in PostgreSQL via Prisma
    const photo = await prisma.photo.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
};

export const getTaskPhotos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const photos = await prisma.photo.findMany({
      where: { taskId },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(photos);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve task photos' });
  }
};

export const deletePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Try deleting file from Supabase Storage if URL points to Supabase
    if (photo.url.includes('supabase.co')) {
      const urlParts = photo.url.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        const pathInBucket = urlParts[1];
        await supabase.storage.from(BUCKET_NAME).remove([pathInBucket]);
      }
    }

    // Delete record from PostgreSQL
    await prisma.photo.delete({ where: { id } });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete photo' });
  }
};

export const getAllPhotos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const photos = await prisma.photo.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve all photos' });
  }
};
