import { Router } from 'express';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getUserProfile,
} from '../controllers/profile.controller';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { requireIntId } from '../middleware/id.middleware';

const router = Router();
router.param('userId', requireIntId);

router.post('/', authMiddleware, createProfile);
router.put('/', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getMyProfile);
router.get('/:userId', optionalAuth, getUserProfile);

export default router;
