import redisClient from './utils/redis';

(async () => {
    console.log(await redisClient.isAlive());  // Check if Redis is alive
    console.log(await redisClient.get('myKey'));  // Get value for 'myKey'

    // Set value with expiration time (5 seconds)
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));  // Get value after setting

    // Wait for 10 seconds and check again
    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));  // Should return null after expiration
    }, 1000 * 10);  // 10 seconds delay
})();

