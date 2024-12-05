// MetaRouter.ts
import express from 'express';
import {fileMetadata} from '../controller/metadeta.Controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const MetaRouter = express.Router();


// Define the route to list all Metas
MetaRouter.post('/list',authMiddleware, fileMetadata);

export default MetaRouter;
