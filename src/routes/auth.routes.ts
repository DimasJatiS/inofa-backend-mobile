import { Router } from 'express';
import { register, login, getMe, getStatus, setRole } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/status', getStatus);
router.post('/set-role', authMiddleware, setRole);
router.get('/me', authMiddleware, getMe);

export default router;
