#!/bin/bash

# Generate self-signed certificates for local HTTPS development
echo "🔒 Setting up HTTPS for local development..."

# Create certificates directory
mkdir -p certs

# Generate private key
openssl genrsa -out certs/key.pem 2048

# Generate certificate
openssl req -new -x509 -key certs/key.pem -out certs/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✅ Certificates generated!"
echo ""
echo "🚀 To run with HTTPS, use one of these commands:"
echo ""
echo "Option 1 - Using http-server:"
echo "npx http-server -S -C certs/cert.pem -K certs/key.pem -p 8080"
echo ""
echo "Option 2 - Using serve:"
echo "npx serve -s . --ssl-cert certs/cert.pem --ssl-key certs/key.pem"
echo ""
echo "Option 3 - Modify next.config.js for Next.js HTTPS:"
echo "Add HTTPS configuration to your Next.js setup"
echo ""
echo "⚠️  You'll need to accept the self-signed certificate in your browser"
echo "📝 Access your app at: https://localhost:3000 (or your configured port)"
