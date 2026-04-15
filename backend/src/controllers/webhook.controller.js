const Workflow = require("../models/Workflow.model");
const executionService = require("../services/execution.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/webhook/:token
 *
 * Public endpoint — no auth required.
 * Any external system (Google Forms, Postman, your own app)
 * can call this URL to trigger a workflow.
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const workflow = await Workflow.findOne({ webhookToken: token, isActive: true });
  if (!workflow) throw ApiError.notFound("Webhook not found or workflow inactive");

  // Merge body + query params as trigger data
  const triggerData = {
    ...req.query,
    ...req.body,
    _meta: {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      triggeredAt: new Date().toISOString(),
    },
  };

  const execution = await executionService.triggerExecution(
    workflow._id,
    triggerData,
    "webhook"
  );

  // Respond immediately — execution happens in the background
  return ApiResponse.success(
    res,
    {
      executionId: execution._id,
      status: "queued",
      message: "Workflow execution queued",
    },
    "Webhook received"
  );
});

module.exports = { handleWebhook };