# Installation Guide

Complete setup instructions for the E-commerce Shopping Cart application.

## Prerequisites

- **Docker Desktop** - Required for running the application
- **Git** - For cloning the repository

Optional (for webhook testing):
- **Stripe CLI** - Automatically installed by setup script

## Automated Setup (Recommended)

### One-Command Installation

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-cart

# Run automated setup script
./setup.sh
```

### What the Setup Script Does

The automated setup script performs the following 10 steps:

1. **📦 Starts Docker containers** - Brings up all services (MySQL, Redis, Mailpit)
2. **📚 Installs Composer dependencies** - All PHP packages including dev tools
3. **⚙️ Sets up environment** - Creates `.env` file and generates application key
4. **🗄️ Database setup** - Runs `migrate:fresh --seed` to create tables and sample data
5. **📦 Installs NPM dependencies** - All frontend packages and testing libraries
6. **🎨 Builds frontend assets** - Production build with Vite
7. **🔍 Code quality checks** - Runs Pint, PHPStan, PHPMD, and Rector
8. **🧪 Backend tests** - Executes all 135 PHPUnit tests
9. **🧪 Frontend tests** - Executes all 253 Jest tests
10. **💳 Stripe CLI setup** - Automatically installs Stripe CLI (macOS/Linux)

**Total setup time:** 5-10 minutes

### Post-Installation

After setup completes, you'll have:

- ✅ Application running at http://localhost:8000
- ✅ Mailpit (email viewer) at http://localhost:8026
- ✅ Database with sample data:
  - Admin user: eComAdmin@mailinator.com / password
  - Test user: testeComUser@mailinator.com / password
  - 8 sample products with stock

---

## Manual Setup (Alternative)

If you prefer step-by-step installation:

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ecommerce-cart
```

### Step 2: Start Docker Containers

```bash
./vendor/bin/sail up -d
```

This starts:
- MySQL 8.4
- Redis 7
- Mailpit (for email testing)
- PHP 8.2 with Laravel 12

### Step 3: Install Dependencies

**Backend (Composer):**
```bash
./vendor/bin/sail composer install
```

**Frontend (NPM):**
```bash
./vendor/bin/sail npm install
```

### Step 4: Environment Configuration

**Create Environment File:**
```bash
cp .env.example .env
```

**Generate Application Key:**
```bash
./vendor/bin/sail artisan key:generate
```

**Environment Variables:**

The `.env` file comes pre-configured for Docker. Key variables:

```env
# Application
APP_NAME="E-commerce Cart"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (Docker)
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=ecommerce_cart
DB_USERNAME=sail
DB_PASSWORD=password

# Redis (Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# Mail (Mailpit - Docker)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025

# Admin Notifications
ADMIN_EMAIL=eComAdmin@mailinator.com

# Stripe Configuration (Get your keys from Stripe Dashboard)
STRIPE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 5: Database Setup

**Run Migrations and Seeders:**
```bash
./vendor/bin/sail artisan migrate:fresh --seed
```

This creates:
- All database tables
- Admin user with admin role
- Test user with user role
- 8 sample products
- Role and permission data

### Step 6: Build Frontend Assets

**Production Build:**
```bash
./vendor/bin/sail npm run build
```

**Development (with hot-reload):**
```bash
./vendor/bin/sail npm run dev
```

### Step 7: Verify Installation

**Run Tests:**
```bash
# Backend tests
./vendor/bin/sail composer test

# Frontend tests
./vendor/bin/sail npm test

# All quality checks
./vendor/bin/sail composer qa:full
```

---

## Docker Services

The application uses Laravel Sail which provides:

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **Laravel App** | 8000 | Main application |
| **MySQL** | 3306 | Database |
| **Redis** | 6379 | Cache & Queue |
| **Mailpit** | 8026 | Email testing |
| **Vite** | 5173 | Hot reload (dev) |

### Useful Commands

```bash
# Start all containers
./vendor/bin/sail up -d

# Stop all containers
./vendor/bin/sail down

# View logs
./vendor/bin/sail logs -f

# Access container shell
./vendor/bin/sail shell

# View running containers
./vendor/bin/sail ps

# Restart services
./vendor/bin/sail restart
```

---

## Stripe CLI Installation

The setup script automatically installs Stripe CLI. For manual installation:

### macOS

```bash
brew install stripe/stripe-cli/stripe
```

### Linux

```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xzf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
rm stripe_linux_amd64.tar.gz
```

### Windows

```bash
scoop install stripe
```

### Verify Installation

```bash
stripe --version
```

---

## Initial Configuration

### Storage Link

Create symbolic link for file storage:

```bash
./vendor/bin/sail artisan storage:link
```

### Queue Worker (Optional)

For background jobs:

```bash
./vendor/bin/sail artisan queue:work
```

Or use the dev command which starts queue automatically:

```bash
./vendor/bin/sail composer dev
```

### Scheduler (Optional)

For daily sales reports, add to crontab:

```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Troubleshooting Installation

### Port Conflicts

If port 8000 is already in use:

```bash
# Check what's using the port
lsof -i :8000

# Kill the process or change port in docker-compose.yml
```

### Docker Issues

```bash
# Stop and clean Docker
./vendor/bin/sail down
docker system prune -f

# Restart
./vendor/bin/sail up -d
```

### Permission Issues

```bash
# Fix storage permissions
./vendor/bin/sail artisan storage:link
sudo chmod -R 775 storage bootstrap/cache
```

### Database Connection Issues

```bash
# Wait for MySQL to be ready
./vendor/bin/sail up -d
sleep 10

# Then run migrations
./vendor/bin/sail artisan migrate:fresh --seed
```

---

## Next Steps

After installation:

1. **Access Application** - Visit http://localhost:8000
2. **Login** - Use admin or test user credentials
3. **Setup Stripe Webhooks** - See [Stripe Integration](STRIPE_INTEGRATION.md)
4. **Run Development Server** - `./vendor/bin/sail composer dev`
5. **Explore Features** - Browse products, add to cart, checkout

---

## Additional Resources

- [Development Commands](DEVELOPMENT.md)
- [Testing Documentation](TESTING.md)
- [Code Quality Tools](CODE_QUALITY.md)
- [Stripe Integration](STRIPE_INTEGRATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
