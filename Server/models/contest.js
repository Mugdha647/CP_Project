const mongoose = require("mongoose");

// Hidden test case schema (input + expected output pairs)
const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false }, // true = visible to users, false = hidden
  points: { type: Number, default: 0 } // optional per-test-case points
});

const problemSchema = new mongoose.Schema({
  problemId: { type: String, required: true },
  title: { type: String, required: true },
  statement: { type: String, required: true },
  inputFormat: { type: String, default: "Standard input" },
  outputFormat: { type: String, default: "Standard output" },
  constraints: { type: String, default: "1 <= N <= 10^5" },
  sampleInput: { type: String, default: "" },
  sampleOutput: { type: String, default: "" },
  points: { type: Number, default: 100 },
  difficulty: { type: String, default: "Easy" },
  testCases: [testCaseSchema] // Hidden + sample test cases
});

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  problemId: { type: String, required: true },
  language: { type: String, default: "cpp" },
  code: { type: String, required: true },
  verdict: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error"],
    default: "Accepted"
  },
  score: { type: Number, default: 0 },
  testsPassed: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  errorDetails: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now }
});

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 120 },
    problems: [problemSchema],
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    submissions: [submissionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);
