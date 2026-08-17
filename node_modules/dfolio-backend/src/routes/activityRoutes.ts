import { Router } from 'express';
import { getActivityLogs } from '../controllers/activityController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/', getActivityLogs);

export default router;
