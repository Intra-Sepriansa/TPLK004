# 🚀 Deployment Checklist - TPLK004 Attendance System

## Pre-Deployment

### 1. Code Preparation
- [ ] Semua fitur sudah di-test di local
- [ ] Tidak ada console.log atau dd() yang tertinggal
- [ ] Semua migration sudah dibuat dan di-test
- [ ] Seeder data awal sudah siap

### 2. Build Assets
```bash
# Build production assets
npm run build

# Verify build output
ls -la public/build/
```

### 3. Environment Check
- [ ] APP_DEBUG=false
- [ ] APP_ENV=production
- [ ] APP_KEY sudah di-generate
- [ ] Database credentials sudah benar
- [ ] Mail configuration sudah di-test

### 4. Security Check
- [ ] .env TIDAK di-commit ke Git
- [ ] Sensitive data tidak hardcoded
- [ ] HTTPS enabled
- [ ] CSRF protection aktif

---

## Deployment Steps

### Railway
```bash
# 1. Push ke GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. Railway akan auto-deploy

# 3. Set environment variables di Railway dashboard

# 4. Run migrations
railway run php artisan migrate --force
railway run php artisan db:seed --class=GamificationSeeder --force
```

### Manual Server
```bash
# 1. SSH ke server
ssh user@your-server.com

# 2. Clone/pull repository
git clone https://github.com/your-repo/tplk004.git
cd tplk004

# 3. Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build

# 4. Setup environment
cp .env.production.example .env
php artisan key:generate

# 5. Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 6. Run migrations
php artisan migrate --force
php artisan db:seed --force

# 7. Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Restart services
sudo systemctl restart php-fpm
sudo systemctl restart nginx
```

---

## Post-Deployment

### 1. Verify Application
- [ ] Homepage loads correctly
- [ ] Login works (admin & mahasiswa)
- [ ] Dashboard displays data
- [ ] QR Code generation works
- [ ] Absensi flow works end-to-end

### 2. Setup Initial Data
```bash
# Create admin user
php artisan tinker
>>> \App\Models\User::create([
    'name' => 'Admin TPLK004',
    'email' => 'admin@tplk004.unpam.ac.id',
    'password' => bcrypt('your-secure-password'),
]);

# Or use seeder
php artisan db:seed --class=AdminSeeder
```

### 3. Configure Cron Jobs (for scheduled tasks)
```bash
# Add to crontab
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Setup Queue Worker (for background jobs)
```bash
# Using Supervisor
sudo apt install supervisor

# Create config: /etc/supervisor/conf.d/tplk004-worker.conf
[program:tplk004-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path-to-project/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path-to-project/storage/logs/worker.log

# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start tplk004-worker:*
```

---

## Monitoring

### 1. Check Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Server logs
tail -f /var/log/nginx/error.log
```

### 2. Health Check Endpoints
- `/` - Homepage
- `/login` - Admin login
- `/user` - Student dashboard (requires auth)

### 3. Database Backup
```bash
# PostgreSQL
pg_dump -U username -d tplk004 > backup_$(date +%Y%m%d).sql

# MySQL
mysqldump -u username -p tplk004 > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Common Issues

**1. 500 Internal Server Error**
```bash
# Check permissions
chmod -R 775 storage bootstrap/cache

# Check logs
cat storage/logs/laravel.log | tail -50

# Clear cache
php artisan cache:clear
php artisan config:clear
```

**2. Assets Not Loading**
```bash
# Rebuild assets
npm run build

# Check APP_URL in .env
# Make sure it matches your domain
```

**3. Database Connection Error**
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();

# Check credentials in .env
```

**4. Session/Login Issues**
```bash
# Clear sessions
php artisan session:clear

# Check SESSION_DRIVER in .env
# For production, use 'database' or 'redis'
```

---

## Rollback Plan

If deployment fails:

```bash
# 1. Revert to previous version
git checkout previous-tag

# 2. Restore database backup
psql -U username -d tplk004 < backup_previous.sql

# 3. Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 4. Restart services
sudo systemctl restart php-fpm nginx
```
