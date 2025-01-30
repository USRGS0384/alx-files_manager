#!/bin/bash

# Set the Node.js environment (optional but highly recommended)
export NODE_ENV="development"  # Or "production" when deploying

# No need for cd since server.js is in the root directory

# Check if node_modules exists. If not, install dependencies.
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  if [ $? -ne 0 ]; then # Check for error after npm install
    echo "Error: npm install failed!"
    exit 1 # Exit with error code
  fi
fi

# Start the server using node or nodemon based on NODE_ENV
if [[ "$NODE_ENV" == "production" ]]; then
  echo "Starting server in production mode..."
  node server.js
elif [[ "$NODE_ENV" == "development" ]]; then # Explicitly check for development
  echo "Starting server in development mode..."
  nodemon server.js
else
  echo "NODE_ENV not set. Defaulting to development..."
  nodemon server.js # Default to nodemon if NODE_ENV isn't set
fi


# Alternative: Use npm start (Recommended)
# npm start

# Even better for production: Use a process manager like pm2
# (Install pm2 globally: npm install pm2 -g)
# pm2 start server.js --name "your-app-name"  # And then pm2 save to persist
# pm2 save
