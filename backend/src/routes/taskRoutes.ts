import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createTask);
router.get('/', authenticateJWT, getTasks);
router.get('/:id', authenticateJWT, getTaskById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'CONTRACTOR']), updateTask);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), deleteTask);

export default router;
