const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });
const publicImagesDir = path.join(__dirname, "public", "images");

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;
  const outputFilePath = path.join(publicImagesDir, req.file.filename + ".jpg");

  try {
    await sharp(filePath)
      .resize(800, 600)
      .jpeg({ quality: 80 })
      .toFile(outputFilePath);
    res.json({ url: `/images/${req.file.filename}.jpg` });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.get("/images/:filename", async (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(publicImagesDir, filename);

  try {
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send("Image not found");
    }
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).send("Internal server error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
