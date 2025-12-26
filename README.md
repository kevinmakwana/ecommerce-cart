# E-commerce Shopping Cart

[![Tests](https://img.shields.io/badge/tests-388%20passing-brightgreen)]()
[![PHPUnit](https://img.shields.io/badge/PHPUnit-135%20tests-blue)]()
[![Jest](https://img.shields.io/badge/Jest-253%20tests-blue)]()
[![Code Quality](https://img.shields.io/badge/quality-0%20issues-brightgreen)]()
[![PHPStan](https://img.shields.io/badge/PHPStan-Level%206-blue)]()

A modern full-stack e-commerce application with Stripe payment integration, comprehensive testing suite, and automated code quality tools.

## ✨ Features

### Customer Features
- 🛍️ **Product Browsing** - Browse catalog with search and filtering
- 🛒 **Shopping Cart** - Add, update, and remove items with real-time stock validation
- 💳 **Stripe Checkout** - Secure payment processing via Stripe Checkout
- 📦 **Order History** - View past orders and order details
- 👤 **User Authentication** - Register, login, and profile management

### Admin Features
- 📊 **Order Management** - View, search, filter, and update all customer orders
- 🖨️ **Invoice Printing** - Generate and print professional invoices
- 📧 **Email Notifications** - Automated low stock alerts and daily sales reports
- 📈 **Order Status Tracking** - Manage order lifecycle (pending → processing → completed)
- 🔍 **Advanced Search** - Search orders by number, customer name, or email

### Developer Features
- ✅ **388 Tests** - Comprehensive test suite (135 PHPUnit + 253 Jest)
- 🔍 **Code Quality** - 4 automated tools (PHPStan, Pint, PHPMD, Rector)
- 🐳 **Docker** - Complete development environment with Laravel Sail
- 🚀 **Automated Setup** - One-command installation script
- 📚 **Documentation** - Comprehensive guides for all aspects

---

## 🚀 Quick Start

### Automated Setup (5-10 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-cart

# Run automated setup
./setup.sh
```

**Access the application:**
- **Application:** http://localhost:8000
- **Mailpit (emails):** http://localhost:8026
- **Admin Login:** eComAdmin@mailinator.com / password
- **Test User:** testeComUser@mailinator.com / password

### Manual Setup

See detailed instructions in [Installation Guide](docs/INSTALLATION.md).

---

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - PHP web application framework
- **MySQL 8.4** - Relational database
- **Redis 7** - Cache and queue driver
- **Stripe API** - Payment processing
- **Laravel Sail** - Docker development environment

### Frontend
- **React 19** - UI component library
- **Inertia.js 2** - Modern monolithic architecture
- **Vite** - Frontend build tool
- **Tailwind CSS 3** - Utility-first CSS framework

### Testing & Quality
- **PHPUnit** - Backend testing (135 tests, 428 assertions)
- **Jest** - Frontend testing (253 tests, 14 snapshots)
- **PHPStan** - Static analysis (Level 6, 0 errors)
- **Laravel Pint** - Code style fixer (PSR-12)
- **PHPMD** - Code quality detector (0 warnings)
- **Rector** - Automated refactoring (Laravel 12 patterns)

---

## 📖 Documentation

### Getting Started
- **[Installation Guide](docs/INSTALLATION.md)** - Complete setup instructions
- **[Development Commands](docs/DEVELOPMENT.md)** - All available commands and workflows
- **[Stripe Integration](docs/STRIPE_INTEGRATION.md)** - Payment setup and webhook configuration

### Development
- **[Testing Documentation](docs/TESTING.md)** - Frontend and backend testing guides
- **[Code Quality Tools](docs/CODE_QUALITY.md)** - PHPStan, Pint, PHPMD, Rector usage
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Operations
- **[Admin Features](docs/ADMIN_FEATURES.md)** - Order management and admin dashboard
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

---

## 🎯 Development Workflow

### Daily Development

```bash
# Start containers
./vendor/bin/sail up -d

# Start dev server with queue worker
./vendor/bin/sail composer dev

# In another terminal, start frontend dev server
./vendor/bin/sail npm run dev
```

### Before Committing

```bash
# Run complete QA pipeline
./vendor/bin/sail composer qa:full
```

This runs:
1. ✅ Pint - Auto-fix code style
2. ✅ Rector - Apply refactoring patterns
3. ✅ PHPStan - Static analysis (Level 6)
4. ✅ PHPMD - Code quality check
5. ✅ PHPUnit - Backend tests (135)
6. ✅ Jest - Frontend tests (253)

---

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
./vendor/bin/sail composer test

# Frontend tests
./vendor/bin/sail npm test

# With coverage
./vendor/bin/sail npm run test:coverage
```

### Test Coverage

- **Total Tests:** 388
  - Backend: 135 PHPUnit tests (428 assertions)
  - Frontend: 253 Jest tests (14 snapshots)
- **Coverage:** ~85% overall
- **Categories:**
  - Component tests (105)
  - Unit tests (83)
  - Integration tests (51)
  - Feature tests (93)
  - Model tests (42)

---

## 💳 Stripe Integration

### Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | ✅ 3D Secure |
| `4000 0000 0000 9995` | ❌ Declined |

**Expiry:** Any future date (e.g., 12/25)  
**CVC:** Any 3 digits (e.g., 123)

### Webhook Testing

```bash
# Start webhook listener
stripe listen --forward-to localhost:8000/stripe/webhook

# Or use automated script
./start-with-webhooks.sh
```

See [Stripe Integration Guide](docs/STRIPE_INTEGRATION.md) for details.

---

## 🗄️ Database Schema

### Core Tables
- **products** - Product catalog (name, price, stock, image)
- **cart_items** - Shopping cart (user, product, quantity)
- **orders** - Customer orders (user, total, status)
- **order_items** - Order line items (order, product, quantity, price)
- **users** - User accounts with Stripe integration

### Relationships
- User → many CartItems → Product
- User → many Orders → many OrderItems → Product

---

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```env
# Application
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=ecommerce_cart

# Stripe (Test Mode)
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin
ADMIN_EMAIL=eComAdmin@mailinator.com
```

### Services

| Service | URL | Purpose |
|---------|-----|---------|
| Application | http://localhost:8000 | Main app |
| Mailpit | http://localhost:8026 | Email testing |
| MySQL | localhost:3306 | Database |
| Redis | localhost:6379 | Cache/Queue |

---

## 📁 Project Structure

```
ecommerce-cart/
├── app/
│   ├── Http/Controllers/     # API endpoints
│   ├── Models/               # Eloquent models
│   ├── Jobs/                 # Queue jobs
│   └── Mail/                 # Email templates
├── database/
│   ├── migrations/           # Database schema
│   ├── factories/            # Test data factories
│   └── seeders/              # Sample data
├── resources/
│   ├── js/
│   │   ├── Pages/           # Inertia pages
│   │   ├── Components/      # React components
│   │   └── utils/           # Helper functions
│   └── views/emails/        # Email templates
├── routes/
│   ├── web.php              # Public routes
│   ├── admin.php            # Admin routes
│   └── auth.php             # Authentication routes
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
├── docs/                     # Documentation
├── setup.sh                  # Automated setup
└── composer.json             # PHP dependencies
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Configure production webhook
- [ ] Enable HTTPS/SSL
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure email service
- [ ] Set up queue workers
- [ ] Configure cron scheduler
- [ ] Set up database backups

See [Deployment Guide](docs/DEPLOYMENT.md) for complete instructions.

---

## 🤝 Contributing

### Code Quality Standards

All code must pass:
- ✅ Laravel Pint (PSR-12 compliance)
- ✅ PHPStan Level 6 (0 errors)
- ✅ PHPMD (0 warnings)
- ✅ All tests (388 passing)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Run quality checks
./vendor/bin/sail composer qa:full

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### Pre-commit Hook

Automatically run quality checks before committing:

```bash
# Copy pre-commit hook
cp .git/hooks/pre-commit.example .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 📊 Quality Metrics

### Current Status

- ✅ **Pint:** 0 style issues
- ✅ **PHPStan:** 0 errors (Level 6, 15 baselined)
- ✅ **PHPMD:** 0 warnings
- ✅ **Rector:** Laravel 12 patterns applied
- ✅ **PHPUnit:** 135/135 tests passing
- ✅ **Jest:** 253/253 tests passing
- ✅ **Coverage:** ~85%

### Goals

- 🎯 Reach PHPStan Level 8
- 🎯 Maintain 0 warnings across all tools
- 🎯 Keep test coverage above 80%
- 🎯 Reduce PHPStan baseline to 0

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :8000
kill -9 <PID>
```

**Webhooks not working:**
```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

**Tests failing:**
```bash
./vendor/bin/sail artisan config:clear
./vendor/bin/sail composer test
```

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for more solutions.

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Author

Built with ❤️ using modern web technologies.

---

## 🎯 Roadmap

Future enhancements:

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Inventory management
- [ ] Order tracking integration
- [ ] Email marketing integration
- [ ] Multi-vendor marketplace
