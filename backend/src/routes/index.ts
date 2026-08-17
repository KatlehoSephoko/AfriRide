import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';

const router = Router();

// Infrastructure Routes
router.use('/', healthRoutes); // Binds to /api/v1/health and /api/v1/ready via app.ts

// V1 Modules (To be added in subsequent phases)
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/rides', rideRoutes);

export default router;
