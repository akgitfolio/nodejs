const net = require("net");
const port = 8080;

const socket = net.connect({ port }, () => {
  console.log("Connected to server");
});

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

socket.on("data", (data) => {
  const message = JSON.parse(data.toString());
  if (message.type === "draw") {
    const [startX, startY, endX, endY] = message.data.map(Number);
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  } else if (message.type === "clear") {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
});

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const startX = e.clientX - rect.left;
  const startY = e.clientY - rect.top;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
    socket.write(`draw ${startX} ${startY} ${endX} ${endY}\n`);
    startX = endX;
    startY = endY;
  });

  canvas.addEventListener("mouseup", () => {
    canvas.removeEventListener("mousemove", () => {});
  });
});

document.getElementById("clear").addEventListener("click", () => {
  socket.write("clear\n");
});
