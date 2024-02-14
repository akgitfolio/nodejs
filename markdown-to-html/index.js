const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const marked = require("marked");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const https = require("https");

const app = express();

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};
const server = https.createServer(options, app);

const io = socketIo(server);

let documentContent = "";

io.on("connection", (socket) => {
  socket.emit("documentContent", documentContent);

  socket.on("editDocument", (content) => {
    documentContent = content;
    io.emit("documentContent", documentContent);
    io.emit(
      "htmlContent",
      marked(documentContent, {
        gfm: true,
        breaks: true,
        highlight: (code) => code,
      })
    );
  });
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
