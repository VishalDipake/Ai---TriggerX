const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { generateWorkflow } = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const generateSchema = Joi.object({
  prompt: Joi.string().min(10).max(500).required(),
  save: Joi.boolean().default(false),
});

router.use(authenticate);
router.post("/generate-workflow", validate(generateSchema), generateWorkflow);

module.exports = router;