import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getUsers);
router.post('/', authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), createUser);
router.put('/:id', authorizeRoles(['ADMIN', 'PROJECT_MANAGER']), updateUser);
router.delete('/:id', authorizeRoles(['ADMIN']), deleteUser);

export default router;
