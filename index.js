const WebSocket = require("ws");
const Redis = require("ioredis");
const express = require("express");
const app = express();
const port = 3001;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const wss = new WebSocket.Server({ port: 8090 });
const redisSubscriber = new Redis();
const redisPublisher = new Redis();

wss.on("connection", (ws) => {
  console.log("WebSocket connection established.");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "draw") {
      drawLine(data.x0, data.y0, data.x1, data.y1);
      redisPublisher.publish("drawing", JSON.stringify(data));
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
});

function drawLine(x0, y0, x1, y1) {
  // Implement your own drawing logic or forward it to the clients as needed.
  // This example backend does not implement a drawing canvas.
}

redisSubscriber.subscribe("drawing");
redisSubscriber.on("message", (channel, message) => {
  if (channel === "drawing") {
    // Broadcast the drawing data received from Redis to all connected clients.
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
