#!/bin/bash
echo "🔒 Setting up SSL certificates for linuxclub.tech..."

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Stop nginx temporarily
docker stop linuxclub_frontend 2>/dev/null || true

# Get SSL certificate
sudo certbot certonly --standalone \
    -d linuxclub.tech \
    -d www.linuxclub.tech \
    --email admin@linuxclub.tech \
    --agree-tos \
    --non-interactive

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/linuxclub.tech/fullchain.pem nginx/ssl/linuxclub.tech.crt
sudo cp /etc/letsencrypt/live/linuxclub.tech/privkey.pem nginx/ssl/linuxclub.tech.key

# Set proper permissions
sudo chown $(whoami):$(whoami) nginx/ssl/linuxclub.tech.*
chmod 644 nginx/ssl/linuxclub.tech.crt
chmod 600 nginx/ssl/linuxclub.tech.key

echo "✅ SSL certificates installed!"
