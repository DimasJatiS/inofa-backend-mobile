import { Router } from 'express';
import { getAllDevelopers, getDeveloperById } from '../controllers/developer.controller';

const router = Router();

// Alias for clients that call /developer/all
router.get('/all', getAllDevelopers);
router.get('/', getAllDevelopers);
router.get('/:id', getDeveloperById);

export default router;
