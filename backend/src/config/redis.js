const Redis = require("ioredis");
const logger = require("../utils/logger");

const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL, {
    //  tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 10000,
  });

   client.on("connect", () => logger.info("Redis connected"));
  client.on("ready", () => logger.info("Redis ready"));
  client.on("error", (err) => logger.error(`Redis error: ${err.message}`));
  client.on("end", () => logger.error("Redis connection closed"));

  return client;
};

const redisConfig = {
  url: process.env.REDIS_URL,
  // tls: {},
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

module.exports = { createRedisClient, redisConfig };