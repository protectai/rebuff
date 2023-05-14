# Dockerfile
# Use an official Node.js runtime as the parent image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY server/package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle the app source code inside the Docker image
COPY server/ .

# Build the project
RUN npm run build

# The app is served by Next.js on port 3000, so expose this port
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
