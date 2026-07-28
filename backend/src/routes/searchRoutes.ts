import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, globalSearch);

export default router;
