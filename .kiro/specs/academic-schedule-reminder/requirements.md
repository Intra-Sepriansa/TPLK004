# Requirements Document

## Introduction

Fitur Jadwal & Pengingat Akademik untuk mahasiswa kelas 06TPLK004 UNPAM. Sistem ini membantu mahasiswa melacak jadwal perkuliahan (online Senin-Jumat, offline Kamis), mengelola tugas, mencatat pembelajaran, dan mendapatkan pengingat otomatis untuk UTS/UAS berdasarkan jumlah SKS mata kuliah.

## Glossary

- **Schedule_System**: Sistem yang mengelola jadwal perkuliahan dan pengingat
- **Task_Tracker**: Komponen yang melacak status tugas (belum/sudah dikerjakan)
- **Meeting_Progress**: Komponen yang menampilkan progress pertemuan per mata kuliah
- **Learning_Notes**: Komponen untuk mencatat pembelajaran per pertemuan
- **Reminder_Engine**: Komponen yang mengirim pengingat UTS/UAS
- **SKS**: Satuan Kredit Semester (2 SKS = 14 pertemuan, 3 SKS = 21 pertemuan)
- **Mahasiswa**: Pengguna sistem (mahasiswa kelas 06TPLK004)

## Requirements

### Requirement 1: Jadwal Perkuliahan

**User Story:** As a mahasiswa, I want to see my weekly class schedule, so that I can know when I have online and offline classes.

#### Acceptance Criteria

1. THE Schedule_System SHALL display weekly schedule with online classes (Monday-Friday) and offline class (Thursday)
2. WHEN a mahasiswa views the schedule, THE Schedule_System SHALL show course name, time, meeting number, and mode (online/offline)
3. THE Schedule_System SHALL highlight today's classes with visual distinction
4. WHEN a class is completed, THE Schedule_System SHALL mark it as done with checkmark indicator
5. THE Schedule_System SHALL show countdown to next class session

### Requirement 2: Progress Pertemuan per Mata Kuliah

**User Story:** As a mahasiswa, I want to track meeting progress for each course, so that I can see how many meetings are left and when UTS/UAS will be.

#### Acceptance Criteria

1. THE Meeting_Progress SHALL display progress bar showing completed meetings vs total meetings
2. FOR courses with 3 SKS, THE Meeting_Progress SHALL show 21 total meetings with UTS after meeting 14 and UAS after meeting 21
3. FOR courses with 2 SKS, THE Meeting_Progress SHALL show 14 total meetings with UTS after meeting 7 and UAS after meeting 14
4. THE Meeting_Progress SHALL display milestone markers for UTS and UAS on the progress bar
5. WHEN current meeting approaches UTS/UAS, THE Meeting_Progress SHALL show warning indicator
6. THE Meeting_Progress SHALL calculate and display estimated UTS/UAS dates based on schedule

### Requirement 3: Task Tracker (Tugas)

**User Story:** As a mahasiswa, I want to track my assignments for each meeting, so that I can know which tasks are done and which are pending.

#### Acceptance Criteria

1. THE Task_Tracker SHALL allow mahasiswa to add tasks for each meeting/course
2. THE Task_Tracker SHALL display task status: pending, in-progress, completed
3. WHEN a mahasiswa marks a task as complete, THE Task_Tracker SHALL update the status with timestamp
4. THE Task_Tracker SHALL show task deadline and days remaining
5. THE Task_Tracker SHALL display overdue tasks with red warning indicator
6. THE Task_Tracker SHALL allow filtering tasks by course, status, and deadline
7. THE Task_Tracker SHALL show task completion statistics per course

### Requirement 4: Learning Notes (Catatan Pembelajaran)

**User Story:** As a mahasiswa, I want to write notes for each meeting, so that I can review what I learned especially for offline classes.

#### Acceptance Criteria

1. THE Learning_Notes SHALL allow mahasiswa to create notes for each meeting
2. THE Learning_Notes SHALL support rich text formatting (bold, italic, bullet points)
3. THE Learning_Notes SHALL allow attaching links or references
4. THE Learning_Notes SHALL display notes organized by course and meeting number
5. WHEN viewing a course, THE Learning_Notes SHALL show all notes in chronological order
6. THE Learning_Notes SHALL allow searching notes by keyword
7. THE Learning_Notes SHALL distinguish between online and offline meeting notes with visual indicator

### Requirement 5: UTS/UAS Reminder System

**User Story:** As a mahasiswa, I want to receive reminders for upcoming UTS and UAS, so that I don't forget to prepare.

#### Acceptance Criteria

1. THE Reminder_Engine SHALL calculate UTS/UAS dates based on course SKS and meeting schedule
2. THE Reminder_Engine SHALL display countdown days to UTS/UAS for each course
3. WHEN UTS/UAS is within 7 days, THE Reminder_Engine SHALL show prominent warning banner
4. WHEN UTS/UAS is within 3 days, THE Reminder_Engine SHALL show critical alert with red indicator
5. THE Reminder_Engine SHALL display preparation checklist for UTS/UAS
6. THE Reminder_Engine SHALL show all upcoming exams in a unified calendar view

### Requirement 6: Dashboard Overview

**User Story:** As a mahasiswa, I want to see an overview of my academic progress, so that I can quickly understand my current status.

#### Acceptance Criteria

1. THE Schedule_System SHALL display dashboard with today's schedule summary
2. THE Schedule_System SHALL show pending tasks count with urgency indicator
3. THE Schedule_System SHALL display upcoming UTS/UAS with countdown
4. THE Schedule_System SHALL show overall progress across all courses
5. THE Schedule_System SHALL display recent notes and activities
6. THE Schedule_System SHALL show motivational progress statistics (e.g., "80% tugas selesai minggu ini")

### Requirement 7: Course Management

**User Story:** As a mahasiswa, I want to manage my enrolled courses, so that the system can track my schedule accurately.

#### Acceptance Criteria

1. THE Schedule_System SHALL allow mahasiswa to add courses with name, SKS, schedule day/time, and mode
2. THE Schedule_System SHALL validate SKS input (only 2 or 3 allowed)
3. THE Schedule_System SHALL auto-calculate total meetings based on SKS
4. THE Schedule_System SHALL auto-calculate UTS/UAS meeting numbers based on SKS
5. WHEN a course is added, THE Schedule_System SHALL generate meeting schedule automatically
6. THE Schedule_System SHALL allow editing and deleting courses
