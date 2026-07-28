# Stage 1: Build Phase
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Generate Prisma Client & Build Applications
RUN npx prisma generate
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built artifacts and production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# Run compiled backend Express server
CMD ["node", "backend/dist/index.js"]
