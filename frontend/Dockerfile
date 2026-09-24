FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# The command is provided by docker-compose.yml for dev
CMD ["npm", "run", "dev"]
