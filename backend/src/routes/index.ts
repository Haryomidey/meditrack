import { Router } from 'express';
import authRoutes from './auth.routes';
import drugRoutes from './drug.routes';
import saleRoutes from './sale.routes';
import prescriptionRoutes from './prescription.routes';
import supplierRoutes from './supplier.routes';
import reportRoutes from './report.routes';
import syncRoutes from './sync.routes';
import auditRoutes from './audit.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'meditrack-backend' });
});

router.use('/auth', authRoutes);
router.use('/drugs', drugRoutes);
router.use('/sales', saleRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/reports', reportRoutes);
router.use('/sync', syncRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
