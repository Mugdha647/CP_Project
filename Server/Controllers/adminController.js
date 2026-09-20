const User = require("../models/user");
const Contest = require("../models/contest");
const RoadmapStage = require("../models/roadmap");

// ====================================
// GET DASHBOARD STATS
// ====================================
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalContests = await Contest.countDocuments();
    const stages = await RoadmapStage.find();

    let totalTopics = 0;
    let totalProblems = 0;
    stages.forEach((stage) => {
      totalTopics += stage.topics.length;
      stage.topics.forEach((t) => {
        totalProblems += t.problems.length;
      });
    });

    const contests = await Contest.find();
    let totalSubmissions = 0;
    contests.forEach((c) => {
      totalSubmissions += c.submissions ? c.submissions.length : 0;
    });

    res.json({
      totalUsers,
      totalContests,
      totalTopics,
      totalProblems,
      totalSubmissions
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// ====================================
// GET ALL USERS (Admin Only)
// ====================================
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = {
  getStats,
  getUsers
};
