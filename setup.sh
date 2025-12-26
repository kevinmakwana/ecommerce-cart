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

# Step 1: Check if vendor/bin/sail exists
echo -e "${BLUE}📦 Step 1/10: Checking dependencies...${NC}"
if [ ! -f ./vendor/bin/sail ]; then
    echo -e "${YELLOW}⚠️  Sail not found. Installing Composer dependencies first...${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker Desktop and try again.${NC}"
        exit 1
    fi
    
    # Install dependencies using Docker directly
    docker run --rm \
        -u "$(id -u):$(id -g)" \
        -v "$(pwd):/var/www/html" \
        -w /var/www/html \
        laravelsail/php84-composer:latest \
        composer install --ignore-platform-reqs
    
    echo -e "${GREEN}✅ Composer dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Sail already available${NC}"
fi
echo ""

# Step 2: Setup environment (before starting containers)
echo -e "${BLUE}⚙️  Step 2/10: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    
    # Configure database for MySQL (Sail default)
    echo -e "${YELLOW}🔧 Configuring MySQL database...${NC}"
    
    # Update database configuration
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires -i with extension
        sed -i '' 's/DB_CONNECTION=sqlite/DB_CONNECTION=mysql/' .env
        sed -i '' 's/# DB_HOST=127.0.0.1/DB_HOST=mysql/' .env
        sed -i '' 's/# DB_PORT=3306/DB_PORT=3306/' .env
        sed -i '' 's/# DB_DATABASE=laravel/DB_DATABASE=ecommerce_cart/' .env
        sed -i '' 's/# DB_USERNAME=root/DB_USERNAME=sail/' .env
        sed -i '' 's/# DB_PASSWORD=/DB_PASSWORD=password/' .env
        
        # Update Redis configuration for Sail
        sed -i '' 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/' .env
        
        # Update Mail configuration for Mailpit
        sed -i '' 's/MAIL_MAILER=log/MAIL_MAILER=smtp/' .env
        sed -i '' 's/MAIL_HOST=127.0.0.1/MAIL_HOST=mailpit/' .env
        sed -i '' 's/MAIL_PORT=2525/MAIL_PORT=1025/' .env
        
        # Update Cache and Queue to use Redis
        sed -i '' 's/CACHE_STORE=database/CACHE_STORE=redis/' .env
        sed -i '' 's/QUEUE_CONNECTION=database/QUEUE_CONNECTION=redis/' .env
        
        # Add APP_PORT if not exists
        if ! grep -q "APP_PORT" .env; then
            echo "" >> .env
            echo "APP_PORT=8000" >> .env
        fi
    else
        # Linux sed syntax
        sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=mysql/' .env
        sed -i 's/# DB_HOST=127.0.0.1/DB_HOST=mysql/' .env
        sed -i 's/# DB_PORT=3306/DB_PORT=3306/' .env
        sed -i 's/# DB_DATABASE=laravel/DB_DATABASE=ecommerce_cart/' .env
        sed -i 's/# DB_USERNAME=root/DB_USERNAME=sail/' .env
        sed -i 's/# DB_PASSWORD=/DB_PASSWORD=password/' .env
        
        # Update Redis configuration for Sail
        sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/' .env
        
        # Update Mail configuration for Mailpit
        sed -i 's/MAIL_MAILER=log/MAIL_MAILER=smtp/' .env
        sed -i 's/MAIL_HOST=127.0.0.1/MAIL_HOST=mailpit/' .env
        sed -i 's/MAIL_PORT=2525/MAIL_PORT=1025/' .env
        
        # Update Cache and Queue to use Redis
        sed -i 's/CACHE_STORE=database/CACHE_STORE=redis/' .env
        sed -i 's/QUEUE_CONNECTION=database/QUEUE_CONNECTION=redis/' .env
        
        # Add APP_PORT if not exists
        if ! grep -q "APP_PORT" .env; then
            echo "" >> .env
            echo "APP_PORT=8000" >> .env
        fi
    fi
    
    echo -e "${GREEN}✅ Environment configured for Docker${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping configuration${NC}"
fi
echo ""

# Step 3: Start Docker containers
echo -e "${BLUE}🐳 Step 3/10: Starting Docker containers...${NC}"
./vendor/bin/sail up -d
echo -e "${GREEN}✅ Docker containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Step 4: Generate application key
echo -e "${BLUE}🔑 Step 4/10: Generating application key...${NC}"
./vendor/bin/sail artisan key:generate --ansi
echo -e "${GREEN}✅ Application key generated${NC}"
echo ""

# Step 5: Run migrations and seeders
echo -e "${BLUE}🗄️  Step 5/10: Running database migrations and seeders...${NC}"
./vendor/bin/sail artisan migrate:fresh --seed --force
echo -e "${GREEN}✅ Database setup complete${NC}"
echo ""

# Step 6: Install NPM dependencies
echo -e "${BLUE}📦 Step 6/10: Installing NPM dependencies...${NC}"
./vendor/bin/sail npm install
echo -e "${GREEN}✅ NPM dependencies installed${NC}"
echo ""

# Step 7: Build frontend assets
echo -e "${BLUE}🎨 Step 7/10: Building frontend assets...${NC}"
./vendor/bin/sail npm run build
echo -e "${GREEN}✅ Frontend assets built${NC}"
echo ""

# Step 8: Run code quality checks
echo -e "${BLUE}🔍 Step 8/10: Running code quality checks...${NC}"
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

# Step 9: Run backend tests
echo -e "${BLUE}🧪 Step 9/10: Running backend tests (PHPUnit)...${NC}"
./vendor/bin/sail composer test
echo -e "${GREEN}✅ Backend tests passed${NC}"
echo ""

# Step 10: Run frontend tests
echo -e "${BLUE}🧪 Step 10/10: Running frontend tests (Jest)...${NC}"
./vendor/bin/sail npm test
echo -e "${GREEN}✅ Frontend tests passed${NC}"
echo ""

# Optional: Setup Stripe CLI
echo -e "${BLUE}💳 Optional: Setting up Stripe CLI...${NC}"
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
