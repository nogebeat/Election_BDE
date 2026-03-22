FROM node:20-alpine

WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copie le reste du code
COPY . .

# Génère le client Prisma
RUN npx prisma generate

# Expose le port
EXPOSE 3001

# Démarre avec migration auto + serveur
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx index.ts"]
