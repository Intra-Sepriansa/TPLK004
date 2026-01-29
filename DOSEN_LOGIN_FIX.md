# Panduan Fix Login Dosen

## Status Backend
✅ **Backend sudah 100% benar!**
- Dosen dengan NIDN `0412019801` sudah ada di database
- Password `dosen123` sudah benar
- Authentication guard sudah dikonfigurasi dengan benar
- Test login manual berhasil

## Cara Login Dosen

### Kredensial Login:
- **NIDN**: `0412019801`
- **Password**: `dosen123`

### Langkah-langkah Login:

1. **Buka halaman login**: http://localhost:8000/login

2. **Pilih tab "Dosen"** (tab tengah dengan icon GraduationCap)

3. **Masukkan kredensial**:
   - NIDN: `0412019801`
   - Password: `dosen123`

4. **Klik tombol "Masuk"**

## Troubleshooting

### Jika masih tidak bisa login, coba langkah berikut:

#### 1. Clear Browser Cache & Cookies
```bash
# Di browser:
- Tekan Cmd+Shift+Delete (Mac) atau Ctrl+Shift+Delete (Windows)
- Pilih "Cookies and other site data"
- Pilih "Cached images and files"
- Klik "Clear data"
```

#### 2. Clear Laravel Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

#### 3. Restart Development Server
```bash
# Stop server (Ctrl+C)
# Kemudian start lagi:
php artisan serve
```

#### 4. Cek Browser Console
- Buka Developer Tools (F12)
- Lihat tab "Console" untuk error JavaScript
- Lihat tab "Network" untuk error HTTP request

#### 5. Test dengan Browser Lain atau Incognito Mode
- Buka browser dalam mode incognito/private
- Coba login lagi

#### 6. Cek Error Message
Jika muncul error "NIDN atau password salah", kemungkinan:
- Salah ketik NIDN (pastikan: `0412019801`)
- Salah ketik password (pastikan: `dosen123`)
- Session belum clear

## Dosen Lain yang Tersedia

Jika masih bermasalah, coba login dengan dosen lain:

1. **Dr. Ahmad Fauzi, M.Kom**
   - NIDN: `0412018901`
   - Password: `password`

2. **Dr. Siti Nurhaliza, M.T**
   - NIDN: `0415028902`
   - Password: `password`

3. **Prof. Budi Santoso, Ph.D**
   - NIDN: `0420038903`
   - Password: `password`

## Verifikasi Manual

Untuk memastikan backend bekerja, jalankan:
```bash
php test-dosen-login.php
```

Jika semua test berhasil (✓), berarti masalah ada di frontend/browser.

## Kontak Support

Jika masih bermasalah setelah semua langkah di atas:
1. Screenshot error message
2. Screenshot browser console (F12 > Console tab)
3. Screenshot network request (F12 > Network tab)
4. Kirim ke developer untuk analisis lebih lanjut
