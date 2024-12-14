// 0-main.js
const redisClient = require('./utils/redis'); // Adjust path if needed

(async () => {
  console.log(await redisClient.isAlive()); // Check if Redis is alive

  console.log(await redisClient.get('myKey')); // Try to get a key (should be null)

  await redisClient.set('myKey', 12, 5); // Set a key with a value and expiration time
  console.log(await redisClient.get('myKey')); // Fetch the value just set (should be 12)

  setTimeout(async () => {
    console.log(await redisClient.get('myKey')); // Wait for the key to expire, then check again (should be null)
  }, 10000); // Wait for 10 seconds
})();

