# Troubleshooting Guide

Common issues and solutions for the E-commerce Shopping Cart application.

## Table of Contents

- [Payment & Stripe Issues](#payment--stripe-issues)
- [Docker & Container Issues](#docker--container-issues)
- [Database Issues](#database-issues)
- [Frontend & Asset Issues](#frontend--asset-issues)
- [Code Quality Tool Issues](#code-quality-tool-issues)
- [Testing Issues](#testing-issues)
- [Permission Issues](#permission-issues)
- [Performance Issues](#performance-issues)

---

## Payment & Stripe Issues

### Invalid API Key Error

**Error Message:**
```
No API key provided
```

**Causes:**
- Missing Stripe keys in `.env`
- Wrong keys for test/live mode
- Config cache not cleared

**Solutions:**

1. **Verify `.env` file:**
   ```env
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Clear config cache:**
   ```bash
   ./vendor/bin/sail artisan config:clear
   ./vendor/bin/sail artisan config:cache
   ```

3. **Verify Stripe package:**
   ```bash
   ./vendor/bin/sail composer show stripe/stripe-php
   ```

### Webhook Not Receiving Events

**Symptoms:**
- Payment succeeds but order not created
- Cart not cleared after payment
- No email notification

**Solutions:**

1. **Verify Stripe CLI is running:**
   ```bash
   stripe listen --forward-to localhost:8000/stripe/webhook
   ```

2. **Check webhook secret in `.env`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Verify webhook route:**
   ```bash
   ./vendor/bin/sail artisan route:list | grep webhook
   ```

4. **Check application logs:**
   ```bash
   ./vendor/bin/sail artisan log:tail
   # or
   tail -f storage/logs/laravel.log
   ```

5. **Test webhook signature:**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Payment Succeeds But Order Not Created

**Causes:**
- Webhook signature verification failed
- Webhook endpoint not accessible
- Database constraint violation
- User session lost

**Solutions:**

1. **Check webhook logs in Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:8000/stripe/webhook --log-level debug
   ```

2. **Verify user_id in session:**
   ```php
   // In StripeWebhookController
   Log::info('Client reference ID: ' . $session->client_reference_id);
   ```

3. **Check database constraints:**
   ```bash
   ./vendor/bin/sail artisan tinker
   >>> Order::create([...]) // Test manual order creation
   ```

4. **Verify webhook signature:**
   ```bash
   # Check logs for signature verification errors
   tail -f storage/logs/laravel.log
   ```

### Checkout Session Creation Fails

**Error:**
```
Error creating checkout session
```

**Solutions:**

1. **Check cart not empty:**
   ```bash
   ./vendor/bin/sail artisan tinker
   >>> CartItem::where('user_id', 1)->get()
   ```

2. **Verify Stripe API version compatibility:**
   ```bash
   ./vendor/bin/sail composer show stripe/stripe-php
   ```

3. **Check product prices:**
   ```sql
   SELECT * FROM products WHERE price <= 0;
   ```

4. **Verify user authentication:**
   ```php
   // In controller
   if (!Auth::check()) {
       return redirect()->route('login');
   }
   ```

---

## Docker & Container Issues

### Containers Not Starting

**Error:**
```
ERROR: Could not start container
```

**Solutions:**

1. **Stop and clean Docker:**
   ```bash
   ./vendor/bin/sail down
   docker system prune -f
   ./vendor/bin/sail up -d
   ```

2. **Check Docker Desktop is running:**
   - Open Docker Desktop application
   - Ensure Docker engine is started

3. **Check disk space:**
   ```bash
   df -h
   docker system df
   ```

4. **Rebuild containers:**
   ```bash
   ./vendor/bin/sail down -v
   ./vendor/bin/sail build --no-cache
   ./vendor/bin/sail up -d
   ```

### Port Already in Use

**Error:**
```
Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Solutions:**

1. **Find process using port:**
   ```bash
   lsof -i :8000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Change port in `docker-compose.yml`:**
   ```yaml
   ports:
       - "8080:80"  # Use 8080 instead of 8000
   ```

### MySQL Container Keeps Restarting

**Symptoms:**
- Container status shows "Restarting"
- Database connection fails

**Solutions:**

1. **Check container logs:**
   ```bash
   ./vendor/bin/sail logs mysql
   ```

2. **Remove volumes and restart:**
   ```bash
   ./vendor/bin/sail down -v
   ./vendor/bin/sail up -d
   ```

3. **Wait for MySQL to be ready:**
   ```bash
   ./vendor/bin/sail up -d
   sleep 10
   ./vendor/bin/sail artisan migrate
   ```

4. **Check MySQL version compatibility:**
   ```yaml
   # In docker-compose.yml
   mysql:
       image: 'mysql/mysql-server:8.4'
   ```

---

## Database Issues

### Connection Refused

**Error:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solutions:**

1. **Verify containers are running:**
   ```bash
   ./vendor/bin/sail ps
   ```

2. **Check database credentials in `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=ecommerce_cart
   DB_USERNAME=sail
   DB_PASSWORD=password
   ```

3. **Wait for MySQL to start:**
   ```bash
   ./vendor/bin/sail up -d
   sleep 10
   ./vendor/bin/sail artisan migrate
   ```

4. **Test connection:**
   ```bash
   ./vendor/bin/sail mysql -e "SELECT 1"
   ```

### Migration Fails

**Error:**
```
SQLSTATE[42S01]: Base table or view already exists
```

**Solutions:**

1. **Fresh migration:**
   ```bash
   ./vendor/bin/sail artisan migrate:fresh --seed
   ```

2. **Rollback and re-run:**
   ```bash
   ./vendor/bin/sail artisan migrate:rollback
   ./vendor/bin/sail artisan migrate
   ```

3. **Check migration status:**
   ```bash
   ./vendor/bin/sail artisan migrate:status
   ```

### Foreign Key Constraint Fails

**Error:**
```
SQLSTATE[23000]: Integrity constraint violation
```

**Solutions:**

1. **Run migrations in correct order:**
   ```bash
   ./vendor/bin/sail artisan migrate:fresh --seed
   ```

2. **Check foreign key relationships:**
   ```sql
   SHOW CREATE TABLE cart_items;
   ```

3. **Disable foreign key checks temporarily:**
   ```sql
   SET FOREIGN_KEY_CHECKS=0;
   -- Your operations
   SET FOREIGN_KEY_CHECKS=1;
   ```

---

## Frontend & Asset Issues

### Assets Not Loading

**Symptoms:**
- Blank page
- CSS not applied
- JavaScript errors

**Solutions:**

1. **Rebuild assets:**
   ```bash
   ./vendor/bin/sail npm run build
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Clear browser cache completely

3. **Check asset manifest:**
   ```bash
   cat public/build/manifest.json
   ```

4. **Verify Vite configuration:**
   ```javascript
   // vite.config.js
   export default defineConfig({
       plugins: [
           laravel({
               input: ['resources/css/app.css', 'resources/js/app.jsx'],
               refresh: true,
           }),
       ],
   });
   ```

### Hot Reload Not Working

**Symptoms:**
- Changes not reflecting in browser
- Have to manually refresh

**Solutions:**

1. **Use dev mode:**
   ```bash
   ./vendor/bin/sail npm run dev
   ```

2. **Check Vite server is running:**
   - Look for "Local: http://localhost:5173"

3. **Clear cache and rebuild:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run dev
   ```

### React Component Not Rendering

**Symptoms:**
- Component shows as blank
- Console errors

**Solutions:**

1. **Check console for errors:**
   - Open browser DevTools (F12)
   - Check Console tab

2. **Verify component import:**
   ```javascript
   import MyComponent from '@/Components/MyComponent';
   ```

3. **Check prop types:**
   ```javascript
   // Ensure props match expected types
   <MyComponent title={title} items={items} />
   ```

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R

---

## Code Quality Tool Issues

### PHPStan Memory Limit

**Error:**
```
PHP Fatal error: Allowed memory size exhausted
```

**Solutions:**

1. **Increase memory limit:**
   ```bash
   ./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyze
   ```

2. **Add to `phpstan.neon`:**
   ```neon
   parameters:
       tmpDir: var/cache/phpstan
       resultCachePath: var/cache/phpstan/resultCache.php
   ```

3. **Clear PHPStan cache:**
   ```bash
   ./vendor/bin/sail composer phpstan -- --clear-result-cache
   ```

### Pint Not Fixing Files

**Symptoms:**
- Style issues remain after running Pint
- No files changed

**Solutions:**

1. **Clear cache:**
   ```bash
   rm -rf .php-cs-fixer.cache
   ./vendor/bin/sail composer pint
   ```

2. **Run with verbose output:**
   ```bash
   ./vendor/bin/sail pint -v
   ```

3. **Check file permissions:**
   ```bash
   chmod -R 755 app/
   ```

### PHPMD Taking Too Long

**Symptoms:**
- PHPMD hangs
- Very slow execution

**Solutions:**

1. **Check specific directory:**
   ```bash
   ./vendor/bin/sail phpmd app text phpmd.xml
   ```

2. **Exclude large directories:**
   ```xml
   <!-- In phpmd.xml -->
   <exclude>vendor</exclude>
   <exclude>node_modules</exclude>
   <exclude>storage</exclude>
   ```

3. **Run on specific files:**
   ```bash
   ./vendor/bin/sail phpmd app/Models text phpmd.xml
   ```

### Rector Breaking Tests

**Symptoms:**
- Tests fail after Rector refactoring
- Unexpected behavior

**Solutions:**

1. **Always dry-run first:**
   ```bash
   ./vendor/bin/sail composer rector
   ```

2. **Review changes:**
   ```bash
   git diff
   ```

3. **Run tests after applying:**
   ```bash
   ./vendor/bin/sail composer rector:fix
   ./vendor/bin/sail composer test
   ```

4. **Rollback if needed:**
   ```bash
   git checkout .
   ```

---

## Testing Issues

### Frontend Tests Failing

**Error:**
```
Cannot find module '@/...'
```

**Solutions:**

1. **Check `jest.config.cjs`:**
   ```javascript
   moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/resources/js/$1',
   }
   ```

2. **Clear Jest cache:**
   ```bash
   ./vendor/bin/sail npm test -- --clearCache
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   ./vendor/bin/sail npm install
   ```

### Backend Tests Failing

**Error:**
```
Database not found
```

**Solutions:**

1. **Create test database:**
   ```bash
   ./vendor/bin/sail artisan config:clear
   ./vendor/bin/sail artisan migrate --env=testing
   ```

2. **Check `.env.testing`:**
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=:memory:
   ```

3. **Clear cache:**
   ```bash
   ./vendor/bin/sail artisan cache:clear
   ./vendor/bin/sail artisan config:clear
   ```

### Snapshot Tests Failing

**Error:**
```
Snapshot doesn't match
```

**Solutions:**

1. **Update snapshots if changes are intentional:**
   ```bash
   ./vendor/bin/sail npm test -- -u
   ```

2. **Review snapshot diff:**
   - Check test output for differences
   - Verify changes are expected

3. **Delete snapshot file and recreate:**
   ```bash
   rm resources/js/__tests__/__snapshots__/Component.test.jsx.snap
   ./vendor/bin/sail npm test
   ```

---

## Permission Issues

### Storage Permission Denied

**Error:**
```
The stream or file "storage/logs/laravel.log" could not be opened
```

**Solutions:**

1. **Fix permissions:**
   ```bash
   sudo chmod -R 775 storage bootstrap/cache
   sudo chown -R $USER:$USER storage bootstrap/cache
   ```

2. **Inside container:**
   ```bash
   ./vendor/bin/sail shell
   chmod -R 775 storage bootstrap/cache
   ```

3. **Create storage link:**
   ```bash
   ./vendor/bin/sail artisan storage:link
   ```

---

## Performance Issues

### Application Slow

**Solutions:**

1. **Clear all caches:**
   ```bash
   ./vendor/bin/sail artisan optimize:clear
   ```

2. **Optimize for production:**
   ```bash
   ./vendor/bin/sail artisan config:cache
   ./vendor/bin/sail artisan route:cache
   ./vendor/bin/sail artisan view:cache
   ```

3. **Check database queries:**
   ```bash
   # Enable query log in tinker
   ./vendor/bin/sail artisan tinker
   >>> DB::enableQueryLog();
   >>> // Your operations
   >>> DB::getQueryLog();
   ```

4. **Use queue for background jobs:**
   ```bash
   ./vendor/bin/sail artisan queue:work
   ```

### Database Queries Slow

**Solutions:**

1. **Add indexes:**
   ```php
   $table->index('user_id');
   $table->index('product_id');
   ```

2. **Use eager loading:**
   ```php
   $orders = Order::with(['user', 'orderItems.product'])->get();
   ```

3. **Analyze queries:**
   ```bash
   ./vendor/bin/sail mysql
   EXPLAIN SELECT * FROM orders WHERE user_id = 1;
   ```

---

## Getting Help

If you can't find a solution here:

1. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ./vendor/bin/sail logs -f
   ```

2. **Enable debug mode:**
   ```env
   APP_DEBUG=true
   ```

3. **Check Laravel documentation:**
   - [Laravel Docs](https://laravel.com/docs)
   - [Laravel Sail](https://laravel.com/docs/sail)

4. **Check Stripe documentation:**
   - [Stripe Docs](https://stripe.com/docs)
   - [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Development Commands](DEVELOPMENT.md)
- [Testing Documentation](TESTING.md)
- [Code Quality Tools](CODE_QUALITY.md)
- [Stripe Integration](STRIPE_INTEGRATION.md)
