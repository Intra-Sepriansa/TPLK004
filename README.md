<p align="center">
  <img src="./public/image.png" alt="UNPAM" height="96" />
</p>

<h1 align="center">TPLK004 - Sistem Absensi AI</h1>

<p align="center">
  <img src="./public/readme/radar.svg" alt="Animated radar" height="140" />
</p>

<p align="center">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3200&pause=600&color=6B7280&width=900&lines=Absensi+mahasiswa+berbasis+AI+%2B+geofence;Laravel+12+%2B+React+19+%2B+FastAPI+YOLO;Admin+dashboard+%2B+selfie+verification+%2B+live+scan"
    alt="Animated intro"
  />
</p>
<p align="center">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&duration=2600&pause=400&color=9CA3AF&width=900&lines=Live+camera+scan+for+attendance;Geofence+validation+%2B+anti-fraud+checks;Audit+trail+untuk+rekap+dan+verifikasi"
    alt="Animated highlights"
  />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/laravel/laravel-original.svg" alt="Laravel" height="42" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" height="42" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" height="42" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" alt="Vite" height="42" />
  <img src="./public/readme/tailwindcss.svg" alt="Tailwind CSS" height="42" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL" height="42" />
</p>

![divider](./public/readme/divider.svg)

## Daftar Isi
- [Ringkasan](#ringkasan)
- [Tujuan Proyek](#tujuan-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack Detail](#tech-stack-detail)
- [Struktur Sistem dan Modul](#struktur-sistem-dan-modul)
- [Diagram UML dan Arsitektur](#diagram-uml-dan-arsitektur)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)
- [Konfigurasi Kunci](#konfigurasi-kunci)
- [Setup Lokal](#setup-lokal)
- [Port Default](#port-default)
- [SOP Admin](#sop-admin)
- [SOP Mahasiswa](#sop-mahasiswa)
- [Flow Troubleshooting](#flow-troubleshooting)
- [Catatan Hosting](#catatan-hosting)
- [Legal dan Kepatuhan](#legal-dan-kepatuhan)
- [Referensi Layanan AI](#referensi-layanan-ai)

![divider](./public/readme/divider.svg)

## Ringkasan
- <img src="./public/readme/icons/info.svg" alt="Info" height="18" /> TPLK004 adalah sistem absensi mahasiswa berbasis web yang menggabungkan geofence dan verifikasi kamera (AI + selfie) agar kehadiran valid.
- <img src="./public/readme/icons/cpu.svg" alt="AI" height="18" /> Backend Laravel bertugas mengorkestrasi proses: menerima request, validasi lokasi, memanggil AI Service, lalu mencatat hasil.
- <img src="./public/readme/icons/map-pin.svg" alt="Geofence" height="18" /> Geofence memastikan mahasiswa berada di radius yang ditentukan sebelum absensi diterima.
- <img src="./public/readme/icons/database.svg" alt="Audit" height="18" /> Semua aktivitas tersimpan sebagai audit trail (waktu, lokasi, selfie, status) untuk rekap dan verifikasi.

![divider](./public/readme/divider.svg)

## Tujuan Proyek
- <img src="./public/readme/icons/target.svg" alt="Target" height="18" /> Mengurangi kecurangan absensi melalui kombinasi lokasi dan verifikasi visual.
- <img src="./public/readme/icons/layout-dashboard.svg" alt="Dashboard" height="18" /> Menyediakan dashboard admin yang ringkas dan mudah diaudit.
- <img src="./public/readme/icons/users.svg" alt="Users" height="18" /> Menjaga pengalaman mahasiswa tetap sederhana tanpa input manual berulang.

![divider](./public/readme/divider.svg)

## Fitur Utama
- <img src="./public/readme/icons/layout-dashboard.svg" alt="Dashboard" height="18" /> Dashboard admin untuk memonitor sesi, rekap, dan status absensi.
- <img src="./public/readme/icons/map-pin.svg" alt="Geofence" height="18" /> Geofence dinamis: admin dapat menetapkan titik pusat dan radius absensi.
- <img src="./public/readme/icons/camera.svg" alt="Selfie" height="18" /> Verifikasi selfie untuk approval atau penolakan oleh admin.
- <img src="./public/readme/icons/cpu.svg" alt="AI" height="18" /> Absen AI: deteksi kamera admin untuk mencatat absensi otomatis.
- <img src="./public/readme/icons/user-check.svg" alt="Mahasiswa" height="18" /> Mahasiswa melakukan absen dengan kamera + lokasi otomatis.
- <img src="./public/readme/icons/database.svg" alt="Rekap" height="18" /> Rekap absensi dan bukti masuk tersedia di sisi mahasiswa.

![divider](./public/readme/divider.svg)

## Tech Stack Detail
- <img src="./public/readme/icons/info.svg" alt="Info" height="18" /> Versi di bawah mengikuti dependensi yang tercatat pada repository ini.

### Frontend Core
<p>
  <img src="https://img.shields.io/badge/React-19.2.0-38bdf8?style=flat-square&logo=react&logoColor=white&labelColor=0f172a" alt="React" />
  <img src="https://img.shields.io/badge/Inertia-2.1.4-6366f1?style=flat-square&labelColor=0f172a" alt="Inertia" />
  <img src="https://img.shields.io/badge/Vite-7.0.4-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=0f172a" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.0.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=0f172a" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=0f172a" alt="TypeScript" />
</p>

### UI dan Utilities
<p>
  <img src="https://img.shields.io/badge/Radix%20UI-1.1.x-9333EA?style=flat-square&logo=radixui&logoColor=white&labelColor=0f172a" alt="Radix UI" />
  <img src="https://img.shields.io/badge/Headless%20UI-2.2.0-111827?style=flat-square&logo=headlessui&logoColor=white&labelColor=0f172a" alt="Headless UI" />
  <img src="https://img.shields.io/badge/Lucide-0.475.0-22c55e?style=flat-square&logo=lucide&logoColor=white&labelColor=0f172a" alt="Lucide" />
  <img src="https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat-square&logo=leaflet&logoColor=white&labelColor=0f172a" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Recharts-3.6.0-06b6d4?style=flat-square&labelColor=0f172a" alt="Recharts" />
  <img src="https://img.shields.io/badge/Lottie-0.17.12-0ea5e9?style=flat-square&labelColor=0f172a" alt="Lottie" />
  <img src="https://img.shields.io/badge/QRCode-1.5.4-64748b?style=flat-square&labelColor=0f172a" alt="QRCode" />
</p>

### Backend
<p>
  <img src="https://img.shields.io/badge/Laravel-12.x-F55247?style=flat-square&logo=laravel&logoColor=white&labelColor=0f172a" alt="Laravel" />
  <img src="https://img.shields.io/badge/PHP-8.2-777BB4?style=flat-square&logo=php&logoColor=white&labelColor=0f172a" alt="PHP" />
  <img src="https://img.shields.io/badge/Inertia%20Laravel-2.0-6366f1?style=flat-square&labelColor=0f172a" alt="Inertia Laravel" />
  <img src="https://img.shields.io/badge/Fortify-1.30-F55247?style=flat-square&labelColor=0f172a" alt="Fortify" />
  <img src="https://img.shields.io/badge/MySQL-DB-4479A1?style=flat-square&logo=mysql&logoColor=white&labelColor=0f172a" alt="MySQL" />
</p>

### AI Service
<p>
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white&labelColor=0f172a" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat-square&logo=fastapi&logoColor=white&labelColor=0f172a" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Uvicorn-0.30.3-0ea5e9?style=flat-square&labelColor=0f172a" alt="Uvicorn" />
  <img src="https://img.shields.io/badge/Ultralytics%20YOLO-8.2%2B-111827?style=flat-square&labelColor=0f172a" alt="Ultralytics YOLO" />
  <img src="https://img.shields.io/badge/PyTorch-2.1%2B-EE4C2C?style=flat-square&logo=pytorch&logoColor=white&labelColor=0f172a" alt="PyTorch" />
  <img src="https://img.shields.io/badge/Torchvision-0.16%2B-64748b?style=flat-square&labelColor=0f172a" alt="Torchvision" />
</p>

### Dev Tools
<p>
  <img src="https://img.shields.io/badge/ESLint-9.17.0-4B32C3?style=flat-square&logo=eslint&logoColor=white&labelColor=0f172a" alt="ESLint" />
  <img src="https://img.shields.io/badge/Prettier-3.4.2-F7B93E?style=flat-square&logo=prettier&logoColor=white&labelColor=0f172a" alt="Prettier" />
  <img src="https://img.shields.io/badge/Pest-4.2-7c3aed?style=flat-square&labelColor=0f172a" alt="Pest" />
</p>

![divider](./public/readme/divider.svg)

## Struktur Sistem dan Modul
- <img src="./public/readme/icons/info.svg" alt="Info" height="18" /> Aplikasi dibagi menjadi frontend, backend, dan AI service agar proses absensi terukur dan mudah dipelihara.

### Peran Pengguna
- <img src="./public/readme/icons/layout-dashboard.svg" alt="Admin" height="18" /> Admin: kelola geofence, verifikasi selfie, jalankan absen AI, dan kelola data mahasiswa.
- <img src="./public/readme/icons/user-check.svg" alt="Mahasiswa" height="18" /> Mahasiswa: absen dengan kamera + lokasi otomatis dan melihat rekap.

### Modul Admin
- <img src="./public/readme/icons/layout-dashboard.svg" alt="Dashboard" height="18" /> Dashboard ringkas untuk status sesi, statistik, dan rekap.
- <img src="./public/readme/icons/map-pin.svg" alt="Geofence" height="18" /> Zona 100 Meter untuk mengatur titik dan radius absensi.
- <img src="./public/readme/icons/camera.svg" alt="Selfie" height="18" /> Verifikasi selfie mahasiswa (approve/reject) dengan catatan.
- <img src="./public/readme/icons/cpu.svg" alt="AI" height="18" /> Absen AI untuk deteksi kamera admin dan auto-record ke database.

### Modul Mahasiswa
- <img src="./public/readme/icons/user-check.svg" alt="Absen" height="18" /> Absensi berbasis kamera + lokasi tanpa input manual.
- <img src="./public/readme/icons/database.svg" alt="Rekap" height="18" /> Rekap dan bukti masuk tersimpan untuk audit dan histori.

### Modul AI Service
- <img src="./public/readme/icons/cpu.svg" alt="Inference" height="18" /> Endpoint inference YOLO untuk deteksi objek/wajah sesuai kebutuhan.
- <img src="./public/readme/icons/server.svg" alt="Server" height="18" /> Dipanggil melalui backend sebagai proxy untuk menghindari CORS.
- <img src="./public/readme/icons/shield-check.svg" alt="Security" height="18" /> Mendukung API key dan batasan payload untuk keamanan.

![divider](./public/readme/divider.svg)

## Diagram UML dan Arsitektur
- <img src="./public/readme/icons/info.svg" alt="Info" height="18" /> Diagram berikut merangkum alur utama, struktur data, dan hubungan antar modul.

### Use Case Diagram (Umum)
```mermaid
flowchart LR
    Mahasiswa([Mahasiswa]) --> UC1((Absen))
    Mahasiswa --> UC2((Lihat Rekap))
    Mahasiswa --> UC3((Kirim Selfie))
    Admin([Admin]) --> UC4((Kelola Geofence))
    Admin --> UC5((Verifikasi Selfie))
    Admin --> UC6((Absen AI))
    Admin --> UC7((Kelola Mahasiswa))
```

### Activity Diagram (Absensi Mahasiswa)
```mermaid
flowchart TD
    Start([Mulai]) --> Open[Masuk halaman Absen]
    Open --> Permission{Izin kamera & lokasi?}
    Permission -- Tidak --> Denied[Notifikasi izin]
    Denied --> End([Selesai])
    Permission -- Ya --> Capture[Ambil lokasi + kamera]
    Capture --> InRange{Dalam geofence?}
    InRange -- Tidak --> Reject[Ditolak, tampilkan alasan]
    InRange -- Ya --> Detect[Deteksi AI / selfie]
    Detect --> Match{Valid?}
    Match -- Tidak --> Retry[Ulangi scan]
    Match -- Ya --> Record[Catat absensi]
    Record --> End
```

### Class Diagram (High Level)
```mermaid
classDiagram
    class User {
        +id
        +name
        +email
        +role
    }
    class Admin
    class Mahasiswa {
        +nim
    }
    User <|-- Admin
    User <|-- Mahasiswa

    class AttendanceSession {
        +id
        +title
        +date
        +status
    }
    class AttendanceRecord {
        +id
        +status
        +check_in_at
    }
    class Geofence {
        +lat
        +lng
        +radius_m
    }
    class Selfie {
        +path
        +status
    }
    class AiInference {
        +label
        +confidence
    }

    AttendanceSession "1" --> "many" AttendanceRecord
    Mahasiswa "1" --> "many" AttendanceRecord
    AttendanceSession "1" --> "1" Geofence
    AttendanceRecord "0..1" --> Selfie
    AttendanceRecord "0..1" --> AiInference
```

### Diagram Konseptual / High-Level Architecture
```mermaid
flowchart LR
    subgraph Clients
        A[Mahasiswa Web]
        C[Admin Web]
    end
    subgraph App
        B[Laravel Backend]
        D[AI Service]
    end
    A -->|Scan + GPS| B
    C -->|Absen AI| B
    B -->|Call inference| D
    B --> E[(Database)]
    B --> F[(Storage)]
```
- <img src="./public/readme/icons/server.svg" alt="Server" height="18" /> Backend menjadi penghubung utama antara UI, database, storage, dan AI service.
- <img src="./public/readme/icons/database.svg" alt="Database" height="18" /> Data absensi, selfie, dan metadata disimpan terpusat untuk audit.
- <img src="./public/readme/icons/cpu.svg" alt="AI" height="18" /> AI service hanya menangani inference agar proses inti tetap cepat dan terisolasi.


## Dokumentasi Lengkap
- <img src="./public/readme/icons/info.svg" alt="Docs" height="18" /> Lihat `docs/DOKUMENTASI.md` untuk detail alur, modul, konfigurasi, dan troubleshooting.


## Konfigurasi Kunci
### Laravel (.env)
- <img src="./public/readme/icons/server.svg" alt="Service" height="18" /> `YOLO_SERVICE_URL` mengarah ke AI service yang menerima request inference.
- <img src="./public/readme/icons/shield-check.svg" alt="Security" height="18" /> `YOLO_API_KEY` dipakai jika endpoint inference dilindungi.
- <img src="./public/readme/icons/cpu.svg" alt="Threshold" height="18" /> `YOLO_MIN_CONF` menentukan batas confidence minimal.
- <img src="./public/readme/icons/map-pin.svg" alt="Location" height="18" /> `LOCATION_*` mengatur sampling lokasi dan anti-spoofing.
```
YOLO_SERVICE_URL=http://127.0.0.1:9001
YOLO_API_KEY=
YOLO_MIN_CONF=0.6
YOLO_TARGET_LABEL=
YOLO_MAINTENANCE_MODE=true

LOCATION_SAMPLE_COUNT=3
LOCATION_SAMPLE_WINDOW_SECONDS=20
LOCATION_SAMPLE_MAX_AGE_SECONDS=60
LOCATION_MAX_SPEED_MPS=35
LOCATION_MAX_JUMP_M=150
LOCATION_MAX_SPREAD_M=100
```

### AI Service (.env)
- <img src="./public/readme/icons/cpu.svg" alt="Model" height="18" /> `MODEL_PATH` menentukan model YOLO yang dipakai.
- <img src="./public/readme/icons/server.svg" alt="Runtime" height="18" /> `DEVICE`, `CONF`, dan `IMGSZ` mengatur performa inference.
- <img src="./public/readme/icons/shield-check.svg" alt="Security" height="18" /> `API_KEY` opsional untuk mengamankan endpoint.
```
MODEL_PATH=models/yolov8m.pt
DEVICE=auto
CONF=0.25
IOU=0.45
IMGSZ=640
API_KEY=
INFER_CONCURRENCY=1
MAX_IMAGE_BYTES=8388608
```

![divider](./public/readme/divider.svg)

## Setup Lokal
### 1) Backend (Laravel)
- <img src="./public/readme/icons/wrench.svg" alt="Setup" height="18" /> Menyiapkan dependensi PHP, key aplikasi, migrasi, dan storage link.
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

### 2) Frontend (Vite)
- <img src="./public/readme/icons/wrench.svg" alt="Setup" height="18" /> Menjalankan bundler Vite untuk UI React.
```bash
npm install
npm run dev
```

### 3) AI Service (YOLO)
- <img src="./public/readme/icons/wrench.svg" alt="Setup" height="18" /> Menjalankan FastAPI + YOLO pada port 9001.
```bash
cd TPLK004-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DEVICE=mps
export MODEL_PATH=models/yolov8m.pt
export PYTORCH_ENABLE_MPS_FALLBACK=1
uvicorn app:app --host 127.0.0.1 --port 9001
```

### 4) Env untuk integrasi AI (Laravel)
- <img src="./public/readme/icons/cpu.svg" alt="Integration" height="18" /> Pastikan Laravel mengarah ke AI service yang aktif.
```
YOLO_SERVICE_URL=http://127.0.0.1:9001
YOLO_API_KEY=
YOLO_MIN_CONF=0.6
YOLO_TARGET_LABEL=
YOLO_MAINTENANCE_MODE=true
```

![divider](./public/readme/divider.svg)

## Port Default
- <img src="./public/readme/icons/server.svg" alt="Port" height="18" /> Laravel: `http://127.0.0.1:8000`
- <img src="./public/readme/icons/server.svg" alt="Port" height="18" /> Vite: `http://127.0.0.1:5173`
- <img src="./public/readme/icons/server.svg" alt="Port" height="18" /> YOLO Service: `http://127.0.0.1:9001`


## SOP Admin
### A. Set Geofence (Zona 100 Meter)
1. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Login sebagai admin.
2. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Buka menu `Zona 100 Meter`.
3. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Klik `Pindai lokasi saat ini` atau geser pin di peta.
4. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Atur radius (mis. 100m).
5. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Klik `Simpan geofence`.

### B. Validasi Selfie
1. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Buka menu `Verifikasi Selfie`.
2. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Pilih data mahasiswa yang pending.
3. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Cek foto selfie dan detail absensi.
4. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Klik `Approve` atau `Reject` lalu simpan catatan.

### C. Absen AI (Admin Kamera)
1. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Buka menu `Absen AI`.
2. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Pilih mahasiswa target (jika tersedia).
3. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Klik `Mulai kamera`.
4. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Tunggu hasil deteksi, lalu klik `Scan sekali` jika perlu.

![divider](./public/readme/divider.svg)

## SOP Mahasiswa (Cara Scan)
1. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Login sebagai mahasiswa.
2. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Buka halaman `Absen`.
3. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Izinkan akses kamera dan lokasi.
4. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Pastikan berada di dalam radius geofence.
5. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Tampilkan wajah di kamera hingga status terverifikasi.
6. <img src="./public/readme/icons/circle-check.svg" alt="Step" height="18" /> Jika diminta selfie, ambil foto sesuai instruksi.

![divider](./public/readme/divider.svg)

## Flow Troubleshooting
### 1) Web tidak bisa dibuka
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Pastikan `php artisan serve` berjalan.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Cek URL yang benar (localhost atau domain hosting).

### 2) Kamera tidak muncul
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Pastikan izin kamera di browser aktif.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Gunakan HTTPS di hosting (kamera butuh HTTPS).
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Tutup aplikasi lain yang memakai kamera.

### 3) Lokasi ditolak / di luar radius
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Aktifkan GPS di browser.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Cek geofence di menu `Zona 100 Meter`.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Pastikan radius tidak terlalu kecil.

### 4) Absen AI tidak mendeteksi
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Pastikan YOLO service hidup di port 9001.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Cek `YOLO_SERVICE_URL` di `.env`.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Periksa apakah `YOLO_API_KEY` cocok (jika dipakai).

### 5) Foto selfie tidak tampil di admin
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Jalankan `php artisan storage:link`.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Pastikan folder `storage/app/public` dapat diakses.

### 6) CSS/JS tidak muncul di hosting
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Jalankan `npm run build` sebelum upload.
- <img src="./public/readme/icons/bug.svg" alt="Issue" height="18" /> Pastikan folder `public/build` ikut ter-upload.

![divider](./public/readme/divider.svg)

## Catatan Hosting
- <img src="./public/readme/icons/server.svg" alt="Hosting" height="18" /> Gunakan `.env` produksi terpisah.
- <img src="./public/readme/icons/server.svg" alt="Hosting" height="18" /> Pastikan `APP_URL` sesuai domain.
- <img src="./public/readme/icons/shield-check.svg" alt="Hosting" height="18" /> Gunakan SSL agar kamera dan lokasi berjalan.

![divider](./public/readme/divider.svg)

## Legal dan Kepatuhan
- <img src="./public/readme/icons/shield-check.svg" alt="Privacy" height="18" /> Kebijakan privasi tersedia di `/privacy` (lihat `resources/js/pages/privacy.tsx`).
- <img src="./public/readme/icons/shield-check.svg" alt="Consent" height="18" /> Persetujuan penggunaan kamera dan lokasi ditampilkan sebelum scan.
- <img src="./public/readme/icons/shield-check.svg" alt="Deletion" height="18" /> Penghapusan data dilakukan melalui admin kampus setelah verifikasi.

<div align="center">
  <img src="https://raw.githubusercontent.com/platane/snk/output/github-contribution-grid-snake.svg" alt="Animated footer" />
</div>

![divider](./public/readme/divider.svg)

## Referensi Layanan AI
- <img src="./public/readme/icons/cpu.svg" alt="AI" height="18" /> Lihat `TPLK004-service/README.md` untuk detail service YOLO, endpoint, dan konfigurasi.
