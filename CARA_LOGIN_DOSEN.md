# 🎓 Cara Login Dosen - Step by Step

## ✅ Status: Backend Sudah 100% Siap!

Saya sudah test semua komponen backend dan semuanya bekerja dengan sempurna:
- ✅ Akun dosen sudah dibuat
- ✅ Password sudah benar
- ✅ Authentication guard sudah dikonfigurasi
- ✅ Routes sudah benar
- ✅ Controller sudah benar

## 📝 Kredensial Login

```
NIDN: 0412019801
Password: dosen123
```

## 🚀 Langkah-langkah Login

### Step 1: Buka Browser
Buka browser favorit Anda (Chrome, Firefox, Safari, dll)

### Step 2: Akses Halaman Login
Ketik di address bar:
```
http://localhost:8000/login
```
Tekan Enter

### Step 3: Pilih Tab "Dosen"
Di halaman login, Anda akan melihat 3 tab:
- Mahasiswa
- **Dosen** ← Klik tab ini!
- Admin

### Step 4: Masukkan NIDN
Di field "NIDN", ketik:
```
0412019801
```
**PENTING**: Pastikan tidak ada spasi di awal atau akhir!

### Step 5: Masukkan Password
Di field "Password", ketik:
```
dosen123
```
**PENTING**: Huruf kecil semua, tidak ada spasi!

### Step 6: Klik Tombol "Masuk"
Klik tombol hijau "Masuk" atau tekan Enter

### Step 7: Tunggu Redirect
Jika berhasil, Anda akan diarahkan ke dashboard dosen di:
```
http://localhost:8000/dosen
```

## 🔧 Jika Masih Tidak Bisa Login

### Solusi 1: Clear Browser Cache
1. Tekan `Cmd + Shift + Delete` (Mac) atau `Ctrl + Shift + Delete` (Windows)
2. Centang "Cookies" dan "Cached images and files"
3. Klik "Clear data"
4. Tutup browser
5. Buka browser lagi
6. Coba login lagi

### Solusi 2: Gunakan Incognito/Private Mode
1. Buka browser dalam mode incognito:
   - Chrome: `Cmd + Shift + N` (Mac) atau `Ctrl + Shift + N` (Windows)
   - Firefox: `Cmd + Shift + P` (Mac) atau `Ctrl + Shift + P` (Windows)
   - Safari: `Cmd + Shift + N`
2. Akses http://localhost:8000/login
3. Coba login lagi

### Solusi 3: Clear Laravel Cache
Buka Terminal dan jalankan:
```bash
cd /Users/intrasepriansa/Herd/TPLK004
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
```

### Solusi 4: Restart Server
Di Terminal:
1. Stop server dengan `Ctrl + C`
2. Start lagi dengan `php artisan serve`
3. Coba login lagi

### Solusi 5: Cek Error di Browser Console
1. Buka Developer Tools dengan `F12` atau `Cmd + Option + I` (Mac)
2. Klik tab "Console"
3. Coba login
4. Lihat apakah ada error merah
5. Screenshot error tersebut dan kirim ke saya

### Solusi 6: Cek Network Request
1. Buka Developer Tools (`F12`)
2. Klik tab "Network"
3. Coba login
4. Cari request ke `/dosen/login`
5. Klik request tersebut
6. Lihat:
   - Status code (harus 302 jika berhasil)
   - Response
   - Headers
7. Screenshot dan kirim ke saya jika ada masalah

## 🧪 Test Backend (Untuk Developer)

Jika Anda ingin memastikan backend bekerja, jalankan:
```bash
php test-dosen-login.php
```

Semua test harus menunjukkan ✓ (berhasil).

## 📞 Masih Bermasalah?

Jika setelah semua langkah di atas masih tidak bisa login, tolong berikan informasi berikut:

1. **Screenshot halaman login** (sebelum klik "Masuk")
2. **Screenshot error message** (jika ada)
3. **Screenshot browser console** (F12 > Console tab)
4. **Screenshot network request** (F12 > Network tab > klik /dosen/login)
5. **Browser yang digunakan** (Chrome, Firefox, Safari, dll)
6. **Versi browser**

Dengan informasi tersebut, saya bisa membantu troubleshoot lebih lanjut.

## 🎯 Alternatif: Login dengan Dosen Lain

Jika masih tidak bisa dengan NIDN `0412019801`, coba login dengan dosen lain:

### Dosen 1:
```
NIDN: 0412018901
Password: password
```

### Dosen 2:
```
NIDN: 0415028902
Password: password
```

### Dosen 3:
```
NIDN: 0420038903
Password: password
```

Jika salah satu dari dosen di atas bisa login, berarti ada masalah spesifik dengan akun NIDN `0412019801`. Jika semua tidak bisa login, berarti ada masalah di frontend atau session.
