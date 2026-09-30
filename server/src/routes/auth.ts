import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, (req, res) => {
  // Handle project creation logic here
  res.status(201).json({ userId: req.userId });
});
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;