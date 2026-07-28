import { Router } from 'express';
import {
  createFloor,
  getFloors,
  getFloorById,
  updateFloor,
  deleteFloor,
} from '../controllers/floorController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createFloor);
router.get('/', authenticateJWT, getFloors);
router.get('/:id', authenticateJWT, getFloorById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), updateFloor);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), deleteFloor);

export default router;
