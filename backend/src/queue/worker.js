require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const { workflowQueue } = require("./workflow.queue");
const WorkflowEngine = require("../engine/WorkflowEngine");
const logger = require("../utils/logger");

// Worker runs as a SEPARATE PROCESS: `node src/queue/worker.js`
// It connects to the same Redis queue and processes jobs

const startWorker = async () => {
  await connectDB();
  logger.info("[Worker] Started — waiting for jobs...");

  workflowQueue.process(
    3, // concurrency: process up to 3 jobs simultaneously
    async (job) => {
      const { workflowId, executionId, triggerData } = job.data;

      logger.info(`[Worker] Processing job ${job.id} | execution: ${executionId}`);

      try {
        await WorkflowEngine.execute(workflowId, executionId, triggerData);
        logger.info(`[Worker] Job ${job.id} completed`);
      } catch (err) {
        logger.error(`[Worker] Job ${job.id} threw: ${err.message}`);
        throw err; // re-throw so Bull marks it as failed and retries
      }
    }
  );

  workflowQueue.on("completed", (job) => {
    logger.info(`[Worker] ✓ Job ${job.id} done`);
  });

  workflowQueue.on("failed", (job, err) => {
    logger.error(`[Worker] ✗ Job ${job.id} failed: ${err.message}`);
  });
};

startWorker().catch((err) => {
  logger.error(`[Worker] Fatal startup error: ${err.message}`);
  process.exit(1);
});