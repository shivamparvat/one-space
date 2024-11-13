import express from 'express';
import cors from 'cors';
import connectToDatabase from "../config/db.js";
import TokenRouter from './Routes/token.routes.js';
import dotenv from 'dotenv';
import MetaRouter from './Routes/Meta.routes.js';
import AuthUrlRouter from './Routes/auth.URL.Routes.js';
import webHooksRouter from './Routes/webhook.routes.js';
import AIRouter from './Routes/AI.routes.js';
import imageCache from './utiles/imageCache.js';
// import { registerDriveWatch } from './events/driveEvents.js';

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();


connectToDatabase()
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
  res.send("working....")
})
app.use("/api/v1/auth/url", AuthUrlRouter)
app.use("/api/v1/token", TokenRouter)
app.use("/api/v1/file", MetaRouter)
app.use("/api/v1/webhook", webHooksRouter);
app.use("/api/v1/ai", AIRouter)


// app.use('/api', googleDriveRoutes);

// app.use("/api/v1/watch/watch", registerDriveWatch)

app.get("/proxy-image", imageCache);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
