#!/bin/bash

# Generate private key
openssl genrsa -out atis.key 4096

# Create CSR
openssl req -new -key atis.key -out atis.csr \
  -subj "/C=US/ST=California/L=San Francisco/O=AddictionTracker/CN=atis.health"

# Generate self-signed cert (replace with real CA in production)
openssl x509 -req -days 365 -in atis.csr -signkey atis.key -out atis.crt

# Create CA bundle
cat atis.crt > ca_bundle.crt

# Set permissions
chmod 400 atis.key
chmod 444 atis.crt ca_bundle.crt

echo "SSL certificates generated. Move to ssl/ directory."
