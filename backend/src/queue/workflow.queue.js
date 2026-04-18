require("dotenv").config();
const Bull = require("bull");
const logger = require("../utils/logger");

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const workflowQueue = new Bull("workflow-execution", {
  redis: process.env.REDIS_URL
    ? { ...redisOptions, url: process.env.REDIS_URL }
    : { ...redisOptions, host: "127.0.0.1", port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

workflowQueue.on("error", (err) => {
  logger.error(`[Queue] Error: ${err.message}`);
});

workflowQueue.on("failed", (job, err) => {
  logger.error(`[Queue] Job ${job.id} failed: ${err.message}`);
});

const enqueueWorkflow = async (workflowId, executionId, triggerData = {}) => {
  const job = await workflowQueue.add(
    { workflowId, executionId, triggerData },
    { jobId: executionId }
  );
  logger.info(`[Queue] Enqueued execution ${executionId} as job ${job.id}`);
  return job;
};

module.exports = { workflowQueue, enqueueWorkflow };