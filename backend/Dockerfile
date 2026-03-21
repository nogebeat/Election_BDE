FROM node:20-alpine

WORKDIR /app

# Install dependencies separately to leverage Docker cache
RUN apk add --no-cache openssl
RUN npm install -g tsx
COPY package*.json ./
RUN npm install --no-fund --no-audit

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

# Run the app in development mode
CMD ["sh", "-c", "npx prisma db push && npm run dev"]
