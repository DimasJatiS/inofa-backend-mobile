import { Router } from 'express';
import { getWhatsappLink } from '../controllers/whatsapp.controller';

const router = Router();

router.get('/link', getWhatsappLink);

export default router;
