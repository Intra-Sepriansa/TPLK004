# Implementation Plan: Jadwal & Pengingat Akademik

## Overview

Implementasi fitur Jadwal & Pengingat Akademik untuk mahasiswa kelas 06TPLK004. Fitur ini mencakup manajemen mata kuliah, tracking tugas, catatan pembelajaran, dan sistem pengingat UTS/UAS.

## Tasks

- [x] 1. Setup Database dan Models
  - [x] 1.1 Buat migration untuk tabel mahasiswa_courses
    - Kolom: id, mahasiswa_id, name, sks, total_meetings, current_meeting, uts_meeting, uas_meeting, schedule_day, schedule_time, mode, start_date, timestamps
    - Foreign key ke tabel mahasiswa
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 1.2 Buat migration untuk tabel course_meetings
    - Kolom: id, mahasiswa_course_id, meeting_number, scheduled_date, is_completed, completed_at, notes, timestamps
    - Foreign key ke mahasiswa_courses
    - Unique constraint pada (mahasiswa_course_id, meeting_number)
    - _Requirements: 1.4, 2.1_

  - [x] 1.3 Buat migration untuk tabel academic_tasks
    - Kolom: id, mahasiswa_id, mahasiswa_course_id, meeting_number, title, description, deadline, status, completed_at, timestamps
    - Foreign key ke mahasiswa dan mahasiswa_courses
    - _Requirements: 3.1, 3.2_

  - [x] 1.4 Buat migration untuk tabel academic_notes
    - Kolom: id, mahasiswa_id, mahasiswa_course_id, meeting_number, title, content, links (JSON), timestamps
    - Foreign key ke mahasiswa dan mahasiswa_courses
    - _Requirements: 4.1_

  - [x] 1.5 Buat Model MahasiswaCourse dengan relationships dan accessors
    - Relationships: mahasiswa, meetings, tasks, notes
    - Accessors: progress, uts_days_remaining, uas_days_remaining
    - _Requirements: 2.1, 5.2_

  - [x] 1.6 Buat Model CourseMeeting dengan relationships
    - Relationships: course
    - _Requirements: 1.4_

  - [x] 1.7 Buat Model AcademicTask dengan relationships dan accessors
    - Relationships: mahasiswa, course
    - Accessors: days_remaining, is_overdue
    - _Requirements: 3.4, 3.5_

  - [x] 1.8 Buat Model AcademicNote dengan relationships
    - Relationships: mahasiswa, course
    - _Requirements: 4.1_

- [x] 2. Buat Service Layer
  - [x] 2.1 Buat ScheduleService dengan method kalkulasi
    - calculateTotalMeetings(sks): 2→14, 3→21
    - calculateUtsMeeting(sks): 2→7, 3→14
    - calculateUasMeeting(sks): 2→14, 3→21
    - calculateExamDate(course, examType)
    - getCountdownDays(targetDate)
    - generateMeetingSchedule(course)
    - _Requirements: 2.2, 2.3, 5.1, 7.3, 7.4_

  - [x] 2.2 Write property test untuk SKS-based calculation
    - **Property 1: SKS-based Meeting Calculation**
    - **Validates: Requirements 2.2, 2.3, 7.3, 7.4**

  - [x] 2.3 Write property test untuk countdown calculation
    - **Property 6: Exam Countdown Calculation**
    - **Validates: Requirements 5.1, 5.2, 6.3**

  - [x] 2.4 Write property test untuk reminder threshold
    - **Property 7: Reminder Threshold Logic**
    - **Validates: Requirements 5.3, 5.4**

- [x] 3. Buat Controllers
  - [x] 3.1 Buat AcademicCourseController
    - index(): List mata kuliah dengan progress
    - store(): Tambah mata kuliah dengan validasi SKS
    - update(): Edit mata kuliah
    - destroy(): Hapus mata kuliah
    - Auto-generate meetings saat store
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [x] 3.2 Buat AcademicTaskController
    - index(): List tugas dengan filter
    - store(): Tambah tugas
    - update(): Edit tugas
    - toggleStatus(): Toggle complete/pending dengan timestamp
    - destroy(): Hapus tugas
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_

  - [x] 3.3 Buat AcademicNoteController
    - index(): List catatan per course
    - store(): Tambah catatan
    - update(): Edit catatan
    - destroy(): Hapus catatan
    - search(): Search catatan by keyword
    - _Requirements: 4.1, 4.4, 4.5, 4.6_

  - [x] 3.4 Buat AcademicScheduleController
    - dashboard(): Overview dengan stats
    - schedule(): Weekly schedule view
    - exams(): Exam calendar dengan countdown
    - _Requirements: 1.1, 1.2, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 4. Setup Routes
  - [-] 4.1 Tambah routes di routes/web.php untuk mahasiswa
    - GET /user/akademik - Dashboard
    - GET /user/akademik/jadwal - Schedule
    - GET /user/akademik/tugas - Tasks
    - GET /user/akademik/catatan - Notes
    - GET /user/akademik/matkul - Courses
    - GET /user/akademik/ujian - Exams
    - POST/PUT/DELETE untuk CRUD operations
    - _Requirements: All_

- [x] 5. Checkpoint - Backend Complete
  - Jalankan migrations
  - Test endpoints dengan Postman/curl
  - Pastikan semua CRUD berfungsi

- [x] 6. Buat Frontend Pages
  - [x] 6.1 Buat halaman AcademicDashboard (resources/js/pages/user/akademik/index.tsx)
    - Header dengan greeting dan stats cards
    - Today's schedule section
    - Pending tasks dengan urgency indicator
    - Upcoming exams dengan countdown
    - Recent notes section
    - Progress overview per course
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 6.2 Buat halaman AcademicSchedule (resources/js/pages/user/akademik/jadwal.tsx)
    - Weekly calendar view (Senin-Jumat)
    - Highlight hari ini
    - Badge online/offline
    - Progress bar per course
    - Meeting number indicator
    - Countdown to next class
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 6.3 Buat halaman AcademicTasks (resources/js/pages/user/akademik/tugas.tsx)
    - Task list dengan status badges
    - Filter by course, status, deadline
    - Add task modal/form
    - Toggle complete dengan animation
    - Overdue warning indicator
    - Statistics cards
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 6.4 Buat halaman AcademicNotes (resources/js/pages/user/akademik/catatan.tsx)
    - Notes list grouped by course
    - Online/offline badge
    - Search functionality
    - Add/edit note modal
    - Rich text display
    - Links section
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 6.5 Buat halaman AcademicCourses (resources/js/pages/user/akademik/matkul.tsx)
    - Course cards dengan progress
    - Add course form dengan SKS selector
    - Edit/delete course
    - UTS/UAS milestone display
    - Meeting progress bar
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 6.6 Buat halaman AcademicExams (resources/js/pages/user/akademik/ujian.tsx)
    - Calendar view dengan exam markers
    - Exam cards dengan countdown
    - Warning/critical indicators
    - Preparation checklist
    - Course filter
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7. Tambah Menu Sidebar
  - [x] 7.1 Update app-sidebar.tsx untuk mahasiswa
    - Tambah menu "Akademik" dengan icon BookOpen
    - Sub-menu: Dashboard, Jadwal, Tugas, Catatan, Mata Kuliah, Ujian
    - _Requirements: All_

- [x] 8. Checkpoint - Frontend Complete
  - Test semua halaman
  - Pastikan navigasi berfungsi
  - Test CRUD operations dari UI

- [x] 9. Polish dan Enhancement
  - [x] 9.1 Tambah animasi dan transitions
    - Fade in untuk cards
    - Slide untuk modals
    - Progress bar animation
    - _Requirements: UI Enhancement_

  - [x] 9.2 Tambah empty states dan loading states
    - Empty state untuk list kosong
    - Skeleton loading
    - _Requirements: Error Handling_

  - [x] 9.3 Tambah toast notifications
    - Success toast untuk CRUD
    - Error toast untuk failures
    - _Requirements: Error Handling_

- [x] 10. Final Checkpoint
  - Test semua fitur end-to-end
  - Pastikan semua requirements terpenuhi
  - Review UI/UX

## Notes

- Semua tasks termasuk property tests sekarang required
- Semua halaman menggunakan StudentLayout
- Gunakan komponen UI yang sudah ada (Button, Card, Input, etc.)
- Warna tema: emerald/teal untuk success, amber untuk warning, red untuk critical
