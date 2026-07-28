import { Router } from 'express';
import {
  createSnag,
  getSnags,
  getSnagById,
  updateSnag,
  deleteSnag,
} from '../controllers/snagController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'CONTRACTOR']), createSnag);
router.get('/', authenticateJWT, getSnags);
router.get('/:id', authenticateJWT, getSnagById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'CONTRACTOR']), updateSnag);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), deleteSnag);

export default router;
