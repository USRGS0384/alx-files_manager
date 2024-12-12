// main.js

import dbClient from './utils/db.js';

const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 10) {
          reject();
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });
};

(async () => {
  console.log('Connection alive:', dbClient.isAlive());
  await waitConnection();
  console.log('Connection alive after wait:', dbClient.isAlive());
  console.log('Number of users:', await dbClient.nbUsers());
  console.log('Number of files:', await dbClient.nbFiles());
})();

