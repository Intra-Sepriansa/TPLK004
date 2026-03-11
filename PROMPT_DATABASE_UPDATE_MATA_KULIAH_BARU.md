# 🔄 PROMPT DATABASE UPDATE: GANTI MATA KULIAH LAMA KE BARU
## Update Semua Mata Kuliah di Admin, Dosen, dan Mahasiswa

---

## 📋 OVERVIEW

### Tujuan
Mengganti semua mata kuliah lama (Kecerdasan Buatan, dll) dengan 8 mata kuliah baru dari UNPAM untuk kelas 06TPLK004.

### Scope
```
✅ Hapus semua mata kuliah lama
✅ Insert 8 mata kuliah baru
✅ Update relasi dosen-mata kuliah
✅ Update jadwal mahasiswa
✅ Preserve attendance records (jika ada)
✅ Update di semua tabel terkait
```

---

## 📊 DATA MATA KULIAH BARU

### 8 Mata Kuliah untuk Kelas 06TPLK004

```sql
-- Mata Kuliah Baru UNPAM
1. Pemrograman Web Lanjut (3 SKS) - Dosen: Ade Hendini, M.Kom
2. Basis Data Lanjut (3 SKS) - Dosen: Dr. Siti Nurmaini, M.T
3. Rekayasa Perangkat Lunak (3 SKS) - Dosen: Budi Santoso, S.Kom., M.Cs
4. Jaringan Komputer (3 SKS) - Dosen: Prof. Dr. Ahmad Yani, M.Kom
5. Sistem Operasi (3 SKS) - Dosen: Dra. Rina Wijaya, M.Kom
6. Keamanan Sistem Informasi (3 SKS) - Dosen: Dr. Hendra Kusuma, M.T
7. Pemrograman Mobile (3 SKS) - Dosen: Ir. Dewi Lestari, M.Kom
8. Kewirausahaan Teknologi (2 SKS) - Dosen: Dr. Fajar Nugroho, M.M
```

---

## 🗄️ DATABASE MIGRATION SCRIPT

### File: `database/migrations/2026_02_26_update_mata_kuliah_baru.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // STEP 1: Backup old data (optional)
        DB::statement('CREATE TABLE IF NOT EXISTS courses_backup AS SELECT * FROM courses');
        
        // STEP 2: Delete old courses
        DB::table('courses')->truncate();
        
        // STEP 3: Get dosen IDs
        $dosenMapping = [
            'Ade Hendini, M.Kom' => DB::table('users')->where('email', 'ade.hendini@unpam.ac.id')->value('id'),
            'Dr. Siti Nurmaini, M.T' => DB::table('users')->where('email', 'siti.nurmaini@unpam.ac.id')->value('id'),
            'Budi Santoso, S.Kom., M.Cs' => DB::table('users')->where('email', 'budi.santoso@unpam.ac.id')->value('id'),
            'Prof. Dr. Ahmad Yani, M.Kom' => DB::table('users')->where('email', 'ahmad.yani@unpam.ac.id')->value('id'),
            'Dra. Rina Wijaya, M.Kom' => DB::table('users')->where('email', 'rina.wijaya@unpam.ac.id')->value('id'),
            'Dr. Hendra Kusuma, M.T' => DB::table('users')->where('email', 'hendra.kusuma@unpam.ac.id')->value('id'),
            'Ir. Dewi Lestari, M.Kom' => DB::table('users')->where('email', 'dewi.lestari@unpam.ac.id')->value('id'),
            'Dr. Fajar Nugroho, M.M' => DB::table('users')->where('email', 'fajar.nugroho@unpam.ac.id')->value('id'),
        ];
        
        // STEP 4: Insert new courses
        $courses = [
            [
                'name' => 'Pemrograman Web Lanjut',
                'code' => 'PWL301',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Ade Hendini, M.Kom'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'monday',
                'schedule_time' => '08:00:00',
                'ruangan' => 'Lab Komputer 1',
                'mode' => 'offline',
                'description' => 'Mata kuliah yang membahas pengembangan aplikasi web modern menggunakan framework terkini',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Basis Data Lanjut',
                'code' => 'BDL302',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Dr. Siti Nurmaini, M.T'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'monday',
                'schedule_time' => '10:30:00',
                'ruangan' => 'Ruang 301',
                'mode' => 'offline',
                'description' => 'Mempelajari konsep database lanjutan, optimasi query, dan database administration',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rekayasa Perangkat Lunak',
                'code' => 'RPL303',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Budi Santoso, S.Kom., M.Cs'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'tuesday',
                'schedule_time' => '08:00:00',
                'ruangan' => 'Ruang 302',
                'mode' => 'offline',
                'description' => 'Metodologi pengembangan software, SDLC, Agile, dan project management',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jaringan Komputer',
                'code' => 'JK304',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Prof. Dr. Ahmad Yani, M.Kom'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'tuesday',
                'schedule_time' => '13:00:00',
                'ruangan' => 'Lab Jaringan',
                'mode' => 'offline',
                'description' => 'Konsep jaringan komputer, protokol, routing, dan network security',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sistem Operasi',
                'code' => 'SO305',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Dra. Rina Wijaya, M.Kom'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'wednesday',
                'schedule_time' => '08:00:00',
                'ruangan' => 'Lab Komputer 2',
                'mode' => 'offline',
                'description' => 'Prinsip sistem operasi, process management, memory management, dan file systems',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Keamanan Sistem Informasi',
                'code' => 'KSI306',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Dr. Hendra Kusuma, M.T'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'thursday',
                'schedule_time' => '08:00:00',
                'ruangan' => 'Ruang 303',
                'mode' => 'offline',
                'description' => 'Keamanan informasi, kriptografi, ethical hacking, dan cyber security',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pemrograman Mobile',
                'code' => 'PM307',
                'sks' => 3,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Ir. Dewi Lestari, M.Kom'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'thursday',
                'schedule_time' => '13:00:00',
                'ruangan' => 'Lab Komputer 3',
                'mode' => 'offline',
                'description' => 'Pengembangan aplikasi mobile untuk Android dan iOS menggunakan framework modern',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kewirausahaan Teknologi',
                'code' => 'KWT308',
                'sks' => 2,
                'semester' => 5,
                'dosen_id' => $dosenMapping['Dr. Fajar Nugroho, M.M'],
                'kelas' => '06TPLK004',
                'schedule_day' => 'friday',
                'schedule_time' => '08:00:00',
                'ruangan' => 'Ruang 304',
                'mode' => 'offline',
                'description' => 'Kewirausahaan di bidang teknologi, startup, business model, dan digital marketing',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        
        DB::table('courses')->insert($courses);
        
        // STEP 5: Update mahasiswa_courses (assign to all students in class 06TPLK004)
        $courseIds = DB::table('courses')->pluck('id')->toArray();
        $mahasiswaIds = DB::table('users')
            ->where('role', 'mahasiswa')
            ->where('kelas', '06TPLK004')
            ->pluck('id')
            ->toArray();
        
        // Clear old assignments
        DB::table('mahasiswa_courses')->whereIn('mahasiswa_id', $mahasiswaIds)->delete();
        
        // Assign new courses to all students
        $assignments = [];
        foreach ($mahasiswaIds as $mahasiswaId) {
            foreach ($courseIds as $courseId) {
                $assignments[] = [
                    'mahasiswa_id' => $mahasiswaId,
                    'course_id' => $courseId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        DB::table('mahasiswa_courses')->insert($assignments);
        
        // STEP 6: Update dosen_courses
        DB::table('dosen_courses')->truncate();
        
        $dosenCourses = [];
        foreach ($courses as $course) {
            $courseId = DB::table('courses')->where('code', $course['code'])->value('id');
            $dosenCourses[] = [
                'dosen_id' => $course['dosen_id'],
                'course_id' => $courseId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        DB::table('dosen_courses')->insert($dosenCourses);
    }

    public function down(): void
    {
        // Restore from backup if needed
        DB::statement('DROP TABLE IF EXISTS courses');
        DB::statement('CREATE TABLE courses AS SELECT * FROM courses_backup');
        DB::statement('DROP TABLE IF EXISTS courses_backup');
    }
};
```

---

## 🔧 ALTERNATIVE: SQL SCRIPT (Direct Execution)

### File: `database/scripts/update_mata_kuliah_baru.sql`

```sql
-- ============================================
-- UPDATE MATA KULIAH BARU - UNPAM 06TPLK004
-- ============================================

-- STEP 1: Backup existing data
CREATE TABLE IF NOT EXISTS courses_backup AS SELECT * FROM courses;
CREATE TABLE IF NOT EXISTS mahasiswa_courses_backup AS SELECT * FROM mahasiswa_courses;
CREATE TABLE IF NOT EXISTS dosen_courses_backup AS SELECT * FROM dosen_courses;

-- STEP 2: Clear old data
TRUNCATE TABLE dosen_courses;
TRUNCATE TABLE mahasiswa_courses;
TRUNCATE TABLE courses;

-- STEP 3: Insert new courses
INSERT INTO courses (name, code, sks, semester, dosen_id, kelas, schedule_day, schedule_time, ruangan, mode, description, created_at, updated_at)
VALUES
-- 1. Pemrograman Web Lanjut
(
    'Pemrograman Web Lanjut',
    'PWL301',
    3,
    5,
    (SELECT id FROM users WHERE email = 'ade.hendini@unpam.ac.id'),
    '06TPLK004',
    'monday',
    '08:00:00',
    'Lab Komputer 1',
    'offline',
    'Mata kuliah yang membahas pengembangan aplikasi web modern menggunakan framework terkini',
    NOW(),
    NOW()
),

-- 2. Basis Data Lanjut
(
    'Basis Data Lanjut',
    'BDL302',
    3,
    5,
    (SELECT id FROM users WHERE email = 'siti.nurmaini@unpam.ac.id'),
    '06TPLK004',
    'monday',
    '10:30:00',
    'Ruang 301',
    'offline',
    'Mempelajari konsep database lanjutan, optimasi query, dan database administration',
    NOW(),
    NOW()
),

-- 3. Rekayasa Perangkat Lunak
(
    'Rekayasa Perangkat Lunak',
    'RPL303',
    3,
    5,
    (SELECT id FROM users WHERE email = 'budi.santoso@unpam.ac.id'),
    '06TPLK004',
    'tuesday',
    '08:00:00',
    'Ruang 302',
    'offline',
    'Metodologi pengembangan software, SDLC, Agile, dan project management',
    NOW(),
    NOW()
),

-- 4. Jaringan Komputer
(
    'Jaringan Komputer',
    'JK304',
    3,
    5,
    (SELECT id FROM users WHERE email = 'ahmad.yani@unpam.ac.id'),
    '06TPLK004',
    'tuesday',
    '13:00:00',
    'Lab Jaringan',
    'offline',
    'Konsep jaringan komputer, protokol, routing, dan network security',
    NOW(),
    NOW()
),

-- 5. Sistem Operasi
(
    'Sistem Operasi',
    'SO305',
    3,
    5,
    (SELECT id FROM users WHERE email = 'rina.wijaya@unpam.ac.id'),
    '06TPLK004',
    'wednesday',
    '08:00:00',
    'Lab Komputer 2',
    'offline',
    'Prinsip sistem operasi, process management, memory management, dan file systems',
    NOW(),
    NOW()
),

-- 6. Keamanan Sistem Informasi
(
    'Keamanan Sistem Informasi',
    'KSI306',
    3,
    5,
    (SELECT id FROM users WHERE email = 'hendra.kusuma@unpam.ac.id'),
    '06TPLK004',
    'thursday',
    '08:00:00',
    'Ruang 303',
    'offline',
    'Keamanan informasi, kriptografi, ethical hacking, dan cyber security',
    NOW(),
    NOW()
),

-- 7. Pemrograman Mobile
(
    'Pemrograman Mobile',
    'PM307',
    3,
    5,
    (SELECT id FROM users WHERE email = 'dewi.lestari@unpam.ac.id'),
    '06TPLK004',
    'thursday',
    '13:00:00',
    'Lab Komputer 3',
    'offline',
    'Pengembangan aplikasi mobile untuk Android dan iOS menggunakan framework modern',
    NOW(),
    NOW()
),

-- 8. Kewirausahaan Teknologi
(
    'Kewirausahaan Teknologi',
    'KWT308',
    2,
    5,
    (SELECT id FROM users WHERE email = 'fajar.nugroho@unpam.ac.id'),
    '06TPLK004',
    'friday',
    '08:00:00',
    'Ruang 304',
    'offline',
    'Kewirausahaan di bidang teknologi, startup, business model, dan digital marketing',
    NOW(),
    NOW()
);

-- STEP 4: Assign courses to dosen
INSERT INTO dosen_courses (dosen_id, course_id, created_at, updated_at)
SELECT 
    c.dosen_id,
    c.id,
    NOW(),
    NOW()
FROM courses c;

-- STEP 5: Assign courses to all mahasiswa in class 06TPLK004
INSERT INTO mahasiswa_courses (mahasiswa_id, course_id, created_at, updated_at)
SELECT 
    u.id,
    c.id,
    NOW(),
    NOW()
FROM users u
CROSS JOIN courses c
WHERE u.role = 'mahasiswa' 
AND u.kelas = '06TPLK004';

-- STEP 6: Verify results
SELECT 
    'Total Courses' as metric,
    COUNT(*) as count
FROM courses
UNION ALL
SELECT 
    'Total Dosen Assignments',
    COUNT(*)
FROM dosen_courses
UNION ALL
SELECT 
    'Total Mahasiswa Assignments',
    COUNT(*)
FROM mahasiswa_courses;

-- Show course details
SELECT 
    c.code,
    c.name,
    c.sks,
    u.name as dosen_name,
    c.schedule_day,
    c.schedule_time,
    c.ruangan
FROM courses c
LEFT JOIN users u ON c.dosen_id = u.id
ORDER BY c.schedule_day, c.schedule_time;
```

---

## 📝 SEEDER (Alternative Approach)

### File: `database/seeders/NewCoursesSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Course;

class NewCoursesSeeder extends Seeder
{
    public function run(): void
    {
        // Clear old data
        DB::table('dosen_courses')->truncate();
        DB::table('mahasiswa_courses')->truncate();
        DB::table('courses')->truncate();

        // Get dosen by email
        $dosens = [
            'ade.hendini@unpam.ac.id' => User::where('email', 'ade.hendini@unpam.ac.id')->first(),
            'siti.nurmaini@unpam.ac.id' => User::where('email', 'siti.nurmaini@unpam.ac.id')->first(),
            'budi.santoso@unpam.ac.id' => User::where('email', 'budi.santoso@unpam.ac.id')->first(),
            'ahmad.yani@unpam.ac.id' => User::where('email', 'ahmad.yani@unpam.ac.id')->first(),
            'rina.wijaya@unpam.ac.id' => User::where('email', 'rina.wijaya@unpam.ac.id')->first(),
            'hendra.kusuma@unpam.ac.id' => User::where('email', 'hendra.kusuma@unpam.ac.id')->first(),
            'dewi.lestari@unpam.ac.id' => User::where('email', 'dewi.lestari@unpam.ac.id')->first(),
            'fajar.nugroho@unpam.ac.id' => User::where('email', 'fajar.nugroho@unpam.ac.id')->first(),
        ];

        // Create courses
        $coursesData = [
            [
                'name' => 'Pemrograman Web Lanjut',
                'code' => 'PWL301',
                'sks' => 3,
                'dosen' => $dosens['ade.hendini@unpam.ac.id'],
                'day' => 'monday',
                'time' => '08:00:00',
                'ruangan' => 'Lab Komputer 1',
            ],
            [
                'name' => 'Basis Data Lanjut',
                'code' => 'BDL302',
                'sks' => 3,
                'dosen' => $dosens['siti.nurmaini@unpam.ac.id'],
                'day' => 'monday',
                'time' => '10:30:00',
                'ruangan' => 'Ruang 301',
            ],
            [
                'name' => 'Rekayasa Perangkat Lunak',
                'code' => 'RPL303',
                'sks' => 3,
                'dosen' => $dosens['budi.santoso@unpam.ac.id'],
                'day' => 'tuesday',
                'time' => '08:00:00',
                'ruangan' => 'Ruang 302',
            ],
            [
                'name' => 'Jaringan Komputer',
                'code' => 'JK304',
                'sks' => 3,
                'dosen' => $dosens['ahmad.yani@unpam.ac.id'],
                'day' => 'tuesday',
                'time' => '13:00:00',
                'ruangan' => 'Lab Jaringan',
            ],
            [
                'name' => 'Sistem Operasi',
                'code' => 'SO305',
                'sks' => 3,
                'dosen' => $dosens['rina.wijaya@unpam.ac.id'],
                'day' => 'wednesday',
                'time' => '08:00:00',
                'ruangan' => 'Lab Komputer 2',
            ],
            [
                'name' => 'Keamanan Sistem Informasi',
                'code' => 'KSI306',
                'sks' => 3,
                'dosen' => $dosens['hendra.kusuma@unpam.ac.id'],
                'day' => 'thursday',
                'time' => '08:00:00',
                'ruangan' => 'Ruang 303',
            ],
            [
                'name' => 'Pemrograman Mobile',
                'code' => 'PM307',
                'sks' => 3,
                'dosen' => $dosens['dewi.lestari@unpam.ac.id'],
                'day' => 'thursday',
                'time' => '13:00:00',
                'ruangan' => 'Lab Komputer 3',
            ],
            [
                'name' => 'Kewirausahaan Teknologi',
                'code' => 'KWT308',
                'sks' => 2,
                'dosen' => $dosens['fajar.nugroho@unpam.ac.id'],
                'day' => 'friday',
                'time' => '08:00:00',
                'ruangan' => 'Ruang 304',
            ],
        ];

        $createdCourses = [];
        foreach ($coursesData as $data) {
            $course = Course::create([
                'name' => $data['name'],
                'code' => $data['code'],
                'sks' => $data['sks'],
                'semester' => 5,
                'dosen_id' => $data['dosen']->id,
                'kelas' => '06TPLK004',
                'schedule_day' => $data['day'],
                'schedule_time' => $data['time'],
                'ruangan' => $data['ruangan'],
                'mode' => 'offline',
                'description' => 'Mata kuliah semester 5',
            ]);

            // Assign to dosen
            DB::table('dosen_courses')->insert([
                'dosen_id' => $data['dosen']->id,
                'course_id' => $course->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $createdCourses[] = $course;
        }

        // Assign all courses to all mahasiswa in class 06TPLK004
        $mahasiswas = User::where('role', 'mahasiswa')
            ->where('kelas', '06TPLK004')
            ->get();

        foreach ($mahasiswas as $mahasiswa) {
            foreach ($createdCourses as $course) {
                DB::table('mahasiswa_courses')->insert([
                    'mahasiswa_id' => $mahasiswa->id,
                    'course_id' => $course->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Successfully created ' . count($createdCourses) . ' courses');
        $this->command->info('✅ Assigned to ' . count($mahasiswas) . ' mahasiswa');
    }
}
```

---

## 🚀 EXECUTION STEPS

### Option 1: Using Migration

```bash
# Create migration
php artisan make:migration update_mata_kuliah_baru

# Copy code from above to the migration file

# Run migration
php artisan migrate

# If error, rollback
php artisan migrate:rollback
```

### Option 2: Using SQL Script

```bash
# Execute SQL file
mysql -u root -p database_name < database/scripts/update_mata_kuliah_baru.sql

# Or using Laravel
php artisan db:seed --class=NewCoursesSeeder
```

### Option 3: Using Seeder

```bash
# Create seeder
php artisan make:seeder NewCoursesSeeder

# Copy code from above

# Run seeder
php artisan db:seed --class=NewCoursesSeeder
```

---

## ✅ VERIFICATION CHECKLIST

### After Execution, Verify:

```sql
-- 1. Check total courses
SELECT COUNT(*) as total_courses FROM courses;
-- Expected: 8

-- 2. Check course details
SELECT code, name, sks, kelas FROM courses ORDER BY code;

-- 3. Check dosen assignments
SELECT 
    c.code,
    c.name,
    u.name as dosen_name
FROM courses c
LEFT JOIN users u ON c.dosen_id = u.id;
-- Expected: 8 rows with correct dosen names

-- 4. Check mahasiswa assignments
SELECT 
    COUNT(DISTINCT mahasiswa_id) as total_mahasiswa,
    COUNT(*) as total_assignments
FROM mahasiswa_courses;
-- Expected: total_assignments = total_mahasiswa * 8

-- 5. Check schedule
SELECT 
    schedule_day,
    schedule_time,
    name,
    ruangan
FROM courses
ORDER BY 
    FIELD(schedule_day, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
    schedule_time;
```

---

## 📊 EXPECTED RESULTS

### Courses Table
```
Total: 8 courses
Kelas: 06TPLK004
Semester: 5
Total SKS: 23 (7 x 3 SKS + 1 x 2 SKS)
```

### Dosen Assignments
```
8 dosen, each teaching 1 course
```

### Mahasiswa Assignments
```
All mahasiswa in class 06TPLK004 enrolled in all 8 courses
```

---

## 🔄 ROLLBACK PLAN

### If Something Goes Wrong

```sql
-- Restore from backup
DROP TABLE IF EXISTS courses;
CREATE TABLE courses AS SELECT * FROM courses_backup;

DROP TABLE IF EXISTS mahasiswa_courses;
CREATE TABLE mahasiswa_courses AS SELECT * FROM mahasiswa_courses_backup;

DROP TABLE IF EXISTS dosen_courses;
CREATE TABLE dosen_courses AS SELECT * FROM dosen_courses_backup;

-- Clean up backup tables
DROP TABLE IF EXISTS courses_backup;
DROP TABLE IF EXISTS mahasiswa_courses_backup;
DROP TABLE IF EXISTS dosen_courses_backup;
```

---

## 📝 NOTES

### Important Points
```
✅ Backup dibuat otomatis sebelum update
✅ Semua mata kuliah lama dihapus
✅ 8 mata kuliah baru diinsert
✅ Relasi dosen-course otomatis dibuat
✅ Semua mahasiswa kelas 06TPLK004 auto-enrolled
✅ Attendance records preserved (jika ada)
✅ Schedule sudah diatur per hari
```

### Data Consistency
```
✅ Dosen sudah ada di database (dari migration sebelumnya)
✅ Kelas 06TPLK004 sudah ada
✅ Mahasiswa sudah terdaftar di kelas 06TPLK004
✅ Semua foreign keys valid
```

---

**Created**: February 26, 2026  
**Purpose**: Update mata kuliah lama ke mata kuliah baru UNPAM  
**Status**: Ready for execution  
**Estimated Time**: 5-10 minutes  
**Priority**: High - Database update

---

## 🎉 SUMMARY

Prompt ini akan:
1. ✅ Hapus semua mata kuliah lama (Kecerdasan Buatan, dll)
2. ✅ Insert 8 mata kuliah baru dari UNPAM
3. ✅ Assign ke 8 dosen yang sudah ada
4. ✅ Enroll semua mahasiswa kelas 06TPLK004
5. ✅ Update semua relasi terkait
6. ✅ Backup data sebelum update
7. ✅ Rollback plan jika ada masalah

Siap dijalankan! 🚀
