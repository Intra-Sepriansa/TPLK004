# 🔄 PROMPT: UPDATE MATA KULIAH KE DATA REAL UNPAM
## Ganti Semua Mata Kuliah Lama dengan Data Real dari UNPAM

---

## 📋 OVERVIEW

### Tujuan
Mengganti semua mata kuliah lama (dummy) dengan 8 mata kuliah REAL dari UNPAM yang sudah ada di `DosenSeeder.php`.

### Scope
```
✅ Hapus semua mata kuliah lama
✅ Insert 8 mata kuliah REAL UNPAM
✅ Update relasi dosen-mata kuliah
✅ Update file mahasiswa.sql
✅ Update di semua tabel terkait
✅ Preserve data mahasiswa
```

---

## 📊 DATA MATA KULIAH REAL UNPAM

### 8 Dosen & Mata Kuliah untuk Kelas 06TPLK004

```
1. Intan Kumalasari, S.Kom., M.Kom. (0401028605)
   → REKAYASA PERANGKAT LUNAK (22TIF0323) - 3 SKS

2. Muhammad Yasser Arafat, S.Kom., M.Kom. (0410038801)
   → PEMROGRAMAN II (22TIF0353) - 3 SKS

3. Kecitaan Harefa, S.Kom., M.Kom. (0421049102)
   → SISTEM PENDUKUNG KEPUTUSAN (22TIF2012) - 3 SKS

4. Drs. Muhammad Rosyid Ridlo, M.Eng. (8804410016)
   → TEKNIK KOMPILASI (22TIF3012) - 3 SKS

5. Farida Nurlaila, S.Kom., M.Kom. (0409078802)
   → MOBILE PROGRAMMING (22TIF0443) - 3 SKS

6. Sopiyan Apandi, S.Kom., M.Kom. (0429069401)
   → BASIS DATA II (22TIF0363) - 3 SKS

7. Nurhalimah, S.Kom., M.Kom. (0404059206)
   → TEKNOLOGI INTERNET OF THINGS (22TIF0342) - 3 SKS

8. Farizi Ilham, S.Kom., M.Kom. (0416038709)
   → KERJA PRAKTEK (22TIF0332) - 3 SKS
```

---

## 🚀 STEP 1: JALANKAN SEEDER

### Command
```bash
php artisan db:seed --class=DosenSeeder
```

### Apa yang Dilakukan Seeder?
```php
1. Backup data dosen lama ke JSON file
2. Delete semua dosen existing
3. Insert 8 dosen REAL UNPAM
4. Create/Update 8 mata kuliah REAL
5. Link dosen dengan mata kuliah
```

### Output Expected
```
📦 Backing up old dosen data...
🗑️  Deleting all existing dosen data...
✨ Inserting new dosen data...
✅ Created: Intan Kumalasari, S.Kom., M.Kom. (0401028605)
✅ Created: Muhammad Yasser Arafat, S.Kom., M.Kom. (0410038801)
✅ Created: Kecitaan Harefa, S.Kom., M.Kom. (0421049102)
✅ Created: Drs. Muhammad Rosyid Ridlo, M.Eng. (8804410016)
✅ Created: Farida Nurlaila, S.Kom., M.Kom. (0409078802)
✅ Created: Sopiyan Apandi, S.Kom., M.Kom. (0429069401)
✅ Created: Nurhalimah, S.Kom., M.Kom. (0404059206)
✅ Created: Farizi Ilham, S.Kom., M.Kom. (0416038709)
📚 Creating/Updating mata kuliah...
  ✅ 22TIF0323 - REKAYASA PERANGKAT LUNAK → Intan Kumalasari, S.Kom., M.Kom.
  ✅ 22TIF0353 - PEMROGRAMAN II → Muhammad Yasser Arafat, S.Kom., M.Kom.
  ✅ 22TIF2012 - SISTEM PENDUKUNG KEPUTUSAN → Kecitaan Harefa, S.Kom., M.Kom.
  ✅ 22TIF3012 - TEKNIK KOMPILASI → Drs. Muhammad Rosyid Ridlo, M.Eng.
  ✅ 22TIF0443 - MOBILE PROGRAMMING → Farida Nurlaila, S.Kom., M.Kom.
  ✅ 22TIF0363 - BASIS DATA II → Sopiyan Apandi, S.Kom., M.Kom.
  ✅ 22TIF0342 - TEKNOLOGI INTERNET OF THINGS → Nurhalimah, S.Kom., M.Kom.
  ✅ 22TIF0332 - KERJA PRAKTEK → Farizi Ilham, S.Kom., M.Kom.
🎉 Dosen migration completed successfully!
📊 Total dosen: 8
```

---

## 📝 STEP 2: UPDATE FILE mahasiswa.sql

### File: `database/mahasiswa.sql`

Ganti bagian INSERT mata kuliah dengan data baru:

```sql
-- ============================================
-- MATA KULIAH REAL UNPAM - KELAS 06TPLK004
-- ============================================

-- Hapus mata kuliah lama
DELETE FROM mata_kuliah WHERE kelas = '06TPLK004';
DELETE FROM dosen_mata_kuliah WHERE kelas = '06TPLK004';
DELETE FROM mahasiswa_mata_kuliah WHERE kelas = '06TPLK004';

-- Insert 8 Mata Kuliah REAL UNPAM
INSERT INTO mata_kuliah (kode, nama, sks, semester, kelas, dosen_id, created_at, updated_at) VALUES
-- 1. Rekayasa Perangkat Lunak
(
    '22TIF0323',
    'REKAYASA PERANGKAT LUNAK',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0401028605'),
    NOW(),
    NOW()
),

-- 2. Pemrograman II
(
    '22TIF0353',
    'PEMROGRAMAN II',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0410038801'),
    NOW(),
    NOW()
),

-- 3. Sistem Pendukung Keputusan
(
    '22TIF2012',
    'SISTEM PENDUKUNG KEPUTUSAN',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0421049102'),
    NOW(),
    NOW()
),

-- 4. Teknik Kompilasi
(
    '22TIF3012',
    'TEKNIK KOMPILASI',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '8804410016'),
    NOW(),
    NOW()
),

-- 5. Mobile Programming
(
    '22TIF0443',
    'MOBILE PROGRAMMING',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0409078802'),
    NOW(),
    NOW()
),

-- 6. Basis Data II
(
    '22TIF0363',
    'BASIS DATA II',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0429069401'),
    NOW(),
    NOW()
),

-- 7. Teknologi Internet of Things
(
    '22TIF0342',
    'TEKNOLOGI INTERNET OF THINGS',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0404059206'),
    NOW(),
    NOW()
),

-- 8. Kerja Praktek
(
    '22TIF0332',
    'KERJA PRAKTEK',
    3,
    5,
    '06TPLK004',
    (SELECT id FROM dosen WHERE nidn = '0416038709'),
    NOW(),
    NOW()
);

-- ============================================
-- ASSIGN MATA KULIAH KE SEMUA MAHASISWA 06TPLK004
-- ============================================

INSERT INTO mahasiswa_mata_kuliah (mahasiswa_id, mata_kuliah_id, created_at, updated_at)
SELECT 
    m.id,
    mk.id,
    NOW(),
    NOW()
FROM mahasiswa m
CROSS JOIN mata_kuliah mk
WHERE m.kelas = '06TPLK004'
AND mk.kelas = '06TPLK004';

-- ============================================
-- ASSIGN MATA KULIAH KE DOSEN
-- ============================================

INSERT INTO dosen_mata_kuliah (dosen_id, mata_kuliah_id, created_at, updated_at)
SELECT 
    mk.dosen_id,
    mk.id,
    NOW(),
    NOW()
FROM mata_kuliah mk
WHERE mk.kelas = '06TPLK004';
```

---

## 🔧 STEP 3: VERIFICATION QUERIES

### Cek Data Setelah Update

```sql
-- 1. Cek total mata kuliah
SELECT COUNT(*) as total_mata_kuliah 
FROM mata_kuliah 
WHERE kelas = '06TPLK004';
-- Expected: 8

-- 2. Cek detail mata kuliah dengan dosen
SELECT 
    mk.kode,
    mk.nama as mata_kuliah,
    mk.sks,
    d.nama as dosen_pengampu,
    d.nidn,
    d.email
FROM mata_kuliah mk
LEFT JOIN dosen d ON mk.dosen_id = d.id
WHERE mk.kelas = '06TPLK004'
ORDER BY mk.kode;

-- 3. Cek assignment mahasiswa
SELECT 
    COUNT(DISTINCT mahasiswa_id) as total_mahasiswa,
    COUNT(*) as total_assignments
FROM mahasiswa_mata_kuliah mmk
JOIN mata_kuliah mk ON mmk.mata_kuliah_id = mk.id
WHERE mk.kelas = '06TPLK004';
-- Expected: total_assignments = total_mahasiswa * 8

-- 4. Cek dosen assignments
SELECT 
    d.nama as dosen,
    COUNT(dmk.mata_kuliah_id) as jumlah_mk
FROM dosen d
LEFT JOIN dosen_mata_kuliah dmk ON d.id = dmk.dosen_id
GROUP BY d.id, d.nama
ORDER BY d.nama;
-- Expected: Each dosen has 1 mata kuliah

-- 5. List lengkap per mahasiswa
SELECT 
    m.nim,
    m.nama as mahasiswa,
    mk.kode,
    mk.nama as mata_kuliah,
    d.nama as dosen
FROM mahasiswa m
JOIN mahasiswa_mata_kuliah mmk ON m.id = mmk.mahasiswa_id
JOIN mata_kuliah mk ON mmk.mata_kuliah_id = mk.id
JOIN dosen d ON mk.dosen_id = d.id
WHERE m.kelas = '06TPLK004'
ORDER BY m.nim, mk.kode;
```

---

## 📋 EXPECTED RESULTS

### Mata Kuliah Table
```
+------------+----------------------------------+-----+----------+------------+
| kode       | nama                             | sks | semester | kelas      |
+------------+----------------------------------+-----+----------+------------+
| 22TIF0323  | REKAYASA PERANGKAT LUNAK         | 3   | 5        | 06TPLK004  |
| 22TIF0332  | KERJA PRAKTEK                    | 3   | 5        | 06TPLK004  |
| 22TIF0342  | TEKNOLOGI INTERNET OF THINGS     | 3   | 5        | 06TPLK004  |
| 22TIF0353  | PEMROGRAMAN II                   | 3   | 5        | 06TPLK004  |
| 22TIF0363  | BASIS DATA II                    | 3   | 5        | 06TPLK004  |
| 22TIF0443  | MOBILE PROGRAMMING               | 3   | 5        | 06TPLK004  |
| 22TIF2012  | SISTEM PENDUKUNG KEPUTUSAN       | 3   | 5        | 06TPLK004  |
| 22TIF3012  | TEKNIK KOMPILASI                 | 3   | 5        | 06TPLK004  |
+------------+----------------------------------+-----+----------+------------+
Total: 8 mata kuliah
Total SKS: 24
```

### Dosen Table
```
+------------+------------------------------------------+---------------------------+
| nidn       | nama                                     | email                     |
+------------+------------------------------------------+---------------------------+
| 0401028605 | Intan Kumalasari, S.Kom., M.Kom.         | dosen02368@unpam.ac.id    |
| 0404059206 | Nurhalimah, S.Kom., M.Kom.               | dosen02956@unpam.ac.id    |
| 0409078802 | Farida Nurlaila, S.Kom., M.Kom.          | dosen00676@unpam.ac.id    |
| 0410038801 | Muhammad Yasser Arafat, S.Kom., M.Kom.   | dosen00680@unpam.ac.id    |
| 0416038709 | Farizi Ilham, S.Kom., M.Kom.             | dosen02954@unpam.ac.id    |
| 0421049102 | Kecitaan Harefa, S.Kom., M.Kom.          | dosen00842@unpam.ac.id    |
| 0429069401 | Sopiyan Apandi, S.Kom., M.Kom.           | dosen02601@unpam.ac.id    |
| 8804410016 | Drs. Muhammad Rosyid Ridlo, M.Eng.       | dosen01873@unpam.ac.id    |
+------------+------------------------------------------+---------------------------+
Total: 8 dosen
Password: dosen123 (untuk semua)
```

---

## 🔄 ROLLBACK PLAN

### Jika Ada Masalah

```bash
# 1. Restore dari backup JSON
php artisan tinker
>>> $backup = json_decode(file_get_contents(storage_path('app/backup_dosen_YYYY-MM-DD_HHMMSS.json')), true);
>>> foreach ($backup as $dosen) { \App\Models\Dosen::create($dosen); }

# 2. Atau restore dari SQL backup
mysql -u root -p database_name < backup_before_update.sql
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Pre-Implementation
```
☐ Backup database lengkap
☐ Pastikan DosenSeeder.php sudah benar
☐ Pastikan koneksi database OK
☐ Pastikan tidak ada proses lain yang running
```

### Implementation
```
☐ Run: php artisan db:seed --class=DosenSeeder
☐ Verify: Check output seeder
☐ Update: database/mahasiswa.sql
☐ Run verification queries
☐ Test login dosen (email + password: dosen123)
☐ Test di UI Admin → Jadwal
☐ Test di UI Dosen → Courses
☐ Test di UI Mahasiswa → Jadwal
```

### Post-Implementation
```
☐ Verify total: 8 dosen, 8 mata kuliah
☐ Verify assignments: All mahasiswa enrolled
☐ Verify UI: Mata kuliah muncul di semua role
☐ Test CRUD operations
☐ Check attendance records (if any)
```

---

## 🎯 IMPACT ANALYSIS

### Tables Affected
```
✅ dosen (8 rows replaced)
✅ mata_kuliah (8 rows replaced)
✅ dosen_mata_kuliah (8 rows created)
✅ mahasiswa_mata_kuliah (N * 8 rows, N = jumlah mahasiswa)
⚠️ attendance (preserved, but check foreign keys)
⚠️ tugas (preserved, but check foreign keys)
```

### UI Components Affected
```
✅ Admin Dashboard → Jadwal
✅ Admin → Mata Kuliah Management
✅ Dosen Dashboard → My Courses
✅ Dosen → Sesi Absen
✅ Mahasiswa Dashboard → Jadwal Kuliah
✅ Mahasiswa → Jadwal Detail
✅ All dropdowns/selects with mata kuliah
```

---

## 📱 TESTING GUIDE

### 1. Test Login Dosen
```
Email: dosen00680@unpam.ac.id
Password: dosen123
Expected: Login berhasil, redirect ke dashboard dosen
```

### 2. Test Dosen Dashboard
```
Navigate to: /dosen/dashboard
Expected: Muncul "PEMROGRAMAN II" di My Courses
```

### 3. Test Admin Jadwal
```
Navigate to: /admin/jadwal
Expected: Muncul 8 mata kuliah baru
```

### 4. Test Mahasiswa Jadwal
```
Login as mahasiswa kelas 06TPLK004
Navigate to: /user/akademik/jadwal
Expected: Muncul 8 mata kuliah dengan dosen yang benar
```

### 5. Test Jadwal Detail
```
Click salah satu mata kuliah
Expected: 
- Nama mata kuliah benar
- Dosen pengampu benar
- SKS benar (3)
- Kelas benar (06TPLK004)
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: Foreign Key Constraint Error
```
Error: Cannot delete or update a parent row
Solution: 
- SET FOREIGN_KEY_CHECKS=0 sebelum delete
- SET FOREIGN_KEY_CHECKS=1 setelah insert
```

### Issue 2: Dosen Not Found
```
Error: Dosen dengan NIDN xxx tidak ditemukan
Solution:
- Pastikan DosenSeeder sudah dijalankan
- Check: SELECT * FROM dosen WHERE nidn = 'xxx'
```

### Issue 3: Duplicate Entry
```
Error: Duplicate entry for key 'mata_kuliah_kode_unique'
Solution:
- Delete mata kuliah lama dulu
- DELETE FROM mata_kuliah WHERE kelas = '06TPLK004'
```

### Issue 4: Mahasiswa Tidak Ter-assign
```
Error: Mahasiswa tidak punya mata kuliah
Solution:
- Run query assign mahasiswa_mata_kuliah
- Check: SELECT COUNT(*) FROM mahasiswa_mata_kuliah
```

---

## 📊 COMPARISON: BEFORE vs AFTER

### Before (Dummy Data)
```
❌ Kecerdasan Buatan
❌ Machine Learning
❌ Data Mining
❌ Pemrograman Web Lanjut (dummy dosen)
❌ Basis Data Lanjut (dummy dosen)
... (data tidak real)
```

### After (Real UNPAM Data)
```
✅ REKAYASA PERANGKAT LUNAK - Intan Kumalasari
✅ PEMROGRAMAN II - Muhammad Yasser Arafat
✅ SISTEM PENDUKUNG KEPUTUSAN - Kecitaan Harefa
✅ TEKNIK KOMPILASI - Muhammad Rosyid Ridlo
✅ MOBILE PROGRAMMING - Farida Nurlaila
✅ BASIS DATA II - Sopiyan Apandi
✅ TEKNOLOGI INTERNET OF THINGS - Nurhalimah
✅ KERJA PRAKTEK - Farizi Ilham
```

---

## 🎓 ADDITIONAL NOTES

### Jadwal Pertemuan (Optional)
Jika ingin set jadwal pertemuan, tambahkan kolom di mata_kuliah:

```sql
ALTER TABLE mata_kuliah 
ADD COLUMN hari_pertemuan ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') AFTER kelas,
ADD COLUMN jam_mulai TIME AFTER hari_pertemuan,
ADD COLUMN jam_selesai TIME AFTER jam_mulai,
ADD COLUMN ruangan VARCHAR(50) AFTER jam_selesai;

-- Update jadwal
UPDATE mata_kuliah SET 
    hari_pertemuan = 'Senin', 
    jam_mulai = '08:00:00', 
    jam_selesai = '10:30:00',
    ruangan = 'Lab 301'
WHERE kode = '22TIF0323';

-- ... dst untuk mata kuliah lainnya
```

### Password Dosen
```
Default: dosen123
Hash: $2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2

Untuk ganti password:
php artisan tinker
>>> $dosen = \App\Models\Dosen::where('nidn', '0410038801')->first();
>>> $dosen->password = Hash::make('password_baru');
>>> $dosen->save();
```

---

**Created**: February 26, 2026  
**Purpose**: Update mata kuliah ke data REAL UNPAM  
**Status**: Ready for implementation  
**Estimated Time**: 10-15 minutes  
**Priority**: High - Data consistency

---

## 🎉 SUMMARY

Prompt ini akan:
1. ✅ Jalankan DosenSeeder untuk insert 8 dosen REAL UNPAM
2. ✅ Create 8 mata kuliah REAL dengan kode resmi
3. ✅ Link dosen dengan mata kuliah yang benar
4. ✅ Assign semua mahasiswa kelas 06TPLK004
5. ✅ Update file mahasiswa.sql untuk consistency
6. ✅ Provide verification queries
7. ✅ Include rollback plan
8. ✅ Complete testing guide

Data sudah REAL dari UNPAM, bukan dummy lagi! 🚀
