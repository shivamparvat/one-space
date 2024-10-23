// MetaRouter.ts
import express from "express";
import {
  GoogleAuthUrl,
  GoogleCallback
} from "../controller/auth.URL.Controller.js";

const AuthUrlRouter = express.Router();

AuthUrlRouter.get("/google", GoogleAuthUrl);
AuthUrlRouter.get("/google/callback", GoogleCallback);

export default AuthUrlRouter;
