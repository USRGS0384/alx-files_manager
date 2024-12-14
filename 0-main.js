import redisClient from './utils/redis';

(async () => {
    // Wait until Redis is connected
    while (!redisClient.isAlive()) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms before retrying
    }

    console.log(redisClient.isAlive()); // Logs "true"

    console.log(await redisClient.get('myKey')); // Logs "null"

    await redisClient.set('myKey', 12, 5); // Set "myKey" to 12 with a 5-second expiration
    console.log(await redisClient.get('myKey')); // Logs "12"

    setTimeout(async () => {
        console.log(await redisClient.get('myKey')); // Logs "null" (key expired)
    }, 1000 * 10); // 10 seconds later
})();
