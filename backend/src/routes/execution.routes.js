const express = require("express");
const router = express.Router();
const { getExecutions, getExecution, triggerManual } = require("../controllers/execution.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/:workflowId", getExecutions);
router.get("/detail/:executionId", getExecution);
router.post("/:workflowId/trigger", triggerManual);

module.exports = router;