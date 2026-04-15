const executionService = require("../services/execution.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/executions/:workflowId
const getExecutions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await executionService.getExecutions(
    req.params.workflowId,
    req.user._id,
    { page, limit }
  );
  return ApiResponse.success(res, result);
});

// GET /api/executions/detail/:executionId
const getExecution = asyncHandler(async (req, res) => {
  const execution = await executionService.getExecutionById(
    req.params.executionId,
    req.user._id
  );
  return ApiResponse.success(res, { execution });
});

// POST /api/executions/:workflowId/trigger  (manual trigger from dashboard)
const triggerManual = asyncHandler(async (req, res) => {
  const execution = await executionService.triggerExecution(
    req.params.workflowId,
    req.body || {},
    "manual"
  );
  return ApiResponse.success(
    res,
    { executionId: execution._id, status: "queued" },
    "Workflow triggered manually"
  );
});

module.exports = { getExecutions, getExecution, triggerManual };