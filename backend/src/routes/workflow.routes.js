const express = require("express");
const Joi = require("joi");
const router = express.Router();
const {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
} = require("../controllers/workflow.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

// Node schema for validation
const nodeSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid("webhook", "delay", "email", "httpRequest").required(),
  position: Joi.object({
    x: Joi.number().default(0),
    y: Joi.number().default(0),
  }).default(),
  data: Joi.object().unknown(true).default({}),
});

const edgeSchema = Joi.object({
  id: Joi.string().required(),
  source: Joi.string().required(),
  target: Joi.string().required(),
});

const createSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional().allow(""),
  nodes: Joi.array().items(nodeSchema).default([]),
  edges: Joi.array().items(edgeSchema).default([]),
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional().allow(""),
  nodes: Joi.array().items(nodeSchema).optional(),
  edges: Joi.array().items(edgeSchema).optional(),
  isActive: Joi.boolean().optional(),
});

// All workflow routes require auth
router.use(authenticate);

router.post("/", validate(createSchema), createWorkflow);
router.get("/", getWorkflows);
router.get("/:id", getWorkflow);
router.put("/:id", validate(updateSchema), updateWorkflow);
router.delete("/:id", deleteWorkflow);

module.exports = router;