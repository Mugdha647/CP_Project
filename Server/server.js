const dns = require("dns");

// Use public DNS servers
dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();


// ======================
// Middleware
// ======================

app.use(cors());

app.use(express.json());


// ======================
// Routes
// ======================

app.use("/api/auth", authRoutes);


// Test route

app.get("/", (req, res) => {
  res.json({
    message: "CP Master API is running"
  });
});


// ======================
// MongoDB
// ======================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB connected successfully!");

    app.listen(process.env.PORT, () => {

      console.log(
        `Server running at http://localhost:${process.env.PORT}`
      );

    });

  })

  .catch((error) => {

    console.log("MongoDB connection failed");

    console.log(error.message);

  });