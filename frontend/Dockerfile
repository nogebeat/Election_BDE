FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 5173 5174 5175

# Start Vite dev server and expose it to the network
CMD ["npm", "run", "dev", "--", "--host"]
