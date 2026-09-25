const dns = require("dns");
dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const contestRoutes = require("./routes/contestRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Routes

app.use("/api/auth", authRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/admin", adminRoutes);

// ======================
// Test Route
// ======================
app.get("/", (req, res) => {
  res.json({
    message: "CP Master API is running"
  });
});


// MongoDB

const PORT = process.env.PORT || 5000;
const MONGO_URI =process.env.MONGO_URI ;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT,"0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed");
    console.log(error.message);
    process.exit(1)

  });