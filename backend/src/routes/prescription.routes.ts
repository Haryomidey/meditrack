import { Router } from 'express';
import * as prescriptionController from '../controllers/prescription.controller';
import { authRequired } from '../middlewares/auth';
import { requireRoles } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createPrescriptionSchema, idParamsSchema, updatePrescriptionSchema } from './schemas';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authRequired);

router.get('/', requireRoles('Owner', 'Pharmacist', 'SalesStaff'), prescriptionController.listPrescriptions);
router.post('/', requireRoles('Owner', 'Pharmacist'), upload.single('image'), validate(createPrescriptionSchema), prescriptionController.createPrescription);
router.put('/:id', requireRoles('Owner', 'Pharmacist'), upload.single('image'), validate(updatePrescriptionSchema), prescriptionController.updatePrescription);
router.delete('/:id', requireRoles('Owner', 'Pharmacist'), validate(idParamsSchema), prescriptionController.deletePrescription);

export default router;
