import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authRequired } from '../middlewares/auth';
import { requireRoles } from '../middlewares/rbac';

const router = Router();

router.use(authRequired, requireRoles('Owner', 'Pharmacist'));

router.get('/daily', reportController.getDailyReport);
router.get('/weekly', reportController.getWeeklyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/low-stock', reportController.getLowStockReport);
router.get('/expiring', reportController.getExpiringReport);

export default router;
