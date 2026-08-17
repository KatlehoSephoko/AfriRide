import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';
import driverRoutes from '../modules/drivers/driver.routes';
import rideRoutes from '../modules/rides/ride.routes';

const router = Router();

// Infrastructure Routes
router.use('/', healthRoutes); 

// V1 Modules
router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);

export default router;
