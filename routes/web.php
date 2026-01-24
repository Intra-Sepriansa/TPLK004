<?php

use App\Http\Controllers\Admin\AttendanceLogController;
use App\Http\Controllers\Admin\AttendanceSessionController;
use App\Http\Controllers\Admin\AttendanceTokenController;
use App\Http\Controllers\Admin\AiAttendanceController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\RekapKehadiranController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SelfieVerificationController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Auth\MahasiswaAuthController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\User\AbsensiController;
use App\Http\Controllers\User\PasswordController;
use App\Http\Controllers\User\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::get('privacy', function () {
    return Inertia::render('privacy');
})->name('privacy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('analytics', [DashboardController::class, 'analytics'])->name('analytics');
    
    // Admin Profile
    Route::get('admin/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'index'])->name('admin.profile');
    Route::patch('admin/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'update'])->name('admin.profile.update');
    Route::post('admin/profile/avatar', [\App\Http\Controllers\Admin\ProfileController::class, 'updateAvatar'])->name('admin.profile.avatar');
    Route::patch('admin/profile/password', [\App\Http\Controllers\Admin\ProfileController::class, 'updatePassword'])->name('admin.profile.password');
    
    Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
    Route::post('attendance-sessions', [AttendanceSessionController::class, 'store'])->name('attendance-sessions.store');
    Route::patch('attendance-sessions/{attendanceSession}', [AttendanceSessionController::class, 'update'])->name('attendance-sessions.update');
    Route::delete('attendance-sessions/{attendanceSession}', [AttendanceSessionController::class, 'destroy'])->name('attendance-sessions.destroy');
    Route::patch('attendance-sessions/{attendanceSession}/activate', [AttendanceSessionController::class, 'activate'])->name('attendance-sessions.activate');
    Route::patch('attendance-sessions/{attendanceSession}/close', [AttendanceSessionController::class, 'close'])->name('attendance-sessions.close');
    Route::post('attendance-sessions/{attendanceSession}/token', [AttendanceTokenController::class, 'store'])->name('attendance-sessions.token');
    Route::get('attendance-logs', [AttendanceLogController::class, 'index'])->name('attendance-logs.index');
    Route::post('attendance-ai/scan', [AiAttendanceController::class, 'scan'])->name('attendance-ai.scan');
    Route::patch('selfie-verifications/{selfieVerification}/approve', [SelfieVerificationController::class, 'approve'])->name('selfie-verifications.approve');
    Route::patch('selfie-verifications/{selfieVerification}/reject', [SelfieVerificationController::class, 'reject'])->name('selfie-verifications.reject');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::patch('settings/geofence', [SettingsController::class, 'updateGeofence'])->name('settings.geofence');
    Route::get('reports/attendance.csv', [ReportController::class, 'export'])->name('reports.export');
    Route::get('reports/audit.csv', [ReportController::class, 'exportAudit'])->name('reports.audit');
    
    // Advanced Audit & Rekap
    Route::get('admin/audit', [AuditController::class, 'index'])->name('admin.audit');
    Route::get('admin/audit/pdf', [AuditController::class, 'exportPdf'])->name('admin.audit.pdf');
    Route::get('admin/rekap-kehadiran', [RekapKehadiranController::class, 'index'])->name('admin.rekap-kehadiran');
    Route::get('admin/rekap-kehadiran/pdf', [RekapKehadiranController::class, 'exportPdf'])->name('admin.rekap-kehadiran.pdf');
});

// Routes accessible by both admin (auth) and dosen (auth:dosen)
Route::middleware(['auth:web,dosen'])->group(function () {
    Route::post('attendance-sessions/create', [AttendanceSessionController::class, 'store'])->name('attendance-sessions.create');
    Route::patch('attendance-sessions/{attendanceSession}/toggle', [AttendanceSessionController::class, 'activate'])->name('attendance-sessions.toggle');
    Route::patch('attendance-sessions/{attendanceSession}/deactivate', [AttendanceSessionController::class, 'close'])->name('attendance-sessions.deactivate');
    
    // Admin Mahasiswa
    Route::get('admin/mahasiswa', [\App\Http\Controllers\Admin\MahasiswaController::class, 'index'])->name('admin.mahasiswa');
    Route::post('admin/mahasiswa', [\App\Http\Controllers\Admin\MahasiswaController::class, 'store'])->name('admin.mahasiswa.store');
    Route::patch('admin/mahasiswa/{mahasiswa}', [\App\Http\Controllers\Admin\MahasiswaController::class, 'update'])->name('admin.mahasiswa.update');
    Route::delete('admin/mahasiswa/{mahasiswa}', [\App\Http\Controllers\Admin\MahasiswaController::class, 'destroy'])->name('admin.mahasiswa.destroy');
    Route::post('admin/mahasiswa/{mahasiswa}/reset-password', [\App\Http\Controllers\Admin\MahasiswaController::class, 'resetPassword'])->name('admin.mahasiswa.reset-password');
    Route::get('admin/mahasiswa/pdf', [\App\Http\Controllers\Admin\MahasiswaController::class, 'exportPdf'])->name('admin.mahasiswa.pdf');
    
    // Admin Jadwal
    Route::get('admin/jadwal', [\App\Http\Controllers\Admin\JadwalController::class, 'index'])->name('admin.jadwal');
    Route::post('admin/jadwal', [\App\Http\Controllers\Admin\JadwalController::class, 'store'])->name('admin.jadwal.store');
    Route::patch('admin/jadwal/{session}', [\App\Http\Controllers\Admin\JadwalController::class, 'update'])->name('admin.jadwal.update');
    Route::delete('admin/jadwal/{session}', [\App\Http\Controllers\Admin\JadwalController::class, 'destroy'])->name('admin.jadwal.destroy');
    Route::patch('admin/jadwal/{session}/activate', [\App\Http\Controllers\Admin\JadwalController::class, 'activate'])->name('admin.jadwal.activate');
    Route::patch('admin/jadwal/{session}/deactivate', [\App\Http\Controllers\Admin\JadwalController::class, 'deactivate'])->name('admin.jadwal.deactivate');
    Route::get('admin/jadwal/pdf', [\App\Http\Controllers\Admin\JadwalController::class, 'exportPdf'])->name('admin.jadwal.pdf');
    
    // Admin Perangkat
    Route::get('admin/perangkat', [\App\Http\Controllers\Admin\PerangkatController::class, 'index'])->name('admin.perangkat');
    Route::get('admin/perangkat/pdf', [\App\Http\Controllers\Admin\PerangkatController::class, 'exportPdf'])->name('admin.perangkat.pdf');
    
    // Admin Pengaturan
    Route::get('admin/pengaturan', [\App\Http\Controllers\Admin\PengaturanController::class, 'index'])->name('admin.pengaturan');
    Route::patch('admin/pengaturan', [\App\Http\Controllers\Admin\PengaturanController::class, 'update'])->name('admin.pengaturan.update');
    Route::patch('admin/pengaturan/geofence', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateGeofence'])->name('admin.pengaturan.geofence');
    Route::patch('admin/pengaturan/notifications', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateNotifications'])->name('admin.pengaturan.notifications');
    Route::patch('admin/pengaturan/advanced', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateAdvanced'])->name('admin.pengaturan.advanced');
    Route::post('admin/pengaturan/clear-cache', [\App\Http\Controllers\Admin\PengaturanController::class, 'clearCache'])->name('admin.pengaturan.clear-cache');
    Route::post('admin/pengaturan/optimize', [\App\Http\Controllers\Admin\PengaturanController::class, 'optimize'])->name('admin.pengaturan.optimize');
    
    // Admin QR Builder
    Route::get('admin/qr-builder', [\App\Http\Controllers\Admin\QrBuilderController::class, 'index'])->name('admin.qr-builder');
    
    // Admin Live Monitor
    Route::get('admin/live-monitor', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'index'])->name('admin.live-monitor');
    Route::get('admin/live-monitor/logs', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'logs'])->name('admin.live-monitor.logs');
    
    // Admin Verifikasi Selfie
    Route::get('admin/verifikasi-selfie', [\App\Http\Controllers\Admin\VerifikasiSelfieController::class, 'index'])->name('admin.verifikasi-selfie');
    Route::patch('admin/verifikasi-selfie/{selfieVerification}/approve', [\App\Http\Controllers\Admin\VerifikasiSelfieController::class, 'approve'])->name('admin.verifikasi-selfie.approve');
    Route::patch('admin/verifikasi-selfie/{selfieVerification}/reject', [\App\Http\Controllers\Admin\VerifikasiSelfieController::class, 'reject'])->name('admin.verifikasi-selfie.reject');
    Route::post('admin/verifikasi-selfie/bulk-approve', [\App\Http\Controllers\Admin\VerifikasiSelfieController::class, 'bulkApprove'])->name('admin.verifikasi-selfie.bulk-approve');
    Route::post('admin/verifikasi-selfie/bulk-reject', [\App\Http\Controllers\Admin\VerifikasiSelfieController::class, 'bulkReject'])->name('admin.verifikasi-selfie.bulk-reject');
    
    // Admin Zona
    Route::get('admin/zona', [\App\Http\Controllers\Admin\ZonaController::class, 'index'])->name('admin.zona');
    Route::patch('admin/zona', [\App\Http\Controllers\Admin\ZonaController::class, 'update'])->name('admin.zona.update');
    
    // Admin Sesi Absen
    Route::get('admin/sesi-absen', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'index'])->name('admin.sesi-absen');
    Route::post('admin/sesi-absen', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'store'])->name('admin.sesi-absen.store');
    Route::get('admin/sesi-absen/pdf', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'exportPdf'])->name('admin.sesi-absen.pdf');
    Route::get('admin/sesi-absen/{session}', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'show'])->name('admin.sesi-absen.show');
    Route::patch('admin/sesi-absen/{session}', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'update'])->name('admin.sesi-absen.update');
    Route::delete('admin/sesi-absen/{session}', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'destroy'])->name('admin.sesi-absen.destroy');
    Route::patch('admin/sesi-absen/{session}/activate', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'activate'])->name('admin.sesi-absen.activate');
    Route::patch('admin/sesi-absen/{session}/deactivate', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'deactivate'])->name('admin.sesi-absen.deactivate');
    Route::post('admin/sesi-absen/{session}/duplicate', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'duplicate'])->name('admin.sesi-absen.duplicate');
    
    // Admin Kas
    Route::get('admin/kas', [\App\Http\Controllers\Admin\KasController::class, 'index'])->name('admin.kas');
    Route::post('admin/kas', [\App\Http\Controllers\Admin\KasController::class, 'store'])->name('admin.kas.store');
    Route::delete('admin/kas/{ka}', [\App\Http\Controllers\Admin\KasController::class, 'destroy'])->name('admin.kas.destroy');
    Route::post('admin/kas/mark-paid', [\App\Http\Controllers\Admin\KasController::class, 'markPaid'])->name('admin.kas.mark-paid');
    Route::post('admin/kas/expense', [\App\Http\Controllers\Admin\KasController::class, 'addExpense'])->name('admin.kas.expense');
    Route::post('admin/kas/bulk-mark-paid', [\App\Http\Controllers\Admin\KasController::class, 'bulkMarkPaid'])->name('admin.kas.bulk-mark-paid');
    Route::post('admin/kas/create-pertemuan', [\App\Http\Controllers\Admin\KasController::class, 'createPertemuan'])->name('admin.kas.create-pertemuan');
    Route::get('admin/kas/pdf', [\App\Http\Controllers\Admin\KasController::class, 'exportPdf'])->name('admin.kas.pdf');
    
    // Admin Kas Voting
    Route::get('admin/kas-voting', [\App\Http\Controllers\Admin\KasVotingController::class, 'index'])->name('admin.kas-voting');
    Route::post('admin/kas-voting/{voting}/approve', [\App\Http\Controllers\Admin\KasVotingController::class, 'approve'])->name('admin.kas-voting.approve');
    Route::post('admin/kas-voting/{voting}/reject', [\App\Http\Controllers\Admin\KasVotingController::class, 'reject'])->name('admin.kas-voting.reject');
    Route::post('admin/kas-voting/{voting}/close', [\App\Http\Controllers\Admin\KasVotingController::class, 'close'])->name('admin.kas-voting.close');
    Route::post('admin/kas-voting/{voting}/finalize', [\App\Http\Controllers\Admin\KasVotingController::class, 'finalize'])->name('admin.kas-voting.finalize');
    
    // Admin Leaderboard
    Route::get('admin/leaderboard', [\App\Http\Controllers\Admin\LeaderboardController::class, 'index'])->name('admin.leaderboard');
    
    // Admin Analytics
    Route::get('admin/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('admin.analytics');
    
    // Admin Activity Log
    Route::get('admin/activity-log', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('admin.activity-log');
    
    // Admin Advanced Analytics
    Route::get('admin/advanced-analytics', [\App\Http\Controllers\Admin\AdvancedAnalyticsController::class, 'index'])->name('admin.advanced-analytics');
    
    // Admin Fraud Detection
    Route::get('admin/fraud-detection', [\App\Http\Controllers\Admin\FraudDetectionController::class, 'index'])->name('admin.fraud-detection');
    Route::get('admin/fraud-detection/{alert}', [\App\Http\Controllers\Admin\FraudDetectionController::class, 'show'])->name('admin.fraud-detection.show');
    Route::patch('admin/fraud-detection/{alert}/review', [\App\Http\Controllers\Admin\FraudDetectionController::class, 'review'])->name('admin.fraud-detection.review');
    Route::post('admin/fraud-detection/scan', [\App\Http\Controllers\Admin\FraudDetectionController::class, 'runScan'])->name('admin.fraud-detection.scan');
    Route::post('admin/fraud-detection/bulk-action', [\App\Http\Controllers\Admin\FraudDetectionController::class, 'bulkAction'])->name('admin.fraud-detection.bulk-action');
    
    // Admin Notification Center
    Route::get('admin/notification-center', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'index'])->name('admin.notification-center');
    Route::post('admin/notification-center', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'store'])->name('admin.notification-center.store');
    Route::delete('admin/notification-center/{notification}', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'destroy'])->name('admin.notification-center.destroy');
    Route::post('admin/notification-center/bulk-delete', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'bulkDelete'])->name('admin.notification-center.bulk-delete');
    Route::get('admin/notification-center/templates', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'templates'])->name('admin.notification-center.templates');
    
    // Admin Notifications (for header dropdown)
    Route::post('admin/notifications/{id}/read', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::post('admin/notifications/read-all', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAllAsRead'])->name('admin.notifications.read-all');
    Route::delete('admin/notifications/{id}', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'destroy'])->name('admin.notifications.destroy');
    
    // Admin Bulk Import
    Route::get('admin/bulk-import', [\App\Http\Controllers\Admin\BulkImportController::class, 'index'])->name('admin.bulk-import');
    Route::post('admin/bulk-import/preview', [\App\Http\Controllers\Admin\BulkImportController::class, 'preview'])->name('admin.bulk-import.preview');
    Route::post('admin/bulk-import', [\App\Http\Controllers\Admin\BulkImportController::class, 'import'])->name('admin.bulk-import.import');
    Route::get('admin/bulk-import/template/{type}', [\App\Http\Controllers\Admin\BulkImportController::class, 'downloadTemplate'])->name('admin.bulk-import.template');
    Route::get('admin/bulk-import/log/{log}', [\App\Http\Controllers\Admin\BulkImportController::class, 'showLog'])->name('admin.bulk-import.log');
    
    // Admin Panduan & Help Center
    Route::get('admin/panduan', function () {
        return \Inertia\Inertia::render('admin/panduan');
    })->name('admin.panduan');
    Route::get('admin/help-center', function () {
        return \Inertia\Inertia::render('admin/help-center');
    })->name('admin.help-center');
    
    // Admin Tugas
    Route::get('admin/tugas', [\App\Http\Controllers\Admin\TugasController::class, 'index'])->name('admin.tugas');
    Route::post('admin/tugas', [\App\Http\Controllers\Admin\TugasController::class, 'store'])->name('admin.tugas.store');
    Route::get('admin/tugas/{tuga}', [\App\Http\Controllers\Admin\TugasController::class, 'show'])->name('admin.tugas.show');
    Route::patch('admin/tugas/{tuga}', [\App\Http\Controllers\Admin\TugasController::class, 'update'])->name('admin.tugas.update');
    Route::delete('admin/tugas/{tuga}', [\App\Http\Controllers\Admin\TugasController::class, 'destroy'])->name('admin.tugas.destroy');
    Route::post('admin/tugas/{tuga}/message', [\App\Http\Controllers\Admin\TugasController::class, 'sendMessage'])->name('admin.tugas.message');
    Route::patch('admin/tugas/diskusi/{diskusi}/pin', [\App\Http\Controllers\Admin\TugasController::class, 'togglePin'])->name('admin.tugas.diskusi.pin');
    Route::delete('admin/tugas/diskusi/{diskusi}', [\App\Http\Controllers\Admin\TugasController::class, 'deleteMessage'])->name('admin.tugas.diskusi.delete');
    
    Route::post('mahasiswa', [MahasiswaController::class, 'store'])->name('mahasiswa.store');
    Route::get('mahasiswa/export.csv', [MahasiswaController::class, 'export'])->name('mahasiswa.export');
    Route::delete('mahasiswa/{mahasiswa}', [MahasiswaController::class, 'destroy'])->name('mahasiswa.destroy');
});

Route::post('login/mahasiswa', [MahasiswaAuthController::class, 'store'])->name('mahasiswa.login');
Route::get('login/mahasiswa', function () {
    return redirect('/login')->with('info', 'Silakan login sebagai mahasiswa');
});
Route::post('logout/mahasiswa', [MahasiswaAuthController::class, 'destroy'])->name('mahasiswa.logout');

// Dosen Login Route
Route::post('dosen/login', [\App\Http\Controllers\Auth\DosenAuthController::class, 'store'])->name('dosen.login');

Route::middleware(['auth:mahasiswa'])->group(function () {
    Route::get('user', [AbsensiController::class, 'dashboard'])->name('user.dashboard');
    Route::get('user/dashboard', [AbsensiController::class, 'dashboard'])->name('user.dashboard.alt');
    Route::get('user/absen', [AbsensiController::class, 'create'])->name('user.absen');
    Route::post('user/absen', [AbsensiController::class, 'store'])->name('user.absen.store');
    Route::get('user/rekapan', [AbsensiController::class, 'rekapan'])->name('user.rekapan');
    Route::get('user/bukti-masuk', [AbsensiController::class, 'buktiMasuk'])->name('user.bukti-masuk');
    Route::get('user/history', [AbsensiController::class, 'history'])->name('user.history');
    Route::get('user/achievements', [AbsensiController::class, 'achievements'])->name('user.achievements');
    Route::get('user/achievements/{badge}', [AbsensiController::class, 'badgeDetail'])->name('user.badge-detail');
    Route::get('user/leaderboard', [\App\Http\Controllers\User\LeaderboardController::class, 'index'])->name('user.leaderboard');
    Route::get('user/kas', [\App\Http\Controllers\User\KasController::class, 'index'])->name('user.kas');
    Route::get('user/tugas', [\App\Http\Controllers\User\TugasController::class, 'index'])->name('user.tugas');
    Route::get('user/tugas/{tuga}', [\App\Http\Controllers\User\TugasController::class, 'show'])->name('user.tugas.show');
    Route::post('user/tugas/{tuga}/message', [\App\Http\Controllers\User\TugasController::class, 'sendMessage'])->name('user.tugas.message');
    
    // User Permit (Izin/Sakit)
    Route::get('user/permit', [\App\Http\Controllers\User\PermitController::class, 'index'])->name('user.permit');
    Route::post('user/permit', [\App\Http\Controllers\User\PermitController::class, 'store'])->name('user.permit.store');
    Route::delete('user/permit/{permit}', [\App\Http\Controllers\User\PermitController::class, 'destroy'])->name('user.permit.destroy');
    
    // User Kas Voting
    Route::get('user/kas-voting', [\App\Http\Controllers\User\KasVotingController::class, 'index'])->name('user.kas-voting');
    Route::post('user/kas-voting', [\App\Http\Controllers\User\KasVotingController::class, 'store'])->name('user.kas-voting.store');
    Route::post('user/kas-voting/{voting}/vote', [\App\Http\Controllers\User\KasVotingController::class, 'vote'])->name('user.kas-voting.vote');
    
    // User Tugas Submission
    Route::post('user/tugas/{tuga}/submit', [\App\Http\Controllers\User\TugasSubmissionController::class, 'store'])->name('user.tugas.submit');
    
    Route::get('user/profile', [ProfileController::class, 'edit'])->name('user.profile');
    Route::patch('user/profile', [ProfileController::class, 'update'])->name('user.profile.update');
    Route::post('user/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('user.profile.avatar');
    Route::get('user/password', [PasswordController::class, 'edit'])->name('user.password');
    Route::patch('user/password', [PasswordController::class, 'update'])->name('user.password.update');
    
    // Akademik (Jadwal & Pengingat)
    Route::get('user/akademik', [\App\Http\Controllers\User\AcademicScheduleController::class, 'dashboard'])->name('user.akademik');
    Route::get('user/akademik/jadwal', [\App\Http\Controllers\User\AcademicScheduleController::class, 'schedule'])->name('user.akademik.jadwal');
    Route::get('user/akademik/ujian', [\App\Http\Controllers\User\AcademicScheduleController::class, 'exams'])->name('user.akademik.ujian');
    
    // Akademik - Mata Kuliah
    Route::get('user/akademik/matkul', [\App\Http\Controllers\User\AcademicCourseController::class, 'index'])->name('user.akademik.matkul');
    Route::post('user/akademik/matkul', [\App\Http\Controllers\User\AcademicCourseController::class, 'store'])->name('user.akademik.matkul.store');
    Route::patch('user/akademik/matkul/{id}', [\App\Http\Controllers\User\AcademicCourseController::class, 'update'])->name('user.akademik.matkul.update');
    Route::delete('user/akademik/matkul/{id}', [\App\Http\Controllers\User\AcademicCourseController::class, 'destroy'])->name('user.akademik.matkul.destroy');
    Route::post('user/akademik/matkul/{courseId}/meeting/{meetingNumber}/complete', [\App\Http\Controllers\User\AcademicCourseController::class, 'markMeetingComplete'])->name('user.akademik.matkul.meeting.complete');
    
    // Akademik - Tugas
    Route::get('user/akademik/tugas', [\App\Http\Controllers\User\AcademicTaskController::class, 'index'])->name('user.akademik.tugas');
    Route::post('user/akademik/tugas', [\App\Http\Controllers\User\AcademicTaskController::class, 'store'])->name('user.akademik.tugas.store');
    Route::patch('user/akademik/tugas/{id}', [\App\Http\Controllers\User\AcademicTaskController::class, 'update'])->name('user.akademik.tugas.update');
    Route::delete('user/akademik/tugas/{id}', [\App\Http\Controllers\User\AcademicTaskController::class, 'destroy'])->name('user.akademik.tugas.destroy');
    Route::post('user/akademik/tugas/{id}/toggle', [\App\Http\Controllers\User\AcademicTaskController::class, 'toggleStatus'])->name('user.akademik.tugas.toggle');
    
    // Akademik - Catatan
    Route::get('user/akademik/catatan', [\App\Http\Controllers\User\AcademicNoteController::class, 'index'])->name('user.akademik.catatan');
    Route::post('user/akademik/catatan', [\App\Http\Controllers\User\AcademicNoteController::class, 'store'])->name('user.akademik.catatan.store');
    Route::patch('user/akademik/catatan/{id}', [\App\Http\Controllers\User\AcademicNoteController::class, 'update'])->name('user.akademik.catatan.update');
    Route::delete('user/akademik/catatan/{id}', [\App\Http\Controllers\User\AcademicNoteController::class, 'destroy'])->name('user.akademik.catatan.destroy');
    
    // Personal Analytics
    Route::get('user/personal-analytics', [\App\Http\Controllers\User\PersonalAnalyticsController::class, 'index'])->name('user.personal-analytics');
    
    // Notifications
    Route::get('user/notifications', [\App\Http\Controllers\User\NotificationController::class, 'index'])->name('user.notifications');
    Route::post('user/notifications/{id}/read', [\App\Http\Controllers\User\NotificationController::class, 'markAsRead'])->name('user.notifications.read');
    Route::post('user/notifications/read-all', [\App\Http\Controllers\User\NotificationController::class, 'markAllAsRead'])->name('user.notifications.read-all');
    Route::delete('user/notifications/{id}', [\App\Http\Controllers\User\NotificationController::class, 'destroy'])->name('user.notifications.destroy');
    
    // Settings, Documentation, Help (Inertia pages)
    Route::get('user/settings', fn () => inertia('student/settings'))->name('user.settings');
    Route::get('user/docs', fn () => inertia('student/docs'))->name('user.docs');
    Route::get('user/docs/{guideId}', fn (string $guideId) => inertia('student/docs-detail', ['guideId' => $guideId]))->name('user.docs.detail');
    Route::get('user/help', fn () => inertia('student/help'))->name('user.help');
});

require __DIR__.'/settings.php';
require __DIR__.'/dosen.php';
require __DIR__.'/chat.php';
