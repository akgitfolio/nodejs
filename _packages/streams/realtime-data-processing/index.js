const fs = require("fs");
const { Transform, Reduce } = require("stream");
const WebSocket = require("ws");

const fileToRead = "your_text_file.txt"; // Replace with the actual filename

const transformStream = new Transform({
  objectMode: true, // Work with objects instead of buffers
  transform(line, _, next) {
    const words = line.toString().split(/\s+/); // Split line into words
    words.forEach((word) => this.push({ word })); // Emit word objects
  },
});

const reduceStream = new Reduce((acc, word) => {
  // Reducer function
  acc[word.word] = (acc[word.word] || 0) + 1;
  return acc;
}, {});

const wss = new WebSocket.Server({ port: 8080 }); // WebSocket Server

fs.createReadStream(fileToRead)
  .pipe(transformStream)
  .pipe(reduceStream)
  .on("data", (wordFrequency) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(wordFrequency)); // Send word frequency to clients
      }
    });
  });

console.log("Server listening on ws://localhost:8080");

// Client-side implementation (separate file)
const socket = new WebSocket("ws://localhost:8080");
socket.onmessage = (event) => {
  // Parse and display the real-time word frequency data
};
