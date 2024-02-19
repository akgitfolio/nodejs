// socket.js
const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(/* Your express app */);
const io = socketIo(server);

module.exports = io;
