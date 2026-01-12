<p align="center">
  <img src="./public/image.png" alt="UNPAM" height="120" />
</p>

<h1 align="center">🎓 TPLK004 - Sistem Absensi Cerdas Berbasis AI</h1>
<h3 align="center">Universitas Pamulang • Fakultas Ilmu Komputer • Teknik Informatika</h3>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3200&pause=600&color=10B981&center=true&vCenter=true&width=900&lines=🤖+AI-Powered+Attendance+System;📍+Geofence+%2B+Face+Verification;🔒+Anti-Fraud+%26+Real-time+Monitoring;📊+Advanced+Analytics+%26+Gamification" alt="Animated intro" />
</p>

<p align="center">
  <a href="#-fitur-utama"><img src="https://img.shields.io/badge/Features-40+-10B981?style=for-the-badge" alt="Features" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/YOLO-v8-00FFFF?style=for-the-badge" alt="YOLO" /></a>
  <a href="#-instalasi"><img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status" /></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/laravel/laravel-original.svg" alt="Laravel" height="50" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" height="50" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" height="50" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" height="50" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL" height="50" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind" height="50" />
</p>

---

## 📑 Daftar Isi

<details open>
<summary>Klik untuk melihat daftar isi lengkap</summary>

- [🎯 Tentang Project](#-tentang-project)
- [✨ Fitur Utama](#-fitur-utama)
- [🏗️ Arsitektur Sistem](#️-arsitektur-sistem)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Struktur Project](#-struktur-project)
- [⚙️ Instalasi](#️-instalasi)
- [🔧 Konfigurasi](#-konfigurasi)
- [👥 Multi-Role System](#-multi-role-system)
- [📱 Fitur per Role](#-fitur-per-role)
- [🎮 Sistem Gamifikasi](#-sistem-gamifikasi)
- [📊 Analytics & Reporting](#-analytics--reporting)
- [🔐 Keamanan](#-keamanan)
- [🌐 Deployment](#-deployment)
- [📖 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🤝 Kontribusi](#-kontribusi)
- [📄 Lisensi](#-lisensi)
- [👨‍💻 Tim Pengembang](#-tim-pengembang)

</details>

---

## 🎯 Tentang Project

**TPLK004** adalah sistem absensi mahasiswa berbasis web yang mengintegrasikan teknologi **Artificial Intelligence (AI)**, **Geofencing**, dan **Face Verification** untuk memastikan kehadiran yang valid dan mencegah kecurangan.

### 🎓 Informasi Akademik

| Informasi | Detail |
|-----------|--------|
| **Universitas** | Universitas Pamulang (UNPAM) |
| **Fakultas** | Fakultas Ilmu Komputer |
| **Program Studi** | Teknik Informatika |
| **Kelas** | 06TPLK004 |
| **Tahun** | 2024/2025 |

### 📋 Latar Belakang

Sistem absensi konvensional memiliki beberapa kelemahan:
- ❌ Mudah dimanipulasi (titip absen)
- ❌ Tidak ada validasi lokasi
- ❌ Proses manual yang memakan waktu
- ❌ Sulit melacak kehadiran real-time

**TPLK004** hadir sebagai solusi dengan:
- ✅ Verifikasi wajah menggunakan AI
- ✅ Validasi lokasi dengan Geofencing
- ✅ QR Code dinamis yang berubah setiap sesi
- ✅ Dashboard real-time untuk monitoring
- ✅ Sistem gamifikasi untuk meningkatkan engagement

### 🏆 Keunggulan Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                    TPLK004 ADVANTAGES                           │
├─────────────────────────────────────────────────────────────────┤
│  🤖 AI-Powered      │ Deteksi wajah otomatis dengan YOLO v8    │
│  📍 Geofencing      │ Validasi lokasi dalam radius tertentu    │
│  🔄 Real-time       │ Monitoring kehadiran secara langsung     │
│  🎮 Gamification    │ Badge, level, streak untuk engagement    │
│  📊 Analytics       │ Laporan dan statistik komprehensif       │
│  🔒 Anti-Fraud      │ Mencegah kecurangan absensi              │
│  📱 PWA Ready       │ Dapat diinstall seperti aplikasi native  │
│  🌙 Dark Mode       │ Tampilan nyaman untuk mata               │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Utama

### 🎯 Core Features

<table>
<tr>
<td width="50%">

#### 📸 Absensi Berbasis AI
- Face detection dengan YOLO v8
- Selfie verification
- Anti-spoofing detection
- Real-time camera scanning

#### 📍 Geofencing System
- Radius validasi dinamis
- GPS tracking
- Location sampling
- Anti-GPS spoofing

#### 🔐 QR Code Dinamis
- Token berubah setiap sesi
- Expiry time otomatis
- One-time use validation
- Regenerate on demand

</td>
<td width="50%">

#### 👥 Multi-Role Management
- Admin (Super Admin)
- Dosen (Lecturer)
- Mahasiswa (Student)
- Role-based permissions

#### 📊 Advanced Analytics
- Attendance trends
- Risk analysis
- Performance metrics
- Export to PDF/Excel

#### 🎮 Gamification
- Badge system
- Level progression
- Attendance streaks
- Leaderboard

</td>
</tr>
</table>

### 📋 Fitur Lengkap

<details>
<summary><b>🔹 Modul Admin (15+ Fitur)</b></summary>

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Dashboard Analytics | Statistik kehadiran, grafik tren, risk analysis |
| 2 | Manajemen Mahasiswa | CRUD data mahasiswa, import/export |
| 3 | Manajemen Dosen | CRUD data dosen, assign mata kuliah |
| 4 | Manajemen Mata Kuliah | CRUD courses, jadwal, ruangan |
| 5 | Geofence Settings | Set lokasi dan radius absensi |
| 6 | Verifikasi Selfie | Approve/reject selfie mahasiswa |
| 7 | Absen AI | Scan kamera untuk deteksi otomatis |
| 8 | Rekap Kehadiran | Laporan per kelas, mata kuliah, periode |
| 9 | Export Data | PDF, Excel, CSV |
| 10 | Activity Log | Audit trail semua aktivitas |
| 11 | Kas Management | Kelola uang kas kelas |
| 12 | Tugas Management | Kelola tugas dan deadline |
| 13 | Pengumuman | Broadcast ke mahasiswa |
| 14 | Settings | Konfigurasi sistem |
| 15 | Help Center | Panduan dan FAQ |

</details>

<details>
<summary><b>🔹 Modul Dosen (10+ Fitur)</b></summary>

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Dashboard | Overview kelas dan kehadiran |
| 2 | Mata Kuliah | Lihat dan kelola mata kuliah |
| 3 | Buat Sesi Absensi | Generate QR code untuk absensi |
| 4 | Monitoring Real-time | Lihat siapa yang sudah absen |
| 5 | Verifikasi Manual | Approve/reject absensi pending |
| 6 | Rekap Kehadiran | Laporan per mahasiswa |
| 7 | Persetujuan Izin | Approve izin/sakit mahasiswa |
| 8 | Tugas & Grading | Buat tugas dan nilai |
| 9 | Diskusi | Forum diskusi dengan mahasiswa |
| 10 | Profile | Kelola profil dosen |

</details>

<details>
<summary><b>🔹 Modul Mahasiswa (12+ Fitur)</b></summary>

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Dashboard | Overview kehadiran dan statistik |
| 2 | Scan QR Absensi | Absen dengan scan QR + lokasi |
| 3 | Selfie Verification | Upload selfie untuk verifikasi |
| 4 | Riwayat Kehadiran | History absensi lengkap |
| 5 | Rekapan | Statistik kehadiran per mata kuliah |
| 6 | Pengajuan Izin | Submit izin/sakit dengan bukti |
| 7 | Informasi Tugas | Lihat tugas dan deadline |
| 8 | Submit Tugas | Upload tugas dengan attachment |
| 9 | Pencapaian | Badge dan achievement |
| 10 | Leaderboard | Ranking kehadiran |
| 11 | Uang Kas | Lihat status pembayaran kas |
| 12 | Voting Kas | Vote untuk penggunaan kas |
| 13 | Profile | Kelola profil mahasiswa |

</details>

---

## 🏗️ Arsitektur Sistem

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Admin UI   │  │   Dosen UI   │  │ Mahasiswa UI │                   │
│  │   (React)    │  │   (React)    │  │   (React)    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
│         │                 │                 │                            │
│         └─────────────────┼─────────────────┘                            │
│                           │                                              │
│                    ┌──────▼──────┐                                       │
│                    │   Inertia   │                                       │
│                    │    Bridge   │                                       │
│                    └──────┬──────┘                                       │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────┐
│                         APPLICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Laravel 12 Backend                          │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │    │
│  │  │ Controllers │  │   Models    │  │  Services   │              │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │    │
│  │  │ Middleware  │  │   Guards    │  │   Events    │              │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
┌─────────▼─────────┐ ┌────▼────┐ ┌─────────▼─────────┐
│   AI SERVICE      │ │ MySQL   │ │   FILE STORAGE    │
├───────────────────┤ │ Database│ ├───────────────────┤
│  FastAPI + YOLO   │ └─────────┘ │  Selfies, Docs    │
│  Face Detection   │             │  Attachments      │
│  Object Detection │             │  QR Codes         │
└───────────────────┘             └───────────────────┘
```

### Database Schema (Simplified)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    mahasiswa    │     │      dosen      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ name            │     │ nim             │     │ nidn            │
│ email           │     │ nama            │     │ nama            │
│ password        │     │ email           │     │ email           │
│ role            │     │ kelas           │     │ password        │
└─────────────────┘     │ password        │     └────────┬────────┘
                        └────────┬────────┘              │
                                 │                       │
                        ┌────────▼────────┐     ┌────────▼────────┐
                        │ attendance_logs │     │   mata_kuliah   │
                        ├─────────────────┤     ├─────────────────┤
                        │ id              │     │ id              │
                        │ mahasiswa_id    │◄────┤ dosen_id        │
                        │ session_id      │     │ nama            │
                        │ status          │     │ kode            │
                        │ check_in_at     │     │ sks             │
                        │ selfie_path     │     └─────────────────┘
                        │ location        │
                        └─────────────────┘
```

### Request Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───▶│  Nginx   │───▶│ Laravel  │───▶│   AI     │───▶│ Database │
│ (React)  │    │ (Proxy)  │    │ Backend  │    │ Service  │    │ (MySQL)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                               │                               │
     │         1. Scan QR            │                               │
     │──────────────────────────────▶│                               │
     │                               │      2. Validate Token        │
     │                               │──────────────────────────────▶│
     │                               │◀──────────────────────────────│
     │                               │                               │
     │                               │      3. Check Geofence        │
     │                               │──────────────────────────────▶│
     │                               │◀──────────────────────────────│
     │                               │                               │
     │         4. Request Selfie     │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
     │         5. Upload Selfie      │                               │
     │──────────────────────────────▶│      6. AI Verification       │
     │                               │──────────────────────────────▶│
     │                               │◀──────────────────────────────│
     │                               │                               │
     │                               │      7. Save Attendance       │
     │                               │──────────────────────────────▶│
     │         8. Success Response   │◀──────────────────────────────│
     │◀──────────────────────────────│                               │
     │                               │                               │
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Library |
| TypeScript | 5.7.x | Type Safety |
| Inertia.js | 2.x | SPA Bridge |
| Tailwind CSS | 4.x | Styling |
| Radix UI | 1.x | Headless Components |
| Lucide Icons | 0.475.x | Icons |
| Recharts | 3.x | Charts & Graphs |
| Leaflet | 1.9.x | Maps |
| React Webcam | 7.x | Camera Access |
| QRCode.react | 4.x | QR Generation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 12.x | PHP Framework |
| PHP | 8.2+ | Server Language |
| MySQL | 8.x | Database |
| Laravel Fortify | 1.x | Authentication |
| Inertia Laravel | 2.x | SPA Integration |
| Laravel Sanctum | 4.x | API Auth |

### AI Service

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Language |
| FastAPI | 0.111.x | API Framework |
| Ultralytics YOLO | 8.x | Object Detection |
| PyTorch | 2.x | Deep Learning |
| OpenCV | 4.x | Image Processing |

### DevOps & Tools

| Technology | Purpose |
|------------|---------|
| Vite | Build Tool |
| ESLint | Linting |
| Prettier | Code Formatting |
| Pest | PHP Testing |
| Git | Version Control |

---

## 📁 Struktur Project

```
TPLK004/
├── 📂 app/
│   ├── 📂 Actions/           # Business logic actions
│   ├── 📂 Http/
│   │   ├── 📂 Controllers/
│   │   │   ├── 📂 Admin/     # Admin controllers
│   │   │   ├── 📂 Dosen/     # Dosen controllers
│   │   │   ├── 📂 User/      # Mahasiswa controllers
│   │   │   └── 📂 Auth/      # Authentication
│   │   └── 📂 Middleware/    # Custom middleware
│   ├── 📂 Models/            # Eloquent models
│   └── 📂 Providers/         # Service providers
│
├── 📂 database/
│   ├── 📂 migrations/        # Database migrations
│   ├── 📂 seeders/           # Data seeders
│   └── 📂 factories/         # Model factories
│
├── 📂 resources/
│   ├── 📂 js/
│   │   ├── 📂 components/    # React components
│   │   │   ├── 📂 ui/        # UI primitives
│   │   │   ├── 📂 analytics/ # Analytics components
│   │   │   └── 📂 qr/        # QR components
│   │   ├── 📂 pages/         # Page components
│   │   │   ├── 📂 admin/     # Admin pages
│   │   │   ├── 📂 dosen/     # Dosen pages
│   │   │   ├── 📂 user/      # Mahasiswa pages
│   │   │   └── 📂 auth/      # Auth pages
│   │   ├── 📂 layouts/       # Layout components
│   │   ├── 📂 hooks/         # Custom React hooks
│   │   ├── 📂 lib/           # Utilities
│   │   └── 📂 types/         # TypeScript types
│   ├── 📂 css/               # Stylesheets
│   └── 📂 views/             # Blade templates
│
├── 📂 routes/
│   ├── 📄 web.php            # Web routes
│   ├── 📄 dosen.php          # Dosen routes
│   └── 📄 api.php            # API routes
│
├── 📂 public/
│   ├── 📂 build/             # Compiled assets
│   └── 📄 manifest.json      # PWA manifest
│
├── 📂 config/                # Configuration files
├── 📂 storage/               # File storage
├── 📂 tests/                 # Test files
├── 📂 docs/                  # Documentation
│
├── 📄 .env.example           # Environment template
├── 📄 composer.json          # PHP dependencies
├── 📄 package.json           # Node dependencies
├── 📄 vite.config.ts         # Vite configuration
└── 📄 README.md              # This file
```

---

## ⚙️ Instalasi

### Prerequisites

Pastikan sistem Anda memiliki:

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x
- **MySQL** >= 8.x
- **Git**

### Step-by-Step Installation


#### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/TPLK004.git
cd TPLK004
```

#### 2️⃣ Install PHP Dependencies

```bash
composer install
```

#### 3️⃣ Install Node Dependencies

```bash
npm install
```

#### 4️⃣ Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### 5️⃣ Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE tplk004"

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed
```

#### 6️⃣ Storage Link

```bash
php artisan storage:link
```

#### 7️⃣ Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

#### 8️⃣ Start Server

```bash
# Laravel server
php artisan serve

# Vite dev server (separate terminal)
npm run dev
```

### 🐳 Docker Installation (Optional)

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate --seed
```

---

## 🔧 Konfigurasi

### Environment Variables

```env
# Application
APP_NAME="TPLK004 Absensi"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tplk004
DB_USERNAME=root
DB_PASSWORD=

# AI Service
YOLO_SERVICE_URL=http://127.0.0.1:9001
YOLO_API_KEY=
YOLO_MIN_CONF=0.6
YOLO_MAINTENANCE_MODE=false

# Geofence Settings
LOCATION_SAMPLE_COUNT=3
LOCATION_SAMPLE_WINDOW_SECONDS=20
LOCATION_MAX_SPEED_MPS=35
LOCATION_MAX_JUMP_M=150

# Mail (for notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Geofence Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCATION_SAMPLE_COUNT` | 3 | Jumlah sample lokasi |
| `LOCATION_SAMPLE_WINDOW_SECONDS` | 20 | Window waktu sampling |
| `LOCATION_MAX_SPEED_MPS` | 35 | Kecepatan maksimal (m/s) |
| `LOCATION_MAX_JUMP_M` | 150 | Jarak lompatan maksimal |
| `LOCATION_MAX_SPREAD_M` | 100 | Spread maksimal |

### AI Service Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | models/yolov8m.pt | Path ke model YOLO |
| `DEVICE` | auto | Device (cpu/cuda/mps) |
| `CONF` | 0.25 | Confidence threshold |
| `IOU` | 0.45 | IOU threshold |
| `IMGSZ` | 640 | Image size |

---

## 👥 Multi-Role System

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN (Super Admin)                     │
│  • Full system access                                        │
│  • Manage all users                                          │
│  • System configuration                                      │
│  • Analytics & reports                                       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│         DOSEN           │     │       MAHASISWA         │
│  • Manage own courses   │     │  • Attendance only      │
│  • Create sessions      │     │  • View own records     │
│  • Verify attendance    │     │  • Submit permits       │
│  • Grade assignments    │     │  • View achievements    │
└─────────────────────────┘     └─────────────────────────┘
```

### Authentication Guards

| Guard | Model | Purpose |
|-------|-------|---------|
| `web` | User | Admin authentication |
| `dosen` | Dosen | Dosen authentication |
| `mahasiswa` | Mahasiswa | Student authentication |

### Login URLs

| Role | URL | Credentials |
|------|-----|-------------|
| Admin | `/login` | Email + Password |
| Dosen | `/dosen/login` | NIDN + Password |
| Mahasiswa | `/mahasiswa/login` | NIM + Password |

---

## 📱 Fitur per Role

### 🔴 Admin Features

<details>
<summary>Lihat detail fitur Admin</summary>

#### Dashboard
- Total mahasiswa, dosen, mata kuliah
- Statistik kehadiran hari ini
- Grafik tren kehadiran mingguan
- Risk analysis (mahasiswa berisiko)
- Recent activities

#### Manajemen Data
- CRUD Mahasiswa (import Excel)
- CRUD Dosen
- CRUD Mata Kuliah
- CRUD Kelas

#### Absensi
- Geofence settings (peta interaktif)
- Verifikasi selfie
- Absen AI (kamera admin)
- Rekap kehadiran

#### Keuangan
- Manajemen uang kas
- Laporan keuangan
- Voting kas

#### Sistem
- Activity log
- Settings
- Help center
- Panduan admin

</details>

### 🟢 Dosen Features

<details>
<summary>Lihat detail fitur Dosen</summary>

#### Dashboard
- Overview mata kuliah
- Statistik kehadiran per kelas
- Sesi aktif

#### Mata Kuliah
- Lihat daftar mata kuliah
- Detail mahasiswa per kelas
- Statistik per mahasiswa

#### Sesi Absensi
- Buat sesi baru
- Generate QR code
- Monitoring real-time
- Tutup sesi

#### Verifikasi
- Approve/reject absensi pending
- Lihat selfie mahasiswa
- Catatan verifikasi

#### Izin & Tugas
- Persetujuan izin/sakit
- Buat tugas
- Grading tugas
- Diskusi

</details>

### 🔵 Mahasiswa Features

<details>
<summary>Lihat detail fitur Mahasiswa</summary>

#### Dashboard
- Status kehadiran
- Statistik personal
- Upcoming deadlines
- Achievements

#### Absensi
- Scan QR code
- Validasi lokasi
- Upload selfie
- Riwayat kehadiran

#### Akademik
- Rekapan per mata kuliah
- Informasi tugas
- Submit tugas
- Diskusi

#### Izin
- Pengajuan izin/sakit
- Upload bukti
- Status pengajuan

#### Gamifikasi
- Badge collection
- Level progress
- Attendance streak
- Leaderboard

#### Keuangan
- Status kas
- Riwayat pembayaran
- Voting kas

</details>

---

## 🎮 Sistem Gamifikasi

### 🏅 Badge System

| Badge | Requirement | Points |
|-------|-------------|--------|
| 🌟 First Timer | Absen pertama kali | 10 |
| 🔥 On Fire | 7 hari berturut-turut | 50 |
| 💪 Consistent | 30 hari berturut-turut | 200 |
| 🏆 Perfect Month | 100% kehadiran sebulan | 500 |
| 👑 Semester Champion | Tertinggi di semester | 1000 |
| ⚡ Early Bird | Absen 5 menit pertama | 25 |
| 📚 Bookworm | Submit semua tugas | 100 |

### 📊 Level System

| Level | Points Required | Title |
|-------|-----------------|-------|
| 1 | 0 | Newbie |
| 2 | 100 | Beginner |
| 3 | 300 | Regular |
| 4 | 600 | Committed |
| 5 | 1000 | Dedicated |
| 6 | 1500 | Expert |
| 7 | 2100 | Master |
| 8 | 2800 | Legend |
| 9 | 3600 | Champion |
| 10 | 4500 | Ultimate |

### 🔥 Streak System

- **Daily Streak**: Absen setiap hari
- **Weekly Streak**: Absen setiap minggu
- **Streak Multiplier**: Bonus points untuk streak panjang

---

## 📊 Analytics & Reporting

### Available Reports

| Report | Format | Description |
|--------|--------|-------------|
| Rekap Harian | PDF | Kehadiran per hari |
| Rekap Mingguan | PDF/Excel | Summary mingguan |
| Rekap Bulanan | PDF/Excel | Summary bulanan |
| Per Mahasiswa | PDF | Detail per mahasiswa |
| Per Mata Kuliah | PDF/Excel | Detail per course |
| Risk Analysis | Dashboard | Mahasiswa berisiko |

### Risk Categories

```
┌─────────────────────────────────────────────────────────────┐
│                    RISK ANALYSIS                             │
├─────────────────────────────────────────────────────────────┤
│  🟢 SAFE      │ Kehadiran > 80%                             │
│  🟡 WARNING   │ Kehadiran 60-80%                            │
│  🔴 DANGER    │ Kehadiran < 60% (tidak bisa UAS)            │
└─────────────────────────────────────────────────────────────┘

⚠️ Aturan UNPAM: 3x Alpha = Tidak bisa mengikuti UAS
```

---

## 🔐 Keamanan

### Security Features

| Feature | Description |
|---------|-------------|
| 🔒 Password Hashing | Bcrypt dengan cost factor 12 |
| 🛡️ CSRF Protection | Token validation |
| 🔑 Session Security | Encrypted sessions |
| 📍 Geofence Validation | Anti-GPS spoofing |
| 📸 Selfie Verification | AI-powered face detection |
| 📝 Audit Trail | Complete activity logging |
| 🚫 Rate Limiting | Prevent brute force |
| 🔐 2FA Support | Two-factor authentication |

### Anti-Fraud Measures

1. **Location Sampling**: Multiple GPS samples untuk validasi
2. **Speed Check**: Deteksi perpindahan tidak wajar
3. **Selfie Verification**: Wajah harus terdeteksi
4. **QR Expiry**: Token kadaluarsa otomatis
5. **One-Time Use**: QR hanya bisa dipakai sekali
6. **Device Fingerprint**: Identifikasi device

---

## 🌐 Deployment

### Supported Platforms

| Platform | Recommended | Notes |
|----------|-------------|-------|
| Railway | ⭐⭐⭐⭐⭐ | Easiest, auto-deploy |
| Render | ⭐⭐⭐⭐ | Good free tier |
| Vercel | ⭐⭐⭐ | Frontend only |
| DigitalOcean | ⭐⭐⭐⭐ | Full control |
| AWS | ⭐⭐⭐⭐⭐ | Enterprise |
| Shared Hosting | ⭐⭐ | Limited features |

### Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure proper `APP_URL`
- [ ] Set up SSL certificate
- [ ] Configure database
- [ ] Set up file storage
- [ ] Configure mail service
- [ ] Set up monitoring
- [ ] Configure backups

---

## 📖 API Documentation

### Authentication Endpoints

```http
POST /login                 # Admin login
POST /dosen/login          # Dosen login
POST /mahasiswa/login      # Mahasiswa login
POST /logout               # Logout
```

### Attendance Endpoints

```http
GET  /user/absen           # Get attendance page
POST /user/absen/scan      # Submit attendance
GET  /user/history         # Get attendance history
GET  /user/rekapan         # Get attendance summary
```

### Permit Endpoints

```http
GET  /user/permit          # Get permits list
POST /user/permit          # Submit permit
DELETE /user/permit/{id}   # Cancel permit
```

### Admin Endpoints

```http
GET  /dashboard            # Admin dashboard
GET  /mahasiswa            # List mahasiswa
GET  /dosen                # List dosen
GET  /mata-kuliah          # List courses
GET  /analytics            # Analytics data
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter=AttendanceTest
```

### Test Categories

| Category | Description |
|----------|-------------|
| Unit | Model & service tests |
| Feature | HTTP & integration tests |
| Browser | Dusk browser tests |

---

## 🤝 Kontribusi

### How to Contribute

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Follow PSR-12 for PHP
- Use ESLint & Prettier for TypeScript
- Write meaningful commit messages
- Add tests for new features

---

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 TPLK004 Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Tim Pengembang

<table>
<tr>
<td align="center">
<b>TPLK004 Team</b><br>
Universitas Pamulang<br>
Fakultas Ilmu Komputer<br>
Teknik Informatika<br>
Kelas 06TPLK004
</td>
</tr>
</table>

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=3000&pause=1000&color=6B7280&center=true&vCenter=true&width=600&lines=Made+with+❤️+by+TPLK004+Team;Universitas+Pamulang+•+2024" alt="Footer" />
</p>

<p align="center">
  <a href="#-tplk004---sistem-absensi-cerdas-berbasis-ai">⬆️ Back to Top</a>
</p>
