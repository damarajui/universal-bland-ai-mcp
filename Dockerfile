# 🚀 Universal Bland AI MCP - Production Docker Container
FROM node:18-alpine

# Set production environment
ENV NODE_ENV=production
ENV MCP_SERVER_PORT=3000
ENV LOG_LEVEL=info

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code and build files
COPY . .

# Build the TypeScript project
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bland-mcp -u 1001

# Set ownership of app directory
RUN chown -R bland-mcp:nodejs /app
USER bland-mcp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: process.env.MCP_SERVER_PORT || 3000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Expose port
EXPOSE 3000

# Start the MCP server
CMD ["node", "build/index.js"] 