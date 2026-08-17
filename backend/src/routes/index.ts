import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

// Infrastructure Routes
router.use('/', healthRoutes); 

// V1 Modules
router.use('/auth', authRoutes);

export default router;
