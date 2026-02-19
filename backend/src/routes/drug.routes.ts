import { Router } from 'express';
import * as drugController from '../controllers/drug.controller';
import { authRequired } from '../middlewares/auth';
import { requireRoles } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createDrugSchema, idParamsSchema, updateDrugSchema } from './schemas';

const router = Router();

router.use(authRequired);

router.get('/', requireRoles('Owner', 'Pharmacist', 'SalesStaff'), drugController.listDrugs);
router.post('/', requireRoles('Owner', 'Pharmacist'), validate(createDrugSchema), drugController.createDrug);
router.put('/:id', requireRoles('Owner', 'Pharmacist'), validate(updateDrugSchema), drugController.updateDrug);
router.delete('/:id', requireRoles('Owner', 'Pharmacist'), validate(idParamsSchema), drugController.deleteDrug);

export default router;