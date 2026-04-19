require("dotenv").config();
const Bull = require("bull");
const logger = require("../utils/logger");

const workflowQueue = new Bull(
  "workflow-execution",
  process.env.REDIS_URL,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  }
);

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