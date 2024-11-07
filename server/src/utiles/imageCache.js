import axios from 'axios'

export default imageCache = async (req, res) => {
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
  }