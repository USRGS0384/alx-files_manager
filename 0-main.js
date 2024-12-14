import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive()); // Should log "true" if Redis is connected

    console.log(await redisClient.get('myKey')); // Should log "null" (key does not exist yet)

    await redisClient.set('myKey', 12, 5); // Set "myKey" to 12 with a 5-second expiration
    console.log(await redisClient.get('myKey')); // Should log "12"

    // Wait 10 seconds, after which the key will have expired
    setTimeout(async () => {
        console.log(await redisClient.get('myKey')); // Should log "null" (key expired)
    }, 1000 * 10);
})();

