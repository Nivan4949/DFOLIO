import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createCategory);
router.get('/', authenticateJWT, getCategories);
router.get('/:id', authenticateJWT, getCategoryById);
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER']), updateCategory);
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), deleteCategory);

export default router;
