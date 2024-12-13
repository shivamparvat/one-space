import express from "express";
import { login, permission } from "../controller/user.Controller.js";
const router = express.Router();

router.get("/permission", permission);
router.post("/login", login);

export default router;
