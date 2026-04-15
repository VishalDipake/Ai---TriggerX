const ExecutionLog = require("../models/ExecutionLog.model");
const Workflow = require("../models/Workflow.model");
const { enqueueWorkflow } = require("../queue/workflow.queue");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

/**
 * Creates an ExecutionLog entry and pushes job to Bull queue.
 * Called by both webhook trigger and manual trigger.
 */
const triggerExecution = async (workflowId, triggerData = {}, triggeredBy = "webhook") => {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw ApiError.notFound("Workflow not found");
  if (!workflow.isActive) throw ApiError.badRequest("Workflow is inactive");

  if (!workflow.nodes || workflow.nodes.length === 0) {
    throw ApiError.badRequest("Workflow has no nodes to execute");
  }

  // Create execution record BEFORE queuing (so we have an ID to track)
  const execution = await ExecutionLog.create({
    workflowId,
    triggeredBy,
    triggerData,
    status: "queued",
  });

  await enqueueWorkflow(workflowId, execution._id.toString(), triggerData);

  logger.info(`[ExecutionService] Execution ${execution._id} queued for workflow ${workflowId}`);
  return execution;
};

/**
 * Get paginated execution logs for a workflow.
 */
const getExecutions = async (workflowId, userId, { page = 1, limit = 20 } = {}) => {
  // Verify ownership
  const workflow = await Workflow.findOne({ _id: workflowId, createdBy: userId });
  if (!workflow) throw ApiError.notFound("Workflow not found");

  const skip = (page - 1) * limit;

  const [executions, total] = await Promise.all([
    ExecutionLog.find({ workflowId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ExecutionLog.countDocuments({ workflowId }),
  ]);

  return {
    executions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single execution log with all step details.
 */
const getExecutionById = async (executionId, userId) => {
  const execution = await ExecutionLog.findById(executionId)
    .populate("workflowId", "name createdBy")
    .lean();

  if (!execution) throw ApiError.notFound("Execution not found");

  // Security: make sure this execution belongs to the user
  if (execution.workflowId.createdBy.toString() !== userId.toString()) {
    throw ApiError.forbidden();
  }

  return execution;
};

module.exports = { triggerExecution, getExecutions, getExecutionById };