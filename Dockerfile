# Use Node.js 20 Alpine for small image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY server.js index.html ./

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && \
    chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose application port
EXPOSE 3000

# Health check - verify server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node", "server.js"]
