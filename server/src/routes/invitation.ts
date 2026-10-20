import { Router } from "express";
import { acceptInvitation, getInvitation } from "../controllers/invitationController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/:token", authenticate, getInvitation);
router.post("/:token/accept", authenticate, acceptInvitation);

export default router;