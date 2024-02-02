const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const supportedFormats = ["png", "jpg", "jpeg", "gif", "webp"];

function convertImage(inputFile, outputFormat, outputDirectory) {
  const outputFile = path.join(
    outputDirectory,
    `${path.basename(inputFile, path.extname(inputFile))}.${outputFormat}`
  );

  const magickCommand = `convert "${inputFile}" "${outputFile}"`;

  const magickProcess = spawn("magick", magickCommand.split(" "));

  magickProcess.stdout.on("data", (data) => {
    console.log(`[ImageMagick] ${data}`);
  });

  magickProcess.stderr.on("data", (data) => {
    console.error(`[ImageMagick Error] ${data}`);
  });

  magickProcess.on("close", (code) => {
    if (code === 0) {
      console.log(
        `Image successfully converted to ${outputFormat} format and saved to ${outputFile}`
      );
    } else {
      console.error(`Error converting image: ${code}`);
    }
  });
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 3) {
    const inputFile = args[0];
    const outputFormat = args[1];
    const outputDirectory = path.resolve(args[2]);

    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file "${inputFile}" does not exist.`);
      return;
    }

    if (!supportedFormats.includes(outputFormat)) {
      console.error(`Error: Unsupported output format "${outputFormat}".`);
      return;
    }

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    convertImage(inputFile, outputFormat, outputDirectory);
  } else {
    console.log(
      "Usage: node image-converter.js <input_file> <output_format> <output_directory>"
    );
  }
}

main();
