# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Build NestJS
RUN npm run build

# Expose the port your Nest app listens on
EXPOSE 8080

# Start the app
CMD ["npm", "run", "start:dev"]
