import redisClient from './utils/redis';

(async () => {
    try {
        console.log(redisClient.isAlive()); // Should return true if Redis connection is live

        console.log(await redisClient.get('myKey')); // Should initially return null

        await redisClient.set('myKey', 12, 5); // Set 'myKey' with value 12 and expiry of 5 seconds
        console.log(await redisClient.get('myKey')); // Should return '12'

        setTimeout(async () => {
            console.log(await redisClient.get('myKey')); // Should return null after 10 seconds
        }, 1000 * 10);
    } catch (err) {
        console.error(`Unhandled error: ${err.message}`);
    }
})();

