const WebhookNode = require("./nodes/WebhookNode");
const DelayNode = require("./nodes/DelayNode");
const EmailNode = require("./nodes/EmailNode");
const HttpRequestNode = require("./nodes/HttpRequestNode");
const ExecutionLog = require("../models/ExecutionLog.model");
const Workflow = require("../models/Workflow.model");
const logger = require("../utils/logger");

// Registry — add new node types here only
const NODE_REGISTRY = {
  webhook: WebhookNode,
  delay: DelayNode,
  email: EmailNode,
  httpRequest: HttpRequestNode,
};

/**
 * WorkflowEngine
 *
 * Responsibilities:
 *  1. Build execution order from nodes + edges (topological sort)
 *  2. Execute each node sequentially
 *  3. Pass context (data) between nodes
 *  4. Write step-level logs to DB in real time
 *  5. Handle failures gracefully
 */
class WorkflowEngine {
  /**
   * Main entry point — called by the queue worker.
   * @param {string} workflowId
   * @param {string} executionId  - pre-created ExecutionLog _id
   * @param {object} triggerData  - payload from webhook
   */
  static async execute(workflowId, executionId, triggerData = {}) {
    const executionLog = await ExecutionLog.findById(executionId);
    if (!executionLog) throw new Error(`ExecutionLog ${executionId} not found`);

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      await WorkflowEngine._failExecution(executionLog, "Workflow not found");
      return;
    }

    // Mark execution as running
    executionLog.status = "running";
    executionLog.startedAt = new Date();
    await executionLog.save();

    logger.info(`[Engine] Starting execution ${executionId} for workflow: ${workflow.name}`);

    // Build ordered list of nodes to execute
    let orderedNodes;
    try {
      orderedNodes = WorkflowEngine._buildExecutionOrder(workflow.nodes, workflow.edges);
    } catch (err) {
      await WorkflowEngine._failExecution(executionLog, `Graph error: ${err.message}`);
      return;
    }

    if (orderedNodes.length === 0) {
      await WorkflowEngine._failExecution(executionLog, "Workflow has no nodes");
      return;
    }

    // Shared context — data accumulates as nodes execute
    // Each node can read outputs from all previous nodes
    const context = {
      triggerData,
      data: { ...triggerData }, // flat map for {{variable}} access
    };

    // Initialize step logs
    executionLog.steps = orderedNodes.map((node) => ({
      nodeId: node.id,
      nodeType: node.type,
      status: "pending",
    }));
    await executionLog.save();

    // Execute each node in order
    for (let i = 0; i < orderedNodes.length; i++) {
      const node = orderedNodes[i];
      const step = executionLog.steps[i];

      logger.info(`[Engine] Executing node ${i + 1}/${orderedNodes.length}: ${node.type} (${node.id})`);

      step.status = "running";
      step.startedAt = new Date();
      await executionLog.save();

      const NodeClass = NODE_REGISTRY[node.type];
      if (!NodeClass) {
        step.status = "failed";
        step.error = `Unknown node type: ${node.type}`;
        step.finishedAt = new Date();
        await WorkflowEngine._failExecution(executionLog, step.error);
        return;
      }

      try {
        const result = await NodeClass.execute(node.data || {}, context);

        step.status = "success";
        step.output = result.output;
        step.finishedAt = new Date();
        step.durationMs = step.finishedAt - step.startedAt;

        // Merge this node's output into context for next nodes
        // Accessible as {{nodeId.field}} and also flat as {{field}} (last-write-wins)
        if (result.output && typeof result.output === "object") {
          context.data = {
            ...context.data,
            ...result.output,              // flat access: {{response}} {{status}}
            [node.id]: result.output,      // namespaced: {{nodeId.field}}
          };
        }

        logger.info(`[Engine] Node ${node.type} ✓ — ${result.message}`);
      } catch (err) {
        step.status = "failed";
        step.error = err.message;
        step.finishedAt = new Date();
        step.durationMs = step.finishedAt - step.startedAt;

        logger.error(`[Engine] Node ${node.type} ✗ — ${err.message}`);

        await WorkflowEngine._failExecution(executionLog, `Node "${node.type}" failed: ${err.message}`);
        return;
      }

      await executionLog.save();
    }

    // All nodes passed
    executionLog.status = "success";
    executionLog.finishedAt = new Date();
    executionLog.durationMs = executionLog.finishedAt - executionLog.startedAt;
    await executionLog.save();

    // Update workflow stats
    await Workflow.findByIdAndUpdate(workflowId, {
      $inc: { executionCount: 1 },
      lastExecutedAt: new Date(),
    });

    logger.info(`[Engine] Execution ${executionId} completed successfully in ${executionLog.durationMs}ms`);
  }

  /**
   * Topological sort (Kahn's algorithm) — determines execution order.
   * For simple linear flows: Webhook → Delay → Email
   * Also handles branching if you add it later.
   */
  static _buildExecutionOrder(nodes, edges) {
    if (!nodes || nodes.length === 0) return [];

    // Build adjacency map and in-degree count
    const inDegree = {};
    const adjacency = {};

    for (const node of nodes) {
      inDegree[node.id] = 0;
      adjacency[node.id] = [];
    }

    for (const edge of edges) {
      adjacency[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }

    // Start with nodes that have no incoming edges (triggers)
    const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
    const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const order = [];

    while (queue.length > 0) {
      const currentId = queue.shift();
      order.push(nodeMap[currentId]);

      for (const neighborId of adjacency[currentId]) {
        inDegree[neighborId]--;
        if (inDegree[neighborId] === 0) {
          queue.push(neighborId);
        }
      }
    }

    if (order.length !== nodes.length) {
      throw new Error("Workflow graph contains a cycle — cannot execute");
    }

    return order;
  }

  static async _failExecution(executionLog, errorMessage) {
    executionLog.status = "failed";
    executionLog.error = errorMessage;
    executionLog.finishedAt = new Date();
    if (executionLog.startedAt) {
      executionLog.durationMs = executionLog.finishedAt - executionLog.startedAt;
    }
    await executionLog.save();
    logger.error(`[Engine] Execution ${executionLog._id} failed: ${errorMessage}`);
  }
}

module.exports = WorkflowEngine;