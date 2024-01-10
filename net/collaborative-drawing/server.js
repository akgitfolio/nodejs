const net = require("net");
const PORT = 8080;

const clients = [];
let drawingData = []; // Array to store drawing coordinates

const server = net.createServer((socket) => {
  clients.push(socket);

  socket.on("data", (data) => {
    const command = data.toString().trim();
    if (command.startsWith("draw")) {
      const coordinates = command.split(" ").slice(1);
      drawingData.push(coordinates);
      broadcast(JSON.stringify({ type: "draw", data: coordinates }));
    } else if (command === "clear") {
      drawingData = [];
      broadcast(JSON.stringify({ type: "clear" }));
    }
  });

  socket.on("close", () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

function broadcast(message) {
  clients.forEach((client) => {
    client.write(message + "\n");
  });
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
