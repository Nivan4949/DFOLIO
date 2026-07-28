import { Router } from 'express';
import { register, login, getProfile, getUsers } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateJWT, getProfile);
router.get('/users', authenticateJWT, getUsers);

export default router;
