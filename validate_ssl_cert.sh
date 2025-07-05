#!/bin/bash

# SSL Certificate Validation Script for NestConnect
# This script validates SSL certificates before domain setup

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_blue() {
    echo -e "${BLUE}[SSL]${NC} $1"
}

# Check if domain is provided
if [ $# -eq 0 ]; then
    print_error "Please provide your domain name"
    echo "Usage: ./validate_ssl_cert.sh yourdomain.com [cert_path] [key_path]"
    echo "Example: ./validate_ssl_cert.sh bhalothia.org"
    exit 1
fi

DOMAIN=$1
CERT_PATH=${2:-"/root/NestConnect/${DOMAIN}.cert"}
KEY_PATH=${3:-"/root/NestConnect/${DOMAIN}.key"}

print_blue "Validating SSL certificates for domain: $DOMAIN"
echo ""

# Check if certificate files exist
print_status "Checking certificate files..."
if [ ! -f "$CERT_PATH" ]; then
    print_error "Certificate file not found: $CERT_PATH"
    exit 1
fi

if [ ! -f "$KEY_PATH" ]; then
    print_error "Private key file not found: $KEY_PATH"
    exit 1
fi

print_status "✅ Certificate files found"

# Validate certificate format
print_status "Validating certificate format..."
if openssl x509 -in "$CERT_PATH" -text -noout > /dev/null 2>&1; then
    print_status "✅ Certificate format is valid"
else
    print_error "❌ Certificate format is invalid"
    exit 1
fi

# Validate private key format
print_status "Validating private key format..."
if openssl rsa -in "$KEY_PATH" -check -noout > /dev/null 2>&1; then
    print_status "✅ Private key format is valid"
else
    print_error "❌ Private key format is invalid"
    exit 1
fi

# Check if certificate and private key match
print_status "Checking certificate and private key match..."
CERT_MODULUS=$(openssl x509 -in "$CERT_PATH" -modulus -noout | openssl md5)
KEY_MODULUS=$(openssl rsa -in "$KEY_PATH" -modulus -noout | openssl md5)

if [ "$CERT_MODULUS" = "$KEY_MODULUS" ]; then
    print_status "✅ Certificate and private key match"
else
    print_error "❌ Certificate and private key do not match"
    exit 1
fi

# Check certificate expiration
print_status "Checking certificate expiration..."
EXPIRY_DATE=$(openssl x509 -in "$CERT_PATH" -enddate -noout | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))

if [ $DAYS_LEFT -gt 0 ]; then
    print_status "✅ Certificate expires in $DAYS_LEFT days"
    if [ $DAYS_LEFT -lt 30 ]; then
        print_warning "⚠️  Certificate expires soon (less than 30 days)"
    fi
else
    print_error "❌ Certificate has expired"
    exit 1
fi

# Check certificate subject and SAN
print_status "Checking certificate subject and SAN..."
CERT_SUBJECT=$(openssl x509 -in "$CERT_PATH" -subject -noout | sed 's/subject=//')
CERT_SAN=$(openssl x509 -in "$CERT_PATH" -text -noout | grep -A1 "Subject Alternative Name" | tail -n1)

print_status "Certificate Subject: $CERT_SUBJECT"
if [ ! -z "$CERT_SAN" ]; then
    print_status "Subject Alternative Names: $CERT_SAN"
fi

# Check if domain is covered by certificate
if echo "$CERT_SUBJECT" | grep -q "$DOMAIN" || echo "$CERT_SAN" | grep -q "$DOMAIN"; then
    print_status "✅ Certificate covers domain: $DOMAIN"
else
    print_warning "⚠️  Certificate may not cover domain: $DOMAIN"
fi

# Check if www subdomain is covered
if echo "$CERT_SAN" | grep -q "www.$DOMAIN"; then
    print_status "✅ Certificate covers www subdomain: www.$DOMAIN"
else
    print_warning "⚠️  Certificate may not cover www subdomain: www.$DOMAIN"
fi

# Check certificate strength
print_status "Checking certificate strength..."
CERT_BITS=$(openssl x509 -in "$CERT_PATH" -text -noout | grep "Public-Key:" | awk '{print $2}')

if [ ! -z "$CERT_BITS" ]; then
    print_status "Certificate strength: $CERT_BITS bits"
    if [[ "$CERT_BITS" -ge 2048 ]]; then
        print_status "✅ Certificate strength is adequate (>= 2048 bits)"
    else
        print_warning "⚠️  Certificate strength is weak (< 2048 bits)"
    fi
fi

# Check certificate issuer
print_status "Checking certificate issuer..."
ISSUER=$(openssl x509 -in "$CERT_PATH" -issuer -noout | sed 's/issuer=//')
print_status "Certificate Issuer: $ISSUER"

# Test certificate with OpenSSL
print_status "Testing certificate with OpenSSL..."
if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    print_status "✅ Certificate is valid for domain: $DOMAIN"
else
    print_warning "⚠️  Certificate validation failed for domain: $DOMAIN"
    print_warning "This might be normal if DNS is not configured yet"
fi

echo ""
print_status "🎉 SSL certificate validation completed!"
echo ""
echo "Certificate Details:"
echo "  📄 Certificate: $CERT_PATH"
echo "  🔑 Private Key: $KEY_PATH"
echo "  🌐 Domain: $DOMAIN"
echo "  📅 Expires: $EXPIRY_DATE ($DAYS_LEFT days remaining)"
echo "  🔒 Strength: $CERT_BITS bits"
echo ""
print_status "Your SSL certificates are ready for domain setup!" 
