const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/webhook.controller");
const { webhookLimiter } = require("../middleware/rateLimit.middleware");

// Public route — no auth, but rate limited
router.post("/:token", webhookLimiter, handleWebhook);
router.get("/:token", webhookLimiter, handleWebhook); // support GET too

module.exports = router;