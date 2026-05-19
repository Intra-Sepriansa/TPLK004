# Panduan Lengkap Menu Admin TPLK004

Dokumen ini menjelaskan menu-menu admin yang tersedia di aplikasi TPLK004, fungsi bisnisnya, data yang dikelola, serta cara penggunaan operasionalnya.

Dokumen ini disusun dari struktur navigasi admin, route admin, controller admin, dan halaman admin yang ada di project.

## 1. Gambaran Struktur Menu Admin

Secara umum, menu admin pada project ini terbagi menjadi 4 lapisan:

1. Menu inti di sidebar admin.
2. Halaman detail atau halaman turunan dari menu inti.
3. Halaman utilitas yang diakses dari tombol aksi, dropdown, atau detail page.
4. Halaman administrasi pendukung seperti profil, pengaturan, panduan, dan help center.

### 1.1. Menu Utama di Sidebar Admin

Kelompok `Absensi`:

- Dashboard
- Sesi Absen
- QR Builder
- Live Monitor
- Verifikasi Selfie
- Zona

Kelompok `Manajemen`:

- Mahasiswa
- Perangkat
- Jadwal
- Chat
- Informasi Tugas
- Uang Kas
- Leaderboard

Kelompok `Laporan`:

- Rekap Kehadiran & Analitik
- Notification Center
- Audit Keamanan

Footer:

- Panduan Admin
- Help Center

### 1.2. Halaman Admin Pendukung yang Tidak Selalu Muncul di Sidebar

Halaman ini tetap penting karena dipakai sebagai turunan atau fitur lanjutan:

- Profil Admin
- Detail Sesi Absen
- Aktivitas Terbaru dari Live Monitor
- Detail Verifikasi Selfie
- Rekap Kehadiran Detail per Mahasiswa
- Tugas Kelompok
- Kas Voting
- Weekly Digest
- Advanced Analytics

## 2. Alur Kerja Admin yang Direkomendasikan

Supaya penggunaan menu lebih sistematis, admin biasanya bekerja dengan urutan seperti ini:

### 2.1. Alur Operasional Absensi Harian

1. Buka `Dashboard` untuk melihat kondisi umum hari ini.
2. Buka `Jadwal` untuk memastikan sesi hari ini sudah terjadwal.
3. Buka `Sesi Absen` untuk membuat atau mengaktifkan sesi.
4. Buka `QR Builder` untuk menampilkan token QR aktif.
5. Pantau proses scan dari `Live Monitor`.
6. Tinjau selfie yang bermasalah di `Verifikasi Selfie`.
7. Jika ada indikasi anomali, cek `Audit Keamanan`, `Perangkat`, dan `Zona`.
8. Tutup hari dengan review di `Rekap Kehadiran & Analitik`.

### 2.2. Alur Manajemen Akademik dan Kelas

1. Kelola data mahasiswa di `Mahasiswa`.
2. Atur jadwal perkuliahan di `Jadwal`.
3. Buat tugas individu di `Informasi Tugas`.
4. Jika tugas berbasis kolaborasi, lanjut ke `Tugas Kelompok`.
5. Gunakan `Notification Center` untuk mengirim pengumuman atau reminder.

### 2.3. Alur Administrasi Kas

1. Cek status pembayaran di `Uang Kas`.
2. Buat pertemuan kas untuk 1 bulan sekaligus; sistem hanya membuat tagihan pada hari Kamis karena perkuliahan offline berlangsung hari Kamis.
3. Tandai pembayaran mahasiswa.
4. Catat pengeluaran kas.
5. Jika ada pengajuan atau keputusan kolektif, proses di `Kas Voting`.

## 3. Penjelasan Detail Setiap Menu

## 3.1. Dashboard

### Fungsi Utama

Dashboard adalah pusat kendali admin. Menu ini dipakai untuk membaca situasi sistem secara cepat tanpa harus masuk ke setiap menu satu per satu.

### Data yang Ditampilkan

Dashboard admin mengambil dan menampilkan data seperti:

- sesi aktif yang sedang berjalan
- statistik kehadiran hari ini
- jumlah keterlambatan
- jumlah selfie ditolak
- total mahasiswa
- aktivitas absensi terbaru
- tren kehadiran mingguan
- distribusi perangkat
- jadwal atau sesi mendatang
- ringkasan keamanan seperti token duplicate dan token expired

Selain mode overview, dashboard juga mendukung beberapa section internal seperti:

- students
- sessions
- schedule
- qr
- monitor
- selfie
- geofence
- devices
- settings
- reports
- audit
- absen-ai

Artinya, dashboard bukan cuma halaman ringkasan, tapi juga bertindak sebagai command center yang bisa memfokuskan tampilan ke domain tertentu.

### Kapan Dipakai

- saat admin pertama kali login
- saat ingin melihat kesehatan sistem hari ini
- saat ingin tahu apakah ada sesi aktif
- saat ingin melihat antrean verifikasi selfie
- saat ingin mendeteksi masalah tanpa membuka terlalu banyak halaman

### Cara Menggunakan

1. Masuk ke dashboard setelah login.
2. Lihat kartu statistik utama untuk membaca kondisi harian.
3. Periksa blok sesi aktif.
4. Review feed aktivitas terbaru.
5. Jika ada angka yang tidak wajar, pindah ke menu spesifik terkait.

### Interpretasi Cepat

- `Hadir hari ini` tinggi: operasional absensi berjalan normal.
- `Terlambat` tinggi: perlu cek toleransi keterlambatan atau kedisiplinan kelas.
- `Selfie ditolak` tinggi: perlu review pencahayaan, kualitas kamera, atau potensi kecurangan.
- `Sesi aktif` ada tetapi `scan` rendah: cek QR Builder, Zona, dan Live Monitor.

### Best Practice

- jadikan dashboard sebagai halaman briefing awal setiap hari
- gunakan angka dashboard untuk menentukan prioritas kerja admin
- jangan mengeksekusi keputusan final dari dashboard saja; masuk ke menu detail untuk validasi

## 3.2. Sesi Absen

### Fungsi Utama

Menu ini adalah mesin utama operasional absensi. Di sinilah admin membuat, mengubah, mengaktifkan, menonaktifkan, menduplikasi, dan meninjau detail sesi kehadiran.

### Data yang Ditampilkan

Menu ini menampilkan:

- daftar sesi absensi dengan filter course, status, search, dan per page
- statistik total sesi
- detail sesi aktif
- sesi hari ini
- distribusi waktu scan per jam
- tren mingguan
- performa per mata kuliah

Status yang dikenali:

- active
- completed
- scheduled
- ongoing

### Aksi Utama

- buat sesi baru
- edit sesi
- hapus sesi
- aktifkan sesi
- nonaktifkan sesi
- duplicate sesi
- lihat detail sesi
- export PDF

### Detail yang Bisa Dilihat di Halaman Detail Sesi

- daftar kehadiran mahasiswa
- status hadir, telat, atau rejected
- riwayat token
- timeline sesi
- perangkat yang dipakai saat scan
- status selfie per mahasiswa

### Cara Menggunakan

#### Membuat sesi absen

1. Buka `Sesi Absen`.
2. Klik `Buat Sesi Baru`.
3. Pilih mata kuliah.
4. Pilih pertemuan ke berapa.
5. Isi judul dan deskripsi jika perlu.
6. Atur waktu mulai dan waktu selesai.
7. Simpan sesi.
8. Aktifkan sesi saat kelas dimulai.

#### Mengelola sesi yang sudah ada

1. Gunakan filter course atau status.
2. Buka detail sesi.
3. Cek jumlah logs, token, present, late, dan rejected.
4. Jika ada kesalahan setup, edit sesi.
5. Jika sesi serupa akan dipakai lagi, gunakan fitur duplicate.

### Kapan Dipakai

- sebelum perkuliahan dimulai
- saat kelas sedang berlangsung
- saat perlu review hasil absensi per pertemuan

### Risiko Jika Salah Pakai

- waktu sesi terlalu sempit bisa memicu banyak mahasiswa telat
- sesi aktif yang tidak ditutup dapat membuat operasional berantakan
- salah memilih pertemuan atau mata kuliah menyebabkan data kehadiran masuk ke sesi yang keliru

## 3.3. QR Builder

### Fungsi Utama

Menu ini dipakai untuk menghasilkan, menampilkan, dan memonitor token QR dinamis untuk sesi absensi aktif.

### Data yang Ditampilkan

- sesi aktif yang dipilih
- TTL token QR
- riwayat token terbaru
- statistik token
- distribusi pembuatan token per jam
- daftar sesi terbaru untuk dipilih

### Fungsi Bisnis

QR Builder adalah jembatan antara sesi absensi dan proses scan mahasiswa. Sesi bisa aktif, tetapi mahasiswa tetap tidak bisa scan dengan baik kalau token tidak tersedia atau tidak sinkron.

### Cara Menggunakan

1. Pastikan ada sesi aktif di `Sesi Absen`.
2. Masuk ke `QR Builder`.
3. Pilih sesi aktif yang relevan.
4. Tampilkan QR ke layar kelas.
5. Pantau apakah token terus ter-refresh sesuai TTL.
6. Jika terjadi masalah, lihat riwayat token terbaru.

### Kapan Dipakai

- ketika kelas dimulai
- ketika QR tidak bisa dipindai
- ketika admin ingin mengecek apakah token dinamis bekerja normal

### Hal yang Perlu Diperhatikan

- token expired terlalu cepat dapat mengganggu mahasiswa
- token aktif terlalu lama meningkatkan risiko penyalahgunaan
- jika scan bermasalah, cek TTL, sesi aktif, dan Live Monitor

## 3.4. Live Monitor

### Fungsi Utama

Live Monitor adalah radar operasional real-time untuk melihat siapa yang baru scan, siapa yang bermasalah, sesi aktif mana yang sedang berjalan, dan pola scan dalam jam berjalan.

### Data yang Ditampilkan

- recent activities
- anomalies
- statistik hadir, terlambat, izin, dan anomali
- total scans
- jumlah mahasiswa aktif
- chart scan per jam
- daftar sesi aktif
- filter berdasarkan course, meeting, session, dan status

### Halaman Turunan

Menu ini juga punya halaman lanjutan:

- `Aktivitas Terbaru`
- export aktivitas hari ini
- advanced export
- log detail

### Cara Menggunakan

1. Buka `Live Monitor` saat sesi berlangsung.
2. Pilih course, meeting, atau session bila perlu.
3. Pantau feed aktivitas terbaru.
4. Fokus ke panel anomali bila ada status `rejected` atau `absent`.
5. Jika perlu dokumen formal, gunakan export.

### Kapan Dipakai

- saat kelas sedang berjalan
- saat admin ingin memantau scan real-time
- saat ingin mengidentifikasi keterlambatan dan penolakan langsung

### Praktik Lanjutan

- gunakan menu ini untuk keputusan operasional cepat
- gunakan `Aktivitas Terbaru` untuk audit lapangan yang lebih rinci
- jika anomali berulang pada mahasiswa yang sama, lanjut ke `Audit Keamanan`, `Perangkat`, dan `Zona`

## 3.5. Verifikasi Selfie

### Fungsi Utama

Menu ini dipakai untuk memproses bukti selfie yang perlu persetujuan manual admin.

### Data yang Ditampilkan

- antrean selfie berdasarkan status
- info mahasiswa, NIM, course, scanned_at
- status selfie
- catatan, alasan penolakan, dan verifikator
- statistik total, pending, approved, rejected
- tren harian verifikasi
- daftar verifikasi terbaru oleh admin

### Aksi Utama

- approve satu selfie
- reject satu selfie
- bulk approve
- bulk reject
- consume approved view request untuk privasi selfie

### Dampak Approval dan Rejection

Jika disetujui:

- status selfie menjadi `approved`
- attendance log terkait diubah menjadi `present`

Jika ditolak:

- status selfie menjadi `rejected`
- attendance log terkait diubah menjadi `rejected`

### Cara Menggunakan

1. Buka filter `pending`.
2. Cek mahasiswa, waktu scan, jarak lokasi, dan konteks mata kuliah.
3. Lihat selfie jika admin memiliki hak akses view request yang approved.
4. Tambahkan catatan bila perlu.
5. Klik approve atau reject.
6. Untuk banyak antrean sekaligus, gunakan bulk action.

### Kapan Dipakai

- setelah sesi absensi berjalan
- ketika AI belum cukup yakin
- ketika kualitas foto perlu verifikasi manusia

### Best Practice

- utamakan antrean pending terbaru agar keputusan cepat
- gunakan alasan penolakan yang spesifik dan konsisten
- jangan approve hanya karena mahasiswa dikenal; tetap validasi konteks scan

## 3.6. Zona

### Fungsi Utama

Menu ini mengelola geofence absensi dan memonitor pelanggaran lokasi.

### Data yang Ditampilkan

- latitude, longitude, dan radius geofence
- total pelanggaran lokasi
- pelanggaran hari ini dan 7 hari terakhir
- rata-rata jarak scan
- distribusi jarak
- recent violations
- tren harian pelanggaran
- recent scan locations untuk peta

### Aksi Utama

- ubah titik geofence
- ubah radius geofence

### Cara Menggunakan

1. Buka `Zona`.
2. Pastikan titik kampus atau titik absensi sudah benar.
3. Tinjau radius aktif.
4. Review daftar pelanggaran terbaru.
5. Jika banyak pelanggaran yang sebenarnya valid, evaluasi apakah radius terlalu sempit.
6. Jika pelanggaran valid dan serius, lanjutkan ke `Audit Keamanan`.

### Kapan Dipakai

- saat awal implementasi geofence
- saat banyak mahasiswa gagal absensi karena lokasi
- saat mendeteksi kemungkinan spoofing atau scan di luar area

### Risiko Jika Salah Atur

- radius terlalu kecil: mahasiswa valid ikut tertolak
- radius terlalu besar: kontrol lokasi melemah
- titik koordinat salah: seluruh sistem validasi lokasi menjadi bias

## 3.7. Mahasiswa

### Fungsi Utama

Menu ini dipakai untuk mengelola data master mahasiswa sekaligus memonitor performa kehadiran mereka.

### Data yang Ditampilkan

- daftar mahasiswa dengan pagination
- filter search, fakultas, kelas, sort
- statistik mahasiswa
- ringkasan kehadiran per mahasiswa
- top performers
- low attendance students
- tren registrasi

### Aksi Utama

- tambah mahasiswa
- edit mahasiswa
- lihat detail mahasiswa
- hapus mahasiswa
- reset password mahasiswa
- cek duplikasi NIM atau email
- export PDF
- export CSV

### Cara Menggunakan

#### Menambah mahasiswa

1. Buka `Mahasiswa`.
2. Klik tambah mahasiswa.
3. Isi identitas utama.
4. Isi email, kelas, semester, dan atribut lain jika ada.
5. Simpan.

#### Mengubah data mahasiswa

1. Cari mahasiswa lewat search atau filter.
2. Buka halaman edit.
3. Perbarui data yang salah.
4. Simpan perubahan.

#### Reset password

1. Cari mahasiswa.
2. Pilih aksi reset password.
3. Sistem akan menerapkan kebijakan default password yang berlaku.

### Kapan Dipakai

- awal semester
- setelah ada mahasiswa baru, pindah kelas, atau perubahan data
- saat investigasi masalah login mahasiswa
- saat ingin memantau mahasiswa berisiko absensi rendah

### Nilai Strategis Menu Ini

Menu `Mahasiswa` bukan hanya data master, tetapi juga titik awal untuk:

- monitoring kepatuhan kehadiran
- analisis performa
- pengiriman notifikasi terarah
- pemetaan risiko akademik

## 3.8. Perangkat

### Fungsi Utama

Menu ini dipakai untuk menganalisis perangkat yang digunakan mahasiswa saat absensi dan mendeteksi pola yang mencurigakan.

### Data yang Ditampilkan

- distribusi OS
- distribusi tipe perangkat
- distribusi model perangkat
- total scan
- unique devices
- daily device trend
- recent device logs
- top devices by usage

### Aksi Utama

- lihat detail perangkat/log
- block perangkat
- whitelist perangkat
- export PDF

### Cara Menggunakan

1. Atur rentang tanggal.
2. Lihat perangkat yang paling sering dipakai.
3. Periksa model atau OS yang muncul terlalu dominan.
4. Buka detail log jika ada indikasi satu device dipakai banyak akun.
5. Block atau whitelist sesuai kebijakan.

### Kapan Dipakai

- saat ada indikasi device sharing
- saat audit keamanan
- saat ingin tahu mayoritas device yang dipakai mahasiswa

### Best Practice

- cek menu ini berdampingan dengan `Audit Keamanan`
- jangan block perangkat tanpa bukti yang cukup
- dokumentasikan alasan block agar mudah ditelusuri

## 3.9. Jadwal

### Fungsi Utama

Menu ini dipakai untuk mengatur rencana sesi atau kalender absensi jauh sebelum sesi diaktifkan.

### Bedanya dengan Sesi Absen

`Jadwal` berfokus pada perencanaan.
`Sesi Absen` berfokus pada operasional dan eksekusi sesi.

Secara teknis, keduanya sama-sama mengelola data sesi, tetapi sudut pandangnya berbeda:

- `Jadwal`: scheduling
- `Sesi Absen`: run-time attendance management

### Data yang Ditampilkan

- daftar jadwal per rentang tanggal
- filter course dan status
- statistik jadwal
- weekly schedule
- distribusi sesi per mata kuliah
- upcoming sessions
- recent sessions

### Aksi Utama

- tambah jadwal
- edit jadwal
- hapus jadwal
- aktivasi/nonaktivasi jadwal
- export PDF

### Cara Menggunakan

1. Buka `Jadwal`.
2. Pilih mata kuliah dan rentang tanggal.
3. Buat sesi pertemuan untuk minggu atau bulan ke depan.
4. Pastikan tidak ada bentrok waktu.
5. Saat hari H, lanjutkan operasional dari `Sesi Absen`.

### Kapan Dipakai

- awal minggu
- awal bulan
- saat menyusun kalender pembelajaran

## 3.10. Chat

### Fungsi Utama

Menu ini dipakai untuk komunikasi internal antara admin, dosen, dan mahasiswa melalui percakapan personal maupun grup.

### Fitur yang Tersedia

- daftar conversation
- conversation detail
- personal chat
- group chat
- pencarian kontak
- grup berdasarkan course
- read status
- unread count
- pin, archive, dan mute
- online status dan last seen untuk chat personal

### Cara Menggunakan

1. Buka `Chat`.
2. Pilih percakapan yang sudah ada atau buat percakapan baru.
3. Untuk chat personal, pilih peserta.
4. Untuk grup, isi nama grup, deskripsi, dan peserta.
5. Gunakan grup course bila ingin komunikasi berbasis mata kuliah.

### Kapan Dipakai

- koordinasi dengan dosen
- klarifikasi dengan mahasiswa
- diskusi internal terkait tugas atau absensi

### Posisi Strategis

Menu ini bukan sekadar messenger. Dalam konteks admin, chat membantu:

- penyelesaian masalah cepat
- komunikasi tindak lanjut verifikasi
- koordinasi tugas dan kelas

## 3.11. Informasi Tugas

### Fungsi Utama

Menu ini dipakai untuk mengelola tugas individu.

### Data yang Ditampilkan

- daftar tugas
- filter search, course, dan status
- status published atau draft
- tugas overdue
- jumlah diskusi per tugas
- deadline display

### Aksi Utama

- buat tugas
- simpan draft
- edit tugas
- hapus tugas
- buka detail tugas
- kirim pesan pada diskusi tugas
- pin atau delete pesan diskusi

### Cara Menggunakan

1. Buka `Informasi Tugas`.
2. Klik buat tugas.
3. Pilih mata kuliah.
4. Isi judul, deskripsi, jenis, dan deadline.
5. Tambahkan lampiran jika perlu.
6. Publikasikan.

### Kapan Dipakai

- saat admin menerbitkan tugas untuk mahasiswa
- saat perlu mengubah deadline atau instruksi
- saat diskusi tugas perlu dimoderasi

### Halaman Detail Tugas

Di detail tugas, admin bisa melihat:

- metadata tugas
- deadline
- course dan dosen terkait
- riwayat edit
- forum diskusi terkait tugas

## 3.12. Tugas Kelompok

### Fungsi Utama

Ini adalah fitur lanjutan dari domain tugas, khusus untuk assignment berbasis kelompok.

### Fitur Utama

- daftar semua group assignments
- create page
- workflow page
- detail assignment
- random group formation
- assign student manual ke group
- create group manual
- lock atau unlock group
- grade submission
- resolve conflict report
- update group config
- force assign
- auto assign remaining
- export PDF

### Mode Pembentukan Kelompok

- self-form
- random
- manual

### Mode Penilaian

- same
- individual
- peer
- contribution

### Data yang Ditampilkan

- total groups
- total students
- submitted groups
- graded groups
- analytics assignment
- peer evaluation summary
- conflict reports
- unassigned students
- force assign logs

### Cara Menggunakan

#### Membuat tugas kelompok

1. Buka halaman tugas kelompok.
2. Buat assignment baru.
3. Pilih mata kuliah dan dosen.
4. Pilih mode pembentukan kelompok.
5. Atur ukuran minimal dan maksimal anggota.
6. Tentukan deadline pembentukan dan deadline submit.
7. Simpan.

#### Mengelola pembentukan kelompok

1. Jika mode random, jalankan random group formation.
2. Jika mode manual, buat grup satu per satu.
3. Jika ada mahasiswa tersisa, gunakan force assign atau auto assign.
4. Lock grup bila komposisi sudah final.

#### Menilai hasil kelompok

1. Buka detail assignment.
2. Pilih grup yang sudah submit.
3. Input nilai dasar.
4. Terapkan mode penilaian yang sesuai.
5. Simpan nilai.

### Kapan Dipakai

- saat tugas membutuhkan kolaborasi
- saat admin ingin mengatur komposisi kelompok
- saat perlu mengelola konflik atau kontribusi anggota

## 3.13. Uang Kas

### Fungsi Utama

Menu ini dipakai untuk mengelola pemasukan kas mingguan dan pengeluaran kas.

### Data yang Ditampilkan

- daftar mahasiswa dan status kas
- total paid
- total unpaid
- global unpaid
- ledger transaksi
- saldo total
- income dan expense per periode
- tanggal pertemuan kas

### Aksi Utama

- tambah transaksi kas
- mark paid
- mark unpaid
- bulk mark paid
- tambah pengeluaran
- create pertemuan kas beberapa bulan untuk semua hari Kamis
- create pertemuan kas tanggal tunggal khusus hari Kamis
- hapus pertemuan kas
- hapus transaksi
- export PDF

### Cara Menggunakan

#### Membuat pertemuan kas

1. Pilih mode `Rentang Bulan` untuk membuat tagihan kas otomatis pada semua hari Kamis dari bulan awal sampai bulan akhir, misalnya April-Juni.
2. Jika hanya perlu satu pertemuan, pilih mode `Tanggal` lalu pilih tanggal hari Kamis.
3. Klik buat pertemuan kas.
4. Sistem akan menghasilkan record unpaid untuk semua mahasiswa pada tanggal Kamis yang dibuat.

#### Melihat data kas beberapa bulan

1. Di filter atas halaman `Uang Kas`, pilih bulan awal dan bulan akhir.
2. Tabel pembayaran akan menampilkan semua kolom pertemuan hari Kamis dari rentang bulan tersebut.
3. Ringkasan lunas, belum bayar, progress periode, dan export periode mengikuti rentang bulan yang dipilih.

#### Menandai pembayaran

1. Cari mahasiswa.
2. Pilih tanggal pertemuan.
3. Tandai paid.
4. Isi metode pembayaran jika perlu.

#### Mencatat pengeluaran

1. Pilih tambah expense.
2. Isi nominal, kategori, deskripsi, dan tanggal.
3. Simpan.

### Kapan Dipakai

- pengelolaan kas mingguan
- rekonsiliasi pembayaran
- audit saldo kas kelas

### Nilai Strategis

Menu ini bukan hanya pencatatan tagihan, tetapi juga menyediakan ledger keuangan yang bisa dibaca per tanggal dan per periode.

## 3.14. Kas Voting

### Fungsi Utama

Kas Voting adalah fitur pendukung domain kas untuk menangani pengambilan keputusan bersama terkait penggunaan atau keputusan keuangan tertentu.

### Data yang Ditampilkan

- daftar voting
- status open, approved, rejected, closed
- creator voting
- amount, category
- deadline voting
- statistik approve atau reject
- detail vote per mahasiswa
- participation rate
- vote timeline
- demographic breakdown
- comment threads
- related transactions

### Aksi Utama

- approve voting
- reject voting
- close voting
- finalize voting

### Cara Menggunakan

1. Buka daftar voting.
2. Pilih voting yang ingin direview.
3. Cek total suara, threshold, dan partisipasi.
4. Review komentar mahasiswa.
5. Putuskan apakah voting disetujui, ditolak, ditutup, atau difinalisasi.

### Kapan Dipakai

- ketika ada keputusan kolektif terkait pengeluaran atau agenda kas
- ketika admin perlu melihat legitimasi keputusan kelas

## 3.15. Leaderboard

### Fungsi Utama

Menu ini menampilkan ranking mahasiswa berdasarkan performa kehadiran dan poin gamifikasi.

### Data yang Ditampilkan

- podium top 3
- leaderboard lengkap
- attendance rate
- on-time rate
- streak
- points
- level
- filter period dan kelas

### Cara Menggunakan

1. Buka `Leaderboard`.
2. Pilih periode: all, week, atau month.
3. Jika perlu, filter per kelas.
4. Amati mahasiswa dengan poin tertinggi dan mahasiswa dengan streak kuat.

### Kapan Dipakai

- untuk monitoring motivasi kelas
- untuk memberi apresiasi
- untuk membaca dampak gamifikasi terhadap disiplin hadir

### Catatan Penting

Poin dihitung dari kombinasi:

- total attendance
- jumlah hadir tepat waktu
- streak kehadiran

## 3.16. Rekap Kehadiran & Analitik

### Fungsi Utama

Ini adalah menu laporan utama untuk membaca performa kehadiran secara makro.

### Data yang Ditampilkan

- overview stats
- attendance trend
- device distribution
- top performers
- AI insights
- filter periode day, week, month, year

### Fitur Turunan yang Relevan

- export CSV
- student detail analytics
- rekap kehadiran detail per mahasiswa
- warning attendance
- advanced analytics

### Cara Menggunakan

1. Pilih periode analisis.
2. Review tren hadir dan telat.
3. Cek top performers.
4. Baca AI insights untuk sinyal tren, lateness, dan anomali.
5. Masuk ke detail mahasiswa bila ada kasus khusus.

### Kapan Dipakai

- review mingguan
- evaluasi bulanan
- penyusunan laporan akademik
- identifikasi mahasiswa berisiko UAS

### Rekap Kehadiran Detail

Pada halaman rekap detail per mahasiswa, admin dapat:

- melihat histori kehadiran individu
- menilai tingkat risiko
- menyimpan warning jika perlu
- export PDF

## 3.17. Notification Center

### Fungsi Utama

Menu ini adalah pusat kampanye notifikasi untuk mahasiswa dan dosen.

### Data yang Ditampilkan

- daftar campaign notifikasi yang digrup berdasarkan signature campaign
- filter type dan status
- total recipients dan read count
- statistik total, unread, scheduled, by_type

### Aksi Utama

- create notification
- pilih template
- target ke semua user, semua mahasiswa, semua dosen, atau penerima spesifik
- schedule notification
- resend ke penerima yang belum membaca
- cancel notifikasi unread
- bulk delete
- export recipients ke Excel atau PDF
- lihat detail campaign

### Detail Campaign

Halaman detail menampilkan:

- campaign stats
- timeline campaign
- hourly read distribution
- status distribution
- recipient list
- average read time

### Cara Menggunakan

#### Mengirim notifikasi baru

1. Buka `Notification Center`.
2. Klik create.
3. Pilih template jika perlu.
4. Isi title, message, type, priority, dan action URL.
5. Pilih target audience.
6. Jika ingin dijadwalkan, isi scheduled_at.
7. Kirim.

#### Mengelola campaign yang sudah ada

1. Buka detail campaign.
2. Cek berapa yang sudah membaca.
3. Jika masih banyak unread, gunakan resend.
4. Jika campaign tidak relevan lagi dan belum dibaca, gunakan cancel.

### Kapan Dipakai

- reminder absensi
- pengumuman mendadak
- warning kehadiran
- pemberitahuan akademik

## 3.18. Audit Keamanan

### Fungsi Utama

Menu ini dipakai untuk investigasi dan respons terhadap event keamanan atau kecurangan.

### Data yang Ditampilkan

- audit logs dengan filter tanggal dan event type
- statistik keamanan
- distribusi jenis event
- daily audit trend
- suspicious activities
- top flagged students
- website login history
- login insights

### Detail Audit

Halaman detail audit menampilkan:

- audit log utama
- related events
- action history
- risk assessment
- pattern analysis

### Aksi Utama

Admin dapat menjalankan aksi seperti:

- block user
- void attendance
- flag device
- send warning
- escalate
- resolve

### Cara Menggunakan

1. Buka `Audit Keamanan`.
2. Filter rentang tanggal dan jenis event.
3. Pilih event dengan severity tertinggi atau pola berulang.
4. Buka detailnya.
5. Review related events dan risk assessment.
6. Jalankan action yang sesuai.

### Kapan Dipakai

- saat ada dugaan kecurangan
- saat token duplicate muncul
- saat terjadi pelanggaran lokasi
- saat login mencurigakan terdeteksi

## 3.19. Pengaturan

### Fungsi Utama

Menu ini mengelola konfigurasi global sistem admin.

### Ruang Konfigurasi

#### Pengaturan umum

- token_ttl_seconds
- late_minutes
- selfie_required
- notify_rejected
- notify_selfie_blur

#### Geofence

- geofence_lat
- geofence_lng
- geofence_radius_m

#### Notifikasi

- email_notifications
- push_notifications
- daily_report
- weekly_report

#### Pengaturan lanjutan

- max_login_attempts
- lockout_duration
- session_lifetime
- ai_verification_enabled
- face_match_threshold
- blur_detection_enabled
- auto_approve_verified
- maintenance_mode

### Fitur Operasional Tambahan

- update template notifikasi
- backup pengaturan
- restore backup
- delete backup
- export settings ke JSON
- import settings dari JSON
- history perubahan
- clear cache
- optimize sistem
- lihat system info
- lihat storage info

### Cara Menggunakan

#### Mengubah parameter sistem

1. Buka `Pengaturan`.
2. Pilih blok konfigurasi yang sesuai.
3. Ubah nilai.
4. Simpan.

#### Backup sebelum perubahan besar

1. Buat backup snapshot.
2. Lakukan perubahan.
3. Jika hasil tidak sesuai, lakukan restore.

#### Import/export konfigurasi

1. Export setting dari sistem sumber.
2. Simpan file JSON.
3. Import ke sistem target.
4. Review history sesudah import.

### Kapan Dipakai

- saat tuning sistem
- saat onboarding environment baru
- saat troubleshooting performa
- saat hardening keamanan

## 3.20. Profil Admin

### Fungsi Utama

Menu ini dipakai untuk mengelola identitas akun admin sendiri.

### Aksi Utama

- ubah nama
- ubah email
- ubah avatar
- ubah password

### Cara Menggunakan

1. Buka profil dari user menu.
2. Update identitas dasar.
3. Ganti password secara berkala.
4. Upload avatar agar identifikasi admin lebih mudah.

### Kapan Dipakai

- saat data akun berubah
- saat hardening keamanan akun

## 3.21. Weekly Digest

### Fungsi Utama

Weekly Digest adalah fitur admin untuk membuat ringkasan pembelajaran mingguan, terutama terkait platform Mentari.

### Data dan Fitur

- daftar digest
- filter search, semester, status, week
- create digest
- edit digest
- publish atau unpublish
- export PDF
- batch export PDF
- sinkronisasi meeting dan course terkait

### Kapan Dipakai

- saat admin ingin menyusun rangkuman mingguan
- saat perlu menginformasikan materi, meeting, tugas terstruktur, dan forum post requirement

### Cara Menggunakan

1. Buka halaman weekly digest.
2. Buat digest baru.
3. Pilih course dan meeting terkait.
4. Isi ringkasan mingguan.
5. Simpan sebagai draft atau publish.
6. Jika publish, sistem dapat membuat notifikasi ke mahasiswa.

## 3.22. Panduan Admin

### Fungsi Utama

Menu ini adalah dokumentasi internal admin di dalam aplikasi.

### Isi Utama

Panduan dibagi ke beberapa chapter:

- Memulai
- Manajemen Absensi
- Manajemen Data
- Laporan & Analytics
- Keamanan & Pengaturan
- Fitur Lanjutan

### Kapan Dipakai

- saat admin baru onboarding
- saat lupa langkah penggunaan fitur tertentu
- saat ingin memahami hubungan antar fitur

### Cara Menggunakan

1. Buka `Panduan Admin`.
2. Pilih chapter.
3. Baca section yang sesuai konteks pekerjaan Anda.
4. Jadikan panduan ini sebagai rujukan konsep, lalu eksekusi di menu aslinya.

## 3.23. Help Center

### Fungsi Utama

Menu ini adalah pusat FAQ, troubleshooting, dan quick support.

### Isi yang Tersedia

- FAQ kategori absensi
- FAQ kategori keamanan
- FAQ kategori mahasiswa
- FAQ kategori teknis
- troubleshooting guide
- quick links ke panduan
- form kontak

### Kapan Dipakai

- saat admin mengalami error operasional
- saat perlu jawaban cepat tanpa membuka dokumentasi penuh
- saat butuh checklist troubleshooting

### Cara Menggunakan

1. Buka `Help Center`.
2. Cari masalah lewat search atau kategori.
3. Ikuti langkah troubleshooting.
4. Jika belum selesai, gunakan form kontak atau eskalasi ke tim teknis.

## 4. Hubungan Antar Menu

Memahami hubungan antar menu jauh lebih penting daripada menghafal nama menu.

### 4.1. Domain Absensi

Urutannya:

`Jadwal -> Sesi Absen -> QR Builder -> Live Monitor -> Verifikasi Selfie -> Rekap Kehadiran & Analitik -> Audit Keamanan`

### 4.2. Domain Keamanan

Urutannya:

`Live Monitor -> Audit Keamanan -> Perangkat -> Zona`

### 4.3. Domain Tugas

Urutannya:

`Informasi Tugas -> Tugas Kelompok -> Notification Center`

### 4.4. Domain Kas

Urutannya:

`Uang Kas -> Kas Voting -> Laporan PDF`

## 5. Rekomendasi Penggunaan Harian Admin

### Pagi Hari Sebelum Kelas

1. Cek `Dashboard`.
2. Cek `Jadwal`.
3. Siapkan `Sesi Absen`.
4. Pastikan `QR Builder` siap.

### Saat Kelas Berlangsung

1. Pantau `Live Monitor`.
2. Tinjau `Verifikasi Selfie` jika ada antrean.
3. Cek `Zona` jika banyak scan ditolak karena lokasi.

### Setelah Kelas

1. Review `Sesi Absen` detail.
2. Buka `Rekap Kehadiran & Analitik`.
3. Cek `Audit Keamanan` jika ada anomali.

### Mingguan

1. Review `Mahasiswa` berisiko rendah kehadiran.
2. Review `Leaderboard`.
3. Kirim reminder lewat `Notification Center`.
4. Update `Weekly Digest` bila digunakan.

### Bulanan

1. Audit `Perangkat`.
2. Audit `Kas`.
3. Backup dari `Pengaturan`.
4. Export laporan-laporan penting.

## 6. Kesalahan Penggunaan yang Paling Sering Terjadi

### 6.1. Sesi aktif tapi QR tidak muncul

Penyebab umum:

- sesi belum aktif
- sesi yang dipilih di QR Builder salah
- token expired atau tidak refresh

Menu yang harus dicek:

- Sesi Absen
- QR Builder
- Live Monitor

### 6.2. Banyak selfie ditolak

Penyebab umum:

- kualitas kamera buruk
- cahaya kurang
- admin belum memproses antrean verifikasi

Menu yang harus dicek:

- Verifikasi Selfie
- Pengaturan

### 6.3. Banyak scan di luar radius

Penyebab umum:

- geofence salah titik
- radius terlalu kecil
- spoofing atau scan dari lokasi tak valid

Menu yang harus dicek:

- Zona
- Audit Keamanan

### 6.4. Mahasiswa tidak bisa login atau akses

Menu yang harus dicek:

- Mahasiswa
- Profil Admin jika terkait role admin
- Pengaturan jika terkait session atau maintenance

## 7. Kesimpulan Praktis

Kalau disederhanakan:

- `Dashboard` untuk membaca situasi.
- `Sesi Absen` dan `QR Builder` untuk menjalankan absensi.
- `Live Monitor` dan `Verifikasi Selfie` untuk mengawal proses real-time.
- `Mahasiswa`, `Jadwal`, `Tugas`, `Kas`, dan `Chat` untuk administrasi akademik.
- `Analytics`, `Notification Center`, dan `Audit` untuk evaluasi, komunikasi, dan kontrol risiko.
- `Pengaturan`, `Profil`, `Panduan`, dan `Help Center` untuk stabilitas dan keberlanjutan operasional.

Jika admin memahami relasi antar menu ini, maka sistem tidak lagi terasa seperti kumpulan halaman terpisah, tetapi menjadi satu alur kerja operasional yang utuh.
