const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const connectToDatabase = require("./db");
const Document = require("./models/Document");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectToDatabase();

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("create_document", async (title, content) => {
    try {
      const newDocument = new Document({ title, content });
      const doc = await newDocument.save();
      socket.emit("document_created", doc._id);
      socket.join(doc._id.toString());
    } catch (err) {
      console.error("Error creating document:", err);
    }
  });

  socket.on("join_document", async (docId) => {
    try {
      const doc = await Document.findById(docId);
      if (doc) {
        socket.join(docId);
        socket.emit("document_loaded", doc);
      } else {
        socket.emit("error", "Document not found");
      }
    } catch (err) {
      console.error("Error joining document:", err);
    }
  });

  socket.on("document_change", async (docId, content) => {
    try {
      const doc = await Document.findByIdAndUpdate(
        docId,
        { content },
        { new: true }
      );
      if (doc) {
        io.to(docId).emit("document_updated", content);
      } else {
        socket.emit("error", "Document not found");
      }
    } catch (err) {
      console.error("Error updating document:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    try {
      const docs = await Document.find();
      docs.forEach(async (doc) => {
        if (doc.users && doc.users.includes(socket.id)) {
          doc.users = doc.users.filter((id) => id !== socket.id);
          await Document.findByIdAndUpdate(doc._id, { users: doc.users });
        }
      });
    } catch (err) {
      console.error("Error handling disconnect:", err);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
