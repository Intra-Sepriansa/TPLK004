# 🚀 COMPREHENSIVE DEPLOYMENT GUIDE

> **Tambahkan section ini setelah section API Documentation di README.md**

---

## 🌐 Production Deployment Guide

### Pre-Deployment Checklist

- [ ] **Code Quality**
  - [ ] All tests passing
  - [ ] No console.log() in production code
  - [ ] Code linted and formatted
  - [ ] Security vulnerabilities fixed
  - [ ] Performance optimized

- [ ] **Environment Configuration**
  - [ ] `.env.production` configured
  - [ ] `APP_ENV=production`
  - [ ] `APP_DEBUG=false`
  - [ ] Strong `APP_KEY` generated
  - [ ] Database credentials secured
  - [ ] Mail service configured
  - [ ] Storage configured (S3/local)

- [ ] **Security**
  - [ ] SSL certificate installed
  - [ ] HTTPS enforced
  - [ ] Security headers configured
  - [ ] CORS properly configured
  - [ ] Rate limiting enabled
  - [ ] Firewall rules set

- [ ] **Performance**
  - [ ] Assets minified and compressed
  - [ ] Images optimized
  - [ ] Caching configured (Redis)
  - [ ] CDN configured
  - [ ] Database indexed
  - [ ] Query optimization done

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring (New Relic)
  - [ ] Uptime monitoring
  - [ ] Log aggregation
  - [ ] Backup system configured

---

## 🐳 Docker Deployment

### Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: tplk004-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./storage:/var/www/storage
    networks:
      - tplk004-network
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    depends_on:
      - mysql
      - redis

  nginx:
    image: nginx:alpine
    container_name: tplk004-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www
      - ./docker/nginx:/etc/nginx/conf.d
      - ./docker/ssl:/etc/nginx/ssl
    networks:
      - tplk004-network
    depends_on:
      - app

  mysql:
    image: mysql:8.0
    container_name: tplk004-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - tplk004-network
    ports:
      - "3306:3306"

  redis:
    image: redis:alpine
    container_name: tplk004-redis
    restart: unless-stopped
    networks:
      - tplk004-network
    ports:
      - "6379:6379"

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    container_name: tplk004-ai
    restart: unless-stopped
    ports:
      - "9001:9001"
    networks:
      - tplk004-network
    environment:
      - MODEL_PATH=/models/yolov8m.pt
      - DEVICE=cpu
    volumes:
      - ./ai-service/models:/models

networks:
  tplk004-network:
    driver: bridge

volumes:
  mysql-data:
    driver: local
```

### Dockerfile.prod

```dockerfile
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . /var/www

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node.js and build assets
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www/storage
RUN chmod -R 755 /var/www/bootstrap/cache

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
```

### Deploy Commands

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose exec app php artisan migrate --force

# Seed database (if needed)
docker-compose exec app php artisan db:seed --force

# Optimize application
docker-compose exec app php artisan optimize
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache

# Set permissions
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 775 storage bootstrap/cache

# View logs
docker-compose logs -f app
```

---

## ☁️ Cloud Platform Deployments

### 1. Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

#### Step-by-Step:

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Project**
```bash
railway init
```

4. **Add MySQL Database**
```bash
railway add mysql
```

5. **Add Redis**
```bash
railway add redis
```

6. **Configure Environment Variables**
```bash
railway variables set APP_ENV=production
railway variables set APP_DEBUG=false
railway variables set APP_KEY=$(php artisan key:generate --show)
```

7. **Deploy**
```bash
railway up
```

8. **Run Migrations**
```bash
railway run php artisan migrate --force
```

#### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "composer install --no-dev --optimize-autoloader && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "php artisan serve --host=0.0.0.0 --port=$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### 2. Render Deployment

#### render.yaml

```yaml
services:
  - type: web
    name: tplk004-web
    env: php
    buildCommand: |
      composer install --no-dev --optimize-autoloader
      npm install
      npm run build
      php artisan migrate --force
      php artisan optimize
    startCommand: php artisan serve --host=0.0.0.0 --port=$PORT
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: false
      - key: APP_KEY
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: tplk004-db
          property: connectionString

databases:
  - name: tplk004-db
    databaseName: tplk004
    user: tplk004_user
```

#### Deploy Steps:

1. Connect GitHub repository
2. Select "Web Service"
3. Configure build command
4. Add environment variables
5. Deploy!

---

### 3. DigitalOcean App Platform

#### .do/app.yaml

```yaml
name: tplk004
services:
  - name: web
    github:
      repo: your-username/TPLK004
      branch: main
      deploy_on_push: true
    build_command: |
      composer install --no-dev --optimize-autoloader
      npm install
      npm run build
    run_command: php artisan serve --host=0.0.0.0 --port=8080
    environment_slug: php
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 8080
    envs:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: "false"
      - key: APP_KEY
        type: SECRET
      - key: DATABASE_URL
        type: SECRET

databases:
  - name: db
    engine: MYSQL
    version: "8"
    size: db-s-1vcpu-1gb
```

---

### 4. AWS Elastic Beanstalk

#### .ebextensions/01_laravel.config

```yaml
option_settings:
  aws:elasticbeanstalk:container:php:phpini:
    document_root: /public
    memory_limit: 512M
    max_execution_time: 60

  aws:elasticbeanstalk:application:environment:
    APP_ENV: production
    APP_DEBUG: false
    CACHE_DRIVER: redis
    SESSION_DRIVER: redis
    QUEUE_CONNECTION: sqs

container_commands:
  01_install_dependencies:
    command: "composer install --no-dev --optimize-autoloader"
  02_build_assets:
    command: "npm install && npm run build"
  03_migrate:
    command: "php artisan migrate --force"
    leader_only: true
  04_optimize:
    command: "php artisan optimize"
  05_storage_link:
    command: "php artisan storage:link"
```

#### Deploy Commands:

```bash
# Initialize EB
eb init -p php-8.2 tplk004

# Create environment
eb create tplk004-prod

# Deploy
eb deploy

# Open application
eb open
```

---

### 5. Vercel (Frontend Only)

For deploying frontend separately:

#### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "public/build"
      }
    }
  ],
  "routes": [
    {
      "src": "/build/(.*)",
      "dest": "/build/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🔧 Server Configuration

### Nginx Configuration

#### /etc/nginx/sites-available/tplk004

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tplk004.com www.tplk004.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tplk004.com www.tplk004.com;
    root /var/www/tplk004/public;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/tplk004.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tplk004.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Index
    index index.php index.html;

    # Character Set
    charset utf-8;

    # Logging
    access_log /var/log/nginx/tplk004-access.log;
    error_log /var/log/nginx/tplk004-error.log;

    # Root Location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Static Assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny Access to Hidden Files
    location ~ /\. {
        deny all;
    }

    # Client Max Body Size (for file uploads)
    client_max_body_size 20M;
}
```

### Apache Configuration

#### /etc/apache2/sites-available/tplk004.conf

```apache
<VirtualHost *:80>
    ServerName tplk004.com
    ServerAlias www.tplk004.com
    Redirect permanent / https://tplk004.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName tplk004.com
    ServerAlias www.tplk004.com
    DocumentRoot /var/www/tplk004/public

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/tplk004.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/tplk004.com/privkey.pem

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    # Directory Configuration
    <Directory /var/www/tplk004/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/tplk004-error.log
    CustomLog ${APACHE_LOG_DIR}/tplk004-access.log combined
</VirtualHost>
```

---

## 🔐 SSL Certificate Setup

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain Certificate
sudo certbot --nginx -d tplk004.com -d www.tplk004.com

# Auto-renewal (runs twice daily)
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
0 0,12 * * * certbot renew --quiet
```

---

## 📊 Monitoring & Logging

### Error Tracking with Sentry

```bash
composer require sentry/sentry-laravel
```

#### config/sentry.php

```php
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),
    'environment' => env('APP_ENV', 'production'),
    'release' => env('APP_VERSION', '1.0.0'),
    'traces_sample_rate' => 1.0,
];
```

### Performance Monitoring with New Relic

```bash
# Install New Relic PHP Agent
wget -O - https://download.newrelic.com/548C16BF.gpg | sudo apt-key add -
echo "deb http://apt.newrelic.com/debian/ newrelic non-free" | sudo tee /etc/apt/sources.list.d/newrelic.list
sudo apt-get update
sudo apt-get install newrelic-php5

# Configure
sudo newrelic-install install
```

### Log Aggregation with Papertrail

```bash
# Install remote_syslog2
wget https://github.com/papertrail/remote_syslog2/releases/download/v0.20/remote_syslog_linux_amd64.tar.gz
tar xzf remote_syslog_linux_amd64.tar.gz
sudo cp remote_syslog/remote_syslog /usr/local/bin
```

#### /etc/log_files.yml

```yaml
files:
  - /var/www/tplk004/storage/logs/laravel.log
destination:
  host: logs.papertrailapp.com
  port: YOUR_PORT
  protocol: tls
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Install Dependencies
        run: composer install --prefer-dist --no-progress
        
      - name: Run Tests
        run: php artisan test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/tplk004
            git pull origin main
            composer install --no-dev --optimize-autoloader
            npm install
            npm run build
            php artisan migrate --force
            php artisan optimize
            sudo systemctl reload php8.2-fpm
            sudo systemctl reload nginx
```

---

## 🔄 Zero-Downtime Deployment

### Blue-Green Deployment Script

```bash
#!/bin/bash

# Configuration
BLUE_DIR="/var/www/tplk004-blue"
GREEN_DIR="/var/www/tplk004-green"
CURRENT_LINK="/var/www/tplk004"

# Determine current and next environment
if [ "$(readlink $CURRENT_LINK)" == "$BLUE_DIR" ]; then
    CURRENT="blue"
    NEXT="green"
    NEXT_DIR=$GREEN_DIR
else
    CURRENT="green"
    NEXT="blue"
    NEXT_DIR=$BLUE_DIR
fi

echo "Current environment: $CURRENT"
echo "Deploying to: $NEXT"

# Deploy to next environment
cd $NEXT_DIR
git pull origin main
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan migrate --force
php artisan optimize

# Health check
if curl -f http://localhost:8000/health; then
    echo "Health check passed"
    
    # Switch symlink
    ln -sfn $NEXT_DIR $CURRENT_LINK
    
    # Reload services
    sudo systemctl reload php8.2-fpm
    sudo systemctl reload nginx
    
    echo "Deployment successful!"
else
    echo "Health check failed. Rollback!"
    exit 1
fi
```

---

## 📦 Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups/tplk004"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tplk004"
DB_USER="root"
DB_PASS="password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/tplk004/storage

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://tplk004-backups/
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://tplk004-backups/

# Delete old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Add to Crontab

```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-tplk004.sh
```

---

