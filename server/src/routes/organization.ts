import { Router } from 'express';
import { createOrganization } from '../controllers/organizationController';
import { authenticate } from '../middlewares/auth';
import { inviteMember } from '../controllers/inviteMemberController';
import { requireRole } from '../middlewares/requireRole';
const router = Router();

router.post('/', authenticate, createOrganization);
router.post('/:organizationId/invitations', authenticate, requireRole(['OWNER']), inviteMember);

export default router;