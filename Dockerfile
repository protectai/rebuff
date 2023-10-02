# Dockerfile
# Use an official Node.js runtime as the parent image
FROM node:18

# Copy the monorepo
COPY . /app

# Set the working directory in the container to /app/server
WORKDIR /app/

# Install any needed packages specified in package.json
RUN npm install

# The app is served by Next.js on port 3000, so expose this port
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "run", "dev", "--workspace=server"]
