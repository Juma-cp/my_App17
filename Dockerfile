# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install backend dependencies
RUN if [ -f "package.json" ]; then npm install; fi

# Optional frontend build
RUN if [ -d "client" ] && [ -f "client/package.json" ]; then \
    cd client && npm install && npm run build && cd .. && \
    mkdir -p server/public && cp -r client/build/* server/public/ ; \
fi

# Set working directory to backend if it exists
WORKDIR /app/server

# Install backend dependencies (again if using /server)
RUN if [ -f "package.json" ]; then npm install; fi

# Expose port (change if your backend uses another)
EXPOSE 5000

# Run backend
CMD ["npm", "start"]
