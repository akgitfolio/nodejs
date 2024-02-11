const { Command } = require("commander");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const exifParser = require("exif-parser");
const terminalImage = require("terminal-image");
const { exec } = require("child_process");
const AWS = require("aws-sdk");
const { Storage } = require("@google-cloud/storage");
const { BlobServiceClient } = require("@azure/storage-blob");

const program = new Command();

program
  .command("organize")
  .description("Organizes images into folders based on creation date or tags")
  .requiredOption("-s, --source <source>", "Source directory containing images")
  .option(
    "-d, --destination <destination>",
    "Target directory for organized images",
    "./organized"
  )
  .requiredOption("-b, --by <by>", "Organize by date or tag", /^(date|tag)$/i)
  .option("-t, --tag <tag>", "Specific tag to organize by")
  .action(async (options) => {
    try {
      await organizeImages(
        options.source,
        options.destination,
        options.by,
        options.tag
      );
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command("search")
  .description("Search for images by name or tags")
  .requiredOption("-q, --query <query>", "Search query")
  .option("-s, --source <source>", "Source directory to search", "./organized")
  .action(async (options) => {
    try {
      const results = await searchImages(options.query, options.source);
      console.log(results);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command("view")
  .description("View image thumbnails in the terminal")
  .requiredOption("-p, --path <path>", "Path to image file")
  .action(async (options) => {
    try {
      await viewImage(options.path);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command("edit")
  .description("Apply filters and adjustments to images")
  .requiredOption("-p, --path <path>", "Path to image file")
  .requiredOption(
    "-f, --filter <filter>",
    "Image filter to apply",
    /^(grayscale|contrast|brightness)$/i
  )
  .option("-v, --value <value>", "Filter value", parseFloat)
  .action(async (options) => {
    try {
      await editImage(options.path, options.filter, options.value);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command("slideshow")
  .description("Create a slideshow of images")
  .requiredOption("-s, --source <source>", "Source directory containing images")
  .option(
    "-i, --interval <interval>",
    "Slideshow interval in milliseconds",
    3000
  )
  .action(async (options) => {
    try {
      await createSlideshow(options.source, options.interval);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command("upload")
  .description("Upload images to cloud storage (optional)")
  .requiredOption("-p, --path <path>", "Path to image file")
  .requiredOption(
    "--provider <provider>",
    "Cloud storage provider",
    /^(aws|azure|gcp)$/i
  )
  .requiredOption("--credentials <credentials>", "Cloud storage credentials")
  .action(async (options) => {
    try {
      await uploadImage(options.path, options.provider, options.credentials);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program.parse(process.argv);

async function organizeImages(source, destination, by, tag) {
  ensureDirectory(destination);
  const files = fs.readdirSync(source);

  for (const file of files) {
    const filePath = path.join(source, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file)) {
      let targetDir;
      if (by === "date") {
        targetDir = createDirectoryByDate(destination, file);
      } else if (by === "tag" && tag) {
        targetDir = path.join(destination, tag);
      } else {
        continue;
      }

      ensureDirectory(targetDir);
      const targetPath = path.join(targetDir, file);
      fs.renameSync(filePath, targetPath);
    }
  }
}

function createDirectoryByDate(destination, file) {
  const filePath = path.join(destination, file);
  const buffer = fs.readFileSync(filePath);
  const parser = exifParser.create(buffer);
  const result = parser.parse();
  const date = result.tags.DateTimeOriginal || fs.statSync(filePath).birthtime;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return path.join(
    destination,
    `${year}`,
    `${month}`,
    `${year}_${month}_${day}`
  );
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function searchImages(query, source) {
  const results = [];
  searchImagesRecursive(query, source, results);
  return results;
}

function searchImagesRecursive(query, source, results) {
  const files = fs.readdirSync(source);

  for (const file of files) {
    const filePath = path.join(source, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && file.includes(query)) {
      results.push(filePath);
    } else if (stats.isDirectory()) {
      searchImagesRecursive(query, filePath, results);
    }
  }
}

async function viewImage(imagePath) {
  const image = await terminalImage.file(imagePath);
  console.log(image);
}

async function editImage(imagePath, filter, value) {
  let image = sharp(imagePath);

  switch (filter) {
    case "grayscale":
      image = image.grayscale();
      break;
    case "contrast":
      image = image.modulate({ contrast: value });
      break;
    case "brightness":
      image = image.modulate({ brightness: value });
      break;
    default:
      throw new Error("Unsupported filter");
  }

  await image.toFile(imagePath);
}

async function createSlideshow(source, interval) {
  const files = fs
    .readdirSync(source)
    .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
  const filePaths = files.map((file) => path.join(source, file));

  let index = 0;
  setInterval(() => {
    exec(`open ${filePaths[index]}`);
    index = (index + 1) % filePaths.length;
  }, interval);
}

async function uploadImage(imagePath, provider, credentials) {
  const fileName = path.basename(imagePath);
  const fileContent = fs.readFileSync(imagePath);

  switch (provider) {
    case "aws":
      const s3 = new AWS.S3(credentials);
      await s3
        .upload({
          Bucket: credentials.bucket,
          Key: fileName,
          Body: fileContent,
        })
        .promise();
      break;
    case "azure":
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        credentials.connectionString
      );
      const containerClient = blobServiceClient.getContainerClient(
        credentials.container
      );
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.upload(fileContent, fileContent.length);
      break;
    case "gcp":
      const storage = new Storage({ credentials });
      await storage.bucket(credentials.bucket).upload(imagePath);
      break;
    default:
      throw new Error("Unsupported cloud provider");
  }
}
