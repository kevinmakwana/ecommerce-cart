#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 E-commerce Cart - Development Setup      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}❌ Stripe CLI not found!${NC}"
    echo ""
    echo -e "${YELLOW}📦 Installing Stripe CLI...${NC}"
    echo ""
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detected macOS - using Homebrew"
        brew install stripe/stripe-cli/stripe
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detected Linux - downloading latest release"
        wget -q https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
        tar -xzf stripe_linux_amd64.tar.gz
        sudo mv stripe /usr/local/bin/
        rm stripe_linux_amd64.tar.gz
        echo -e "${GREEN}✅ Stripe CLI installed!${NC}"
    else
        echo -e "${RED}Please install Stripe CLI manually:${NC}"
        echo "https://stripe.com/docs/stripe-cli#install"
        exit 1
    fi
    echo ""
fi

echo -e "${GREEN}✅ Stripe CLI is installed${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start Laravel Sail
echo -e "${BLUE}🐳 Starting Laravel Sail...${NC}"
./vendor/bin/sail up -d

echo ""
echo -e "${BLUE}⏳ Waiting for containers to be ready...${NC}"
sleep 5
echo ""

echo -e "${GREEN}✅ Laravel application is running${NC}"
echo ""

# Check if Stripe is logged in
if ! stripe config --list &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Stripe...${NC}"
    stripe login
    echo ""
fi

echo -e "${GREEN}✅ Logged in to Stripe${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}    Application URLs${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Application:${NC}  http://localhost:8000"
echo -e "${GREEN}📧 Mailpit:${NC}      http://localhost:8026"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}    Test Credentials${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}📧 Email:${NC}     testeComUser@mailinator.com"
echo -e "${GREEN}🔑 Password:${NC}  password"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}    Stripe Test Card${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}💳 Card:${NC}     4242 4242 4242 4242"
echo -e "${GREEN}📅 Expiry:${NC}   12/30"
echo -e "${GREEN}🔒 CVC:${NC}      123"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🔔 Starting Stripe Webhook Listener...${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${RED}📝 IMPORTANT:${NC} Copy the webhook secret below and add it to your .env file"
echo -e "${RED}   Look for: ${GREEN}whsec_...${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Start Stripe webhook forwarding
stripe listen --forward-to localhost:8000/stripe/webhook
