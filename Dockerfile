# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema
COPY backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy backend source code
COPY backend/src ./src/

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
