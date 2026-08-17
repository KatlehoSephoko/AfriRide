import { Router } from 'express';
import { checkHealth, checkReadiness } from './health.controller';

const router = Router();

router.get('/health', checkHealth);
router.get('/ready', checkReadiness);

export default router;
