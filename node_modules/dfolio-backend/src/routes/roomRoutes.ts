import { Router } from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createRoom);
router.get('/', authenticateJWT, getRooms);
router.get('/:id', authenticateJWT, getRoomById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), updateRoom);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), deleteRoom);

export default router;
