import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), (req, res) => {
  const videoFile = req.file as any;
  const outputFile = `processed_${videoFile.filename}.mp4`;

  ffmpeg(videoFile.path)
    .outputOptions("-c:v libx264")
    .outputOptions("-preset slow")
    .outputOptions("-crf 22")
    .output(`uploads/${outputFile}`)
    .on("end", () => {
      // Video processing completed successfully
      // Store the video details in a database or file system
      // ...
      res.send("Video uploaded and processed successfully");
    })
    .on("error", (err) => {
      console.error("Error processing video:", err);
      res.status(500).send("Error processing video");
    })
    .run();
});

app.get("/video/:id", (req, res) => {
  const videoId = req.params.id;
  const videoPath = `uploads/${videoId}.mp4`;

  // Ensure the video file exists
  // ...

  const stream = ffmpeg(videoPath)
    .outputOptions("-movflags frag_keyframe+empty_moov")
    .outputOptions("-c:v copy")
    .outputOptions("-c:a aac")
    .outputOptions("-f mp4")
    .output(res)
    .on("error", (err) => {
      console.error("Error streaming video:", err);
      res.status(500).send("Error streaming video");
    });

  stream.run();
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
