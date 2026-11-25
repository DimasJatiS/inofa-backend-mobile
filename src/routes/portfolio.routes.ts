import { Router } from 'express';
import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getMyPortfolios,
  getUserPortfolios,
  getPortfolioById,
} from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireIntId } from '../middleware/id.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.param('id', requireIntId);
router.param('userId', requireIntId);

router.post('/', authMiddleware, requireRole(['developer']), createPortfolio);
router.put('/:id', authMiddleware, requireRole(['developer']), updatePortfolio);
router.delete('/:id', authMiddleware, requireRole(['developer']), deletePortfolio);
router.get('/me', authMiddleware, getMyPortfolios);
router.get('/user/:userId', getUserPortfolios);
router.get('/:id', getPortfolioById);

export default router;
