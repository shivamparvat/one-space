// MetaRouter.ts
import express from 'express';
import {fileMetadata} from '../controller/metadeta.Controller.js';

const MetaRouter = express.Router();


// Define the route to list all Metas
MetaRouter.get('/list', fileMetadata);

export default MetaRouter;
