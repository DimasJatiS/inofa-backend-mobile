import { Router } from 'express';
import {
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  getAllProjects,
  getProjectById,
} from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/', authMiddleware, requireRole(['client']), createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);
router.get('/me', authMiddleware, getMyProjects);
router.get('/all', getAllProjects);
router.get('/:id', getProjectById);

export default router;
