const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const watchDir = process.env.WATCH_DIR || "/tmp";
const logFile = process.env.LOG_FILE || "processing.log";

function processFile(filename) {
  const ext = path.extname(filename);
  switch (ext) {
    case ".txt":
      return processTextFile(filename);
    case ".csv":
      return processCSVFile(filename);
    default:
      return Promise.reject(`Unsupported file type: ${ext}`);
  }
}

function processTextFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf-8", (err, data) => {
      if (err) return reject(err);
      // Process text data here
      console.log(`Processed text file: ${filename}`);
      resolve();
    });
  });
}

function processCSVFile(filename) {
  return new Promise((resolve, reject) => {
    const cmd = spawn("python", ["csv_processor.py", filename]);
    cmd.stdout.on("data", (data) => console.log(data.toString()));
    cmd.stderr.on("data", (data) => reject(data.toString()));
    cmd.on("close", (code) => {
      if (code === 0) resolve();
      else reject(`Error processing CSV file: ${filename}`);
    });
  });
}

fs.watch(watchDir, (event, filename) => {
  if (event === "rename") {
    processFile(path.join(watchDir, filename))
      .then(() => {
        console.log(`File ${filename} processed successfully.`);
        fs.appendFileSync(logFile, `Processed ${filename}\n`);
      })
      .catch((err) => {
        console.error(`Error processing file ${filename}: ${err}`);
        fs.appendFileSync(logFile, `Error processing ${filename}: ${err}\n`);
      });
  }
});

console.log(`Watching directory: ${watchDir}`);
console.log(`Log file: ${logFile}`);

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  process.exit(0);
});
