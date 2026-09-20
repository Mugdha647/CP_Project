const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const problemItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    default: "Codeforces"
  },
  difficulty: {
    type: String,
    default: "Easy"
  },
  url: {
    type: String,
    required: true
  }
});

const topicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ""
  },
  resources: [resourceSchema],
  problems: [problemItemSchema]
});

const stageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner"
    },
    levelColor: {
      type: String,
      default: "#10b981"
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    order: {
      type: Number,
      default: 1
    },
    topics: [topicSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("RoadmapStage", stageSchema);
