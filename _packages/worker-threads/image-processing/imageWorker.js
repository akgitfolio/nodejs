const sharp = require("sharp");
const { parentPort } = require("worker_threads");

parentPort.on("message", async (workerData) => {
  const { imageData } = workerData;

  // Process the image using sharp
  const processedImage = await sharp(imageData)
    .resize(256, 256)
    .grayscale()
    .toBuffer();

  // Send processed image data back to the main thread
  parentPort.postMessage(processedImage);
});
