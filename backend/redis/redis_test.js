import { createClient } from "redis";

const redis = createClient({
  url: "redis://localhost:6379"
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

await redis.connect();
console.log("Connected to Redis");

console.log(await redis.get('name'));