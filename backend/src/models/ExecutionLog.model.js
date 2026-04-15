const mongoose = require("mongoose");

const stepLogSchema = new mongoose.Schema(
  {
    nodeId: { type: String, required: true },
    nodeType: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
    },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    output: { type: mongoose.Schema.Types.Mixed }, // what this node produced
    error: { type: String }, // error message if failed
  },
  { _id: false }
);

const executionLogSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    triggeredBy: {
      type: String,
      enum: ["webhook", "manual"],
      default: "webhook",
    },
    triggerData: {
      type: mongoose.Schema.Types.Mixed, // the payload that triggered the workflow
    },
    status: {
      type: String,
      enum: ["queued", "running", "success", "failed"],
      default: "queued",
    },
    steps: [stepLogSchema],
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    error: { type: String }, // top-level error if whole execution failed
  },
  {
    timestamps: true,
  }
);

executionLogSchema.index({ workflowId: 1, createdAt: -1 });

module.exports = mongoose.model("ExecutionLog", executionLogSchema);