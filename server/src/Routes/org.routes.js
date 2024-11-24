// TokenRouter.ts
import express from 'express';
import {add} from '../controller/org.Controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const orgRouter = express.Router();

// Define the route to store the org
orgRouter.post('/add',authMiddleware, add);



export default orgRouter;
