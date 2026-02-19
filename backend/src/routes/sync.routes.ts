import { Router } from 'express';
import * as syncController from '../controllers/sync.controller';
import { authRequired } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { syncSchema } from './schemas';

const router = Router();

router.use(authRequired);

router.post('/queue', validate(syncSchema), syncController.syncQueue);

export default router;
