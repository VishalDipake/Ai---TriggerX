const Redis = require("ioredis");
const logger = require("../utils/logger");

const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  client.on("connect", () => logger.info("Redis connected"));
  client.on("error", (err) => logger.error(`Redis error: ${err.message}`));

  return client;
};

const redisConfig = process.env.REDIS_URL;

module.exports = { createRedisClient, redisConfig };