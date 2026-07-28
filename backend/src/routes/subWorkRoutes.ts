import { Router } from 'express';
import {
  createSubWork,
  getSubWorks,
  getSubWorkById,
  updateSubWork,
  deleteSubWork,
} from '../controllers/subWorkController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createSubWork);
router.get('/', authenticateJWT, getSubWorks);
router.get('/:id', authenticateJWT, getSubWorkById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), updateSubWork);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), deleteSubWork);

export default router;
