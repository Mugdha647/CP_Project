const Contest = require("../models/contest");
const { evaluateSubmissionWithJudge0 } = require("../utils/judge0");


// ====================================
// GET ALL CONTESTS (Public / User)
// ====================================
const getContests = async (req, res) => {
  try {
    let contests = await Contest.find().sort({ startTime: -1 });

    if (contests.length === 0) {
      try {
        const { seedDatabase } = require("../seedData");
        await seedDatabase();
        contests = await Contest.find().sort({ startTime: -1 });
      } catch (seedErr) {
        console.warn("Could not auto-seed contests:", seedErr.message);
      }
    }

    const now = new Date();

    const formatted = contests.map((c) => {
      let status = "upcoming";
      if (now >= new Date(c.startTime) && now <= new Date(c.endTime)) status = "active";
      else if (now > new Date(c.endTime)) status = "ended";

      return {
        id: c._id,
        title: c.title,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
        durationMinutes: c.durationMinutes,
        status,
        problemCount: c.problems.length,
        participantCount: c.registeredUsers.length,
        registeredUsers: c.registeredUsers
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Failed to fetch contests" });
  }
};

// ====================================
// GET GLOBAL LEADERBOARD
// ====================================
const getGlobalLeaderboard = async (req, res) => {
  try {
    const contests = await Contest.find();
    const userScores = {};

    contests.forEach((contest) => {
      (contest.submissions || []).forEach((sub) => {
        const uKey = sub.userId ? sub.userId.toString() : sub.username;
        if (!userScores[uKey]) {
          userScores[uKey] = {
            username: sub.username,
            totalScore: 0,
            contestsParticipated: new Set(),
            problemsSolvedCount: 0,
            lastActive: sub.submittedAt
          };
        }
        userScores[uKey].contestsParticipated.add(contest._id.toString());
        if (sub.verdict === "Accepted") {
          userScores[uKey].totalScore += sub.score || 100;
          userScores[uKey].problemsSolvedCount += 1;
        }
        if (new Date(sub.submittedAt) > new Date(userScores[uKey].lastActive)) {
          userScores[uKey].lastActive = sub.submittedAt;
        }
      });
    });

    const result = Object.values(userScores)
      .map((u) => ({
        username: u.username,
        totalScore: u.totalScore,
        contestsCount: u.contestsParticipated.size,
        problemsSolved: u.problemsSolvedCount,
        lastActive: u.lastActive,
        rating: Math.min(u.totalScore, 2000)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    res.json(result);
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch global leaderboard" });
  }
};

// ====================================
// GET CONTEST BY ID
// ====================================
const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const now = new Date();
    let status = "upcoming";
    if (now >= new Date(contest.startTime) && now <= new Date(contest.endTime)) status = "active";
    else if (now > new Date(contest.endTime)) status = "ended";

    // Strip hidden test case input/output before sending to client, keep sample test cases
    const sanitizedProblems = contest.problems.map((p) => {
      const sampleTc = (p.testCases || []).find((tc) => tc.isSample) || (p.testCases || [])[0];
      const sampleInput = p.sampleInput || (sampleTc ? sampleTc.input : "");
      const sampleOutput = p.sampleOutput || (sampleTc ? sampleTc.expectedOutput : "");
      const visibleSamples = (p.testCases || [])
        .filter((tc) => tc.isSample)
        .map((tc) => ({
          input: tc.input || "",
          expectedOutput: tc.expectedOutput || "",
          isSample: true
        }));

      return {
        problemId: p.problemId,
        title: p.title,
        statement: p.statement,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        sampleInput,
        sampleOutput,
        sampleTestCases: visibleSamples.length > 0 ? visibleSamples : (sampleInput || sampleOutput ? [{ input: sampleInput, expectedOutput: sampleOutput, isSample: true }] : []),
        points: p.points,
        difficulty: p.difficulty,
        testCaseCount: p.testCases ? p.testCases.length : 0
      };
    });

    res.json({
      id: contest._id,
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      status,
      problems: sanitizedProblems,
      registeredUsers: contest.registeredUsers,
      submissions: contest.submissions
    });
  } catch (error) {
    console.error("Error fetching contest details:", error);
    res.status(500).json({ message: "Failed to fetch contest details" });
  }
};

// Helper to normalize problem data and keep sample cases in sync
function normalizeProblems(problems) {
  return (problems || []).map((p, idx) => {
    let testCases = Array.isArray(p.testCases) ? [...p.testCases] : [];

    // Find first sample test case if available
    const sampleTc = testCases.find((tc) => tc.isSample) || testCases[0];
    let sampleInput = p.sampleInput !== undefined && p.sampleInput !== null ? String(p.sampleInput).trim() : (sampleTc ? sampleTc.input : "");
    let sampleOutput = p.sampleOutput !== undefined && p.sampleOutput !== null ? String(p.sampleOutput).trim() : (sampleTc ? sampleTc.expectedOutput : "");

    // If sampleInput/sampleOutput exist, ensure they are represented in testCases as visible sample
    if (sampleInput || sampleOutput) {
      const existingSample = testCases.find((tc) => tc.isSample);
      if (existingSample) {
        existingSample.input = sampleInput;
        existingSample.expectedOutput = sampleOutput;
      } else {
        testCases.unshift({
          input: sampleInput,
          expectedOutput: sampleOutput,
          isSample: true
        });
      }
    } else if (sampleTc) {
      sampleInput = sampleTc.input || "";
      sampleOutput = sampleTc.expectedOutput || "";
    }

    return {
      problemId: p.problemId || `p${idx + 1}`,
      title: p.title || `Problem ${String.fromCharCode(65 + idx)}`,
      statement: p.statement || "",
      inputFormat: p.inputFormat || "Standard Input",
      outputFormat: p.outputFormat || "Standard Output",
      constraints: p.constraints || "1 <= N <= 10^5",
      sampleInput,
      sampleOutput,
      points: Number(p.points) || 100,
      difficulty: p.difficulty || "Easy",
      testCases
    };
  });
}

// ====================================
// CREATE CONTEST (Admin Only)
// ====================================
const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, durationMinutes, problems } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Title, start time, and end time are required" });
    }

    const processedProblems = normalizeProblems(problems);

    const newContest = await Contest.create({
      title,
      description: description || "",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      durationMinutes: durationMinutes || 120,
      problems: processedProblems,
      createdBy: req.user._id
    });

    res.status(201).json({ message: "Contest created successfully", contest: newContest });
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ message: "Failed to create contest" });
  }
};

// ====================================
// UPDATE CONTEST (Admin Only)
// ====================================
const updateContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, durationMinutes, problems } = req.body;
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    if (title) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (startTime) contest.startTime = new Date(startTime);
    if (endTime) contest.endTime = new Date(endTime);
    if (durationMinutes) contest.durationMinutes = durationMinutes;
    if (problems) contest.problems = normalizeProblems(problems);

    await contest.save();
    res.json({ message: "Contest updated successfully", contest });
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ message: "Failed to update contest" });
  }
};

// ====================================
// DELETE CONTEST (Admin Only)
// ====================================
const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json({ message: "Contest deleted successfully" });
  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ message: "Failed to delete contest" });
  }
};

// ====================================
// REGISTER FOR CONTEST (User)
// ====================================
const registerContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const userId = req.user._id;
    if (contest.registeredUsers.some((id) => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "You are already registered for this contest" });
    }

    contest.registeredUsers.push(userId);
    await contest.save();
    res.json({ message: "Successfully registered for contest", registeredUsers: contest.registeredUsers });
  } catch (error) {
    console.error("Error registering for contest:", error);
    res.status(500).json({ message: "Failed to register for contest" });
  }
};

// ====================================
// SUBMIT SOLUTION (User)
// ====================================
const submitSolution = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const contest = await Contest.findById(req.params.id);

    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (!code || !code.trim()) return res.status(400).json({ message: "Code cannot be empty" });

    const problem = contest.problems.find(
      (p) => p.problemId === problemId || p._id.toString() === problemId
    );
    if (!problem) return res.status(404).json({ message: "Problem not found in this contest" });

    const evalResult = await evaluateSubmissionWithJudge0(code, language, problem);

    const submission = {
      userId: req.user._id,
      username: req.user.username,
      problemId: problem.problemId || problem._id.toString(),
      language: language || "cpp",
      code,
      verdict: evalResult.verdict,
      score: evalResult.score,
      testsPassed: evalResult.testsPassed || 0,
      totalTests: evalResult.totalTests || 0,
      errorDetails: evalResult.errorDetails || "",
      submittedAt: new Date()
    };

    contest.submissions.push(submission);
    await contest.save();

    res.status(201).json({
      message: "Submission evaluated successfully",
      submission,
      testsPassed: evalResult.testsPassed,
      totalTests: evalResult.totalTests,
      reason: evalResult.reason,
      errorDetails: evalResult.errorDetails || ""
    });
  } catch (error) {
    console.error("Error submitting solution:", error);
    res.status(500).json({ message: "Failed to submit solution" });
  }
};

// ====================================
// GET CONTEST LEADERBOARD
// ====================================
const getLeaderboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const userScores = {};
    contest.submissions.forEach((sub) => {
      const uKey = sub.userId.toString();
      if (!userScores[uKey]) {
        userScores[uKey] = {
          userId: sub.userId,
          username: sub.username,
          totalScore: 0,
          problemsSolved: {},
          lastSubmissionTime: sub.submittedAt
        };
      }
      if (sub.verdict === "Accepted" && !userScores[uKey].problemsSolved[sub.problemId]) {
        userScores[uKey].problemsSolved[sub.problemId] = sub.score;
        userScores[uKey].totalScore += sub.score;
      } else if (sub.score > 0 && !userScores[uKey].problemsSolved[sub.problemId]) {
        // Partial credit for Wrong Answer with partial score
        userScores[uKey].problemsSolved[sub.problemId] = sub.score;
        userScores[uKey].totalScore += sub.score;
      }
      if (new Date(sub.submittedAt) > new Date(userScores[uKey].lastSubmissionTime)) {
        userScores[uKey].lastSubmissionTime = sub.submittedAt;
      }
    });

    const leaderboard = Object.values(userScores).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return new Date(a.lastSubmissionTime) - new Date(b.lastSubmissionTime);
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

module.exports = {
  getContests,
  getGlobalLeaderboard,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerContest,
  submitSolution,
  getLeaderboard
};
