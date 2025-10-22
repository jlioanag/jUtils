# Use a small base image with Node.js
FROM node:lts-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set pnpm environment variables
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Set working directory inside container
WORKDIR /app

# Copy package definition files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy all source files to container
COPY . .

# Expose port if needed (optional)
EXPOSE 3000

# Start the bot
CMD ["pnpm", "start"]
