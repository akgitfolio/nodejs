const { Worker, isMainThread } = require("worker_threads");
const express = require("express");
const sharp = require("sharp");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);

const workerPath = require.resolve("./imageWorker.js");

app.post("/process-image", async (req, res) => {
  try {
    // Receive image data from client
    const imageData = req.body.image;

    // Create a worker thread to process the image
    const worker = new Worker(workerPath, { workerData: { imageData } });

    // Listen for processed image data from the worker
    worker.on("message", (processedImageData) => {
      // Send processed image data to the client
      io.emit("image-processed", processedImageData);
    });

    // Send a confirmation message to the client
    res.json({ message: "Image processing started" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image processing failed" });
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
