# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start:dev"]
