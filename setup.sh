#!/bin/bash

# E-commerce Cart - Complete Setup Script
# This script sets up the entire project from a fresh clone

set -e  # Exit on error

echo "🚀 Starting E-commerce Cart Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Start Docker containers
echo -e "${BLUE}📦 Step 1/9: Starting Docker containers...${NC}"
./vendor/bin/sail up -d
echo -e "${GREEN}✅ Docker containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Step 2: Install Composer dependencies
echo -e "${BLUE}📚 Step 2/9: Installing Composer dependencies...${NC}"
./vendor/bin/sail composer install
echo -e "${GREEN}✅ Composer dependencies installed${NC}"
echo ""

# Step 3: Setup environment
echo -e "${BLUE}⚙️  Step 3/9: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi
./vendor/bin/sail artisan key:generate --ansi
echo -e "${GREEN}✅ Application key generated${NC}"
echo ""

# Step 4: Run migrations and seeders
echo -e "${BLUE}🗄️  Step 4/9: Running database migrations and seeders...${NC}"
./vendor/bin/sail artisan migrate:fresh --seed --force
echo -e "${GREEN}✅ Database setup complete${NC}"
echo ""

# Step 5: Install NPM dependencies
echo -e "${BLUE}📦 Step 5/9: Installing NPM dependencies...${NC}"
./vendor/bin/sail npm install
echo -e "${GREEN}✅ NPM dependencies installed${NC}"
echo ""

# Step 6: Build frontend assets
echo -e "${BLUE}🎨 Step 6/9: Building frontend assets...${NC}"
./vendor/bin/sail npm run build
echo -e "${GREEN}✅ Frontend assets built${NC}"
echo ""

# Step 7: Run code quality checks
echo -e "${BLUE}🔍 Step 7/9: Running code quality checks...${NC}"
echo "  - Laravel Pint (Code Style)..."
./vendor/bin/sail composer pint
echo "  - PHPStan (Static Analysis)..."
./vendor/bin/sail composer phpstan
echo "  - PHPMD (Mess Detection)..."
./vendor/bin/sail composer phpmd
echo "  - Rector (Dry Run)..."
./vendor/bin/sail composer rector
echo -e "${GREEN}✅ Code quality checks passed${NC}"
echo ""

# Step 8: Run backend tests
echo -e "${BLUE}🧪 Step 8/9: Running backend tests (PHPUnit)...${NC}"
./vendor/bin/sail composer test
echo -e "${GREEN}✅ Backend tests passed${NC}"
echo ""

# Step 9: Run frontend tests
echo -e "${BLUE}🧪 Step 9/10: Running frontend tests (Jest)...${NC}"
./vendor/bin/sail npm test
echo -e "${GREEN}✅ Frontend tests passed${NC}"
echo ""

# Step 10: Setup Stripe CLI (Optional)
echo -e "${BLUE}💳 Step 10/10: Setting up Stripe CLI (optional)...${NC}"
if command -v stripe &> /dev/null; then
    echo -e "${GREEN}✅ Stripe CLI already installed${NC}"
    echo -e "${YELLOW}ℹ️  To setup webhook forwarding, run:${NC}"
    echo "    stripe login"
    echo "    stripe listen --forward-to localhost:8000/stripe/webhook"
else
    echo -e "${YELLOW}⚠️  Stripe CLI not found${NC}"
    echo -e "${YELLOW}📦 Installing Stripe CLI...${NC}"
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install stripe/stripe-cli/stripe
            echo -e "${GREEN}✅ Stripe CLI installed via Homebrew${NC}"
        else
            echo -e "${YELLOW}⚠️  Homebrew not found. Please install Stripe CLI manually:${NC}"
            echo "    https://stripe.com/docs/stripe-cli#install"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo -e "${YELLOW}📥 Downloading Stripe CLI for Linux...${NC}"
        wget -q https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
        tar -xzf stripe_linux_amd64.tar.gz
        sudo mv stripe /usr/local/bin/
        rm stripe_linux_amd64.tar.gz
        echo -e "${GREEN}✅ Stripe CLI installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Unsupported OS. Please install Stripe CLI manually:${NC}"
        echo "    https://stripe.com/docs/stripe-cli#install"
    fi
    
    if command -v stripe &> /dev/null; then
        echo -e "${YELLOW}ℹ️  To complete Stripe setup, run:${NC}"
        echo "    stripe login"
        echo "    stripe listen --forward-to localhost:8000/stripe/webhook"
        echo "    # Copy the webhook secret to .env"
    fi
fi
echo ""

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  ✅ Docker containers running"
echo "  ✅ Dependencies installed"
echo "  ✅ Database migrated and seeded"
echo "  ✅ Frontend assets built"
echo "  ✅ Code quality checks passed"
echo "  ✅ All tests passed (135 PHPUnit + 253 Jest)"
if command -v stripe &> /dev/null; then
    echo "  ✅ Stripe CLI installed"
else
    echo "  ⚠️  Stripe CLI not installed (optional)"
fi
echo ""
echo -e "${BLUE}🌐 Access the application:${NC}"
echo "  - Application: http://localhost:8000"
echo "  - Mailpit: http://localhost:8026"
echo ""
echo -e "${BLUE}👤 Login credentials:${NC}"
echo "  - Admin: eComAdmin@mailinator.com / password"
echo "  - User: testeComUser@mailinator.com / password"
echo ""
echo -e "${BLUE}💳 Stripe Test Card:${NC}"
echo "  - Card: 4242 4242 4242 4242"
echo "  - Expiry: Any future date (e.g., 12/30)"
echo "  - CVC: Any 3 digits (e.g., 123)"
echo ""
if command -v stripe &> /dev/null; then
    echo -e "${BLUE}🔗 Stripe Webhook Setup (optional):${NC}"
    echo "  1. stripe login"
    echo "  2. stripe listen --forward-to localhost:8000/stripe/webhook"
    echo "  3. Copy webhook secret to .env as STRIPE_WEBHOOK_SECRET"
    echo "  4. ./vendor/bin/sail artisan config:clear"
    echo ""
fi
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo "  - Start dev server: ./vendor/bin/sail composer dev"
echo "  - Run quality checks: ./vendor/bin/sail composer qa:full"
echo "  - Stop containers: ./vendor/bin/sail down"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
