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
use App\Http\Controllers\Admin\VerifikasiSelfieController;
use App\Http\Controllers\Auth\MahasiswaAuthController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\User\AbsensiController;
use App\Http\Controllers\User\KehadiranController;
use App\Http\Controllers\User\MataKuliahController;
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

// Testing Error Pages (REMOVE IN PRODUCTION)
Route::get('test-errors/404', function () {
    abort(404);
});
Route::get('test-errors/403', function () {
    abort(403);
});
Route::get('test-errors/419', function () {
    abort(419);
});
Route::get('test-errors/500', function () {
    abort(500);
});
Route::get('test-errors/503', function () {
    abort(503);
});

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
    Route::post('selfie-view-requests', [\App\Http\Controllers\Admin\SelfieViewRequestController::class, 'store'])->name('selfie-view-requests.store');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('api/settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme.update');
    Route::post('api/settings/reset', [SettingsController::class, 'reset'])->name('settings.reset');
    Route::post('api/settings/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.clear-cache');
    Route::post('api/settings/import', [SettingsController::class, 'import'])->name('settings.import');
    Route::patch('settings/geofence', [SettingsController::class, 'updateGeofence'])->name('settings.geofence');
    Route::get('reports/attendance.csv', [ReportController::class, 'export'])->name('reports.export');
    Route::get('reports/audit.csv', [ReportController::class, 'exportAudit'])->name('reports.audit');
    
    // Advanced Audit & Rekap
    Route::get('admin/audit', [AuditController::class, 'index'])->name('admin.audit');
    Route::get('admin/audit/{id}', [AuditController::class, 'show'])->name('admin.audit.show');
    Route::post('admin/audit/{id}/action', [AuditController::class, 'executeAction'])->name('admin.audit.action');
    Route::get('admin/audit/pdf', [AuditController::class, 'exportPdf'])->name('admin.audit.pdf');
    Route::get('admin/rekap-kehadiran', [RekapKehadiranController::class, 'index'])->name('admin.rekap-kehadiran');
    Route::get('admin/rekap-kehadiran/pdf', [RekapKehadiranController::class, 'exportPdf'])->name('admin.rekap-kehadiran.pdf');
    Route::get('admin/rekap-kehadiran/{mahasiswa}', [RekapKehadiranController::class, 'show'])->name('admin.rekap-kehadiran.show');
    Route::post('admin/attendance/warning', [RekapKehadiranController::class, 'storeWarning'])->name('admin.attendance.warning.store');
});

// Routes accessible by both admin (auth) and dosen (auth:dosen)
Route::middleware(['auth:web,dosen'])->group(function () {
    Route::post('attendance-sessions/create', [AttendanceSessionController::class, 'store'])->name('attendance-sessions.create');
    Route::patch('attendance-sessions/{attendanceSession}/toggle', [AttendanceSessionController::class, 'activate'])->name('attendance-sessions.toggle');
    Route::patch('attendance-sessions/{attendanceSession}/deactivate', [AttendanceSessionController::class, 'close'])->name('attendance-sessions.deactivate');
    
    // Admin Mahasiswa
    Route::get('admin/mahasiswa', [\App\Http\Controllers\Admin\MahasiswaController::class, 'index'])->name('admin.mahasiswa');
    Route::get('admin/mahasiswa/create', [\App\Http\Controllers\Admin\MahasiswaController::class, 'create'])->name('admin.mahasiswa.create');
    Route::get('admin/mahasiswa/check-duplicate', [\App\Http\Controllers\Admin\MahasiswaController::class, 'checkDuplicate'])->name('admin.mahasiswa.check-duplicate');
    Route::post('admin/mahasiswa', [\App\Http\Controllers\Admin\MahasiswaController::class, 'store'])->name('admin.mahasiswa.store');
    Route::get('admin/mahasiswa/{mahasiswa}/edit', [\App\Http\Controllers\Admin\MahasiswaController::class, 'edit'])->name('admin.mahasiswa.edit');
    Route::get('admin/mahasiswa/{mahasiswa}', [\App\Http\Controllers\Admin\MahasiswaController::class, 'show'])->name('admin.mahasiswa.show');
    Route::patch('admin/mahasiswa/{mahasiswa}', [\App\Http\Controllers\Admin\MahasiswaController::class, 'update'])->name('admin.mahasiswa.update');
    Route::delete('admin/mahasiswa/{mahasiswa}', [\App\Http\Controllers\Admin\MahasiswaController::class, 'destroy'])->name('admin.mahasiswa.destroy');
    Route::post('admin/mahasiswa/{mahasiswa}/reset-password', [\App\Http\Controllers\Admin\MahasiswaController::class, 'resetPassword'])->name('admin.mahasiswa.reset-password');
    Route::get('admin/mahasiswa/pdf', [\App\Http\Controllers\Admin\MahasiswaController::class, 'exportPdf'])->name('admin.mahasiswa.pdf');
    
    // Admin Jadwal
    Route::get('admin/jadwal', [\App\Http\Controllers\Admin\JadwalController::class, 'index'])->name('admin.jadwal');
    Route::get('admin/jadwal/create', [\App\Http\Controllers\Admin\JadwalController::class, 'create'])->name('admin.jadwal.create');
    Route::post('admin/jadwal', [\App\Http\Controllers\Admin\JadwalController::class, 'store'])->name('admin.jadwal.store');
    Route::get('admin/jadwal/{session}/edit', [\App\Http\Controllers\Admin\JadwalController::class, 'edit'])->name('admin.jadwal.edit');
    Route::patch('admin/jadwal/{session}', [\App\Http\Controllers\Admin\JadwalController::class, 'update'])->name('admin.jadwal.update');
    Route::delete('admin/jadwal/{session}', [\App\Http\Controllers\Admin\JadwalController::class, 'destroy'])->name('admin.jadwal.destroy');
    Route::patch('admin/jadwal/{session}/activate', [\App\Http\Controllers\Admin\JadwalController::class, 'activate'])->name('admin.jadwal.activate');
    Route::patch('admin/jadwal/{session}/deactivate', [\App\Http\Controllers\Admin\JadwalController::class, 'deactivate'])->name('admin.jadwal.deactivate');
    Route::get('admin/jadwal/pdf', [\App\Http\Controllers\Admin\JadwalController::class, 'exportPdf'])->name('admin.jadwal.pdf');
    
    // Admin Perangkat
    Route::get('admin/perangkat', [\App\Http\Controllers\Admin\PerangkatController::class, 'index'])->name('admin.perangkat');
    Route::get('admin/perangkat/pdf', [\App\Http\Controllers\Admin\PerangkatController::class, 'exportPdf'])->name('admin.perangkat.pdf');
    Route::get('admin/perangkat/{id}', [\App\Http\Controllers\Admin\PerangkatController::class, 'show'])->name('admin.perangkat.show');
    Route::get('admin/perangkat/{id}/export-pdf', [\App\Http\Controllers\Admin\PerangkatController::class, 'exportDetailPdf'])->name('admin.perangkat.export-detail-pdf');
    Route::post('admin/perangkat/{id}/block', [\App\Http\Controllers\Admin\PerangkatController::class, 'block'])->name('admin.perangkat.block');
    Route::post('admin/perangkat/{id}/whitelist', [\App\Http\Controllers\Admin\PerangkatController::class, 'whitelist'])->name('admin.perangkat.whitelist');
    
    // Admin Pengaturan
    Route::get('admin/pengaturan', [\App\Http\Controllers\Admin\PengaturanController::class, 'index'])->name('admin.pengaturan');
    Route::patch('admin/pengaturan', [\App\Http\Controllers\Admin\PengaturanController::class, 'update'])->name('admin.pengaturan.update');
    Route::patch('admin/pengaturan/geofence', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateGeofence'])->name('admin.pengaturan.geofence');
    Route::patch('admin/pengaturan/notifications', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateNotifications'])->name('admin.pengaturan.notifications');
    Route::patch('admin/pengaturan/advanced', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateAdvanced'])->name('admin.pengaturan.advanced');
    Route::post('admin/pengaturan/backup', [\App\Http\Controllers\Admin\PengaturanController::class, 'createBackup'])->name('admin.pengaturan.backup');
    Route::post('admin/pengaturan/backup/{backup}/restore', [\App\Http\Controllers\Admin\PengaturanController::class, 'restoreBackup'])->name('admin.pengaturan.backup.restore');
    Route::delete('admin/pengaturan/backup/{backup}', [\App\Http\Controllers\Admin\PengaturanController::class, 'deleteBackup'])->name('admin.pengaturan.backup.delete');
    Route::get('admin/pengaturan/export', [\App\Http\Controllers\Admin\PengaturanController::class, 'exportSettings'])->name('admin.pengaturan.export');
    Route::post('admin/pengaturan/import', [\App\Http\Controllers\Admin\PengaturanController::class, 'importSettings'])->name('admin.pengaturan.import');
    Route::get('admin/pengaturan/history', [\App\Http\Controllers\Admin\PengaturanController::class, 'history'])->name('admin.pengaturan.history');
    Route::post('admin/pengaturan/clear-cache', [\App\Http\Controllers\Admin\PengaturanController::class, 'clearCache'])->name('admin.pengaturan.clear-cache');
    Route::post('admin/pengaturan/optimize', [\App\Http\Controllers\Admin\PengaturanController::class, 'optimize'])->name('admin.pengaturan.optimize');
    Route::patch('admin/pengaturan/templates/{template}', [\App\Http\Controllers\Admin\PengaturanController::class, 'updateTemplate'])->name('admin.pengaturan.templates.update');
    Route::patch('admin/pengaturan/preferences/{preference}', [\App\Http\Controllers\Admin\PengaturanController::class, 'updatePreference'])->name('admin.pengaturan.preferences.update');
    
    // Admin QR Builder
    Route::get('admin/qr-builder', [\App\Http\Controllers\Admin\QrBuilderController::class, 'index'])->name('admin.qr-builder');
    
    // Admin Live Monitor
    Route::get('admin/live-monitor', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'index'])->name('admin.live-monitor');
    Route::get('admin/live-monitor/refresh', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'refresh'])->name('admin.live-monitor.refresh');
    Route::get('admin/live-monitor/export-today', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'exportToday'])->name('admin.live-monitor.export-today');
    Route::get('admin/live-monitor/logs', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'logs'])->name('admin.live-monitor.logs');
    Route::get('admin/live-monitor/aktivitas-terbaru', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'aktivitasTerbaru'])->name('admin.live-monitor.aktivitas-terbaru');
    Route::get('admin/live-monitor/aktivitas-terbaru/export', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'exportAktivitasTerbaru'])->name('admin.live-monitor.aktivitas-terbaru.export');
    Route::get('admin/live-monitor/aktivitas-terbaru/{id}/export-pdf', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'exportAktivitasDetailPdf'])->name('admin.live-monitor.aktivitas-terbaru.export-detail');
    Route::get('admin/live-monitor/advanced-export', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'advancedExport'])->name('admin.live-monitor.advanced-export');
    Route::get('admin/live-monitor/filter-options', [\App\Http\Controllers\Admin\LiveMonitorController::class, 'getFilterOptions'])->name('admin.live-monitor.filter-options');
    
    // Admin Verifikasi Selfie
    Route::get('admin/verifikasi-selfie', [VerifikasiSelfieController::class, 'index'])->name('admin.verifikasi-selfie');
    Route::get('admin/verifikasi-selfie/{id}', [SelfieVerificationController::class, 'show'])->name('admin.verifikasi-selfie.show');
    Route::post('admin/verifikasi-selfie/{id}/approve', [SelfieVerificationController::class, 'approve'])->name('admin.verifikasi-selfie.approve');
    Route::post('admin/verifikasi-selfie/{id}/reject', [SelfieVerificationController::class, 'reject'])->name('admin.verifikasi-selfie.reject');
    Route::patch('admin/verifikasi-selfie/{selfieVerification}/approve', [VerifikasiSelfieController::class, 'approve'])->name('admin.verifikasi-selfie.patch-approve');
    Route::patch('admin/verifikasi-selfie/{selfieVerification}/reject', [VerifikasiSelfieController::class, 'reject'])->name('admin.verifikasi-selfie.patch-reject');
    Route::post('admin/verifikasi-selfie/bulk-approve', [VerifikasiSelfieController::class, 'bulkApprove'])->name('admin.verifikasi-selfie.bulk-approve');
    Route::post('admin/verifikasi-selfie/bulk-reject', [VerifikasiSelfieController::class, 'bulkReject'])->name('admin.verifikasi-selfie.bulk-reject');
    Route::patch('admin/verifikasi-selfie/{selfieVerification}/consume-view', [VerifikasiSelfieController::class, 'consumeViewRequest'])->name('admin.verifikasi-selfie.consume-view');
    
    // Admin Zona
    Route::get('admin/zona', [\App\Http\Controllers\Admin\ZonaController::class, 'index'])->name('admin.zona');
    Route::patch('admin/zona', [\App\Http\Controllers\Admin\ZonaController::class, 'update'])->name('admin.zona.update');
    
    // Admin Sesi Absen
    Route::get('admin/sesi-absen', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'index'])->name('admin.sesi-absen');
    Route::get('admin/sesi-absen/create', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'create'])->name('admin.sesi-absen.create');
    Route::get('admin/sesi-absen/{session}/edit', [\App\Http\Controllers\Admin\SesiAbsenController::class, 'edit'])->name('admin.sesi-absen.edit');
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
    Route::post('admin/kas/mark-unpaid', [\App\Http\Controllers\Admin\KasController::class, 'markUnpaid'])->name('admin.kas.mark-unpaid');
    Route::post('admin/kas/expense', [\App\Http\Controllers\Admin\KasController::class, 'addExpense'])->name('admin.kas.expense');
    Route::post('admin/kas/bulk-mark-paid', [\App\Http\Controllers\Admin\KasController::class, 'bulkMarkPaid'])->name('admin.kas.bulk-mark-paid');
    Route::post('admin/kas/create-pertemuan', [\App\Http\Controllers\Admin\KasController::class, 'createPertemuan'])->name('admin.kas.create-pertemuan');
    Route::get('admin/kas/pdf', [\App\Http\Controllers\Admin\KasController::class, 'exportPdf'])->name('admin.kas.pdf');
    
    // Admin Kas Voting
    Route::get('admin/kas-voting', [\App\Http\Controllers\Admin\KasVotingController::class, 'index'])->name('admin.kas-voting');
    Route::get('admin/kas-voting/{voting}', [\App\Http\Controllers\Admin\KasVotingController::class, 'show'])->name('admin.kas-voting.show');
    Route::post('admin/kas-voting/{voting}/approve', [\App\Http\Controllers\Admin\KasVotingController::class, 'approve'])->name('admin.kas-voting.approve');
    Route::post('admin/kas-voting/{voting}/reject', [\App\Http\Controllers\Admin\KasVotingController::class, 'reject'])->name('admin.kas-voting.reject');
    Route::post('admin/kas-voting/{voting}/close', [\App\Http\Controllers\Admin\KasVotingController::class, 'close'])->name('admin.kas-voting.close');
    Route::post('admin/kas-voting/{voting}/finalize', [\App\Http\Controllers\Admin\KasVotingController::class, 'finalize'])->name('admin.kas-voting.finalize');
    
    // Admin Leaderboard
    Route::get('admin/leaderboard', [\App\Http\Controllers\Admin\LeaderboardController::class, 'index'])->name('admin.leaderboard');
    
    // Admin Analytics
    Route::get('admin/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('admin.analytics');
    Route::get('admin/analytics/export', [\App\Http\Controllers\Admin\AnalyticsController::class, 'export'])->name('admin.analytics.export');
    Route::get('admin/analytics/student/{id}', [\App\Http\Controllers\Admin\AnalyticsController::class, 'getStudentDetail'])->name('admin.analytics.student.detail');
    
    // Admin Advanced Analytics
    Route::get('admin/advanced-analytics', [\App\Http\Controllers\Admin\AdvancedAnalyticsController::class, 'index'])->name('admin.advanced-analytics');
    

    // Admin Notification Center
    Route::get('admin/notification-center/create', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'create'])->name('admin.notification-center.create');
    Route::get('admin/notification-center/templates', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'templates'])->name('admin.notification-center.templates');
    Route::get('admin/notification-center/bulk-delete', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'bulkDelete'])->name('admin.notification-center.bulk-delete');
    Route::post('admin/notification-center/bulk-delete', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'bulkDelete'])->name('admin.notification-center.post-bulk-delete');
    Route::get('admin/notification-center', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'index'])->name('admin.notification-center');
    Route::post('admin/notification-center', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'store'])->name('admin.notification-center.store');
    Route::get('admin/notification-center/{id}', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'show'])->name('admin.notification-center.show');
    Route::post('admin/notification-center/{id}/resend', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'resend'])->name('admin.notification-center.resend');
    Route::post('admin/notification-center/{id}/cancel', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'cancel'])->name('admin.notification-center.cancel');
    Route::get('admin/notification-center/{id}/export/{format}', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'export'])->name('admin.notification-center.export');
    Route::delete('admin/notification-center/{notification}', [\App\Http\Controllers\Admin\NotificationCenterController::class, 'destroy'])->name('admin.notification-center.destroy');
    Route::get('admin/weekly-digest', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'index'])->name('admin.weekly-digest.index');
    Route::get('admin/weekly-digest/create', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'create'])->name('admin.weekly-digest.create');
    Route::post('admin/weekly-digest', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'store'])
        ->middleware('throttle:weekly-digest-write')
        ->name('admin.weekly-digest.store');
    Route::post('admin/weekly-digest/batch-export', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'batchExport'])
        ->name('admin.weekly-digest.batch-export');
    Route::get('admin/weekly-digest/{id}', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'show'])->name('admin.weekly-digest.show');
    Route::get('admin/weekly-digest/{id}/edit', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'edit'])->name('admin.weekly-digest.edit');
    Route::patch('admin/weekly-digest/{id}', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'update'])
        ->middleware('throttle:weekly-digest-write')
        ->name('admin.weekly-digest.update');
    Route::delete('admin/weekly-digest/{id}', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'destroy'])
        ->middleware('throttle:weekly-digest-write')
        ->name('admin.weekly-digest.destroy');
    Route::patch('admin/weekly-digest/{id}/publish', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'publish'])
        ->middleware('throttle:weekly-digest-write')
        ->name('admin.weekly-digest.publish');
    Route::get('admin/weekly-digest/{id}/export-pdf', [\App\Http\Controllers\Admin\WeeklyDigestController::class, 'exportPdf'])->name('admin.weekly-digest.export-pdf');
    
    // Admin Notifications (for header dropdown)
    Route::post('admin/notifications/{id}/read', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::post('admin/notifications/read-all', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAllAsRead'])->name('admin.notifications.read-all');
    Route::delete('admin/notifications/{id}', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'destroy'])->name('admin.notifications.destroy');
    


    // Admin Panduan & Help Center
    Route::get('admin/panduan', function () {
        return \Inertia\Inertia::render('admin/panduan');
    })->name('admin.panduan');
    Route::get('admin/help-center', function () {
        return \Inertia\Inertia::render('admin/help-center');
    })->name('admin.help-center');
    
    // Admin Tugas
    Route::get('admin/tugas', [\App\Http\Controllers\Admin\TugasController::class, 'index'])->name('admin.tugas');
    Route::get('admin/tugas/create', [\App\Http\Controllers\Admin\TugasController::class, 'create'])->name('admin.tugas.create');
    Route::post('admin/tugas', [\App\Http\Controllers\Admin\TugasController::class, 'store'])->name('admin.tugas.store');
    Route::post('admin/tugas/draft', [\App\Http\Controllers\Admin\TugasController::class, 'saveDraft'])->name('admin.tugas.draft');
    Route::get('admin/tugas/{tuga}', [\App\Http\Controllers\Admin\TugasController::class, 'show'])->name('admin.tugas.show');
    Route::patch('admin/tugas/{tuga}', [\App\Http\Controllers\Admin\TugasController::class, 'update'])->name('admin.tugas.update');
    Route::delete('admin/tugas/{tuga}', [\App\Http\Controllers\Admin\TugasController::class, 'destroy'])->name('admin.tugas.destroy');
    Route::post('admin/tugas/{tuga}/message', [\App\Http\Controllers\Admin\TugasController::class, 'sendMessage'])->name('admin.tugas.message');
    Route::patch('admin/tugas/diskusi/{diskusi}/pin', [\App\Http\Controllers\Admin\TugasController::class, 'togglePin'])->name('admin.tugas.diskusi.pin');
    Route::delete('admin/tugas/diskusi/{diskusi}', [\App\Http\Controllers\Admin\TugasController::class, 'deleteMessage'])->name('admin.tugas.diskusi.delete');

    // Tugas Kelompok (Group Assignments)
    Route::get('admin/tugas-kelompok', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'index'])->name('admin.tugas-kelompok');
    Route::get('admin/tugas-kelompok/create', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'create'])->name('admin.tugas-kelompok.create');
    Route::get('admin/tugas-kelompok/workflow', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'createWorkflow'])->name('admin.tugas-kelompok.workflow');
    Route::post('admin/tugas-kelompok', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'store'])->name('admin.tugas-kelompok.store');
    Route::get('admin/tugas-kelompok/{id}', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'show'])->name('admin.tugas-kelompok.show');
    Route::delete('admin/tugas-kelompok/{id}', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'destroy'])->name('admin.tugas-kelompok.destroy');
    Route::post('admin/tugas-kelompok/{id}/random-groups', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'formRandomGroups'])->name('admin.tugas-kelompok.random-groups');
    Route::post('admin/tugas-kelompok/{id}/assign-student', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'assignStudentToGroup'])->name('admin.tugas-kelompok.assign-student');
    Route::post('admin/tugas-kelompok/{id}/create-group', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'createGroup'])->name('admin.tugas-kelompok.create-group');
    Route::post('admin/tugas-kelompok/{id}/toggle-lock', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'toggleLock'])->name('admin.tugas-kelompok.toggle-lock');
    Route::post('admin/tugas-kelompok/{id}/grade', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'gradeSubmission'])->name('admin.tugas-kelompok.grade');
    Route::post('admin/tugas-kelompok/{id}/resolve-conflict/{reportId}', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'resolveConflict'])->name('admin.tugas-kelompok.resolve-conflict');
    Route::get('admin/tugas-kelompok/{id}/export-pdf', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'exportPdf'])->name('admin.tugas-kelompok.export-pdf');
    Route::patch('admin/tugas-kelompok/{id}/group-config', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'updateGroupConfig'])->name('admin.tugas-kelompok.group-config');
    Route::post('admin/tugas-kelompok/{id}/force-assign', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'forceAssign'])->name('admin.tugas-kelompok.force-assign');
    Route::post('admin/tugas-kelompok/{id}/auto-assign', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'autoAssignRemaining'])->name('admin.tugas-kelompok.auto-assign');
    Route::delete('admin/tugas-kelompok/{id}/groups/{groupId}/members/{studentId}', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'removeGroupMember'])->name('admin.tugas-kelompok.remove-member');
    Route::delete('admin/tugas-kelompok/{id}/groups/{groupId}', [\App\Http\Controllers\Admin\TugasKelompokController::class, 'deleteGroupAction'])->name('admin.tugas-kelompok.delete-group');
    
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
    Route::post('user/absen/preview-token', [AbsensiController::class, 'previewToken'])->name('user.absen.preview-token');
    Route::post('user/absen', [AbsensiController::class, 'store'])->name('user.absen.store');
    Route::get('user/rekapan', [AbsensiController::class, 'rekapan'])->name('user.rekapan');
    Route::get('user/bukti-masuk', [AbsensiController::class, 'buktiMasuk'])->name('user.bukti-masuk');
    Route::get('user/history', [AbsensiController::class, 'history'])->name('user.history');
    Route::get('user/history/export-pdf', [AbsensiController::class, 'historyExportPdf'])->name('user.history.export-pdf');
    Route::get('user/history/{id}', [AbsensiController::class, 'historyDetail'])->name('user.history.detail');
    Route::get('user/achievements', [AbsensiController::class, 'achievements'])->name('user.achievements');
    Route::post('user/achievements/{badgeId}/claim', [AbsensiController::class, 'claimAchievement'])->name('user.achievements.claim');
    Route::get('user/achievements/{badge}', [AbsensiController::class, 'badgeDetail'])->name('user.badge-detail');
    Route::get('user/leaderboard', [\App\Http\Controllers\User\LeaderboardController::class, 'index'])->name('user.leaderboard');
    Route::get('user/kas', [\App\Http\Controllers\User\KasController::class, 'index'])->name('user.kas');
    Route::get('user/tugas', [\App\Http\Controllers\User\TugasController::class, 'index'])->name('user.tugas');
    Route::get('user/tugas/{tuga}', [\App\Http\Controllers\User\TugasController::class, 'show'])->name('user.tugas.show');
    Route::post('user/tugas/{tuga}/message', [\App\Http\Controllers\User\TugasController::class, 'sendMessage'])->name('user.tugas.message');
    
    // User Tugas Kelompok (Group Assignments)
    Route::get('user/akademik/tugas-kelompok', [\App\Http\Controllers\User\TugasKelompokController::class, 'index'])->name('user.tugas-kelompok');
    Route::get('user/akademik/tugas-kelompok/{id}', [\App\Http\Controllers\User\TugasKelompokController::class, 'show'])->name('user.tugas-kelompok.show');
    Route::get('user/akademik/tugas-kelompok/{id}/export-pdf', [\App\Http\Controllers\User\TugasKelompokController::class, 'exportPdf'])->name('user.tugas-kelompok.export-pdf');
    Route::post('user/akademik/tugas-kelompok/{id}/create-group', [\App\Http\Controllers\User\TugasKelompokController::class, 'createGroup'])->name('user.tugas-kelompok.create-group');
    Route::post('user/akademik/tugas-kelompok/{id}/join-group/{groupId}', [\App\Http\Controllers\User\TugasKelompokController::class, 'joinGroup'])->name('user.tugas-kelompok.join-group');
    Route::post('user/akademik/tugas-kelompok/{id}/join-slot/{slotNumber}', [\App\Http\Controllers\User\TugasKelompokController::class, 'joinGroupSlot'])->name('user.tugas-kelompok.join-slot');
    Route::post('user/akademik/tugas-kelompok/{id}/leader/add-member', [\App\Http\Controllers\User\TugasKelompokController::class, 'leaderAddMember'])->name('user.tugas-kelompok.leader.add-member');
    Route::post('user/akademik/tugas-kelompok/{id}/leader/remove-member', [\App\Http\Controllers\User\TugasKelompokController::class, 'leaderRemoveMember'])->name('user.tugas-kelompok.leader.remove-member');
    Route::post('user/akademik/tugas-kelompok/{id}/leader/set-leader', [\App\Http\Controllers\User\TugasKelompokController::class, 'leaderSetLeader'])->name('user.tugas-kelompok.leader.set-leader');
    Route::post('user/akademik/tugas-kelompok/{id}/leave-group', [\App\Http\Controllers\User\TugasKelompokController::class, 'leaveGroup'])->name('user.tugas-kelompok.leave-group');
    Route::post('user/akademik/tugas-kelompok/{id}/message', [\App\Http\Controllers\User\TugasKelompokController::class, 'sendMessage'])->name('user.tugas-kelompok.message');
    Route::post('user/akademik/tugas-kelompok/{id}/upload', [\App\Http\Controllers\User\TugasKelompokController::class, 'uploadFile'])->name('user.tugas-kelompok.upload');
    Route::post('user/akademik/tugas-kelompok/{id}/task', [\App\Http\Controllers\User\TugasKelompokController::class, 'createTask'])->name('user.tugas-kelompok.task');
    Route::patch('user/akademik/tugas-kelompok/{id}/task/{taskId}', [\App\Http\Controllers\User\TugasKelompokController::class, 'updateTaskStatus'])->name('user.tugas-kelompok.task-status');
    Route::post('user/akademik/tugas-kelompok/{id}/submit', [\App\Http\Controllers\User\TugasKelompokController::class, 'submitWork'])->name('user.tugas-kelompok.submit');
    Route::post('user/akademik/tugas-kelompok/{id}/peer-evaluation', [\App\Http\Controllers\User\TugasKelompokController::class, 'submitPeerEvaluation'])->name('user.tugas-kelompok.peer-eval');
    Route::post('user/akademik/tugas-kelompok/{id}/conflict', [\App\Http\Controllers\User\TugasKelompokController::class, 'reportConflict'])->name('user.tugas-kelompok.conflict');
    Route::post('user/akademik/tugas-kelompok/{id}/invite', [\App\Http\Controllers\User\TugasKelompokController::class, 'invite'])->name('user.tugas-kelompok.invite');
    Route::post('user/akademik/tugas-kelompok/{id}/invitation/{invitationId}/respond', [\App\Http\Controllers\User\TugasKelompokController::class, 'respondInvitation'])->name('user.tugas-kelompok.invitation.respond');
    Route::post('user/akademik/tugas-kelompok/{id}/rename-group', [\App\Http\Controllers\User\TugasKelompokController::class, 'renameGroup'])->name('user.tugas-kelompok.rename-group');

    // User Permit (Izin/Sakit)
    Route::get('user/permit', [\App\Http\Controllers\User\PermitController::class, 'index'])->name('user.permit');
    Route::get('user/permit/create', [\App\Http\Controllers\User\PermitController::class, 'create'])->name('user.permit.create');
    Route::get('user/permit/{permit}/attachment', [\App\Http\Controllers\User\PermitController::class, 'attachment'])->name('user.permit.attachment');
    Route::post('user/permit', [\App\Http\Controllers\User\PermitController::class, 'store'])->name('user.permit.store');
    Route::post('user/permit/{permit}/comment', [\App\Http\Controllers\User\PermitController::class, 'addComment'])->name('user.permit.comment');
    Route::delete('user/permit/{permit}', [\App\Http\Controllers\User\PermitController::class, 'destroy'])->name('user.permit.destroy');
    
    // User Kas Voting
    Route::get('user/kas-voting', [\App\Http\Controllers\User\KasVotingController::class, 'index'])->name('user.kas-voting');
    Route::get('user/kas-voting/create', [\App\Http\Controllers\User\KasVotingController::class, 'create'])->name('user.kas-voting.create');
    Route::get('user/kas-voting/{voting}', [\App\Http\Controllers\User\KasVotingController::class, 'show'])->name('user.kas-voting.detail');
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
    Route::patch('user/akademik/jadwal/{course}/reschedule', [\App\Http\Controllers\User\AcademicScheduleController::class, 'reschedule'])->name('user.akademik.jadwal.reschedule');
    Route::get('user/akademik/kehadiran', [KehadiranController::class, 'index'])->name('user.akademik.kehadiran');
    Route::post('user/akademik/kehadiran/online-claim', [KehadiranController::class, 'onlineSelfClaim'])->name('user.akademik.kehadiran.online-claim');
    Route::get('user/akademik/kehadiran/{mahasiswaCourse}', [KehadiranController::class, 'show'])->name('user.akademik.kehadiran.show');
    Route::get('user/akademik/ujian', [\App\Http\Controllers\User\AcademicScheduleController::class, 'exams'])->name('user.akademik.ujian');
    Route::get('user/akademik/ujian/detail', [\App\Http\Controllers\User\AcademicScheduleController::class, 'examDetail'])->name('user.akademik.ujian.detail');

    // Jadwal Detail
    Route::get('user/akademik/jadwal/{course}', [\App\Http\Controllers\User\ScheduleDetailController::class, 'show'])->name('user.schedule.detail');
    Route::post('user/schedule/{course}/reminder/toggle', [\App\Http\Controllers\User\ScheduleDetailController::class, 'toggleReminder'])->name('user.schedule.reminder.toggle');
    Route::get('user/schedule/{course}/export-ical', [\App\Http\Controllers\User\ScheduleDetailController::class, 'exportIcal'])->name('user.schedule.export-ical');
    Route::post('user/schedule/{course}/notes', [\App\Http\Controllers\User\ScheduleDetailController::class, 'storeNote'])->name('user.schedule.notes.store');
    Route::put('user/schedule/{course}/notes/{note}', [\App\Http\Controllers\User\ScheduleDetailController::class, 'updateNote'])->name('user.schedule.notes.update');
    Route::delete('user/schedule/{course}/notes/{note}', [\App\Http\Controllers\User\ScheduleDetailController::class, 'deleteNote'])->name('user.schedule.notes.delete');
    
    // Akademik - Mata Kuliah
    Route::get('user/akademik/mata-kuliah', [MataKuliahController::class, 'index'])->name('user.akademik.mata-kuliah');
    Route::get('user/akademik/matkul', [MataKuliahController::class, 'index'])->name('user.akademik.matkul');
    Route::get('user/akademik/mata-kuliah/export', [MataKuliahController::class, 'export'])->name('user.akademik.mata-kuliah.export');
    Route::post('user/akademik/mata-kuliah/{id}/favorite', [MataKuliahController::class, 'toggleFavorite'])->name('user.akademik.mata-kuliah.favorite');
    Route::post('user/akademik/matkul/{id}/favorite', [MataKuliahController::class, 'toggleFavorite'])->name('user.akademik.matkul.favorite');
    Route::post('user/akademik/matkul', [\App\Http\Controllers\User\AcademicCourseController::class, 'store'])->name('user.akademik.matkul.store');
    Route::patch('user/akademik/matkul/{id}', [\App\Http\Controllers\User\AcademicCourseController::class, 'update'])->name('user.akademik.matkul.update');
    Route::delete('user/akademik/matkul/{id}', [\App\Http\Controllers\User\AcademicCourseController::class, 'destroy'])->name('user.akademik.matkul.destroy');
    Route::post('user/akademik/matkul/{courseId}/meeting/{meetingNumber}/complete', [\App\Http\Controllers\User\AcademicCourseController::class, 'markMeetingComplete'])->name('user.akademik.matkul.meeting.complete');
    

    // Akademik - Catatan
    Route::get('user/akademik/catatan', [\App\Http\Controllers\User\AcademicNoteController::class, 'index'])->name('user.akademik.catatan');
    Route::get('user/akademik/catatan/create', [\App\Http\Controllers\User\AcademicNoteController::class, 'create'])->name('user.akademik.catatan.create');
    Route::post('user/akademik/catatan', [\App\Http\Controllers\User\AcademicNoteController::class, 'store'])->name('user.akademik.catatan.store');
    Route::get('user/akademik/catatan/{id}', [\App\Http\Controllers\User\AcademicNoteController::class, 'show'])->whereNumber('id')->name('user.akademik.catatan.show');
    Route::get('user/akademik/catatan/{id}/export-pdf', [\App\Http\Controllers\User\AcademicNoteController::class, 'exportPdf'])->whereNumber('id')->name('user.akademik.catatan.export-pdf');
    Route::get('user/akademik/catatan/{id}/edit', [\App\Http\Controllers\User\AcademicNoteController::class, 'edit'])->name('user.akademik.catatan.edit');
    Route::patch('user/akademik/catatan/{id}', [\App\Http\Controllers\User\AcademicNoteController::class, 'update'])->name('user.akademik.catatan.update');
    Route::delete('user/akademik/catatan/{id}', [\App\Http\Controllers\User\AcademicNoteController::class, 'destroy'])->name('user.akademik.catatan.destroy');
    Route::post('user/akademik/catatan/ai-process', [\App\Http\Controllers\User\AcademicNoteController::class, 'processAI'])->name('user.akademik.catatan.ai-process');
    Route::post('user/akademik/catatan/{id}/generate-summary', [\App\Http\Controllers\User\AcademicNoteController::class, 'generateAISummary'])->name('user.akademik.catatan.generate-summary');
    Route::post('user/akademik/catatan/{id}/generate-flashcards', [\App\Http\Controllers\User\AcademicNoteController::class, 'generateFlashcards'])->name('user.akademik.catatan.generate-flashcards');
    
    // Personal Analytics
    Route::get('user/personal-analytics', [\App\Http\Controllers\User\PersonalAnalyticsController::class, 'index'])->name('user.personal-analytics');
    
    // Schedule (Jadwal Kuliah)
    Route::get('user/schedule', [\App\Http\Controllers\User\ScheduleController::class, 'index'])->name('user.schedule');
    Route::get('user/schedule/export-pdf', [\App\Http\Controllers\User\ScheduleController::class, 'exportPdf'])->name('user.schedule.export-pdf');
    
    // Notifications
    Route::get('user/notifications', [\App\Http\Controllers\User\NotificationController::class, 'index'])->name('user.notifications');
    Route::get('user/notifications/{id}', [\App\Http\Controllers\User\NotificationController::class, 'show'])->name('user.notifications.show');
    Route::post('user/notifications/{id}/read', [\App\Http\Controllers\User\NotificationController::class, 'markAsRead'])->name('user.notifications.read');
    Route::post('user/notifications/read-all', [\App\Http\Controllers\User\NotificationController::class, 'markAllAsRead'])->name('user.notifications.read-all');
    Route::delete('user/notifications/{id}', [\App\Http\Controllers\User\NotificationController::class, 'destroy'])->name('user.notifications.destroy');
    
    // Weekly Learning Digest (Hidden from sidebar, accessible from Notifications)
    Route::get('user/weekly-digest/{id}', [\App\Http\Controllers\User\WeeklyDigestController::class, 'show'])->name('user.weekly-digest.show');
    Route::get('user/weekly-digest/{id}/export-pdf', [\App\Http\Controllers\User\WeeklyDigestController::class, 'exportPdf'])->name('user.weekly-digest.export-pdf');
    
    // Settings, Documentation, Help (Inertia pages)
    Route::get('user/settings', fn () => inertia('student/settings'))->name('user.settings');
    Route::get('user/docs', function (\App\Services\DocumentationService $documentationService) {
        $mahasiswa = auth('mahasiswa')->user();
        abort_if(!$mahasiswa, 403);

        $guides = $documentationService->getGuidesWithProgress($mahasiswa, 'mahasiswa')->values();
        $stats = $documentationService->getStats($mahasiswa, 'mahasiswa');

        return inertia('student/docs', [
            'guides' => $guides,
            'stats' => $stats,
            'categories' => $guides->pluck('category')->unique()->values(),
        ]);
    })->name('user.docs');

    Route::get('user/docs/{guideId}', function (\App\Services\DocumentationService $documentationService, string $guideId) {
        $mahasiswa = auth('mahasiswa')->user();
        abort_if(!$mahasiswa, 403);

        $guide = $documentationService->getGuide($guideId, 'mahasiswa');
        abort_if(!$guide, 404);

        $progress = $documentationService->getGuideProgress($mahasiswa, $guideId);
        $completedSections = $progress?->completed_sections ?? [];

        $guideWithProgress = array_merge($guide, [
            'progress' => [
                'completed_sections' => $completedSections,
                'is_completed' => $progress?->is_completed ?? false,
                'completion_percentage' => $progress?->getCompletionPercentage() ?? 0,
            ],
        ]);

        $relatedGuides = $documentationService
            ->getGuidesWithProgress($mahasiswa, 'mahasiswa')
            ->filter(fn ($item) => $item['id'] !== $guideId && $item['category'] === ($guide['category'] ?? null))
            ->take(4)
            ->values();

        return inertia('student/docs-detail', [
            'guide' => $guideWithProgress,
            'relatedGuides' => $relatedGuides,
        ]);
    })->name('user.docs.detail');
    Route::get('user/help', fn () => inertia('student/help'))->name('user.help');
    
    // Selfie Verification Requests
    Route::get('user/selfie-verification', [\App\Http\Controllers\Student\SelfieVerificationController::class, 'index'])->name('user.selfie-verification');
    Route::patch('user/selfie-view-requests/{viewRequest}/approve', [\App\Http\Controllers\Student\SelfieVerificationController::class, 'approve'])->name('user.selfie-view-requests.approve');
    Route::patch('user/selfie-view-requests/{viewRequest}/reject', [\App\Http\Controllers\Student\SelfieVerificationController::class, 'reject'])->name('user.selfie-view-requests.reject');
});

require __DIR__.'/settings.php';
require __DIR__.'/dosen.php';
require __DIR__.'/chat.php';
