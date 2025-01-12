import express from "express";
import cors from "cors";
import connectToDatabase from "../config/db.js";
import TokenRouter from "./Routes/token.routes.js";
import dotenv from "dotenv";
import MetaRouter from "./Routes/Meta.routes.js";
import AuthUrlRouter from "./Routes/auth.URL.Routes.js";
import webHooksRouter from "./Routes/webhook.routes.js";
import AIRouter from "./Routes/AI.routes.js";
import imageCache from "./utils/imageCache.js";
import userRouter from "./Routes/user.routes.js";
import orgRouter from "./Routes/org.routes.js";
import cron from "node-cron";
import { UpdateDriveData } from "./cron/UpdateDriveData.js";
import { getEmailsFromGmail } from "./helper/metaData/email.js";
import { UpdateEmailData } from "./cron/UpdatGmailData.js";
// import { registerDriveWatch } from './events/driveEvents.js';

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

connectToDatabase();

app.use(cors());
app.use(express.json());

app.get("/test", async (req, res) => {
  try {
    getEmailsFromGmail(
      {
        state: "GMAIL",
        access_token:
          "ya29.a0ARW5m77EwGdTRQ386L9xXYNUPfFyKZVEqFV9-7ELFyCG2eW7hN_UGzZmnMhqjSdaiGfyV1Qy5TfQfI-Biv2OpKn9LcaDMjh16G27hmLCe12BmqFxLzABhJJv-pOx0bAWNIDXM2lePBAMPnJbIV3DrLFGJXxvhg7Czl3XAkZdaCgYKAcgSARASFQHGX2MiCTEmFNgTV18C2QHmj73olQ0175",
        refresh_token:
          "1//0gGdenSVm_KblCgYIARAAGBASNwF-L9Ir_4NfvlHX8KyvVfnn5HXFe6Gq9lnEDfWvKHyt7L2792R83QjHJFTj9iz3-GTVyX5pjn0",
        scope: "https://www.googleapis.com/auth/gmail.readonly",
        token_type: "Bearer",
        expiry_date: 1736015918326
      },
      "6763ac19f22093299d3d834e",
      "6763ac39f22093299d3d838e"
    );
    res.send("success....");
  } catch (error) {
    console.log(error);
    res.send("error....");
  }
});
app.get("/", (req, res) => {
  res.send("working....");
});
app.use("/api/v1/auth/url", AuthUrlRouter);
app.use("/api/v1/token", TokenRouter);
app.use("/api/v1/file", MetaRouter);
app.use("/api/v1/webhook", webHooksRouter);
app.use("/api/v1/org", orgRouter);
app.use("/api/v1/ai", AIRouter);
app.use("/api/v1/user", userRouter);

cron.schedule("*/5 * * * *", () => {
  UpdateDriveData();
  UpdateEmailData();
  console.log("cron End")
});
// app.use('/api', googleDriveRoutes);

// app.use("/api/v1/watch/watch", registerDriveWatch)

app.get("/proxy-image", imageCache);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
