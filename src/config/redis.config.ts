import * as redis from "redis";

const redisClient = redis.createClient({
  host: process.env["REDIS_HOST"] || "localhost",
  port: process.env["REDIS_PORT"] || 6379,
});

export default redisClient;
