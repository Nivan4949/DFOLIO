import { Response } from 'express';
import prisma from '../config/prisma';
import { supabase, BUCKET_NAME } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, snagId, content } = req.body;
    const file = req.file;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Missing required field: content' });
    }

    if (!taskId && !snagId) {
      return res.status(400).json({ error: 'Note must be linked to either taskId or snagId' });
    }

    const createdById = req.user?.id || (await prisma.user.findFirst())?.id;
    if (!createdById) {
      return res.status(400).json({ error: 'User missing' });
    }

    let attachmentUrl: string | null = null;

    if (file) {
      const rawExt = file.originalname.split('.').pop()?.toLowerCase();
      const forbiddenExts = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'jar', 'vbs', 'scr', 'msi'];
      if (rawExt && forbiddenExts.includes(rawExt)) {
        return res.status(400).json({ error: 'Executable and script file attachments are forbidden for security.' });
      }
      const fileExtension = rawExt && /^[a-z0-9]+$/.test(rawExt) ? rawExt : 'bin';
      const fileName = `notes/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.warn('Supabase storage upload notice:', uploadError.message);
        attachmentUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      } else {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        attachmentUrl = urlData.publicUrl;
      }
    }

    const note = await prisma.note.create({
      data: {
        content: content.trim(),
        attachmentUrl,
        taskId: taskId || null,
        snagId: snagId || null,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create note' });
  }
};

export const getTaskNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const notes = await prisma.note.findMany({
      where: { taskId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve notes' });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.attachmentUrl && note.attachmentUrl.includes('supabase.co')) {
      const urlParts = note.attachmentUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        await supabase.storage.from(BUCKET_NAME).remove([urlParts[1]]);
      }
    }

    await prisma.note.delete({ where: { id } });

    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete note' });
  }
};
