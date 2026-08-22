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

// Retrieve dashboard stats (support both /stats and /dashboard/stats)
router.get('/stats', authenticateJWT, getDashboardStats);
router.get('/dashboard/stats', authenticateJWT, getDashboardStats);

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), createProject);
router.get('/', authenticateJWT, getProjects);
router.get('/:id', authenticateJWT, getProjectById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), updateProject);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN']), deleteProject);

export default router;
