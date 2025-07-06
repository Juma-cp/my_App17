# Base image
FROM node:18-bullseye-slim

# Set environment variables
ENV NODE_ENV=production
ENV HIPAA_COMPLIANT=true
ENV PORT=443

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Set up SSL
RUN mkdir ssl
COPY ssl/atis.key ssl/
COPY ssl/atis.crt ssl/
COPY ssl/ca_bundle.crt ssl/

# Security hardening
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN chown -R node:node .
USER node

# Start the server
CMD [ "node", "server.js" ]
