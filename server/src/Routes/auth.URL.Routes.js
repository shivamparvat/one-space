// MetaRouter.ts
import express from "express";
import {
  GoogleAuthUrl,
  GoogleCallback,
  DropboxAuthUrl,
  DropboxCallback
} from "../controller/auth.URL.Controller.js";

const AuthUrlRouter = express.Router();

AuthUrlRouter.get("/google", GoogleAuthUrl);
AuthUrlRouter.get("/google/callback", GoogleCallback);

AuthUrlRouter.get("/dropbox", DropboxAuthUrl);
AuthUrlRouter.get("/dropbox/callback", DropboxCallback);

export default AuthUrlRouter;
