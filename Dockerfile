# Use the official Node.js LTS image
FROM node:23-slim

# Set the working directory
WORKDIR /app

# Copy the entire dist directory
COPY dist ./dist

# Copy the .env file to the root of the container
# Comment this line if env variables will be automatically available inside the container using any secret manager directly
COPY .env .env 

# Install dependencies inside the dist folder
WORKDIR /app/dist
RUN npm install

# Run any pending migrations
RUN npm run migrate

# Start the application
CMD ["node", "index.js"]
