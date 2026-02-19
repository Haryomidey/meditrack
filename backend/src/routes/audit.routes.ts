import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller';
import { authRequired } from '../middlewares/auth';
import { requireRoles } from '../middlewares/rbac';

const router = Router();

router.use(authRequired, requireRoles('Owner'));
router.get('/', listAuditLogs);

export default router;
