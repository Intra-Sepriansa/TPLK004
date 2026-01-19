# QR Builder Troubleshooting Guide

## Masalah: QR Builder Tidak Berfungsi

### Penyebab Umum:

#### 1. **Tidak Ada Sesi Aktif** ⚠️
QR Builder membutuhkan sesi absensi yang aktif untuk generate QR code.

**Solusi:**
- Buka menu **Sesi Absensi** (`/attendance-sessions`)
- Aktifkan salah satu sesi yang ada
- Atau buat sesi baru dan aktifkan

**Quick Fix via Tinker:**
```bash
php artisan tinker
```
```php
$session = \App\Models\AttendanceSession::first();
$session->is_active = true;
$session->save();
```

#### 2. **Package QRCode Tidak Terinstall**

**Cek instalasi:**
```bash
npm list qrcode
```

**Install jika belum ada:**
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

#### 3. **CSRF Token Missing**

Pastikan file `resources/views/app.blade.php` memiliki:
```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

#### 4. **Route Tidak Terdaftar**

Cek di `routes/web.php`:
```php
Route::get('admin/qr-builder', [QrBuilderController::class, 'index'])->name('admin.qr-builder');
Route::post('attendance-sessions/{attendanceSession}/token', [AttendanceTokenController::class, 'store']);
```

### Cara Test QR Builder:

1. **Login sebagai Admin**
   - URL: `http://127.0.0.1:8001/login`

2. **Buka QR Builder**
   - URL: `http://127.0.0.1:8001/admin/qr-builder`

3. **Pastikan ada sesi aktif**
   - Jika tidak ada, klik tombol "Kelola Sesi Absensi"
   - Atau aktifkan via menu Sesi Absensi

4. **Klik "Generate QR"**
   - QR code akan muncul
   - Token akan ditampilkan
   - Countdown timer akan berjalan

5. **Cek Console Browser (F12)**
   - Lihat apakah ada error
   - Cek network tab untuk request `/attendance-sessions/{id}/token`

### Error Messages:

#### "Belum ada sesi aktif"
- **Penyebab:** Tidak ada AttendanceSession dengan `is_active = true`
- **Solusi:** Aktifkan sesi di menu Sesi Absensi

#### "Gagal generate token: Sesi belum aktif"
- **Penyebab:** Sesi yang dipilih tidak aktif
- **Solusi:** Refresh halaman atau aktifkan sesi

#### "QR Code generation error"
- **Penyebab:** Package qrcode error atau token invalid
- **Solusi:** Cek console browser untuk detail error

### Fitur QR Builder:

✅ **Auto-rotation:** Token otomatis refresh sesuai TTL (default 180 detik)
✅ **Countdown timer:** Menampilkan sisa waktu token
✅ **Copy token:** Klik icon copy untuk copy token
✅ **Download QR:** Download QR code sebagai PNG
✅ **Real-time stats:** Statistik token generation
✅ **Hourly chart:** Grafik token per jam

### Konfigurasi TTL Token:

Edit di database `settings` table:
```sql
INSERT INTO settings (key, value) VALUES ('token_ttl_seconds', '180');
```

Atau via Tinker:
```php
\App\Models\Setting::updateOrCreate(
    ['key' => 'token_ttl_seconds'],
    ['value' => '180']
);
```

### Debug Mode:

Saya sudah menambahkan console.log di fungsi `generateToken`. Cek browser console untuk:
- `Token generated:` - Menampilkan response dari server
- `Failed to generate token:` - Error dari server
- `Error generating token:` - Error network/fetch

### Perubahan yang Sudah Dilakukan:

1. ✅ Improved error handling di `generateToken()`
2. ✅ Better QR code generation dengan promise-based approach
3. ✅ Added console logging untuk debugging
4. ✅ Better UI message ketika tidak ada sesi aktif
5. ✅ Added link ke halaman Sesi Absensi

### Next Steps:

Jika masih tidak berfungsi, cek:
1. Browser console (F12 → Console tab)
2. Network tab (F12 → Network tab) - lihat request ke `/attendance-sessions/{id}/token`
3. Laravel log: `storage/logs/laravel.log`
4. Server output di terminal
