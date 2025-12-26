# Deployment Guide

Complete guide for deploying the E-commerce Shopping Cart application to production.

## Pre-Deployment Checklist

### Critical Configuration

- [ ] Switch to **live Stripe API keys**
- [ ] Update environment variables for production
- [ ] Configure production webhook endpoint in Stripe
- [ ] Enable HTTPS/SSL (required for Stripe)
- [ ] Set up proper email service (replace Mailpit)
- [ ] Configure production database
- [ ] Set up Redis for caching and queues
- [ ] Configure file storage (S3, DigitalOcean Spaces, etc.)

### Security Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY`
- [ ] Remove development dependencies
- [ ] Set secure `SESSION_DRIVER` (redis/database)
- [ ] Configure CORS settings
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Configure backup strategy

### Performance Checklist

- [ ] Enable OPcache
- [ ] Configure queue workers
- [ ] Set up task scheduler (cron)
- [ ] Enable application cache
- [ ] Optimize autoloader
- [ ] Build production assets
- [ ] Enable CDN for static assets

---

## Environment Configuration

### Production `.env` File

```env
# Application
APP_NAME="E-commerce Cart"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host.com
DB_PORT=3306
DB_DATABASE=ecommerce_cart_prod
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail (Production SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Admin
ADMIN_EMAIL=admin@yourdomain.com

# Stripe (LIVE KEYS)
STRIPE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### Generating Application Key

```bash
php artisan key:generate --show
```

Copy the output and add to your production `.env`.

---

## Server Requirements

### Minimum Requirements

- PHP 8.2 or higher
- Composer 2.0+
- MySQL 8.0+ or PostgreSQL 13+
- Redis 7.0+
- Node.js 18+ and NPM
- Nginx or Apache
- SSL certificate (Let's Encrypt)

### PHP Extensions

```
BCMath
Ctype
cURL
DOM
Fileinfo
JSON
Mbstring
OpenSSL
PCRE
PDO
Tokenizer
XML
```

### Recommended Server Specs

- **CPU:** 2+ cores
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 20GB+ SSD
- **Bandwidth:** Unmetered

---

## Deployment Steps

### 1. Server Setup

#### Install Dependencies (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl \
    php8.2-zip php8.2-bcmath php8.2-redis

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-repo/ecommerce-cart.git
cd ecommerce-cart

# Set ownership
sudo chown -R www-data:www-data /var/www/ecommerce-cart
sudo chmod -R 755 /var/www/ecommerce-cart
sudo chmod -R 775 storage bootstrap/cache

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install --production

# Build assets
npm run build

# Copy environment file
cp .env.example .env
nano .env  # Edit with production values

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (if needed)
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 3. Configure Nginx

**Create file:** `/etc/nginx/sites-available/ecommerce-cart`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/ecommerce-cart/public;
    index index.php index.html;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logging
    access_log /var/log/nginx/ecommerce-cart-access.log;
    error_log /var/log/nginx/ecommerce-cart-error.log;
    
    # Max upload size
    client_max_body_size 20M;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/ecommerce-cart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already set up by Certbot)
sudo certbot renew --dry-run
```

### 5. Configure Queue Workers

**Create file:** `/etc/supervisor/conf.d/ecommerce-cart-worker.conf`

```ini
[program:ecommerce-cart-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ecommerce-cart/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/ecommerce-cart/storage/logs/worker.log
stopwaitsecs=3600
```

**Start supervisor:**

```bash
sudo apt install -y supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ecommerce-cart-worker:*
```

### 6. Configure Scheduler

**Add to crontab:**

```bash
sudo crontab -e -u www-data
```

**Add line:**

```
* * * * * cd /var/www/ecommerce-cart && php artisan schedule:run >> /dev/null 2>&1
```

### 7. Configure Stripe Webhooks

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter URL: `https://yourdomain.com/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Copy webhook signing secret
7. Add to production `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
8. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

---

## Database Backup Strategy

### Automated Daily Backups

**Create backup script:** `/usr/local/bin/backup-db.sh`

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/mysql"
DB_NAME="ecommerce_cart_prod"
DB_USER="your_db_user"
DB_PASS="your_secure_password"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="${DB_NAME}_${DATE}.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

**Make executable:**

```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

**Add to crontab:**

```bash
sudo crontab -e
```

```
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup.log 2>&1
```

### Restore from Backup

```bash
gunzip < /var/backups/mysql/ecommerce_cart_prod_20240101_020000.sql.gz | \
    mysql -u your_db_user -p your_secure_password ecommerce_cart_prod
```

---

## Monitoring & Logging

### Application Logs

**Location:** `/var/www/ecommerce-cart/storage/logs/laravel.log`

**Rotate logs:**

Create `/etc/logrotate.d/ecommerce-cart`:

```
/var/www/ecommerce-cart/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0664 www-data www-data
    sharedscripts
}
```

### Monitor Queue Workers

```bash
# Check worker status
sudo supervisorctl status ecommerce-cart-worker:*

# Restart workers
sudo supervisorctl restart ecommerce-cart-worker:*

# View worker logs
tail -f /var/www/ecommerce-cart/storage/logs/worker.log
```

### Monitor Application

**Install Laravel Telescope (optional, dev only):**

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

---

## Performance Optimization

### OPcache Configuration

**Edit:** `/etc/php/8.2/fpm/conf.d/10-opcache.ini`

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
opcache.enable_cli=1
```

**Restart PHP-FPM:**

```bash
sudo systemctl restart php8.2-fpm
```

### Redis Configuration

**Edit:** `/etc/redis/redis.conf`

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

**Restart Redis:**

```bash
sudo systemctl restart redis-server
```

---

## Security Best Practices

### Firewall (UFW)

```bash
# Enable firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Start service
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Updates

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update application
cd /var/www/ecommerce-cart
git pull origin main
composer install --optimize-autoloader --no-dev
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart ecommerce-cart-worker:*
```

---

## Rollback Plan

### Application Rollback

```bash
cd /var/www/ecommerce-cart

# View commit history
git log --oneline

# Rollback to previous version
git reset --hard COMMIT_HASH

# Reinstall dependencies
composer install --optimize-autoloader --no-dev
npm run build

# Clear caches
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart workers
sudo supervisorctl restart ecommerce-cart-worker:*
```

### Database Rollback

```bash
# Restore from backup
gunzip < /var/backups/mysql/ecommerce_cart_prod_TIMESTAMP.sql.gz | \
    mysql -u your_db_user -p ecommerce_cart_prod
```

---

## Deployment Platforms

### DigitalOcean

**App Platform (easiest):**
- One-click Laravel deployment
- Managed database and Redis
- Auto-scaling
- SSL included

**Droplet (more control):**
- Follow manual deployment steps above
- Use managed databases addon
- Set up load balancer for high traffic

### AWS

**Elastic Beanstalk:**
- Laravel preset available
- RDS for database
- ElastiCache for Redis
- CloudFront for CDN

### Laravel Forge

**Managed Laravel hosting:**
- Automated deployments
- Server management
- Queue monitoring
- Backup management

**Providers:** DigitalOcean, AWS, Linode, Vultr

---

## Post-Deployment Testing

### Checklist

- [ ] Application loads at production URL
- [ ] HTTPS working correctly
- [ ] Database connections working
- [ ] Redis cache working
- [ ] Queue workers running
- [ ] Scheduler running (check logs)
- [ ] Stripe webhooks receiving events
- [ ] Email sending working
- [ ] File uploads working
- [ ] All routes accessible
- [ ] Admin features working
- [ ] Payment flow working end-to-end

### Test Payment Flow

1. Browse products
2. Add to cart
3. Proceed to checkout
4. Complete test payment with real card (small amount)
5. Verify order created
6. Check webhook received
7. Verify email sent
8. Check Stripe dashboard for payment

---

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Stripe Integration](STRIPE_INTEGRATION.md)
- [Development Commands](DEVELOPMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
