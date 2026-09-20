const express = require("express");
const {
  getContests,
  getGlobalLeaderboard,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerContest,
  submitSolution,
  getLeaderboard
} = require("../Controllers/contestController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getContests);
router.get("/leaderboard/global", getGlobalLeaderboard);
router.get("/:id", getContestById);
router.get("/:id/leaderboard", getLeaderboard);

// User authenticated routes
router.post("/:id/register", verifyToken, registerContest);
router.post("/:id/submit", verifyToken, submitSolution);

// Admin only routes
router.post("/", verifyToken, isAdmin, createContest);
router.put("/:id", verifyToken, isAdmin, updateContest);
router.delete("/:id", verifyToken, isAdmin, deleteContest);

module.exports = router;
