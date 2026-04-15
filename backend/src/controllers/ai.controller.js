const aiService = require("../services/ai.service");
const workflowService = require("../services/workflow.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/ai/generate-workflow
 * Body: { prompt: "When user signs up, wait 5 minutes, then send welcome email" }
 *
 * Returns a workflow JSON — frontend can display it for review before saving.
 */
const generateWorkflow = asyncHandler(async (req, res) => {
  const { prompt, save = false } = req.body;

  if (!prompt || prompt.trim().length < 10) {
    throw ApiError.badRequest("Prompt must be at least 10 characters");
  }

  const generatedWorkflow = await aiService.generateWorkflow(prompt.trim());

  // Optionally save directly to DB
  if (save) {
    const workflow = await workflowService.createWorkflow(req.user._id, generatedWorkflow);
    const webhookUrl = workflowService.getWebhookUrl(workflow.webhookToken);
    return ApiResponse.created(
      res,
      { workflow, webhookUrl, generated: true },
      "Workflow generated and saved"
    );
  }

  // Just return the JSON for frontend to preview
  return ApiResponse.success(
    res,
    { workflow: generatedWorkflow, generated: true },
    "Workflow generated. Review and save when ready."
  );
});

module.exports = { generateWorkflow };