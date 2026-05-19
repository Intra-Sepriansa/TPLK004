# Panduan Lengkap Menu Mahasiswa TPLK004

Dokumen ini menjelaskan area mahasiswa pada aplikasi TPLK004 secara detail, sistematis, dan operasional. Fokusnya bukan hanya "menu ini untuk apa", tetapi juga:

- data apa yang ditampilkan di setiap halaman
- kapan menu dipakai
- bagaimana urutan penggunaan yang benar
- apa beda antar menu yang kelihatannya mirip
- risiko jika menu dipakai dengan cara yang salah
- halaman turunan penting yang tidak selalu muncul di sidebar

Panduan ini disusun dari navigasi mahasiswa, route `auth:mahasiswa`, controller mahasiswa, halaman Inertia, dan modul pendukung yang memang ada di project.

## 1. Gambaran Struktur Menu Mahasiswa

Secara umum, area mahasiswa pada project ini terbagi menjadi 5 lapisan:

1. Menu utama di sidebar mahasiswa.
2. Halaman turunan yang muncul dari klik detail, kartu statistik, atau tombol aksi.
3. Halaman operasional pendukung yang tidak selalu tampil di sidebar.
4. Halaman akun dan preferensi pribadi.
5. Halaman lintas modul seperti chat, voting, digest, dan dokumentasi.

### 1.1. Menu Utama di Sidebar Mahasiswa

Menu yang tampil di sidebar mahasiswa saat ini adalah:

- Dashboard
- Absen
- Jadwal Kuliah
- Rekapan & Evaluasi
- Riwayat
- Chat
- Informasi Tugas
- Izin/Sakit
- Akademik
- Monitoring Kehadiran
- Personal Analytics
- Pencapaian & Leaderboard
- Notifikasi
- Verifikasi Selfie
- Uang Kas
- Dokumentasi

### 1.2. Halaman Mahasiswa Pendukung yang Tidak Selalu Muncul di Sidebar

Halaman berikut tetap penting karena dipakai sebagai halaman detail, halaman aksi lanjutan, atau modul yang diakses dari halaman lain:

- Detail Riwayat Absensi
- Bukti Masuk
- Detail Badge
- Leaderboard
- Detail Tugas
- Tugas Kelompok
- Detail Tugas Kelompok
- Kas Voting
- Detail Kas Voting
- Detail Jadwal Kuliah
- Mata Kuliah
- Catatan Akademik
- Detail Catatan Akademik
- Form Catatan Akademik
- Ujian
- Detail Ujian
- Weekly Digest
- Profil
- Pengaturan
- Password
- Help

### 1.3. Cara Membaca Arsitektur Menu Mahasiswa

Ada beberapa pasangan menu yang terlihat mirip, tetapi fungsinya berbeda:

- `Dashboard` dipakai untuk ringkasan prioritas harian.
- `Absen` dipakai untuk aksi scan dan submit kehadiran.
- `Rekapan & Evaluasi` dipakai untuk analitik agregat dan warning.
- `Riwayat` dipakai untuk membaca log absensi satu per satu.
- `Jadwal Kuliah` fokus pada kalender mingguan.
- `Akademik` fokus pada command center akademik yang menggabungkan jadwal, progres kuliah, ujian, dan catatan.
- `Monitoring Kehadiran` fokus pada status hadir per mata kuliah dan prediksi kelayakan.
- `Pencapaian & Leaderboard` fokus pada gamification dan ranking.
- `Uang Kas` fokus pada status pembayaran pribadi dan kondisi keuangan kelas.
- `Kas Voting` fokus pada persetujuan atau penolakan usulan pengeluaran kas.

Kalau mahasiswa memahami pembedaan ini sejak awal, penggunaan sistem akan jauh lebih efisien.

## 2. Alur Kerja Mahasiswa yang Direkomendasikan

Supaya penggunaan menu mahasiswa tidak acak, berikut alur kerja yang paling masuk akal secara operasional.

### 2.1. Alur Harian Sebelum Perkuliahan

1. Buka `Dashboard` untuk melihat prioritas hari ini.
2. Buka `Notifikasi` untuk membaca pengumuman yang belum dibaca.
3. Buka `Jadwal Kuliah` atau `Akademik` untuk memastikan kelas hari ini, jam mulai, dan mata kuliah berikutnya.
4. Jika ada deadline tugas, buka `Informasi Tugas`.
5. Jika ada urusan administrasi kehadiran, cek `Izin/Sakit` atau `Monitoring Kehadiran`.

### 2.2. Alur Saat Kelas Sedang Berlangsung

1. Buka `Absen`.
2. Pastikan QR atau token sesi benar-benar masih aktif.
3. Pastikan GPS, kamera, dan koneksi internet siap.
4. Submit absensi sedini mungkin, jangan menunggu menit terakhir.
5. Setelah sukses, cek status awal di halaman `Absen` atau `Riwayat`.
6. Jika ada masalah selfie atau permintaan akses foto, tindak lanjuti di `Verifikasi Selfie`.

### 2.3. Alur Setelah Kelas Selesai

1. Cek `Riwayat` untuk memastikan log absensi masuk.
2. Jika ingin melihat bukti visual, buka `Bukti Masuk`.
3. Jika ada ketidaksesuaian, cek `Monitoring Kehadiran`.
4. Jika memang berhalangan hadir, pastikan pengajuan di `Izin/Sakit` sudah terkirim dan statusnya dipantau.
5. Catat materi kuliah di area `Akademik`, terutama `Catatan Akademik` bila dipakai dalam workflow belajar pribadi.

### 2.4. Alur Mingguan Akademik

1. Review `Rekapan & Evaluasi`.
2. Review `Monitoring Kehadiran` per mata kuliah.
3. Cek `Informasi Tugas` untuk deadline yang mendekat.
4. Cek `Tugas Kelompok` jika ada tugas kolaboratif.
5. Cek `Ujian` dan `Weekly Digest` bila tersedia.
6. Buka `Personal Analytics` untuk membaca pola keterlambatan, streak, dan area perbaikan.

### 2.5. Alur Administrasi dan Komunikasi

1. Gunakan `Chat` untuk komunikasi personal atau grup.
2. Gunakan `Uang Kas` untuk memantau tunggakan dan histori pembayaran.
3. Gunakan `Kas Voting` saat ada usulan pengeluaran bersama.
4. Gunakan `Dokumentasi` bila butuh panduan penggunaan sistem.
5. Gunakan `Profil`, `Pengaturan`, dan `Password` untuk menjaga kualitas akun dan preferensi.

## 3. Penjelasan Detail Setiap Menu Utama

## 3.1. Dashboard

### Fungsi Utama

Dashboard adalah command center mahasiswa. Menu ini dipakai untuk membaca prioritas harian tanpa harus masuk ke banyak halaman.

### Data yang Ditampilkan

Dashboard mahasiswa membangun ringkasan seperti:

- statistik kehadiran pribadi
- attendance rate
- streak kehadiran
- on-time rate
- aktivitas terbaru
- chart tren kehadiran
- pencapaian atau achievement

Secara praktis, halaman ini dipakai sebagai jawaban cepat atas pertanyaan:

- hari ini saya perlu fokus ke apa
- absensi saya aman atau bermasalah
- ada aktivitas penting yang baru terjadi atau tidak

### Cara Menggunakan

1. Login dan buka `Dashboard`.
2. Baca kartu statistik utama.
3. Lihat aktivitas terbaru.
4. Lihat apakah ada warning, tren turun, atau prioritas yang tertinggal.
5. Pindah ke menu detail yang relevan, misalnya `Absen`, `Rekapan`, atau `Tugas`.

### Kapan Dipakai

- saat pertama kali login
- saat mulai hari kuliah
- saat ingin membaca kesehatan aktivitas akademik secara cepat

### Best Practice

- jadikan dashboard sebagai titik masuk utama setiap hari
- jangan membuat keputusan final dari dashboard saja; gunakan halaman detail untuk validasi
- kalau ada penurunan performa, lanjutkan ke `Personal Analytics` atau `Monitoring Kehadiran`

## 3.2. Absen

### Fungsi Utama

Menu `Absen` adalah pusat aksi kehadiran. Semua validasi teknis absensi dilakukan di sini, bukan di menu lain.

### Data dan Validasi yang Dipakai Sistem

Saat mahasiswa melakukan absensi, sistem memproses beberapa komponen:

- token atau QR aktif
- status sesi masih terbuka
- waktu submit terhadap batas keterlambatan
- posisi GPS
- beberapa sampel lokasi sekaligus
- akurasi GPS
- konsistensi perpindahan lokasi
- radius geofence
- pemeriksaan lokasi IP untuk mendeteksi jarak tidak wajar
- device fingerprint
- status device trusted atau tidak
- selfie bila sesi mewajibkannya

Selain form absensi, halaman ini juga memuat:

- sesi aktif
- daftar sesi aktif bila ada lebih dari satu
- data gamification seperti XP, streak, combo, posisi leaderboard
- social proof seperti peserta yang sudah hadir dan leaderboard ringkas

### Cara Menggunakan

1. Buka `Absen`.
2. Masukkan atau scan token/QR sesi yang aktif.
3. Izinkan akses kamera jika diminta.
4. Izinkan akses lokasi.
5. Pastikan perangkat stabil sampai pengambilan GPS selesai.
6. Ambil selfie jika sesi mewajibkan verifikasi.
7. Submit absensi.
8. Pastikan muncul pesan sukses dengan status `Hadir` atau `Terlambat`.

### Cara Pakai yang Benar Secara Teknis

- scan segera setelah sesi dibuka
- jangan pindah lokasi saat GPS sedang dikumpulkan
- jangan gunakan VPN bila sistem memeriksa lokasi IP
- jangan submit saat sinyal buruk kalau masih ada waktu
- jangan tunggu dosen menutup sesi

### Status yang Mungkin Muncul

- `present` atau `hadir`
- `late` atau `terlambat`
- `rejected` jika validasi gagal

### Risiko Jika Salah Pakai

- token expired membuat submit otomatis ditolak
- lokasi di luar radius membuat log tercatat sebagai rejected
- akurasi GPS buruk membuat submit gagal
- submit ganda pada sesi yang sama ditolak
- selfie buram akan masuk ke antrean verifikasi dan bisa bermasalah di tahap review

### Kapan Dipakai

- hanya saat ada sesi absensi aktif
- saat mahasiswa perlu memastikan kehadiran tercatat resmi

### Best Practice

- datang ke menu ini sebelum dosen menampilkan QR
- cek hasil absensi di `Riwayat` setelah submit
- kalau kelas online memakai skema klaim kehadiran, cek juga `Monitoring Kehadiran`

## 3.3. Jadwal Kuliah

### Fungsi Utama

Menu `Jadwal Kuliah` adalah tampilan kalender mingguan untuk membaca ritme kelas mahasiswa.

### Data yang Ditampilkan

Halaman ini menyusun:

- jadwal mingguan per hari
- nama mata kuliah
- nama dosen
- waktu mulai dan selesai
- SKS
- mode kelas online atau offline
- ruangan atau platform
- total kelas per minggu
- kelas hari ini
- total SKS
- hari tersibuk
- next class

### Cara Menggunakan

1. Buka `Jadwal Kuliah`.
2. Lihat jadwal pada hari berjalan.
3. Cek blok `next class` untuk kelas berikutnya.
4. Klik mata kuliah tertentu untuk masuk ke `Detail Jadwal`.
5. Jika perlu dokumen jadwal, gunakan export PDF bila halaman menyediakan akses ke ekspor.

### Nilai Praktis Menu Ini

Menu ini lebih berguna untuk perencanaan waktu daripada evaluasi performa. Kalau pertanyaannya adalah:

- besok saya ada kelas apa
- kelas terdekat saya apa
- hari tersibuk saya kapan

maka tempat yang tepat adalah `Jadwal Kuliah`, bukan `Akademik` atau `Monitoring Kehadiran`.

### Best Practice

- cek jadwal di awal minggu
- gunakan detail jadwal untuk mengaktifkan reminder
- cocokkan jadwal dengan deadline tugas dan ujian

## 3.4. Rekapan & Evaluasi

### Fungsi Utama

`Rekapan & Evaluasi` adalah halaman analitik kehadiran agregat. Fungsinya bukan menampilkan satu log per scan, tetapi membaca performa absensi secara ringkas dan evaluatif.

### Data yang Ditampilkan

Halaman ini memuat:

- total session
- total hadir
- total terlambat
- total rejected
- attendance rate
- on-time rate
- statistik bulan berjalan
- ringkasan per mata kuliah
- tren bulanan
- distribusi status hadir, terlambat, ditolak
- recent logs
- warning dari sistem atau admin

### Cara Menggunakan

1. Buka `Rekapan & Evaluasi`.
2. Lihat attendance rate keseluruhan.
3. Lihat mata kuliah yang persentasenya paling rendah.
4. Periksa tren bulanan, apakah membaik atau memburuk.
5. Baca warning yang belum dipahami.
6. Jika ada penurunan di mata kuliah tertentu, lanjut ke `Monitoring Kehadiran`.

### Beda dengan Riwayat

- `Rekapan & Evaluasi` bersifat agregat dan analitis.
- `Riwayat` bersifat detail per kejadian.

Kalau mahasiswa ingin tahu "berapa persen saya hadir", buka `Rekapan`.
Kalau mahasiswa ingin tahu "di tanggal berapa saya telat", buka `Riwayat`.

### Kapan Dipakai

- saat evaluasi mingguan
- saat ingin membaca warning sistem
- saat ingin melihat pelajaran mana yang paling berisiko

### Best Practice

- buka minimal seminggu sekali
- gunakan warning sebagai alarm dini, bukan tunggu sampai terlambat diperbaiki
- jika attendance rate turun, cek `Monitoring Kehadiran` dan `Riwayat`

## 3.5. Riwayat

### Fungsi Utama

`Riwayat` adalah log operasional absensi mahasiswa. Menu ini dipakai untuk memeriksa setiap kejadian kehadiran secara rinci.

### Data yang Ditampilkan

Riwayat memuat data seperti:

- mata kuliah
- pertemuan
- status kehadiran
- waktu scan
- jarak dari geofence
- selfie URL
- catatan atau note
- lokasi
- detail teknis lain yang terkait log

Menu ini juga memiliki:

- halaman detail riwayat
- ekspor PDF riwayat

### Cara Menggunakan

1. Buka `Riwayat`.
2. Cari entri yang ingin diperiksa.
3. Klik detail bila perlu informasi lebih lengkap.
4. Jika butuh arsip formal, gunakan export PDF.

### Kapan Dipakai

- saat ingin memastikan absensi tertentu masuk
- saat butuh bukti urutan kehadiran
- saat ingin melacak status telat atau rejected tertentu

### Best Practice

- jadikan `Riwayat` sebagai tempat validasi akhir setelah melakukan absensi
- gunakan detail riwayat jika ada sengketa data
- jangan hanya mengandalkan notifikasi sukses saat submit; tetap cek log riwayat

## 3.6. Chat

### Fungsi Utama

`Chat` adalah modul komunikasi lintas peran. Mahasiswa bisa berkomunikasi dengan mahasiswa lain, dosen, atau pihak admin tergantung percakapan yang tersedia.

### Fitur yang Tersedia

Dari route dan service yang aktif, chat mendukung:

- percakapan personal
- percakapan grup
- pembuatan grup untuk course tertentu
- pencarian kontak
- kirim pesan
- edit dan hapus pesan
- mark as read
- typing indicator
- forward message
- reaction emoji
- attachment
- download attachment
- pin conversation
- archive conversation
- mute conversation
- star message
- pinned messages
- starred messages

### Cara Menggunakan

1. Buka `Chat`.
2. Pilih percakapan yang sudah ada atau cari kontak baru.
3. Jika perlu, buat percakapan baru.
4. Kirim pesan, file, atau balasan.
5. Gunakan pin, mute, atau archive untuk mengatur percakapan yang ramai.

### Kapan Dipakai

- komunikasi tugas kelompok
- komunikasi dengan dosen
- koordinasi kelas
- diskusi file atau lampiran

### Best Practice

- gunakan grup course untuk pembahasan umum
- gunakan personal chat untuk hal privat
- archive percakapan yang sudah tidak aktif agar inbox tetap bersih
- star pesan penting seperti deadline, link, atau instruksi

## 3.7. Informasi Tugas

### Fungsi Utama

Menu `Informasi Tugas` menampilkan tugas resmi yang dipublikasikan untuk mahasiswa berdasarkan mata kuliah yang relevan.

### Data yang Ditampilkan

Halaman ini memuat:

- daftar tugas published
- filter pencarian
- filter mata kuliah
- filter status upcoming atau overdue
- deadline
- prioritas
- nama mata kuliah
- dosen
- jumlah diskusi
- status sudah dibaca atau belum
- statistik total, upcoming, overdue, unread

Di halaman detail tugas, sistem juga menampilkan:

- instruksi tugas
- aturan late submission
- nilai maksimal
- submission milik mahasiswa
- feedback
- diskusi public dan private
- pesan ke dosen atau admin

### Cara Menggunakan

1. Buka `Informasi Tugas`.
2. Filter berdasarkan mata kuliah atau status.
3. Buka tugas yang paling dekat deadline-nya.
4. Baca deskripsi dan instruksi dengan teliti.
5. Jika ada pertanyaan, gunakan diskusi atau message.
6. Upload atau submit tugas sebelum deadline.
7. Kembali ke detail untuk mengecek status penilaian dan feedback.

### Kapan Dipakai

- setiap hari saat ada tugas aktif
- saat ingin memeriksa deadline
- saat menindaklanjuti feedback dosen

### Risiko Jika Salah Pakai

- mahasiswa membaca daftar tugas tapi tidak membuka detail instruksi
- mahasiswa mengandalkan judul tugas tanpa melihat aturan submission
- mahasiswa terlambat karena tidak memperhatikan deadline display dan status overdue

### Best Practice

- cek menu ini minimal sekali per hari kuliah
- gunakan status unread sebagai alarm awal
- kalau ada tugas kolaboratif, lanjut ke `Tugas Kelompok`

## 3.8. Izin/Sakit

### Fungsi Utama

Menu `Izin/Sakit` dipakai untuk mengajukan ketidakhadiran resmi pada sesi tertentu.

### Data yang Ditampilkan

Halaman ini memuat:

- daftar sesi yang masih bisa diajukan
- riwayat permit milik mahasiswa
- status pending, approved, rejected
- lampiran surat
- alasan
- approver
- waktu approve atau review
- estimasi approval time untuk permit pending
- thread komentar antara mahasiswa dan reviewer
- statistik total pengajuan

### Cara Menggunakan

1. Buka `Izin/Sakit`.
2. Pilih sesi absensi yang relevan.
3. Pilih tipe `izin` atau `sakit`.
4. Isi alasan dengan jelas.
5. Upload lampiran jika ada.
6. Submit pengajuan.
7. Pantau statusnya di daftar permit.
8. Jika diperlukan, tambahkan komentar klarifikasi.

### Hal Penting yang Harus Dipahami

- satu sesi hanya boleh diajukan sekali
- permit dengan status `pending` masih bisa dibatalkan
- lampiran harus sesuai format yang diterima sistem
- permit yang sudah diproses tidak bisa diperlakukan seperti draft

### Kapan Dipakai

- saat benar-benar berhalangan hadir
- saat ingin punya bukti administratif resmi

### Best Practice

- ajukan secepat mungkin, jangan setelah sengketa melebar
- tulis alasan faktual, tidak berputar-putar
- lampirkan dokumen yang relevan bila kondisi mendukung
- pantau komentar reviewer agar tidak ada miskomunikasi

## 3.9. Akademik

### Fungsi Utama

`Akademik` adalah command center akademik mahasiswa. Menu ini bukan pengganti `Jadwal Kuliah`, tetapi pusat ringkasan akademik yang menggabungkan berbagai domain.

### Data yang Ditampilkan

Halaman `Akademik` menampilkan:

- jadwal hari ini
- pending tasks
- upcoming exams
- progress mata kuliah
- recent notes
- statistik course dan task
- weekly progress

### Cara Menggunakan

1. Buka `Akademik`.
2. Lihat jadwal hari ini.
3. Lihat tugas yang paling mendesak.
4. Cek ujian yang akan datang.
5. Baca progres mata kuliah satu per satu.
6. Gunakan halaman ini untuk memilih jalur lanjutan: `Jadwal`, `Ujian`, `Catatan`, atau `Monitoring Kehadiran`.

### Kapan Dipakai

- saat memetakan beban akademik minggu berjalan
- saat ingin melihat gambaran belajar, bukan hanya absensi
- saat ingin menentukan prioritas akademik harian

### Best Practice

- gunakan `Akademik` saat perencanaan belajar
- gunakan `Jadwal` saat perencanaan waktu
- gunakan `Monitoring Kehadiran` saat evaluasi kelayakan akademik

## 3.10. Monitoring Kehadiran

### Fungsi Utama

Menu ini memantau kehadiran per mata kuliah dan per pertemuan. Inilah menu paling penting jika mahasiswa ingin tahu apakah kehadirannya aman untuk syarat minimum akademik.

### Data yang Ditampilkan

Di halaman utama monitoring, setiap mata kuliah menampilkan:

- total pertemuan
- jumlah hadir
- jumlah tidak hadir
- attendance rate
- daftar pertemuan 1 sampai selesai
- mode online atau offline tiap pertemuan
- status tiap pertemuan
- current meeting

Status pertemuan yang dipakai sistem antara lain:

- `hadir`
- `aktif`
- `tidak-hadir`
- `belum-dimulai`
- `belum-dibuat`

Pada halaman detail per mata kuliah, sistem menambah:

- prediction 75 persen
- required attendance ke depan
- max possible percentage
- current streak dan longest streak
- performa online vs offline

### Cara Menggunakan

1. Buka `Monitoring Kehadiran`.
2. Cari mata kuliah yang ingin diperiksa.
3. Lihat peta pertemuan dan statusnya.
4. Masuk ke halaman detail mata kuliah.
5. Baca `prediction` untuk melihat apakah target 75 persen masih bisa dicapai.

### Fitur Penting yang Perlu Dipahami

- sistem dapat membedakan pertemuan online dan offline
- ada perhitungan prediktif untuk syarat minimum kehadiran
- ada jalur `online self-claim` untuk konteks pertemuan online tertentu

### Kapan Dipakai

- saat mahasiswa merasa absensinya mulai berisiko
- saat ingin tahu mata kuliah mana yang perlu diselamatkan
- saat ingin memverifikasi apakah ada pertemuan yang seharusnya hadir tetapi belum tercatat

### Best Practice

- review menu ini minimal seminggu sekali
- jangan menunggu akhir semester untuk mengecek 75 persen
- kalau ada mismatch data, cocokkan dengan `Riwayat`, `Bukti Masuk`, dan `Izin/Sakit`

## 3.11. Personal Analytics

### Fungsi Utama

Menu ini mengubah data kehadiran menjadi insight pribadi. Kalau `Rekapan` bersifat ringkasan, maka `Personal Analytics` bersifat interpretatif.

### Data yang Ditampilkan

Halaman ini memuat:

- overview kehadiran total
- overall rate
- on-time rate
- rate bulan ini
- tren dibanding bulan lalu
- streak data
- breakdown per mata kuliah
- weekly trend
- activity graph
- comparison dengan kelas
- badges
- tips perbaikan

### Cara Menggunakan

1. Buka `Personal Analytics`.
2. Lihat tren naik atau turun dibanding periode sebelumnya.
3. Lihat mata kuliah dengan rate terendah.
4. Baca tips perbaikan dari sistem.
5. Tentukan perubahan perilaku yang paling realistis.

### Kapan Dipakai

- saat ingin mengevaluasi disiplin pribadi
- saat merasa sering telat tetapi belum tahu polanya
- saat ingin membandingkan posisi diri dengan kelas

### Best Practice

- gunakan menu ini untuk refleksi mingguan
- jadikan tren, bukan satu angka tunggal, sebagai dasar evaluasi
- hubungkan insight di sini dengan perubahan aksi nyata di `Jadwal` dan `Absen`

## 3.12. Pencapaian & Leaderboard

### Fungsi Utama

Menu ini menampilkan sistem gamification mahasiswa: badge, progress achievement, poin, dan ranking.

### Data yang Ditampilkan

Halaman pencapaian dan leaderboard memuat:

- badge yang sudah diperoleh
- progress badge yang belum lengkap
- detail badge
- aksi claim badge
- poin
- level
- streak
- attendance rate
- rank mahasiswa
- podium top 3
- leaderboard seluruh mahasiswa
- filter periode all, month, week

### Cara Menggunakan

1. Buka `Pencapaian & Leaderboard`.
2. Lihat badge yang sudah terbuka.
3. Cek badge mana yang progresnya hampir selesai.
4. Jika ada badge yang bisa diklaim, lakukan claim.
5. Buka leaderboard untuk melihat posisi pribadi.
6. Gunakan rank sebagai alat evaluasi, bukan sekadar kompetisi simbolik.

### Kapan Dipakai

- saat ingin membaca motivasi progres
- saat ingin tahu posisi dibanding teman sekelas
- saat ingin mengetahui efek disiplin hadir terhadap poin

### Best Practice

- fokus pada badge yang sejalan dengan performa akademik nyata
- jangan mengejar poin dengan mengorbankan kualitas absensi
- gunakan leaderboard untuk mendorong konsistensi, bukan sekadar pamer ranking

## 3.13. Notifikasi

### Fungsi Utama

`Notifikasi` adalah pusat distribusi informasi dalam aplikasi. Menu ini harus diperlakukan seperti inbox operasional.

### Data yang Ditampilkan

Halaman ini mendukung:

- daftar notifikasi
- filter type
- filter priority
- filter unread atau read
- unread count
- statistik total, unread, read, today, this week, urgent
- detail notifikasi
- informasi pengirim
- related notifications
- action URL jika ada

### Cara Menggunakan

1. Buka `Notifikasi`.
2. Filter unread terlebih dahulu.
3. Baca notifikasi urgent lebih dulu.
4. Buka detail notifikasi bila ada konteks tambahan.
5. Gunakan mark as read atau mark all as read setelah selesai diproses.

### Kapan Dipakai

- setiap kali login
- saat ada badge unread
- saat menunggu pengumuman, reminder, warning, atau update administrasi

### Best Practice

- perlakukan notifikasi sebagai daftar tindak lanjut
- jangan biarkan notifikasi urgent menumpuk
- cek related notifications bila ingin memahami konteks komunikasi dari pengirim yang sama

## 3.14. Verifikasi Selfie

### Fungsi Utama

Menu ini bukan tempat mahasiswa mengambil selfie absensi. Menu ini dipakai untuk merespons permintaan akses atau peninjauan selfie yang diajukan pihak lain.

### Data yang Ditampilkan

Halaman ini memuat:

- daftar `SelfieViewRequest`
- status pending, approved, rejected
- relasi ke selfie verification dan attendance log
- siapa yang meminta akses
- waktu permintaan
- statistik total request

### Cara Menggunakan

1. Buka `Verifikasi Selfie`.
2. Baca siapa yang meminta akses dan konteks permintaannya.
3. Jika setuju, approve dan tambahkan catatan bila perlu.
4. Jika menolak, isi alasan penolakan sesuai ketentuan minimal karakter.

### Kapan Dipakai

- saat ada permintaan akses terhadap bukti selfie absensi
- saat mahasiswa perlu menyetujui atau menolak peninjauan foto

### Risiko Jika Salah Paham

- mahasiswa mengira menu ini untuk upload selfie manual
- mahasiswa mengabaikan request padahal berkaitan dengan validasi kehadiran

### Best Practice

- baca konteks permintaan dulu
- kalau menolak, beri alasan yang jelas
- jika kasusnya sensitif, cocokkan juga dengan log di `Riwayat` atau `Bukti Masuk`

## 3.15. Uang Kas

### Fungsi Utama

Menu `Uang Kas` menggabungkan status pembayaran pribadi dengan gambaran keuangan kelas.

### Data yang Ditampilkan

Halaman ini menampilkan:

- record pembayaran kas pribadi
- total paid dan total unpaid
- jumlah periode yang sudah dibayar dan belum dibayar
- class summary: total balance, total income, total expense
- recent expenses
- financial intelligence
- payment prediction
- payment planning
- advanced analytics
- social features
- gamification kas
- reminder settings
- upcoming reminders
- target upload bukti pembayaran
- workflow receipt jika fitur tabel receipt tersedia

### Cara Menggunakan

1. Buka `Uang Kas`.
2. Lihat status tunggakan pribadi.
3. Lihat periode yang belum dibayar.
4. Baca pengeluaran kelas terbaru.
5. Jika sistem mendukung upload receipt, gunakan target pembayaran yang benar.
6. Atur reminder agar tidak lupa pembayaran berikutnya.

### Kapan Dipakai

- saat cek tunggakan
- saat ingin melihat transparansi keuangan kelas
- saat menyiapkan pembayaran
- saat memantau bukti transfer atau receipt

### Best Practice

- jadikan unpaid records sebagai prioritas
- cocokkan nominal pembayaran dengan target periodenya
- gunakan reminder agar keterlambatan kas tidak berulang

## 3.16. Dokumentasi

### Fungsi Utama

`Dokumentasi` adalah pusat panduan in-app untuk mahasiswa.

### Fitur yang Tersedia

Dari service dan halaman frontend yang aktif, modul dokumentasi mendukung:

- daftar guide dengan progress
- statistik penyelesaian
- filter kategori
- filter tingkat kesulitan
- pencarian
- sorting
- bookmark
- offline cache atau offline download
- viewer guide detail
- related guides

### Cara Menggunakan

1. Buka `Dokumentasi`.
2. Cari topik sesuai kebutuhan.
3. Filter berdasarkan kategori atau difficulty.
4. Simpan guide yang penting ke bookmark.
5. Download offline bila perlu dibaca tanpa koneksi.
6. Lanjutkan progres pembacaan dari detail guide.

### Kapan Dipakai

- saat bingung memakai fitur tertentu
- saat onboarding mahasiswa baru
- saat perlu panduan operasional tanpa bertanya ke admin

### Best Practice

- gunakan dokumentasi sebelum mengeskalasi masalah sederhana
- prioritaskan guide yang terkait menu yang sering dipakai
- gunakan offline mode untuk materi referensi yang sering diakses

## 4. Halaman Turunan Penting di Area Mahasiswa

Bagian ini penting karena banyak fitur mahasiswa justru terjadi di halaman detail, bukan hanya halaman utama sidebar.

## 4.1. Detail Riwayat Absensi

Halaman ini dipakai untuk membaca satu log absensi secara rinci. Cocok dipakai ketika ada sengketa data, pengecekan waktu scan, atau validasi bukti kehadiran tertentu.

Gunakan halaman ini ketika:

- status hadir dirasa aneh
- ingin melihat detail satu pertemuan
- perlu bukti granular, bukan sekadar statistik

## 4.2. Bukti Masuk

Halaman `Bukti Masuk` menampilkan log absensi beserta selfie URL dan status verifikasi selfie. Ini adalah halaman pembuktian, bukan analitik.

Pakai halaman ini ketika:

- perlu memastikan selfie benar-benar tersimpan
- ingin melihat bukti visual absensi
- perlu membedakan log hadir biasa dengan log yang punya verifikasi selfie

## 4.3. Detail Badge dan Leaderboard

Halaman detail badge menampilkan penjelasan badge tertentu. Halaman leaderboard menampilkan ranking, podium, dan statistik posisi mahasiswa per periode.

Pakai halaman ini ketika:

- ingin memahami syarat badge
- ingin mengukur posisi pribadi di kelas
- ingin membaca efek poin, streak, dan attendance rate secara kompetitif

## 4.4. Tugas Kelompok

Walau tidak ada di sidebar, modul ini sangat penting untuk tugas kolaboratif.

### Fungsi Utama

Modul ini mengelola:

- daftar assignment kelompok
- status sudah punya grup atau belum
- self-form group
- join slot grup
- create group
- invite anggota
- leader tools
- manajemen anggota grup
- group chat internal
- upload file
- task list internal grup
- submit hasil akhir
- peer evaluation
- conflict report
- export PDF detail tugas kelompok

### Cara Menggunakan

1. Masuk ke tugas kelompok dari halaman tugas atau tautan terkait.
2. Lihat assignment yang aktif.
3. Bentuk grup atau join grup jika diperbolehkan.
4. Atur peran anggota.
5. Gunakan message dan task list untuk koordinasi kerja.
6. Upload file dan submit hasil sebelum deadline.
7. Lengkapi peer evaluation jika model penilaian mengharuskannya.

### Risiko Operasional

- telat membentuk grup membuat mahasiswa terkunci dari assignment
- tugas internal grup tidak diatur sehingga submission terlambat
- leader tidak merapikan anggota dan invitation tepat waktu

## 4.5. Detail Jadwal Kuliah

Halaman detail jadwal adalah salah satu halaman akademik paling kaya. Halaman ini menggabungkan:

- detail mata kuliah
- dosen pengampu
- attendance records
- materials
- notes
- attendance stats
- status kelayakan UAS
- reminder on or off
- next meeting
- weekly digest jika ada
- export iCal

### Aksi yang Bisa Dilakukan

- toggle reminder
- export iCal
- simpan catatan
- edit atau hapus catatan kursus

### Kapan Dipakai

- saat ingin mendalami satu mata kuliah tertentu
- saat ingin menyimpan catatan cepat berbasis mata kuliah
- saat ingin memasukkan jadwal ke kalender pribadi

## 4.6. Mata Kuliah

Halaman `Mata Kuliah` adalah tampilan portofolio kuliah mahasiswa. Ia lebih strategis dibanding `Jadwal`.

### Data yang Ditampilkan

- identitas course
- dosen
- mode
- ruangan
- progress meeting
- progress assignment
- attendance rate
- average grade
- next session
- favorit course
- study time
- difficulty level
- AI recommendation
- predicted completion date
- milestone course
- material
- study group bila tabel terkait tersedia

### Kapan Dipakai

- saat ingin melihat kualitas progres per mata kuliah
- saat ingin menandai course favorit
- saat ingin membaca saran belajar per course

## 4.7. Catatan Akademik

Modul ini berfungsi sebagai personal knowledge base mahasiswa.

### Fitur yang Ada

- daftar catatan
- filter per course
- search
- pin
- favorite
- tags
- word count
- reading time
- AI summary
- AI keywords
- create note
- edit note
- export PDF
- generate AI summary
- generate flashcards
- template note

### Cara Menggunakan

1. Buat catatan per pertemuan atau per topik.
2. Hubungkan catatan dengan mata kuliah yang tepat.
3. Gunakan tag agar mudah dicari.
4. Pakai AI summary jika ingin versi ringkas.
5. Pakai flashcards untuk review cepat sebelum ujian.

### Kapan Dipakai

- setelah kelas selesai
- saat menyusun ringkasan belajar
- saat menyiapkan review ujian

## 4.8. Ujian

Modul `Ujian` menampilkan daftar ujian mendatang dan indikator kesiapan.

### Data yang Ditampilkan

- upcoming exams
- grouping per bulan
- daftar course dan status UTS/UAS
- current meeting vs total meeting
- preparation checklist

### Kapan Dipakai

- saat mendekati UTS atau UAS
- saat menyusun rencana belajar
- saat ingin tahu apakah progres pertemuan sudah melewati ambang ujian

## 4.9. Weekly Digest

`Weekly Digest` adalah rangkuman pembelajaran mingguan yang diterbitkan dan bisa diakses dari notifikasi atau detail jadwal tertentu.

### Data yang Ditampilkan

- week number
- semester
- week range
- daftar mata kuliah terkait
- forum discussion
- assignment
- learning material
- announcement
- upcoming schedule
- support contact
- export PDF

### Kapan Dipakai

- saat ingin membaca ringkasan minggu tertentu
- saat perlu satu halaman untuk melihat materi, tugas, forum, dan agenda lanjutan

## 4.10. Kas Voting

`Kas Voting` dipakai saat kelas perlu memutuskan usulan pengeluaran bersama.

### Fitur yang Tersedia

- daftar voting open, approved, rejected
- create voting
- detail voting
- vote approve atau reject
- comment pada vote
- deadline voting
- approval threshold
- min votes
- related votings

### Cara Menggunakan

1. Buka voting yang masih open.
2. Baca title, description, amount, dan category.
3. Lihat siapa pembuat usulan.
4. Berikan vote dengan komentar jika perlu.
5. Pantau apakah voting memenuhi threshold dan minimum vote.

### Kapan Dipakai

- saat ada kebutuhan pengeluaran kelas yang perlu legitimasi bersama
- saat ingin mengusulkan pengeluaran baru

## 4.11. Profil

Halaman `Profil` dipakai untuk mengelola identitas utama mahasiswa di sistem.

### Data yang Ditampilkan

- nama
- NIM
- email
- phone
- fakultas
- prodi
- kelas
- semester
- avatar
- last activity
- statistik kehadiran
- badges profil
- recent activities

### Aksi Utama

- ubah nama
- ubah avatar

### Best Practice

- jaga data identitas tetap benar
- gunakan avatar yang wajar dan mudah dikenali jika budaya kelas mendukung

## 4.12. Pengaturan

Halaman `Pengaturan` mengelola preferensi antarmuka dan keamanan akun.

### Kategori yang Ada

- General
- Notifications
- Appearance
- Privacy
- Security
- Data Management

### Fitur Penting

- ubah tema dan tampilan
- atur preferensi notifikasi
- atur visibilitas dan privasi
- lihat sesi aktif
- lihat login history
- terminate session
- lihat storage usage
- clear cache
- reset settings
- download settings
- upload settings

### Kapan Dipakai

- saat perangkat utama berubah
- saat ingin merapikan preferensi notifikasi
- saat ingin audit keamanan akun

## 4.13. Password

Halaman ini khusus untuk mengganti password mahasiswa.

### Cara Menggunakan

1. Masuk ke halaman password.
2. Isi password saat ini.
3. Isi password baru dan konfirmasi.
4. Simpan perubahan.

### Best Practice

- gunakan password yang kuat dan unik
- ganti password jika merasa akun pernah dipakai di perangkat orang lain

## 4.14. Help

Route `Help` tersedia sebagai halaman bantuan mahasiswa. Meski bukan menu utama sidebar, secara arsitektur ia masuk kategori halaman pendukung pengguna.

Gunakan halaman ini bila project mengaktifkan bantuan in-app tambahan selain dokumentasi.

## 5. Cara Memilih Menu yang Tepat

Bagian ini penting supaya mahasiswa tidak bolak-balik membuka menu yang salah.

### Jika tujuan Anda adalah...

Kalau tujuan Anda `melakukan absensi`, buka:

- `Absen`

Kalau tujuan Anda `memastikan absensi sudah tercatat`, buka:

- `Riwayat`
- `Bukti Masuk`

Kalau tujuan Anda `melihat persentase kehadiran`, buka:

- `Rekapan & Evaluasi`
- `Monitoring Kehadiran`

Kalau tujuan Anda `melihat risiko tidak lolos syarat kehadiran`, buka:

- `Monitoring Kehadiran`

Kalau tujuan Anda `melihat jadwal kelas minggu ini`, buka:

- `Jadwal Kuliah`

Kalau tujuan Anda `melihat beban akademik secara utuh`, buka:

- `Akademik`

Kalau tujuan Anda `mengerjakan tugas dosen`, buka:

- `Informasi Tugas`

Kalau tujuan Anda `mengelola kerja kolaboratif`, buka:

- `Tugas Kelompok`
- `Chat`

Kalau tujuan Anda `mengajukan alasan ketidakhadiran`, buka:

- `Izin/Sakit`

Kalau tujuan Anda `membaca analitik pribadi`, buka:

- `Personal Analytics`

Kalau tujuan Anda `memantau kas`, buka:

- `Uang Kas`
- `Kas Voting`

Kalau tujuan Anda `mencari cara pakai sistem`, buka:

- `Dokumentasi`

## 6. Risiko Umum dan Kesalahan yang Sering Terjadi

Mahasiswa biasanya salah menggunakan sistem pada titik-titik berikut:

- mengira notifikasi cukup dibaca sepintas tanpa ditindaklanjuti
- mengira `Rekapan` dan `Riwayat` adalah menu yang sama
- baru membuka `Monitoring Kehadiran` saat semester hampir berakhir
- submit absensi terlalu mepet dengan waktu tutup sesi
- tidak memeriksa detail tugas setelah membaca judul tugas
- tidak membedakan `Uang Kas` dan `Kas Voting`
- tidak menyadari bahwa `Verifikasi Selfie` berkaitan dengan request akses, bukan upload selfie
- tidak menggunakan `Pengaturan` untuk mengaudit sesi aktif dan privasi

## 7. Pola Penggunaan Mahasiswa yang Paling Dewasa

Kalau mahasiswa ingin memakai sistem ini dengan benar dan efisien, pola kerjanya seharusnya seperti berikut:

1. Setiap pagi cek `Dashboard`, `Notifikasi`, dan `Jadwal Kuliah`.
2. Saat kelas berlangsung gunakan `Absen` secepat mungkin.
3. Setelah kelas cek `Riwayat` atau `Bukti Masuk` bila perlu.
4. Setiap beberapa hari cek `Informasi Tugas`.
5. Setiap minggu cek `Rekapan`, `Monitoring Kehadiran`, dan `Personal Analytics`.
6. Setiap ada persoalan administratif, gunakan `Izin/Sakit`, `Verifikasi Selfie`, atau `Uang Kas` sesuai konteks.
7. Untuk peningkatan belajar, gunakan `Akademik`, `Catatan Akademik`, `Ujian`, dan `Weekly Digest`.

## 8. Kesimpulan

Area mahasiswa TPLK004 tidak hanya berisi menu absensi. Secara praktik, sistem ini adalah gabungan dari:

- operasional kehadiran
- pengelolaan tugas
- perencanaan akademik
- analitik performa
- komunikasi
- administrasi kelas
- dokumentasi penggunaan

Kalau dipakai dengan urutan yang benar, mahasiswa bisa menjadikan sistem ini bukan sekadar alat absen, tetapi pusat kontrol aktivitas kuliah harian.
