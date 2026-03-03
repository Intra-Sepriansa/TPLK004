# Requirements Document

## Introduction

Sistem Manajemen Tugas Kelompok (Group Assignment Management System) adalah platform terintegrasi yang memungkinkan dosen untuk membuat, mengelola, dan menilai tugas kelompok dengan berbagai mode pembentukan grup, fitur kolaborasi real-time, dan sistem penilaian yang fleksibel. Sistem ini mendukung tiga mode pembentukan grup (self-form, random, manual), fitur kolaborasi lengkap (chat, task distribution, file sharing), serta berbagai opsi penilaian termasuk peer evaluation dan contribution-based grading.

## Glossary

- **Group_Assignment_System**: Sistem utama yang mengelola semua fungsi tugas kelompok
- **Assignment**: Tugas kelompok yang dibuat oleh dosen
- **Group**: Kelompok mahasiswa yang mengerjakan assignment
- **Group_Member**: Mahasiswa yang menjadi anggota dari sebuah group
- **Formation_Mode**: Mode pembentukan grup (self-form, random, manual)
- **Task**: Sub-tugas dalam assignment yang didistribusikan ke group members
- **Submission**: Pengumpulan hasil kerja group
- **Peer_Evaluation**: Penilaian antar anggota kelompok
- **Contribution_Score**: Skor kontribusi individual dalam kelompok
- **Activity_Log**: Catatan aktivitas anggota kelompok
- **Grading_Mode**: Mode penilaian (same grade, individual adjustment, peer-based, contribution-based)
- **Dosen**: Pengajar yang membuat dan mengelola assignment
- **Mahasiswa**: Peserta didik yang mengerjakan assignment dalam kelompok

## Requirements

### Requirement 1: Group Formation - Self-Form Mode

**User Story:** As a mahasiswa, I want to create and join groups myself, so that I can work with classmates I choose.

#### Acceptance Criteria

1. WHEN a dosen enables self-form mode for an assignment, THE Group_Assignment_System SHALL allow mahasiswa to create new groups
2. WHEN a mahasiswa creates a group, THE Group_Assignment_System SHALL require a group name and automatically assign the creator as group leader
3. WHEN a mahasiswa joins a group, THE Group_Assignment_System SHALL add them to the group if capacity allows
4. WHEN a group reaches maximum capacity, THE Group_Assignment_System SHALL prevent additional members from joining
5. WHEN a group has minimum required members, THE Group_Assignment_System SHALL mark the group as valid for submission
6. WHEN the formation deadline passes, THE Group_Assignment_System SHALL lock all groups and prevent further changes
7. IF a mahasiswa is not in any group after deadline, THEN THE Group_Assignment_System SHALL create a solo group or assign them to an incomplete group based on dosen settings

### Requirement 2: Group Formation - Random Mode

**User Story:** As a dosen, I want to automatically create random groups, so that I can ensure fair distribution and diverse collaboration.

#### Acceptance Criteria

1. WHEN a dosen selects random mode, THE Group_Assignment_System SHALL require group size parameters (min and max members)
2. WHEN a dosen triggers random formation, THE Group_Assignment_System SHALL distribute all enrolled mahasiswa into groups randomly
3. WHEN forming random groups, THE Group_Assignment_System SHALL ensure each group has between min and max members
4. WHEN forming random groups, THE Group_Assignment_System SHALL balance group sizes as evenly as possible
5. WHERE a dosen enables balanced distribution, THE Group_Assignment_System SHALL consider factors like GPA or previous performance
6. WHEN random formation is complete, THE Group_Assignment_System SHALL notify all mahasiswa of their group assignments
7. THE Group_Assignment_System SHALL allow dosen to regenerate random groups before the formation deadline

### Requirement 3: Group Formation - Manual Mode

**User Story:** As a dosen, I want to manually assign students to groups, so that I can create specific team compositions based on my knowledge.

#### Acceptance Criteria

1. WHEN a dosen selects manual mode, THE Group_Assignment_System SHALL display a list of all enrolled mahasiswa
2. WHEN a dosen creates a group manually, THE Group_Assignment_System SHALL allow selecting multiple mahasiswa to add
3. WHEN a dosen assigns a mahasiswa to a group, THE Group_Assignment_System SHALL remove them from the unassigned list
4. WHEN a dosen moves a mahasiswa between groups, THE Group_Assignment_System SHALL update both groups immediately
5. THE Group_Assignment_System SHALL allow dosen to designate a group leader for each group
6. THE Group_Assignment_System SHALL highlight unassigned mahasiswa to ensure complete assignment
7. WHEN manual assignment is complete, THE Group_Assignment_System SHALL notify all mahasiswa of their group assignments

### Requirement 4: Real-time Group Chat

**User Story:** As a group member, I want to chat with my teammates in real-time, so that we can coordinate our work effectively.

#### Acceptance Criteria

1. WHEN a group is formed, THE Group_Assignment_System SHALL create a dedicated chat room for that group
2. WHEN a member sends a message, THE Group_Assignment_System SHALL deliver it to all group members in real-time
3. WHEN a member is typing, THE Group_Assignment_System SHALL display a typing indicator to other members
4. WHEN a member sends a message, THE Group_Assignment_System SHALL display sender name, timestamp, and message content
5. THE Group_Assignment_System SHALL support text messages, emojis, and mentions (@username)
6. WHEN a member is offline, THE Group_Assignment_System SHALL queue messages and deliver when they come online
7. THE Group_Assignment_System SHALL display online status indicators for all group members
8. WHEN a member joins or leaves the group, THE Group_Assignment_System SHALL broadcast a system message to the chat

### Requirement 5: Task Distribution

**User Story:** As a group leader, I want to distribute tasks among members, so that work is organized and everyone knows their responsibilities.

#### Acceptance Criteria

1. WHEN a group leader creates a task, THE Group_Assignment_System SHALL require a task title and optional description
2. WHEN a group leader assigns a task, THE Group_Assignment_System SHALL allow selecting one or more group members
3. WHEN a task is assigned, THE Group_Assignment_System SHALL notify the assigned members
4. WHEN a member completes a task, THE Group_Assignment_System SHALL allow marking it as complete
5. WHEN a task status changes, THE Group_Assignment_System SHALL update the group progress tracker
6. THE Group_Assignment_System SHALL display task distribution overview showing who is assigned to what
7. WHERE a task has a deadline, THE Group_Assignment_System SHALL send reminders before the deadline

### Requirement 6: Shared File Uploads

**User Story:** As a group member, I want to upload and share files with my team, so that we can collaborate on documents and resources.

#### Acceptance Criteria

1. WHEN a member uploads a file, THE Group_Assignment_System SHALL validate file type (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, images, ZIP)
2. WHEN a member uploads a file, THE Group_Assignment_System SHALL validate file size (max 25MB per file)
3. WHEN a file is uploaded, THE Group_Assignment_System SHALL store it in the group's shared storage
4. WHEN a file is uploaded, THE Group_Assignment_System SHALL display it in the shared files section with uploader name and timestamp
5. THE Group_Assignment_System SHALL allow all group members to download shared files
6. THE Group_Assignment_System SHALL allow the uploader or group leader to delete files
7. WHEN viewing shared files, THE Group_Assignment_System SHALL display total storage used and remaining quota

### Requirement 7: Activity Tracking

**User Story:** As a dosen, I want to track individual contributions, so that I can assess each member's participation fairly.

#### Acceptance Criteria

1. WHEN a member performs an action (message, file upload, task completion), THE Group_Assignment_System SHALL log it with timestamp and member identifier
2. WHEN viewing activity logs, THE Group_Assignment_System SHALL display chronological list of all group activities
3. WHEN calculating contribution scores, THE Group_Assignment_System SHALL weight different activities (messages: 1 point, file uploads: 3 points, task completions: 5 points)
4. THE Group_Assignment_System SHALL display individual contribution metrics for each member (total actions, contribution percentage)
5. THE Group_Assignment_System SHALL generate activity heatmaps showing when members are most active
6. THE Group_Assignment_System SHALL identify inactive members (no activity for 3+ days)
7. WHEN a dosen views analytics, THE Group_Assignment_System SHALL display comparative contribution charts for all groups

### Requirement 8: Group Submission

**User Story:** As a group leader, I want to submit our completed work, so that it can be graded by the dosen.

#### Acceptance Criteria

1. WHEN a group leader submits work, THE Group_Assignment_System SHALL require uploading at least one file
2. WHEN submitting, THE Group_Assignment_System SHALL allow adding submission notes or comments
3. WHEN a submission is made, THE Group_Assignment_System SHALL record submission timestamp
4. IF submission is before deadline, THEN THE Group_Assignment_System SHALL mark it as on-time
5. IF submission is after deadline, THEN THE Group_Assignment_System SHALL mark it as late and calculate delay duration
6. WHEN a submission is made, THE Group_Assignment_System SHALL notify all group members and the dosen
7. THE Group_Assignment_System SHALL allow resubmission if dosen enables it and deadline allows

### Requirement 9: Grading - Same Grade for All

**User Story:** As a dosen, I want to give the same grade to all group members, so that I can grade quickly when contribution is equal.

#### Acceptance Criteria

1. WHEN a dosen selects same grade mode, THE Group_Assignment_System SHALL apply the entered grade to all group members
2. WHEN a grade is entered, THE Group_Assignment_System SHALL validate it is within the valid range (0-100)
3. WHEN a grade is saved, THE Group_Assignment_System SHALL notify all group members
4. THE Group_Assignment_System SHALL display the group grade on each member's transcript
5. THE Group_Assignment_System SHALL allow dosen to add grading notes visible to all members

### Requirement 10: Grading - Individual Adjustments

**User Story:** As a dosen, I want to adjust individual grades, so that I can account for varying contributions.

#### Acceptance Criteria

1. WHEN a dosen selects individual adjustment mode, THE Group_Assignment_System SHALL start with a base group grade
2. WHEN a dosen adjusts a member's grade, THE Group_Assignment_System SHALL allow adding/subtracting points from base grade
3. WHEN adjusting grades, THE Group_Assignment_System SHALL display contribution metrics for reference
4. WHEN an adjustment is made, THE Group_Assignment_System SHALL require a justification note
5. THE Group_Assignment_System SHALL validate that adjusted grades remain within valid range (0-100)
6. WHEN grades are saved, THE Group_Assignment_System SHALL notify each member of their individual grade
7. THE Group_Assignment_System SHALL display adjustment history for audit purposes

### Requirement 11: Peer Evaluation System

**User Story:** As a group member, I want to evaluate my teammates, so that grading reflects actual contributions.

#### Acceptance Criteria

1. WHEN peer evaluation is enabled, THE Group_Assignment_System SHALL prompt each member to evaluate their teammates after submission
2. WHEN evaluating, THE Group_Assignment_System SHALL require rating each teammate on multiple criteria (contribution, communication, reliability, quality)
3. WHEN evaluating, THE Group_Assignment_System SHALL use a scale of 1-5 for each criterion
4. THE Group_Assignment_System SHALL prevent members from evaluating themselves
5. THE Group_Assignment_System SHALL keep individual evaluations anonymous
6. WHEN all evaluations are complete, THE Group_Assignment_System SHALL calculate average scores for each member
7. THE Group_Assignment_System SHALL allow dosen to configure peer evaluation weight (0-50% of final grade)

### Requirement 12: Contribution-Based Grading

**User Story:** As a dosen, I want to grade based on tracked contributions, so that grades automatically reflect participation levels.

#### Acceptance Criteria

1. WHEN contribution-based grading is enabled, THE Group_Assignment_System SHALL calculate contribution scores from activity logs
2. WHEN calculating final grades, THE Group_Assignment_System SHALL apply contribution percentage to base group grade
3. WHEN a member has 100% contribution (highest in group), THE Group_Assignment_System SHALL give them the full base grade
4. WHEN a member has lower contribution, THE Group_Assignment_System SHALL proportionally reduce their grade
5. THE Group_Assignment_System SHALL display contribution breakdown (messages: X%, files: Y%, tasks: Z%)
6. THE Group_Assignment_System SHALL allow dosen to configure minimum contribution threshold (default 30%)
7. IF a member's contribution is below threshold, THEN THE Group_Assignment_System SHALL flag them for dosen review

### Requirement 13: Progress Tracking Dashboard

**User Story:** As a dosen, I want to monitor all groups' progress, so that I can identify struggling groups early.

#### Acceptance Criteria

1. WHEN viewing the progress dashboard, THE Group_Assignment_System SHALL display all groups with completion percentages
2. WHEN viewing a group's progress, THE Group_Assignment_System SHALL show completed tasks vs total tasks
3. THE Group_Assignment_System SHALL display activity timeline for each group
4. THE Group_Assignment_System SHALL highlight groups with no recent activity (3+ days)
5. THE Group_Assignment_System SHALL display submission status for each group (not started, in progress, submitted)
6. THE Group_Assignment_System SHALL allow filtering groups by status, progress level, or activity
7. WHEN a group is struggling, THE Group_Assignment_System SHALL provide intervention suggestions to dosen

### Requirement 14: Individual Contribution Metrics

**User Story:** As a dosen, I want to see detailed contribution metrics, so that I can make informed grading decisions.

#### Acceptance Criteria

1. WHEN viewing contribution metrics, THE Group_Assignment_System SHALL display per-member statistics (messages sent, files uploaded, tasks completed)
2. THE Group_Assignment_System SHALL calculate contribution percentage for each member relative to group total
3. THE Group_Assignment_System SHALL display activity distribution charts (bar charts, pie charts)
4. THE Group_Assignment_System SHALL show time-based activity patterns (when each member is active)
5. THE Group_Assignment_System SHALL identify the most and least active members
6. THE Group_Assignment_System SHALL display comparative metrics across all groups in the assignment
7. THE Group_Assignment_System SHALL allow exporting contribution reports to PDF or Excel

### Requirement 15: Conflict Resolution Tools

**User Story:** As a dosen, I want tools to handle group conflicts, so that I can mediate issues effectively.

#### Acceptance Criteria

1. WHEN a member reports a conflict, THE Group_Assignment_System SHALL create a conflict ticket with description
2. WHEN a conflict is reported, THE Group_Assignment_System SHALL notify the dosen immediately
3. THE Group_Assignment_System SHALL allow dosen to view conflict details and involved parties
4. THE Group_Assignment_System SHALL allow dosen to move members between groups as resolution
5. THE Group_Assignment_System SHALL allow dosen to split a group into multiple groups
6. THE Group_Assignment_System SHALL log all conflict resolution actions for audit
7. WHEN a conflict is resolved, THE Group_Assignment_System SHALL notify all involved parties

### Requirement 16: Gamification Elements

**User Story:** As a mahasiswa, I want to earn achievements and see leaderboards, so that group work is more engaging.

#### Acceptance Criteria

1. WHEN a group completes milestones, THE Group_Assignment_System SHALL award achievement badges
2. THE Group_Assignment_System SHALL display a leaderboard showing top-performing groups
3. THE Group_Assignment_System SHALL calculate group scores based on submission timeliness, quality, and collaboration
4. WHEN a member contributes significantly, THE Group_Assignment_System SHALL award individual achievement badges
5. THE Group_Assignment_System SHALL display achievement progress bars for unlockable badges
6. THE Group_Assignment_System SHALL allow dosen to enable/disable gamification per assignment
7. WHEN viewing achievements, THE Group_Assignment_System SHALL display badge icons, names, and unlock criteria

### Requirement 17: Notifications System

**User Story:** As a user, I want to receive notifications for group activities, so that I stay informed about important updates.

#### Acceptance Criteria

1. WHEN a member is assigned to a group, THE Group_Assignment_System SHALL send a notification
2. WHEN a new message is posted in group chat, THE Group_Assignment_System SHALL send notifications to all members
3. WHEN a task is assigned to a member, THE Group_Assignment_System SHALL send a notification to that member
4. WHEN a file is uploaded, THE Group_Assignment_System SHALL notify all group members
5. WHEN a deadline is approaching (24 hours), THE Group_Assignment_System SHALL send reminder notifications
6. WHEN a submission is graded, THE Group_Assignment_System SHALL notify all group members
7. THE Group_Assignment_System SHALL allow users to configure notification preferences per notification type

### Requirement 18: Assignment Creation and Configuration

**User Story:** As a dosen, I want to create and configure group assignments, so that I can set up appropriate parameters for each task.

#### Acceptance Criteria

1. WHEN creating an assignment, THE Group_Assignment_System SHALL require title, description, and deadline
2. WHEN creating an assignment, THE Group_Assignment_System SHALL require selecting formation mode (self-form, random, manual)
3. WHEN creating an assignment, THE Group_Assignment_System SHALL require group size parameters (min and max members)
4. WHEN creating an assignment, THE Group_Assignment_System SHALL require selecting grading mode
5. THE Group_Assignment_System SHALL allow dosen to enable/disable features (chat, task distribution, peer evaluation, gamification)
6. THE Group_Assignment_System SHALL allow dosen to set formation deadline (when groups are locked)
7. THE Group_Assignment_System SHALL allow dosen to upload reference materials and instructions

### Requirement 19: Analytics and Reporting

**User Story:** As a dosen, I want comprehensive analytics, so that I can evaluate assignment effectiveness and student performance.

#### Acceptance Criteria

1. WHEN viewing analytics, THE Group_Assignment_System SHALL display overall assignment statistics (total groups, submission rate, average grade)
2. THE Group_Assignment_System SHALL display grade distribution charts (histogram, box plot)
3. THE Group_Assignment_System SHALL display contribution distribution across all groups
4. THE Group_Assignment_System SHALL identify correlation between contribution and grades
5. THE Group_Assignment_System SHALL display timeline of submissions (early, on-time, late)
6. THE Group_Assignment_System SHALL compare performance across different formation modes
7. THE Group_Assignment_System SHALL allow exporting analytics reports to PDF with charts and tables

### Requirement 20: Data Persistence and Synchronization

**User Story:** As a user, I want my data to be saved and synced, so that I don't lose work and can access it from any device.

#### Acceptance Criteria

1. WHEN any data is created or modified, THE Group_Assignment_System SHALL persist it to the database immediately
2. WHEN a user logs in from a new device, THE Group_Assignment_System SHALL sync all group data
3. WHEN network connection is lost, THE Group_Assignment_System SHALL queue actions and sync when reconnected
4. THE Group_Assignment_System SHALL retain all assignment data for at least 2 academic years
5. WHEN a user performs an action offline, THE Group_Assignment_System SHALL show offline indicator and queue the action
6. FOR ALL valid data objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)
7. THE Group_Assignment_System SHALL perform incremental backups of all group data daily

### Requirement 21: UI/UX Requirements

**User Story:** As a user, I want a modern and intuitive interface, so that I can use the system efficiently.

#### Acceptance Criteria

1. THE Group_Assignment_System SHALL use glassmorphism design (bg-white/40 dark:bg-neutral-900/40, backdrop-blur-xl)
2. THE Group_Assignment_System SHALL use indigo-purple-pink gradient for headers (from-indigo-600 via-purple-600 to-pink-500)
3. THE Group_Assignment_System SHALL use rounded-3xl for containers and shadow-xl for shadows
4. THE Group_Assignment_System SHALL use border-white/20 dark:border-white/5 for container borders
5. WHEN hovering over interactive elements, THE Group_Assignment_System SHALL animate with scale: 1.04, y: -4
6. THE Group_Assignment_System SHALL use smooth floating animations for decorative icons (easeInOut, NOT jerky)
7. THE Group_Assignment_System SHALL support responsive design for mobile, tablet, and desktop
8. THE Group_Assignment_System SHALL support dark mode and light mode with smooth transitions
9. WHEN loading data, THE Group_Assignment_System SHALL display skeleton loaders matching the design system
10. THE Group_Assignment_System SHALL use animation standards (stiffness: 300, damping: 20)

### Requirement 22: Security and Access Control

**User Story:** As a system administrator, I want proper security controls, so that data is protected and access is appropriate.

#### Acceptance Criteria

1. THE Group_Assignment_System SHALL require authentication for all operations
2. THE Group_Assignment_System SHALL enforce role-based access (dosen can manage, mahasiswa can participate)
3. WHEN a mahasiswa accesses a group, THE Group_Assignment_System SHALL verify they are a member
4. WHEN a dosen accesses an assignment, THE Group_Assignment_System SHALL verify they are the creator
5. THE Group_Assignment_System SHALL encrypt file uploads in transit and at rest
6. THE Group_Assignment_System SHALL log all sensitive operations for audit purposes
7. IF unauthorized access is attempted, THEN THE Group_Assignment_System SHALL deny access and log the attempt

### Requirement 23: Mobile Responsiveness

**User Story:** As a user, I want to use the system on mobile devices, so that I can participate in group work anywhere.

#### Acceptance Criteria

1. WHEN accessing on mobile, THE Group_Assignment_System SHALL display a mobile-optimized layout
2. WHEN accessing on mobile, THE Group_Assignment_System SHALL support touch gestures (swipe, long-press)
3. THE Group_Assignment_System SHALL ensure all interactive elements are touch-friendly (min 44x44px)
4. WHEN viewing on mobile, THE Group_Assignment_System SHALL stack components vertically for readability
5. THE Group_Assignment_System SHALL optimize image and file loading for mobile networks
6. THE Group_Assignment_System SHALL support mobile file uploads from camera or gallery
7. WHEN rotating device, THE Group_Assignment_System SHALL adapt layout to orientation

### Requirement 24: Performance Requirements

**User Story:** As a user, I want fast and responsive interactions, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN loading the assignment list, THE Group_Assignment_System SHALL display results within 500ms
2. WHEN sending a chat message, THE Group_Assignment_System SHALL deliver it to recipients within 200ms
3. WHEN uploading a file, THE Group_Assignment_System SHALL show upload progress and complete within reasonable time based on file size
4. THE Group_Assignment_System SHALL support pagination for large lists (50 items per page)
5. THE Group_Assignment_System SHALL implement lazy loading for images and files
6. THE Group_Assignment_System SHALL cache frequently accessed data to reduce server requests
7. WHEN performing bulk operations, THE Group_Assignment_System SHALL process them asynchronously with progress indicators

