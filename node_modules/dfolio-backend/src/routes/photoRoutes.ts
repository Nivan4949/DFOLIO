import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto, getTaskPhotos, getAllPhotos, deletePhoto } from '../controllers/photoController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.get('/', authenticateJWT, getAllPhotos);
router.post('/upload', authenticateJWT, upload.single('photo'), uploadPhoto);
router.get('/task/:taskId', authenticateJWT, getTaskPhotos);
router.delete('/:id', authenticateJWT, deletePhoto);

export default router;
