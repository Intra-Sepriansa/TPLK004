# TPLK004 - Sistem Absensi AI

<p align="left">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3200&pause=600&color=6B7280&width=900&lines=Absensi+mahasiswa+berbasis+AI+%2B+geofence;Laravel+%2B+React+%2B+Python+YOLO;Admin+dashboard+%2B+selfie+verification+%2B+live+scan"
    alt="Animated intro"
  />
</p>
<p align="left">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&duration=2600&pause=400&color=9CA3AF&width=900&lines=Live+camera+scan+for+attendance;Geofence+validation+%2B+anti-fraud+checks;Selfie+review+workflow+for+admin"
    alt="Animated highlights"
  />
</p>

<p align="left">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" height="48" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/laravel/laravel-original.svg" alt="Laravel" height="48" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" height="48" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" alt="Vite" height="48" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL" height="48" />
</p>

![divider](./public/readme/divider.svg)

## Ringkasan
TPLK004 adalah sistem absensi mahasiswa berbasis web dengan validasi lokasi (geofence) dan
deteksi kamera untuk membantu absensi lebih akurat. Backend memakai Laravel, frontend React
(Inertia + Vite), dan layanan AI terpisah menggunakan Python (FastAPI + YOLO).

## Fitur Utama
- Admin dashboard untuk monitoring absensi, sesi, dan data mahasiswa.
- Geofence: batas lokasi absensi yang bisa diatur admin.
- Verifikasi selfie: admin bisa approve/reject selfie.
- Absen AI: deteksi kamera admin untuk mencatat absensi otomatis.
- Mahasiswa: absensi dengan kamera + lokasi otomatis (tanpa input manual).
- Rekap dan bukti masuk di sisi mahasiswa.

![divider](./public/readme/divider.svg)

## Stack dan Tools
- Backend: Laravel, PHP, MySQL
- Frontend: React, Inertia, Vite, Tailwind CSS
- AI Service: Python, FastAPI, Uvicorn, Ultralytics YOLO, PyTorch, OpenCV
- Utilities: Leaflet (peta), QR, dan komponen UI

## Diagram UML dan Arsitektur
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
<p align="left">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=2400&pause=300&color=9CA3AF&width=900&lines=Backend+calls+YOLO+service+on+scan;Database+stores+attendance+logs+and+selfies;Admin+controls+geofence+and+validation"
    alt="Animated architecture notes"
  />
</p>

![divider](./public/readme/divider.svg)

## Dokumentasi Lengkap
Lihat `docs/DOKUMENTASI.md` untuk panduan lengkap (alur, modul, konfigurasi, dan troubleshooting).

![divider](./public/readme/divider.svg)

## Legal & Kepatuhan
- Kebijakan privasi tersedia di `/privacy` (lihat `resources/js/pages/privacy.tsx`).
- Persetujuan penggunaan kamera/lokasi ditampilkan sebelum scan.
- Penghapusan data dilakukan melalui admin kampus setelah verifikasi.

![divider](./public/readme/divider.svg)

## Setup Lokal (Singkat)
### 1) Backend (Laravel)
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

### 2) Frontend (Vite)
```bash
npm install
npm run dev
```

### 3) AI Service (YOLO)
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
Set di `.env` utama:
```
YOLO_SERVICE_URL=http://127.0.0.1:9001
YOLO_API_KEY=
YOLO_MIN_CONF=0.6
YOLO_TARGET_LABEL=
YOLO_MAINTENANCE_MODE=true
```

## Port Default
- Laravel: `http://127.0.0.1:8000`
- Vite: `http://127.0.0.1:5173`
- YOLO Service: `http://127.0.0.1:9001`

![divider](./public/readme/divider.svg)

## SOP Admin
<p align="left">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=2400&pause=300&color=9CA3AF&width=900&lines=Set+geofence+for+kelas;Review+selfie+submissions;Run+AI+scan+from+admin+camera"
    alt="Animated SOP admin"
  />
</p>
### A. Set Geofence (Zona 100 Meter)
1. Login sebagai admin.
2. Buka menu `Zona 100 Meter`.
3. Klik `Pindai lokasi saat ini` atau geser pin di peta.
4. Atur radius (mis. 100m).
5. Klik `Simpan geofence`.

### B. Validasi Selfie
1. Buka menu `Verifikasi Selfie`.
2. Pilih data mahasiswa yang pending.
3. Cek foto selfie dan detail absensi.
4. Klik `Approve` atau `Reject` dan simpan catatan.

### C. Absen AI (Admin Kamera)
1. Buka menu `Absen AI`.
2. Pilih mahasiswa target (jika tersedia).
3. Klik `Mulai kamera`.
4. Tunggu hasil deteksi, lalu klik `Scan sekali` jika perlu.

![divider](./public/readme/divider.svg)

## SOP Mahasiswa (Cara Scan)
<p align="left">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=2400&pause=300&color=9CA3AF&width=900&lines=Allow+camera+and+location;Stay+inside+geofence;Wait+for+verification"
    alt="Animated SOP mahasiswa"
  />
</p>
1. Login sebagai mahasiswa.
2. Buka halaman `Absen`.
3. Izinkan akses kamera dan lokasi.
4. Pastikan berada di dalam radius geofence.
5. Tampilkan wajah di kamera hingga status terverifikasi.
6. Jika diminta selfie, ambil foto sesuai instruksi.

![divider](./public/readme/divider.svg)

## Flow Troubleshooting (Cepat)
<p align="left">
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=2400&pause=300&color=9CA3AF&width=900&lines=Check+service+status;Verify+permissions;Confirm+build+assets"
    alt="Animated troubleshooting"
  />
</p>
### 1) Web tidak bisa dibuka
- Pastikan `php artisan serve` berjalan.
- Cek URL yang benar (localhost atau domain hosting).

### 2) Kamera tidak muncul
- Pastikan izin kamera di browser aktif.
- Gunakan HTTPS di hosting (kamera butuh HTTPS).
- Tutup aplikasi lain yang memakai kamera.

### 3) Lokasi ditolak / di luar radius
- Aktifkan GPS di browser.
- Cek geofence di menu `Zona 100 Meter`.
- Pastikan radius tidak terlalu kecil.

### 4) Absen AI tidak mendeteksi
- Pastikan YOLO service hidup di port 9001.
- Cek `YOLO_SERVICE_URL` di `.env`.
- Periksa apakah `YOLO_API_KEY` cocok (jika dipakai).

### 5) Foto selfie tidak tampil di admin
- Jalankan `php artisan storage:link`.
- Pastikan folder `storage/app/public` dapat diakses.

### 6) CSS/JS tidak muncul di hosting
- Jalankan `npm run build` sebelum upload.
- Pastikan folder `public/build` ikut ter-upload.

![divider](./public/readme/divider.svg)

## Catatan Hosting
- Gunakan `.env` produksi terpisah.
- Pastikan `APP_URL` sesuai domain.
- Gunakan SSL agar kamera dan lokasi berjalan.

## Referensi Layanan AI
Lihat `TPLK004-service/README.md` untuk detail service YOLO, endpoint, dan konfigurasi.
# TPLK004
