# Development Commands

Comprehensive guide to commands for developing the E-commerce Shopping Cart application.

## Quick Reference

### Complete Setup

```bash
# Automated setup (recommended)
./setup.sh

# Manual setup
./vendor/bin/sail up -d
./vendor/bin/sail composer install
./vendor/bin/sail npm install
cp .env.example .env
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail npm run build
```

---

## Docker & Sail Commands

### Container Management

```bash
# Start all containers
./vendor/bin/sail up -d

# Start with logs
./vendor/bin/sail up

# Stop containers
./vendor/bin/sail down

# Stop and remove volumes (fresh start)
./vendor/bin/sail down -v

# Restart containers
./vendor/bin/sail restart

# View running containers
./vendor/bin/sail ps

# View container logs
./vendor/bin/sail logs -f

# Access container shell
./vendor/bin/sail shell

# Access MySQL shell
./vendor/bin/sail mysql

# Access Redis CLI
./vendor/bin/sail redis
```

### Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Application | http://localhost:8000 | Main application |
| Mailpit | http://localhost:8026 | Email testing |
| Vite Dev Server | http://localhost:5173 | Hot reload (dev mode) |
| MySQL | localhost:3306 | Database |
| Redis | localhost:6379 | Cache & Queue |

---

## Laravel Artisan Commands

### Database

```bash
# Run migrations
./vendor/bin/sail artisan migrate

# Rollback last migration
./vendor/bin/sail artisan migrate:rollback

# Fresh migration (drops all tables)
./vendor/bin/sail artisan migrate:fresh

# Fresh with seeding
./vendor/bin/sail artisan migrate:fresh --seed

# Run seeders
./vendor/bin/sail artisan db:seed

# Specific seeder
./vendor/bin/sail artisan db:seed --class=ProductSeeder
```

### Cache Management

```bash
# Clear all caches
./vendor/bin/sail artisan optimize:clear

# Individual cache clears
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan route:clear
./vendor/bin/sail artisan view:clear

# Build optimized cache (production)
./vendor/bin/sail artisan optimize
```

### Development

```bash
# Start development servers (queue + NPM dev)
./vendor/bin/sail composer dev

# Generate app key
./vendor/bin/sail artisan key:generate

# Create storage link
./vendor/bin/sail artisan storage:link

# View routes
./vendor/bin/sail artisan route:list

# Interactive shell (Tinker)
./vendor/bin/sail artisan tinker

# View scheduled tasks
./vendor/bin/sail artisan schedule:list

# Run scheduled tasks manually
./vendor/bin/sail artisan schedule:run

# Create new controller
./vendor/bin/sail artisan make:controller ProductController

# Create new model with migration
./vendor/bin/sail artisan make:model Product -m

# Create factory
./vendor/bin/sail artisan make:factory ProductFactory

# Create seeder
./vendor/bin/sail artisan make:seeder ProductSeeder

# Create request
./vendor/bin/sail artisan make:request StoreProductRequest

# Create mail class
./vendor/bin/sail artisan make:mail OrderConfirmation

# Create job
./vendor/bin/sail artisan make:job ProcessOrder

# Create command
./vendor/bin/sail artisan make:command SendDailyReport
```

### Queue Management

```bash
# Start queue worker
./vendor/bin/sail artisan queue:work

# Process one job
./vendor/bin/sail artisan queue:work --once

# Restart queue workers
./vendor/bin/sail artisan queue:restart

# List failed jobs
./vendor/bin/sail artisan queue:failed

# Retry failed job
./vendor/bin/sail artisan queue:retry <job-id>

# Retry all failed jobs
./vendor/bin/sail artisan queue:retry all

# Clear failed jobs
./vendor/bin/sail artisan queue:flush
```

### Email Testing

```bash
# Manually send daily sales report
./vendor/bin/sail artisan sales:daily-report
```

---

## NPM Commands

### Frontend Development

```bash
# Install dependencies
./vendor/bin/sail npm install

# Development mode with hot-reload
./vendor/bin/sail npm run dev

# Production build
./vendor/bin/sail npm run build

# Watch for changes
./vendor/bin/sail npm run watch
```

### Testing

```bash
# Run all tests
./vendor/bin/sail npm test

# Watch mode (re-runs on changes)
./vendor/bin/sail npm run test:watch

# Coverage report
./vendor/bin/sail npm run test:coverage

# Run specific test file
./vendor/bin/sail npm test -- formatters.test.js

# Update snapshots
./vendor/bin/sail npm test -- -u
```

---

## Composer Commands

### Dependency Management

```bash
# Install dependencies
./vendor/bin/sail composer install

# Update dependencies
./vendor/bin/sail composer update

# Add package
./vendor/bin/sail composer require vendor/package

# Add dev package
./vendor/bin/sail composer require --dev vendor/package

# Remove package
./vendor/bin/sail composer remove vendor/package

# Dump autoload
./vendor/bin/sail composer dump-autoload
```

### Custom Scripts

#### Quick Setup

```bash
# Full setup with quality checks
./vendor/bin/sail composer setup

# Quick setup without checks
./vendor/bin/sail composer setup:quick
```

#### Quality Assurance

```bash
# Complete QA pipeline (recommended)
./vendor/bin/sail composer qa:full

# Auto-fix issues
./vendor/bin/sail composer qa:fix

# Validate only (no fixes)
./vendor/bin/sail composer qa:validate

# All checks without auto-fix
./vendor/bin/sail composer quality
```

#### Code Style

```bash
# Check code style
./vendor/bin/sail composer pint:test

# Fix code style
./vendor/bin/sail composer pint
```

#### Static Analysis

```bash
# Run PHPStan
./vendor/bin/sail composer phpstan

# Generate baseline
./vendor/bin/sail composer phpstan:baseline
```

#### Code Quality

```bash
# Run PHPMD
./vendor/bin/sail composer phpmd

# Generate HTML report
./vendor/bin/sail composer phpmd:html
```

#### Refactoring

```bash
# Preview refactorings
./vendor/bin/sail composer rector

# Apply refactorings
./vendor/bin/sail composer rector:fix
```

#### Testing

```bash
# Run PHPUnit tests
./vendor/bin/sail composer test

# Run tests with coverage
./vendor/bin/sail artisan test --coverage

# Run specific test
./vendor/bin/sail artisan test --filter=CartControllerTest
```

#### Development

```bash
# Start dev servers (queue + npm dev)
./vendor/bin/sail composer dev
```

---

## Git Workflow

### Daily Development

```bash
# Start working
git checkout main
git pull origin main
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Before pushing
./vendor/bin/sail composer qa:full

# Push changes
git push origin feature/new-feature
```

### Code Quality Before Commit

```bash
# Auto-fix what can be fixed
./vendor/bin/sail composer qa:fix

# Check remaining issues
./vendor/bin/sail composer qa:validate

# Run tests
./vendor/bin/sail composer test
./vendor/bin/sail npm test

# If all pass, commit
git add .
git commit -m "your message"
```

---

## Stripe CLI Commands

### Setup

```bash
# Login
stripe login

# Check version
stripe --version

# Logout
stripe logout
```

### Webhook Testing

```bash
# Forward webhooks to local app
stripe listen --forward-to localhost:8000/stripe/webhook

# Forward with specific events
stripe listen \
  --forward-to localhost:8000/stripe/webhook \
  --events checkout.session.completed,payment_intent.succeeded

# Show webhook signing secret
stripe listen --print-secret
```

### Testing Payments

```bash
# Trigger test checkout session
stripe trigger checkout.session.completed

# Trigger payment intent
stripe trigger payment_intent.succeeded

# Trigger payment failure
stripe trigger payment_intent.payment_failed
```

### Logs

```bash
# View recent API requests
stripe logs tail

# Filter by specific event
stripe logs tail --filter-by-event checkout.session.completed
```

---

## Useful Development Aliases

Add to your shell profile (~/.zshrc or ~/.bashrc):

```bash
# Sail alias
alias sail='./vendor/bin/sail'

# Common commands
alias sail-up='./vendor/bin/sail up -d'
alias sail-down='./vendor/bin/sail down'
alias sail-logs='./vendor/bin/sail logs -f'
alias sail-shell='./vendor/bin/sail shell'
alias sail-mysql='./vendor/bin/sail mysql'

# Artisan shortcuts
alias artisan='./vendor/bin/sail artisan'
alias migrate='./vendor/bin/sail artisan migrate'
alias seed='./vendor/bin/sail artisan db:seed'
alias fresh='./vendor/bin/sail artisan migrate:fresh --seed'
alias tinker='./vendor/bin/sail artisan tinker'

# Testing
alias test='./vendor/bin/sail artisan test'
alias test-fe='./vendor/bin/sail npm test'

# Quality checks
alias qa='./vendor/bin/sail composer qa:full'
alias pint='./vendor/bin/sail composer pint'
alias phpstan='./vendor/bin/sail composer phpstan'

# NPM shortcuts
alias npm='./vendor/bin/sail npm'
alias dev='./vendor/bin/sail npm run dev'
alias build='./vendor/bin/sail npm run build'
```

After adding, reload shell:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

Then use:
```bash
sail up -d
artisan migrate
test
qa
```

---

## Environment Management

### Switching Environments

```bash
# Development
cp .env.example .env
./vendor/bin/sail artisan config:clear

# Testing
cp .env.testing.example .env.testing

# Production (don't copy, edit manually)
# Never commit production .env
```

### Environment Variables

**Critical variables:**

```env
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:...
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=ecommerce_cart

STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

ADMIN_EMAIL=eComAdmin@mailinator.com
```

---

## Troubleshooting Commands

### Permission Issues

```bash
# Fix storage permissions
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:$USER storage bootstrap/cache

# Or inside container
./vendor/bin/sail shell
chmod -R 775 storage bootstrap/cache
```

### Port Conflicts

```bash
# Check what's using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Issues

```bash
# Reset database
./vendor/bin/sail artisan migrate:fresh --seed

# Check database connection
./vendor/bin/sail mysql -e "SELECT 1"

# View tables
./vendor/bin/sail mysql -e "SHOW TABLES"
```

### Cache Issues

```bash
# Nuclear option - clear everything
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail composer dump-autoload
./vendor/bin/sail artisan config:cache
./vendor/bin/sail artisan route:cache
./vendor/bin/sail artisan view:cache
```

### Docker Issues

```bash
# Complete reset
./vendor/bin/sail down -v
docker system prune -f
./vendor/bin/sail build --no-cache
./vendor/bin/sail up -d
```

---

## Performance Optimization

### Production Optimizations

```bash
# Cache everything
./vendor/bin/sail artisan config:cache
./vendor/bin/sail artisan route:cache
./vendor/bin/sail artisan view:cache
./vendor/bin/sail artisan event:cache

# Optimize autoloader
./vendor/bin/sail composer install --optimize-autoloader --no-dev

# Build production assets
./vendor/bin/sail npm run build
```

### Development Performance

```bash
# Clear caches for faster development
./vendor/bin/sail artisan optimize:clear

# Use queue for background jobs
./vendor/bin/sail artisan queue:work
```

---

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Testing Documentation](TESTING.md)
- [Code Quality Tools](CODE_QUALITY.md)
- [Stripe Integration](STRIPE_INTEGRATION.md)
- [Troubleshooting](TROUBLESHOOTING.md)
