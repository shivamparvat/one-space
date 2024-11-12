import express from "express";
import { Embedding } from "../controller/AI.Controller.js";

const AIRouter = express.Router();

// Define the route to list all Metas
AIRouter.get("/embedding", Embedding);

export default AIRouter;
