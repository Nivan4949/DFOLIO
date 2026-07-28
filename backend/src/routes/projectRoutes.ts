import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getDashboardStats,
} from '../controllers/projectController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// Retrieve dashboard stats (must be placed before GET /:id route)
router.get('/stats', authenticateJWT, getDashboardStats);

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), createProject);
router.get('/', authenticateJWT, getProjects);
router.get('/:id', authenticateJWT, getProjectById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), updateProject);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN']), deleteProject);

export default router;
