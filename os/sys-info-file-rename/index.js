const os = require("os");
const fs = require("fs");
const path = require("path");

const filePath = process.argv[2]; // Get file path from command line argument

if (!filePath) {
  console.error("Please provide a file path as an argument.");
  process.exit(1);
}

try {
  const originalName = path.basename(filePath);
  const extension = path.extname(filePath);
  const hostname = os.hostname();
  const arch = os.arch();
  const platform = os.platform();
  const uptime = os.uptime();

  const newFileName = `${hostname}-${arch}-${platform}-${uptime}${extension}`;
  const newFilePath = path.join(path.dirname(filePath), newFileName);

  fs.rename(filePath, newFilePath, (err) => {
    if (err) {
      console.error("Error renaming file:", err);
    } else {
      console.log(`File renamed to: ${newFileName}`);
    }
  });
} catch (error) {
  console.error("An error occurred:", error);
}
