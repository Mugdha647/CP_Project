const express = require("express");
const {
  getRoadmap,
  saveFullRoadmap,
  addStage,
  updateStage,
  deleteStage,
  addTopic,
  deleteTopic
} = require("../Controllers/roadmapController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route to view roadmap
router.get("/", getRoadmap);

// Admin only routes to modify roadmap
router.post("/save-all", verifyToken, isAdmin, saveFullRoadmap);
router.post("/stages", verifyToken, isAdmin, addStage);
router.put("/stages/:id", verifyToken, isAdmin, updateStage);
router.delete("/stages/:id", verifyToken, isAdmin, deleteStage);
router.post("/stages/:stageId/topics", verifyToken, isAdmin, addTopic);
router.delete("/stages/:stageId/topics/:topicId", verifyToken, isAdmin, deleteTopic);

module.exports = router;
