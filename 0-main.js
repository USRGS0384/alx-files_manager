import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive()); // Should return true after successful connection
    console.log(await redisClient.get('myKey')); // Should return null initially
    await redisClient.set('myKey', 12, 5); // Sets a key with expiration
    console.log(await redisClient.get('myKey')); // Should return 12

    setTimeout(async () => {
        console.log(await redisClient.get('myKey')); // Should return null after expiration
    }, 1000 * 10); // Wait 10 seconds
})();

