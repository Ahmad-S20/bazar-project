# Start from a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Tell Docker this service uses port 3001
EXPOSE 3001

# Command to start the service
CMD ["node", "index.js"]