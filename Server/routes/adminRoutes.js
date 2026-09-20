const express = require("express");
const { getStats, getUsers } = require("../Controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected admin routes
router.get("/stats", verifyToken, isAdmin, getStats);
router.get("/users", verifyToken, isAdmin, getUsers);

module.exports = router;
