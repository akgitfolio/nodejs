// Import necessary modules
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Create express app
const app = express();
const server = http.createServer(app);

// Create socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

// Apply middleware
const env = process.env.NODE_ENV || "development";
app.use(cors());
app.use(helmet());
app.use(morgan(env));

// Store sockets in a dictionary
const userSockets: { [username: string]: Socket } = {};
const userRooms: { [username: string]: string } = {};

interface Message {
  username: string;
  message: string;
  dateTime: string;
}

// Common store for messages
const messageStore: Message[] = [];

// Listen for socket connection
io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  // Identify the user and store their socket
  socket.on("identify", (username: string) => {
    userRooms[username] = "default"; // Assign the user to the default room initially
    socket.join("default"); // Join the default room

    userSockets[username] = socket;

    console.log("User:", username);
    // Send existing messages to the user upon connection
    socket.emit("messages", messageStore);
  });

  socket.on("joinRoom", (roomName: string) => {
    console.log(roomName);
    const username = getUsernameFromSocket(socket);
    const currentRoom = userRooms[username];
    socket.leave(currentRoom); // Leave current room
    socket.join(roomName); // Join new room
    userRooms[username] = roomName; // Update user's room
    io.to(roomName).emit("message", `${username} has joined the room.`);
  });

  // Listen for messages
  socket.on("message", (msg: string) => {
    const username = Object.keys(userSockets).find(
      (key) => userSockets[key] === socket
    );
    const dateTime = new Date().toISOString();

    // Create message object
    const newMessage: Message = {
      username: username || "",
      message: msg,
      dateTime: dateTime,
      // Add any other metadata fields as needed
    };

    // Add message to the common store
    messageStore.push(newMessage);

    // Broadcast the message to all users
    io.emit("message", newMessage);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
    // Remove the socket from the dictionary
    const username = Object.keys(userSockets).find(
      (key) => userSockets[key] === socket
    );
    if (username) {
      delete userSockets[username];
    }
  });
});

function getUsernameFromSocket(socket: Socket): string {
  // Iterate through userSockets to find the username associated with the socket
  for (const [username, userSocket] of Object.entries(userSockets)) {
    if (userSocket === socket) {
      return username;
    }
  }
  return ""; // Return an empty string if the username is not found (handle this case appropriately)
}

// Start the server
const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
