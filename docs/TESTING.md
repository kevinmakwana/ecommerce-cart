# Testing Documentation

Comprehensive testing guide for the E-commerce Shopping Cart application.

## Overview

The application includes **388 total tests**:
- **Frontend Tests:** 253 Jest tests with 14 snapshots
- **Backend Tests:** 135 PHPUnit tests with 428 assertions

---

## Frontend Testing (Jest)

### Test Statistics

- **Total Tests:** 253
- **Test Suites:** 20
- **Snapshots:** 14
- **Test Categories:**
  - Component Tests: 105 tests
  - Unit Tests: 83 tests
  - Integration Tests: 51 tests
  - Snapshot Tests: 14 snapshots

### Running Frontend Tests

```bash
# Run all tests
./vendor/bin/sail npm test

# Run tests in watch mode (re-runs on file changes)
./vendor/bin/sail npm run test:watch

# Run tests with coverage report
./vendor/bin/sail npm run test:coverage

# Run specific test file
./vendor/bin/sail npm test -- formatters.test.js

# Run tests matching pattern
./vendor/bin/sail npm test -- --testNamePattern="calculates"

# Update snapshots after intentional changes
./vendor/bin/sail npm test -- -u
```

### Test Categories

#### 1. Component Tests (105 tests)

Tests React component rendering, props, events, and user interactions.

**Tested Components:**
- **Button Components:** PrimaryButton, SecondaryButton, DangerButton
- **Form Inputs:** TextInput, Checkbox, InputLabel, InputError
- **Navigation:** NavLink, ResponsiveNavLink
- **Complex Components:** Modal, DataTable

**Example Test:**
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryButton from '../PrimaryButton';

test('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<PrimaryButton onClick={handleClick}>Click me</PrimaryButton>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### 2. Unit Tests (83 tests)

Tests pure functions for business logic, calculations, and data formatting.

**Test Files:**
- `formatters.test.js` (30 tests) - Currency, price, date, text truncation
- `validators.test.js` (38 tests) - Email, password, quantity, price validation
- `calculations.test.js` (55 tests) - Subtotal, tax, discount, stock checks

**Available Utility Functions:**

**Formatters:**
```javascript
import { formatCurrency, formatPrice, formatDate, truncateText } from '@/utils/formatters';

formatCurrency(99.99);                    // "$99.99"
formatPrice(19.999);                      // "20.00"
formatDate('2024-12-25', 'medium');       // "Dec 25, 2024"
truncateText('Long text here', 10);       // "Long text ..."
```

**Validators:**
```javascript
import { validateEmail, validatePassword, validateQuantity } from '@/utils/validators';

validateEmail('user@example.com');                    // true
validatePassword('SecurePass123');                    // { isValid: true, errors: [] }
validateQuantity(5, 10);                              // { isValid: true, error: null }
```

**Calculations:**
```javascript
import { calculateSubtotal, calculateTotal, isLowStock } from '@/utils/calculations';

const cartItems = [
    { product: { price: 19.99 }, quantity: 2 },
    { product: { price: 29.99 }, quantity: 1 }
];

calculateSubtotal(cartItems);              // 69.97
calculateTotal(69.97, 5.00, 0);           // 74.97
isLowStock(8);                            // true (≤10)
```

#### 3. Integration Tests (51 tests)

Tests how multiple components and functions work together.

**Test Files:**
- `cart-business-logic.test.js` - Cart operations, stock management, pricing
- `form-validation-integration.test.js` - Registration, product forms
- `bootstrap.test.js` - Axios configuration and global setup

#### 4. Snapshot Tests (14 snapshots)

Tests UI components for unexpected visual changes.

**Test Files:**
- `DataTable.snapshot.test.jsx` - Table variations (empty, paginated, searchable)
- `Modal.snapshot.test.jsx` - Modal variations (sizes, closeable, content)

### Configuration Files

**jest.config.cjs:**
```javascript
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/resources/js/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    collectCoverageFrom: ['resources/js/**/*.{js,jsx}'],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
};
```

**babel.config.cjs:**
```javascript
module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
    ],
};
```

**jest.setup.js:**
```javascript
import '@testing-library/jest-dom';

// Mock the global route() helper
global.route = (name, params) => {
    if (params) {
        return `/${name}/${params}`;
    }
    return `/${name}`;
};
```

### Writing New Tests

**Test File Structure:**
```
resources/js/
├── Components/
│   ├── __tests__/
│   │   ├── Button.test.jsx
│   │   └── Button.snapshot.test.jsx
│   └── Button.jsx
├── utils/
│   ├── __tests__/
│   │   └── helpers.test.js
│   └── helpers.js
```

**Component Test Template:**
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
    test('renders with props', () => {
        render(<MyComponent title="Hello" />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    test('handles user interaction', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();
        
        render(<MyComponent onClick={handleClick} />);
        await user.click(screen.getByRole('button'));
        
        expect(handleClick).toHaveBeenCalled();
    });
});
```

### Coverage Reports

```bash
# Generate coverage report
./vendor/bin/sail npm run test:coverage
```

**Coverage Output:**
```
Test Suites: 20 passed, 20 total
Tests:       253 passed, 253 total
Snapshots:   14 passed, 14 total

Coverage:
statements: 85%
branches:   78%
functions:  82%
lines:      85%
```

**View HTML Coverage:**
Open `coverage/lcov-report/index.html` in your browser for detailed line-by-line coverage.

---

## Backend Testing (PHPUnit)

### Test Statistics

- **Total Tests:** 135
- **Total Assertions:** 428
- **Feature Tests:** 93 tests (8 suites)
- **Unit Tests:** 42 tests (3 suites)

### Running Backend Tests

```bash
# Run all PHPUnit tests
./vendor/bin/sail artisan test
# or
./vendor/bin/sail composer test

# Run specific test suite
./vendor/bin/sail artisan test --testsuite=Feature
./vendor/bin/sail artisan test --testsuite=Unit

# Run specific test file
./vendor/bin/sail artisan test tests/Feature/CartTest.php

# Run with coverage
./vendor/bin/sail artisan test --coverage

# Run tests in parallel (faster)
./vendor/bin/sail artisan test --parallel

# Filter specific test
./vendor/bin/sail artisan test --filter test_user_can_add_product_to_cart
```

### Feature Tests (93 tests)

#### ProductTest.php (11 tests)
- Guest and authenticated access to products
- Product data display and accuracy
- Out of stock and low stock handling
- Search, filtering, and pagination
- Price formatting validation

#### CartTest.php (20 tests)
- Authentication requirements
- Add/update/remove cart operations
- Stock validation and quantity limits
- User authorization (can't modify others' carts)
- Subtotal calculations
- Empty cart and duplicate handling

#### OrderTest.php (14 tests)
- Order creation from cart
- OrderItem creation and relationships
- Stock reduction on order placement
- Cart clearing after checkout
- Empty cart and out-of-stock prevention
- Total calculation and payment intent validation

#### Admin/ProductAdminTest.php (20 tests)
- Role-based admin authorization
- Full CRUD operations (Create, Read, Update, Delete)
- Product validation (name, price, stock)
- Search and filter functionality
- Low stock and out-of-stock filtering
- Non-admin access prevention

#### Admin/OrderAdminTest.php (18 tests)
- Admin authorization checks
- View all orders across users
- Order details and status updates
- Filter by status and search by user
- Order items and user information display
- Pagination and date range filtering

### Unit Tests (42 tests)

#### ProductTest.php (14 tests)
- Model fillable attributes and casting
- Price precision (2 decimals)
- Stock quantity type validation
- In-stock and low-stock checking
- Validation rules
- Factory integrity

#### OrderTest.php (16 tests)
- User and OrderItem relationships
- Fillable attributes and casting
- Total calculation from items
- Status defaults and transitions
- Eager loading relationships
- Factory integrity

#### CartItemTest.php (18 tests)
- User and Product relationships
- Subtotal calculation
- Multiple items per user handling
- Product in multiple carts
- Eager loading and CRUD operations
- Cascade deletion behaviors

### Test Conventions

**Naming Pattern:**
```php
// Descriptive snake_case names
test_user_can_add_product_to_cart()
test_admin_cannot_delete_product_with_orders()
test_product_price_is_cast_to_decimal()
```

**AAA Structure:**
```php
public function test_example(): void
{
    // Arrange - Set up test data
    $user = User::factory()->create();
    $product = Product::factory()->create();
    
    // Act - Perform action
    $response = $this->actingAs($user)
        ->post('/cart', ['product_id' => $product->id, 'quantity' => 2]);
    
    // Assert - Verify results
    $response->assertRedirect();
    $this->assertDatabaseHas('cart_items', [
        'user_id' => $user->id,
        'quantity' => 2,
    ]);
}
```

### Testing Patterns

**Authentication & Authorization:**
```php
// Guest redirect
$this->get('/cart')->assertRedirect('/login');

// Authenticated access
$this->actingAs($user)->get('/cart')->assertStatus(200);

// Role-based access
$this->actingAs($admin)->get('/admin/products')->assertStatus(200);
$this->actingAs($user)->get('/admin/products')->assertStatus(403);
```

**Database Assertions:**
```php
$this->assertDatabaseHas('products', ['name' => 'Laptop']);
$this->assertDatabaseMissing('cart_items', ['user_id' => $user->id]);
$this->assertDatabaseCount('orders', 5);
```

**Inertia Assertions:**
```php
$response->assertInertia(fn ($page) => $page
    ->component('Products/Index')
    ->has('products.data', 10)
    ->where('products.data.0.name', 'Laptop')
);
```

---

## Testing Best Practices

### 1. Test Behavior, Not Implementation
Focus on what users see and do, not internal state.

### 2. Use Semantic Queries
```javascript
// Good
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')

// Avoid
screen.getByTestId('submit-btn')
```

### 3. Keep Tests Isolated
Each test should be independent. Use `beforeEach` to reset state.

### 4. Mock External Dependencies
Mock API calls, Inertia router, and external libraries to keep tests fast.

### 5. Test Error States
Test both success and failure scenarios.

### 6. Descriptive Test Names
Use clear names that describe behavior and conditions.

---

## Troubleshooting

### Frontend Test Issues

**Issue: "Cannot find module '@/...'"**
```javascript
// Check moduleNameMapper in jest.config.cjs
moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/resources/js/$1',
}
```

**Issue: "React is not defined"**
```javascript
// Add to test file or jest.setup.js
import React from 'react';
```

**Issue: "Snapshots fail after changes"**
```bash
# Update snapshots after intentional changes
./vendor/bin/sail npm test -- -u
```

### Backend Test Issues

**Issue: Database not found**
```bash
# Ensure test database is created
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan migrate --env=testing
```

**Issue: Tests fail but code works**
```bash
# Clear cache
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan test
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install Dependencies
        run: composer install
      - name: Run Tests
        run: ./vendor/bin/phpunit
      - name: Frontend Tests
        run: npm test
```

---

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Code Quality Tools](CODE_QUALITY.md)
- [Development Commands](DEVELOPMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
