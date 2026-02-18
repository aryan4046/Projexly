console.log("🔥 THIS SERVER FILE IS RUNNING");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Connect Database (ONLY THIS ONE)
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/gigs", require("./routes/gigRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/proposals", require("./routes/proposalRoutes"));

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
