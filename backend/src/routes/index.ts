import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';
import driverRoutes from '../modules/drivers/driver.routes';
import rideRoutes from '../modules/rides/ride.routes';
import communicationRoutes from '../modules/communication/communication.routes';
import tripsRoutes from '../modules/trips/trips.routes';
import safetyRoutes from '../modules/safety/safety.routes';
import financeRoutes from '../modules/finance/finance.routes'; // <-- Import

const router = Router();

// Infrastructure Routes
router.use('/', healthRoutes); 

// V1 Modules
router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/communication', communicationRoutes);
router.use('/trips', tripsRoutes);
router.use('/safety', safetyRoutes);
router.use('/finance', financeRoutes); // <-- Mount

export default router;
