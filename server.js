// server.js

import express from 'express';
import router from './routes/index.js';  // Adjust the path and add the .js extension

const app = express();
app.use(express.json());
app.use('/', router);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

