import { Router } from 'express';
import { createOrganization } from '../controllers/organizationController';
import { authenticate } from '../middlewares/auth';
const router = Router();

router.post('/', authenticate, createOrganization);

export default router;