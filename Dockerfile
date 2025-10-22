# Use a small base image with Node.js
FROM node:lts-alpine

# Set working directory inside container
WORKDIR /app

# Copy package definition files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source files to container
COPY . .

# Expose port if needed (optional)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
