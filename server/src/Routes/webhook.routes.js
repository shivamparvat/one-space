import express from "express";
import { driveWebhook } from "../controller/webhooks.Controller.js";

const webHooksRouter = express.Router();

// Define the route to list all Metas
webHooksRouter.get("/drive", driveWebhook);

export default webHooksRouter;
