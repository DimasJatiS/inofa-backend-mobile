import { Router } from 'express';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getUserProfile,
} from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createProfile);
router.put('/', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getMyProfile);
router.get('/:userId', getUserProfile);

export default router;
