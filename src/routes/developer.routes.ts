import { Router } from 'express';
import { getAllDevelopers, getDeveloperById } from '../controllers/developer.controller';

const router = Router();

router.get('/', getAllDevelopers);
router.get('/:id', getDeveloperById);

export default router;
