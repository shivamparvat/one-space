import express from "express";
import { login, permission, updatedUser } from "../controller/user.Controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/permission",authMiddleware, permission);
router.get("/updated",authMiddleware, updatedUser);
router.post("/login", login);

export default router;
