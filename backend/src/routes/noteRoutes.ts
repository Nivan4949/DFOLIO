import { Router } from 'express';
import multer from 'multer';
import { createNote, getTaskNotes, deleteNote } from '../controllers/noteController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/', authenticateJWT, upload.single('attachment'), createNote);
router.get('/task/:taskId', authenticateJWT, getTaskNotes);
router.delete('/:id', authenticateJWT, deleteNote);

export default router;
