import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller';
import { authRequired } from '../middlewares/auth';
import { requireRoles } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { idParamsSchema, supplierSchema, updateSupplierSchema } from './schemas';

const router = Router();

router.use(authRequired);

router.get('/', requireRoles('Owner', 'Pharmacist'), supplierController.listSuppliers);
router.post('/', requireRoles('Owner', 'Pharmacist'), validate(supplierSchema), supplierController.createSupplier);
router.put('/:id', requireRoles('Owner', 'Pharmacist'), validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', requireRoles('Owner', 'Pharmacist'), validate(idParamsSchema), supplierController.deleteSupplier);

export default router;
