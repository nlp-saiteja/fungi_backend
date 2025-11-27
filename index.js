const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send("Chat backend is running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory message list (for learning only)
const messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send existing messages to new user
  socket.emit("chat-history", messages);

  socket.on("chat-message", (msg) => {
    // msg: { text, nickname, time }
    if (!msg || !msg.text) return;

    // Limit message length
    msg.text = msg.text.slice(0, 300);

    messages.push(msg);
    if (messages.length > 100) messages.shift(); // keep last 100

    io.emit("chat-message", msg); // broadcast to everyone
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
