FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Build TypeScript
RUN npm run build

# Remove source and dev dependencies
RUN rm -rf src tsconfig.json && npm ci --production

EXPOSE 3001

CMD ["npm", "start"]
