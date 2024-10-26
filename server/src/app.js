import express from 'express';
import cors from 'cors';
import connectToDatabase from "../config/db.js";
import TokenRouter from './Routes/token.routes.js';
import dotenv from 'dotenv';
import MetaRouter from './Routes/Meta.routes.js';
import AuthUrlRouter from './Routes/auth.URL.Routes.js';
import axios from 'axios'

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
// app.use('/api', googleDriveRoutes);


app.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache the image for a year

    res.send(response.data);
  } catch (error) {
    console.error("Error fetching image from Google:", error.message);
    res.status(500).send("Failed to fetch image");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
