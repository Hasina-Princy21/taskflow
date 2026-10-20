import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { createProject } from "../controllers/projectController";
const router = Router();

router.get("/", authenticate, createProject);

export default router;