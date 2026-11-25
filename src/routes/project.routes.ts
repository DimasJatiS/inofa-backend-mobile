import { Router } from 'express';
import {
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  getAllProjects,
  getProjectById,
} from '../controllers/project.controller';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { requireIntId } from '../middleware/id.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.param('id', requireIntId);

router.post('/', authMiddleware, requireRole(['client']), createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);
router.get('/me', authMiddleware, getMyProjects);
router.get('/all', getAllProjects);
router.get('/:id', optionalAuth, getProjectById);

export default router;
