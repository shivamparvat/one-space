// TokenRouter.ts
import express from 'express';
import {connect,disconnect, listTokens} from '../controller/token.Controller.js';

const TokenRouter = express.Router();

// Define the route to store the token
TokenRouter.post('/store', connect);

// Define the route to disconnect and delete the token
TokenRouter.delete('/disconnect/:id', disconnect); // Make sure to add a slash before id

// Define the route to list all tokens
TokenRouter.get('/list', listTokens);

export default TokenRouter;
