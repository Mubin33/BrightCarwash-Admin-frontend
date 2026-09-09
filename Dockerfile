# Base image
FROM node:24-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port on which Next.js runs
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
