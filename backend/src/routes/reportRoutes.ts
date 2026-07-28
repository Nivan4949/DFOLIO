import { Router } from 'express';
import { getReportData } from '../controllers/reportController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/:type', authenticateJWT, getReportData);

export default router;
