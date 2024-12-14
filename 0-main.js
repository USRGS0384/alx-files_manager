import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive()); // Should print: true if Redis is connected

    console.log(await redisClient.get('myKey')); // Should print: null (key doesn't exist)

    await redisClient.set('myKey', '12', 5); // Set key 'myKey' with value '12' for 5 seconds
    console.log(await redisClient.get('myKey')); // Should print: 12

    await redisClient.del('myKey'); // Delete 'myKey'
    console.log(await redisClient.get('myKey')); // Should print: null
})();

