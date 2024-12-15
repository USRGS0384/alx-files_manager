// 1-main.js
import dbClient from './utils/db';

const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const maxAttempts = 10; // Limit the number of retries

    const repeatFct = async () => {
      if (i >= maxAttempts) {
        reject(new Error('Failed to connect after multiple attempts'));
        return;
      }

      await setTimeout(() => {
        i += 1;
        if (!dbClient.isAlive()) {
          repeatFct();  // Retry connection check
        } else {
          resolve();  // Successfully connected
        }
      }, 1000);
    };

    repeatFct();
  });
};

(async () => {
  console.log(dbClient.isAlive());  // Output initial connection status (false at first)
  await waitConnection();  // Wait until connection is successful
  console.log(dbClient.isAlive());  // Output final connection status (true after retry)
  console.log(await dbClient.nbUsers());  // Output number of users (e.g., 4)
  console.log(await dbClient.nbFiles());  // Output number of files (e.g., 30)
})();

