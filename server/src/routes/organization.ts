import { Router } from 'express';
import { createOrganization, getOrganization } from '../controllers/organizationController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/requireRole';
import { inviteMember, cancelInvitation, listInvitations } from '../controllers/invitationController';
const router = Router();

router.get('/', authenticate, getOrganization);
router.post('/', authenticate, createOrganization);
router.post('/:organizationId/invitations', authenticate, requireRole(['OWNER']), inviteMember);
router.get('/:organizationId/invitations', authenticate, requireRole(['OWNER']), listInvitations);
router.post('/:organizationId/invitations/:invitationId/cancel', authenticate, requireRole(['OWNER']), cancelInvitation);

export default router;