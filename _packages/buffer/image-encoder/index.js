const fs = require("fs");
const path = require("path");

function encodeMessage(imagePath, message) {
  // Validate input
  if (!fs.existsSync(imagePath)) throw new Error("Image file does not exist.");
  if (message.length > 512)
    throw new Error("Message too long (max 512 characters).");

  // Read image data
  const buffer = fs.readFileSync(imagePath);

  // Identify image format
  const format = path.extname(imagePath).toLowerCase().slice(1);
  if (!["png", "jpeg"].includes(format))
    throw new Error("Unsupported image format.");

  // Convert message to binary string
  const messageBits = message
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");

  // Embed message in LSBs
  let bitIndex = 0;
  for (let i = 0; i < buffer.length; i++) {
    if (bitIndex >= messageBits.length) break;

    // Modify LSB of each color channel
    for (let channel = 0; channel < 3; channel++) {
      if (bitIndex >= messageBits.length) break;

      const value = buffer[i + channel];
      const mask = ~(1 << (channel * 8 + 7)); // Create mask to isolate LSB
      const newLSB = parseInt(messageBits[bitIndex]) << (channel * 8 + 7);
      buffer[i + channel] = (value & mask) | newLSB;
      bitIndex++;
    }
  }

  // Save modified image
  const outputPath = path.join(
    path.dirname(imagePath),
    `hidden-${path.basename(imagePath)}`
  );
  fs.writeFileSync(outputPath, buffer, { encoding: null });

  console.log(`Message successfully encoded in "${outputPath}".`);
}

// Usage example
const imagePath = "path/to/image.png";
const message = "This is a secret message.";

encodeMessage(imagePath, message);
