import { Router } from 'express';
import * as saleController from '../controllers/sale.controller';
import { authRequired } from '../middlewares/auth';
import { requireRoles } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createSaleSchema, patchSaleSchema } from './schemas';

const router = Router();

router.use(authRequired);

router.get('/', requireRoles('Owner', 'Pharmacist', 'SalesStaff'), saleController.listSales);
router.post('/', requireRoles('Owner', 'Pharmacist', 'SalesStaff'), validate(createSaleSchema), saleController.createSale);
router.patch('/:id', requireRoles('Owner', 'Pharmacist'), validate(patchSaleSchema), saleController.patchSale);

export default router;
