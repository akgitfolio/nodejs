import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

app.use(cors());
app.use(helmet());

const env = process.env.NODE_ENV || "development";
const UPLOADS_FOLDER = path.join(__dirname, "uploads");
app.use(morgan(env));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware to create the uploads folder if it doesn't exist
const createUploadsFolder = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER);
  }
  next();
};

app.use(createUploadsFolder);
app.use(express.static(UPLOADS_FOLDER));

io.on("connection", (socket) => {
  console.log("Client connected");
});

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file as any;
  const fileSize = file.size;
  let uploadedBytes = 0;

  const fileId = req.headers["x-file-id"];

  const uploadProgress = setInterval(() => {
    uploadedBytes += 1024 * 1024; // Simulating chunk upload progress

    if (uploadedBytes >= fileSize) {
      clearInterval(uploadProgress);
      io.emit("uploadComplete", { fileId: fileId });
    } else {
      const progress = Math.round((uploadedBytes / fileSize) * 100);
      io.emit("uploadProgress", { fileId: fileId, progress: progress });
    }
  }, 100);

  res.send("File upload started");
});

// File explorer route
app.get("/files", (req, res) => {
  fs.readdir(UPLOADS_FOLDER, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("files", { files });
    }
  });
});

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
