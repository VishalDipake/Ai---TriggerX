const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Each node in the workflow graph
const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // React Flow node id
    type: {
      type: String,
      required: true,
      enum: ["webhook", "delay", "email", "httpRequest"],
    },
    // Position on canvas (for frontend)
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    // Node-specific configuration
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

// Each edge connecting two nodes
const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true }, // source node id
    target: { type: String, required: true }, // target node id
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workflow name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Unique webhook token for this workflow
    webhookToken: {
      type: String,
      
      default: () => uuidv4(),
    },
    // Stats
    executionCount: {
      type: Number,
      default: 0,
    },
    lastExecutedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast webhook lookup
workflowSchema.index({ webhookToken: 1 });
workflowSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Workflow", workflowSchema);