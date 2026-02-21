console.log("🔥 THIS SERVER FILE IS RUNNING");
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");

// Initialize Passport Strategies
require("./config/passport");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this for production security
    methods: ["GET", "POST"]
  }
});

// Socket mapping
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    // Remove the user from the mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io instance and userSockets available globally
app.set("io", io);
app.set("userSockets", userSockets);

// Connect Database (ONLY THIS ONE)
connectDB();

app.use(cors());
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "projexly_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/gigs", require("./routes/gigRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/proposals", require("./routes/proposalRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
