const Bull = require("bull");
const { redisConfig } = require("../config/redis");
const logger = require("../utils/logger");

// Single queue for all workflow executions
const workflowQueue = new Bull("workflow-execution", {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,                     // retry up to 3 times on failure
    backoff: {
      type: "exponential",
      delay: 2000,                   // 2s, 4s, 8s
    },
    removeOnComplete: 50,            // keep last 50 completed jobs
    removeOnFail: 100,               // keep last 100 failed jobs
  },
});

workflowQueue.on("error", (err) => {
  logger.error(`[Queue] Error: ${err.message}`);
});

workflowQueue.on("failed", (job, err) => {
  logger.error(`[Queue] Job ${job.id} failed after ${job.attemptsMade} attempts: ${err.message}`);
});

workflowQueue.on("stalled", (job) => {
  logger.warn(`[Queue] Job ${job.id} stalled`);
});

/**
 * Add a workflow execution job to the queue.
 * @param {string} workflowId
 * @param {string} executionId  - pre-created ExecutionLog _id
 * @param {object} triggerData  - webhook payload
 */
const enqueueWorkflow = async (workflowId, executionId, triggerData = {}) => {
  const job = await workflowQueue.add(
    { workflowId, executionId, triggerData },
    { jobId: executionId } // use executionId as job ID for easy tracking
  );
  logger.info(`[Queue] Enqueued execution ${executionId} as job ${job.id}`);
  return job;
};

module.exports = { workflowQueue, enqueueWorkflow };