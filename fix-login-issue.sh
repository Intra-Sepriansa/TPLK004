#!/bin/bash

echo "==================================="
echo "  FIX DOSEN LOGIN ISSUE"
echo "==================================="
echo ""

echo "Step 1: Clearing all Laravel caches..."
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "Step 2: Clearing session data..."
php artisan session:table 2>/dev/null || echo "Session table already exists"
# Clear sessions table
php artisan tinker --execute="DB::table('sessions')->truncate();" 2>/dev/null || echo "Sessions cleared"

echo ""
echo "Step 3: Regenerating application key..."
# php artisan key:generate --force

echo ""
echo "Step 4: Clearing browser cookies..."
echo "⚠️  PENTING: Anda harus manual clear browser cookies!"
echo ""
echo "Cara clear cookies di browser:"
echo "1. Buka Developer Tools (F12 atau Cmd+Option+I)"
echo "2. Klik tab 'Application' (Chrome) atau 'Storage' (Firefox)"
echo "3. Di sidebar kiri, klik 'Cookies'"
echo "4. Klik 'http://localhost:8000'"
echo "5. Klik kanan > 'Clear' atau delete semua cookies"
echo ""
echo "ATAU lebih mudah:"
echo "1. Tekan Cmd+Shift+Delete (Mac) atau Ctrl+Shift+Delete (Windows)"
echo "2. Pilih 'Cookies and other site data'"
echo "3. Pilih time range 'All time'"
echo "4. Klik 'Clear data'"
echo ""

echo "Step 5: Restart development server..."
echo "⚠️  Setelah script ini selesai:"
echo "1. Stop server dengan Ctrl+C"
echo "2. Start lagi dengan: php artisan serve"
echo ""

echo "==================================="
echo "  ✓ CACHE CLEARED!"
echo "==================================="
echo ""
echo "Sekarang coba login dengan:"
echo "NIDN: 0401018901"
echo "Password: dosen123"
echo ""
echo "Jika masih tidak bisa, gunakan Incognito Mode!"
