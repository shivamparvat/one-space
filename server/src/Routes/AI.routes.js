import express from "express";
import { Embedding,AIsearch } from "../controller/AI.Controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const AIRouter = express.Router();

// Define the route to list all Metas
AIRouter.get("/embedding", Embedding);
AIRouter.get("/search",authMiddleware, AIsearch);

export default AIRouter;
