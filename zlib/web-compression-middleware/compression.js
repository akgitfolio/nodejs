const zlib = require("zlib");

const express = require("express");
const compression = require("./compressionMiddleware");

function compressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers["accept-encoding"];
  if (acceptEncoding && acceptEncoding.includes("gzip")) {
    res.setHeader("Content-Encoding", "gzip");
    const gzip = zlib.createGzip();
    res.on("finish", () => gzip.end());
    res.pipe(gzip);
  } else {
    next(); // Pass control to the next middleware or handler
  }
}

const app = express();

app.use(compression); // Add the compression middleware

app.listen(3000, () => console.log("Server listening on port 3000"));
