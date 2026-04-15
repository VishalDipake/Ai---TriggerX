const workflowService = require("../services/workflow.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const createWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.createWorkflow(req.user._id, req.body);
  const webhookUrl = workflowService.getWebhookUrl(workflow.webhookToken);
  return ApiResponse.created(res, { workflow, webhookUrl }, "Workflow created");
});

const getWorkflows = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await workflowService.getWorkflows(req.user._id, { page, limit });
  return ApiResponse.success(res, result);
});

const getWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.getWorkflowById(req.params.id, req.user._id);
  const webhookUrl = workflowService.getWebhookUrl(workflow.webhookToken);
  return ApiResponse.success(res, { workflow, webhookUrl });
});

const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.updateWorkflow(req.params.id, req.user._id, req.body);
  return ApiResponse.success(res, { workflow }, "Workflow updated");
});

const deleteWorkflow = asyncHandler(async (req, res) => {
  await workflowService.deleteWorkflow(req.params.id, req.user._id);
  return ApiResponse.success(res, null, "Workflow deleted");
});

module.exports = { createWorkflow, getWorkflows, getWorkflow, updateWorkflow, deleteWorkflow };