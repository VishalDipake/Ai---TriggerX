const Workflow = require("../models/Workflow.model");
const ExecutionLog = require("../models/ExecutionLog.model");
const ApiError = require("../utils/ApiError");

const VALID_NODE_TYPES = ["webhook", "delay", "email", "httpRequest"];

/**
 * Validate workflow nodes and edges before saving.
 */
const validateWorkflowGraph = (nodes = [], edges = []) => {
  if (nodes.length === 0) {
    throw ApiError.badRequest("Workflow must have at least one node");
  }

  // Check all node types are valid
  for (const node of nodes) {
    if (!VALID_NODE_TYPES.includes(node.type)) {
      throw ApiError.badRequest(`Invalid node type: "${node.type}"`);
    }
    if (!node.id) throw ApiError.badRequest("Each node must have an id");
  }

  // Check edges reference existing nodes
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      throw ApiError.badRequest(`Edge source "${edge.source}" not found in nodes`);
    }
    if (!nodeIds.has(edge.target)) {
      throw ApiError.badRequest(`Edge target "${edge.target}" not found in nodes`);
    }
  }

  // Warn if no trigger node (not a hard error — user might be building)
  const hasTrigger = nodes.some((n) => n.type === "webhook");
  if (!hasTrigger) {
    throw ApiError.badRequest("Workflow must have at least one webhook trigger node");
  }
};

const createWorkflow = async (userId, data) => {
  const { name, description, nodes = [], edges = [] } = data;

  if (nodes.length > 0) {
    validateWorkflowGraph(nodes, edges);
  }

  const workflow = await Workflow.create({
    name,
    description,
    createdBy: userId,
    nodes,
    edges,
  });

  return workflow;
};

const getWorkflows = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [workflows, total] = await Promise.all([
    Workflow.find({ createdBy: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-nodes -edges") // list view: no need for full graph
      .lean(),
    Workflow.countDocuments({ createdBy: userId }),
  ]);

  return {
    workflows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const getWorkflowById = async (workflowId, userId) => {
  const workflow = await Workflow.findOne({ _id: workflowId, createdBy: userId });
  if (!workflow) throw ApiError.notFound("Workflow not found");
  return workflow;
};

const updateWorkflow = async (workflowId, userId, data) => {
  const workflow = await Workflow.findOne({ _id: workflowId, createdBy: userId });
  if (!workflow) throw ApiError.notFound("Workflow not found");

  const { name, description, nodes, edges, isActive } = data;

  if (nodes !== undefined) {
    validateWorkflowGraph(nodes, edges || workflow.edges);
    workflow.nodes = nodes;
  }
  if (edges !== undefined) workflow.edges = edges;
  if (name !== undefined) workflow.name = name;
  if (description !== undefined) workflow.description = description;
  if (isActive !== undefined) workflow.isActive = isActive;

  await workflow.save();
  return workflow;
};

const deleteWorkflow = async (workflowId, userId) => {
  const workflow = await Workflow.findOneAndDelete({ _id: workflowId, createdBy: userId });
  if (!workflow) throw ApiError.notFound("Workflow not found");

  // Clean up execution logs
  await ExecutionLog.deleteMany({ workflowId });

  return workflow;
};

/**
 * Get the public webhook URL for a workflow.
 */
const getWebhookUrl = (webhookToken) => {
  return `${process.env.APP_URL}/api/webhook/${webhookToken}`;
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  getWebhookUrl,
};