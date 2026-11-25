import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware';
import { requireIntId } from '../middleware/id.middleware';
import { getAllDevelopers, getDeveloperById } from '../controllers/developer.controller';

const router = Router();
router.param('id', requireIntId);
router.use(optionalAuth);

// Alias for clients that call /developer/all
router.get('/all', getAllDevelopers);
router.get('/', getAllDevelopers);
router.get('/:id', getDeveloperById);

export default router;
