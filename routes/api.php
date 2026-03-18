<?php

use App\Http\Controllers\Api\DocumentationController;
use App\Http\Controllers\Api\HelpCenterController;
use App\Http\Controllers\Api\MobileMahasiswaAuthController;
use App\Http\Controllers\Api\MobileMahasiswaAttendanceController;
use App\Http\Controllers\Api\MobileMahasiswaDashboardController;
use App\Http\Controllers\Api\MobileMahasiswaKasController;
use App\Http\Controllers\Api\MobileMahasiswaProfileController;
use App\Http\Controllers\Api\MobileTugasController;
use App\Http\Controllers\Api\MobileTugasKelompokController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TutorialController;
use App\Http\Controllers\Api\MobileFcmController;
use App\Http\Controllers\User\KasController as UserKasController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

Route::post('mobile/mahasiswa/login', [MobileMahasiswaAuthController::class, 'login'])
    ->name('api.mobile.mahasiswa.login');

Route::post('mobile/mahasiswa/forgot-password', [MobileMahasiswaAuthController::class, 'forgotPassword'])
    ->name('api.mobile.mahasiswa.forgot-password');

Route::middleware(['mobile.mahasiswa'])->prefix('mobile/mahasiswa')->group(function () {
    Route::get('/dashboard', [MobileMahasiswaDashboardController::class, 'index'])
        ->name('api.mobile.mahasiswa.dashboard');
    Route::get('/profile', [MobileMahasiswaProfileController::class, 'show'])
        ->name('api.mobile.mahasiswa.profile');
    Route::post('/profile', [MobileMahasiswaProfileController::class, 'update'])
        ->name('api.mobile.mahasiswa.profile.update');
    Route::post('/profile/avatar', [MobileMahasiswaProfileController::class, 'uploadAvatar'])
        ->name('api.mobile.mahasiswa.profile.avatar');
    Route::post('/profile/password', [MobileMahasiswaProfileController::class, 'updatePassword'])
        ->name('api.mobile.mahasiswa.profile.password');
    Route::get('/attendance/today', [MobileMahasiswaAttendanceController::class, 'today'])
        ->name('api.mobile.mahasiswa.attendance.today');
    Route::get('/attendance/history', [MobileMahasiswaAttendanceController::class, 'history'])
        ->name('api.mobile.mahasiswa.attendance.history');
    Route::get('/attendance/active-sessions', [MobileMahasiswaAttendanceController::class, 'activeSessions'])
        ->name('api.mobile.mahasiswa.attendance.active-sessions');
    Route::post('/attendance/qr', [MobileMahasiswaAttendanceController::class, 'submitQr'])
        ->name('api.mobile.mahasiswa.attendance.qr');
    Route::post('/attendance/selfie', [MobileMahasiswaAttendanceController::class, 'submitSelfie'])
        ->name('api.mobile.mahasiswa.attendance.selfie');

    // FCM Token
    Route::post('/fcm-token', [MobileFcmController::class, 'updateToken'])
        ->name('api.mobile.mahasiswa.fcm-token');

    // Kas
    Route::get('/kas', [MobileMahasiswaKasController::class, 'index'])
        ->name('api.mobile.mahasiswa.kas');
    Route::post('/kas/receipts/upload', [MobileMahasiswaKasController::class, 'uploadReceipt'])
        ->name('api.mobile.mahasiswa.kas.receipts.upload');

    // Tugas Individu
    Route::post('/tugas', [MobileTugasController::class, 'index'])
        ->name('api.mobile.mahasiswa.tugas');
    Route::get('/tugas/{id}', [MobileTugasController::class, 'show'])
        ->name('api.mobile.mahasiswa.tugas.show');
    Route::post('/tugas/{id}/submit', [MobileTugasController::class, 'submit'])
        ->name('api.mobile.mahasiswa.tugas.submit');
    Route::post('/tugas/{id}/message', [MobileTugasController::class, 'sendMessage'])
        ->name('api.mobile.mahasiswa.tugas.message');

    // Tugas Kelompok
    Route::post('/tugas-kelompok', [MobileTugasKelompokController::class, 'index'])
        ->name('api.mobile.mahasiswa.tugas-kelompok');
    Route::get('/tugas-kelompok/{id}', [MobileTugasKelompokController::class, 'show'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.show');
    Route::post('/tugas-kelompok/{id}/join', [MobileTugasKelompokController::class, 'join'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.join');
    Route::post('/tugas-kelompok/{id}/message', [MobileTugasKelompokController::class, 'message'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.message');
    Route::post('/tugas-kelompok/{id}/upload', [MobileTugasKelompokController::class, 'upload'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.upload');
    Route::post('/tugas-kelompok/{id}/submit', [MobileTugasKelompokController::class, 'submit'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.submit');
    Route::post('/tugas-kelompok/{id}/invite', [MobileTugasKelompokController::class, 'invite'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.invite');
    Route::post('/tugas-kelompok/{id}/invitation/{invId}/accept', function (\Illuminate\Http\Request $request, int $id, int $invId) {
        return app(MobileTugasKelompokController::class)->respondInvitation($request, $id, $invId, 'accept');
    })->name('api.mobile.mahasiswa.tugas-kelompok.invitation.accept');
    Route::post('/tugas-kelompok/{id}/invitation/{invId}/decline', function (\Illuminate\Http\Request $request, int $id, int $invId) {
        return app(MobileTugasKelompokController::class)->respondInvitation($request, $id, $invId, 'decline');
    })->name('api.mobile.mahasiswa.tugas-kelompok.invitation.decline');
    Route::post('/tugas-kelompok/{id}/task', [MobileTugasKelompokController::class, 'addTask'])
        ->name('api.mobile.mahasiswa.tugas-kelompok.task');
});

// Settings API - accessible by all authenticated users
Route::middleware(['web', 'auth:mahasiswa,dosen,web'])->prefix('settings')->group(function () {
    Route::get('/', [SettingsController::class, 'index'])->name('api.settings.index');
    Route::put('/', [SettingsController::class, 'update'])->name('api.settings.update');
    Route::patch('/{category}', [SettingsController::class, 'updateCategory'])->name('api.settings.category');
    Route::post('/reset', [SettingsController::class, 'reset'])->name('api.settings.reset');
    Route::get('/export', [SettingsController::class, 'export'])->name('api.settings.export');
    Route::post('/import', [SettingsController::class, 'import'])->name('api.settings.import');
    Route::get('/defaults', [SettingsController::class, 'defaults'])->name('api.settings.defaults');
    // Session management
    Route::get('/sessions', [SettingsController::class, 'sessions'])->name('api.settings.sessions');
    Route::post('/sessions/{sessionId}/terminate', [SettingsController::class, 'terminateSession'])->name('api.settings.sessions.terminate');
    // Login history
    Route::get('/login-history', [SettingsController::class, 'loginHistory'])->name('api.settings.login-history');
    // Storage & Cache
    Route::get('/storage', [SettingsController::class, 'storageUsage'])->name('api.settings.storage');
    Route::post('/clear-cache', [SettingsController::class, 'clearCache'])->name('api.settings.clear-cache');
});

// Documentation API - accessible by all authenticated users
Route::middleware(['web', 'auth:mahasiswa,dosen,web'])->prefix('docs')->group(function () {
    Route::get('/guides', [DocumentationController::class, 'index'])->name('api.docs.index');
    Route::get('/guides/search', [DocumentationController::class, 'search'])->name('api.docs.search');
    Route::get('/guides/{guideId}', [DocumentationController::class, 'show'])->name('api.docs.show');
    Route::get('/progress', [DocumentationController::class, 'progress'])->name('api.docs.progress');
    Route::get('/progress/{guideId}', [DocumentationController::class, 'guideProgress'])->name('api.docs.progress.guide');
    Route::post('/progress/{guideId}', [DocumentationController::class, 'updateProgress'])->name('api.docs.progress.update');
    Route::put('/progress/{guideId}', [DocumentationController::class, 'updateProgressPut'])->name('api.docs.progress.put');
    Route::post('/progress/{guideId}/complete', [DocumentationController::class, 'markComplete'])->name('api.docs.progress.complete');
    Route::post('/progress/{guideId}/reset', [DocumentationController::class, 'resetProgress'])->name('api.docs.progress.reset');
    Route::get('/stats', [DocumentationController::class, 'stats'])->name('api.docs.stats');

    Route::get('/bookmarks', [DocumentationController::class, 'bookmarks'])->name('api.docs.bookmarks.index');
    Route::post('/bookmarks/{guideId}', [DocumentationController::class, 'toggleBookmark'])->name('api.docs.bookmarks.toggle');

    Route::get('/feedback/{guideId}', [DocumentationController::class, 'feedback'])->name('api.docs.feedback.show');
    Route::post('/feedback/{guideId}', [DocumentationController::class, 'upsertFeedback'])->name('api.docs.feedback.upsert');

    Route::get('/offline-downloads', [DocumentationController::class, 'offlineDownloads'])->name('api.docs.offline.index');
    Route::post('/offline-downloads/{guideId}', [DocumentationController::class, 'upsertOfflineDownload'])->name('api.docs.offline.upsert');
    Route::delete('/offline-downloads/{guideId}', [DocumentationController::class, 'removeOfflineDownload'])->name('api.docs.offline.remove');
});

// Tutorial API - accessible by all authenticated users
Route::middleware(['web', 'auth:mahasiswa,dosen,web'])->prefix('tutorials')->group(function () {
    Route::get('/', [TutorialController::class, 'index'])->name('api.tutorials.index');
    Route::get('/status', [TutorialController::class, 'status'])->name('api.tutorials.status');
    Route::get('/{tutorialId}', [TutorialController::class, 'show'])->name('api.tutorials.show');
    Route::get('/{tutorialId}/should-show', [TutorialController::class, 'shouldShow'])->name('api.tutorials.should-show');
    Route::post('/{tutorialId}/start', [TutorialController::class, 'start'])->name('api.tutorials.start');
    Route::post('/{tutorialId}/advance', [TutorialController::class, 'advance'])->name('api.tutorials.advance');
    Route::post('/{tutorialId}/step', [TutorialController::class, 'setStep'])->name('api.tutorials.step');
    Route::post('/{tutorialId}/complete', [TutorialController::class, 'complete'])->name('api.tutorials.complete');
    Route::post('/{tutorialId}/skip', [TutorialController::class, 'skip'])->name('api.tutorials.skip');
    Route::post('/{tutorialId}/reset', [TutorialController::class, 'reset'])->name('api.tutorials.reset');
});

// Help Center API - accessible by all authenticated users
Route::middleware(['web', 'auth:mahasiswa,dosen,web'])->prefix('help')->group(function () {
    Route::get('/faqs', [HelpCenterController::class, 'faqs'])->name('api.help.faqs');
    Route::post('/faqs/{faqId}/rate', [HelpCenterController::class, 'rateFaq'])->name('api.help.faqs.rate');
    Route::get('/faqs/{category}', [HelpCenterController::class, 'faqsByCategory'])->name('api.help.faqs.category');
    Route::get('/search', [HelpCenterController::class, 'search'])->name('api.help.search');
    Route::get('/troubleshooting', [HelpCenterController::class, 'troubleshooting'])->name('api.help.troubleshooting');
    Route::get('/videos', [HelpCenterController::class, 'videos'])->name('api.help.videos');
    Route::post('/analytics/page-view', [HelpCenterController::class, 'trackPageView'])->name('api.help.analytics.page-view');
    Route::post('/analytics/search', [HelpCenterController::class, 'trackSearch'])->name('api.help.analytics.search');
    Route::post('/analytics/view', [HelpCenterController::class, 'trackView'])->name('api.help.analytics.view');
    Route::get('/analytics/summary', [HelpCenterController::class, 'analyticsSummary'])->name('api.help.analytics.summary');
    Route::get('/contact', [HelpCenterController::class, 'contact'])->name('api.help.contact');
    Route::post('/feedback', [HelpCenterController::class, 'submitFeedback'])->name('api.help.feedback');
});

// Dosen Settings API
Route::middleware(['web', 'auth:dosen'])->prefix('dosen/api/settings')->group(function () {
    Route::get('/', [\App\Http\Controllers\Dosen\SettingsController::class, 'index'])->name('api.dosen.settings.index');
    Route::post('/general', [\App\Http\Controllers\Dosen\SettingsController::class, 'updateGeneral'])->name('api.dosen.settings.general');
    Route::post('/teaching', [\App\Http\Controllers\Dosen\SettingsController::class, 'updateTeaching'])->name('api.dosen.settings.teaching');
    Route::post('/class-management', [\App\Http\Controllers\Dosen\SettingsController::class, 'updateClassManagement'])->name('api.dosen.settings.class-management');
    Route::post('/notifications', [\App\Http\Controllers\Dosen\SettingsController::class, 'updateNotifications'])->name('api.dosen.settings.notifications');
    Route::post('/privacy', [\App\Http\Controllers\Dosen\SettingsController::class, 'updatePrivacy'])->name('api.dosen.settings.privacy');
    Route::post('/password', [\App\Http\Controllers\Dosen\SettingsController::class, 'updatePassword'])->name('api.dosen.settings.password');
    Route::post('/reset', [\App\Http\Controllers\Dosen\SettingsController::class, 'reset'])->name('api.dosen.settings.reset');
    Route::get('/export', [\App\Http\Controllers\Dosen\SettingsController::class, 'export'])->name('api.dosen.settings.export');
    Route::get('/export-pdf', [\App\Http\Controllers\Dosen\SettingsController::class, 'exportPdf'])->name('api.dosen.settings.export-pdf');
});

// AI Verification Status API
Route::middleware(['web', 'auth:mahasiswa,dosen,web'])->group(function () {
    Route::get('/attendance/{id}/ai-status', [\App\Http\Controllers\Api\AttendanceAIStatusController::class, 'show'])
        ->name('api.attendance.ai-status');
});

// Kas Innovation API (Mahasiswa)
Route::middleware(['web', 'auth:mahasiswa'])->prefix('kas')->group(function () {
    Route::get('/analytics/health-score', [UserKasController::class, 'getHealthScore'])->name('api.kas.analytics.health-score');
    Route::get('/analytics/predictions', [UserKasController::class, 'getPredictions'])->name('api.kas.analytics.predictions');
    Route::get('/analytics/insights', [UserKasController::class, 'getInsights'])->name('api.kas.analytics.insights');

    Route::post('/reminders/preferences', [UserKasController::class, 'updateReminderPreferences'])->name('api.kas.reminders.preferences');
    Route::post('/reminders/{id}/snooze', [UserKasController::class, 'snoozeReminder'])->name('api.kas.reminders.snooze');

    Route::get('/achievements', [UserKasController::class, 'getAchievements'])->name('api.kas.achievements');
    Route::get('/leaderboard', [UserKasController::class, 'getLeaderboard'])->name('api.kas.leaderboard');
    Route::get('/challenges', [UserKasController::class, 'getChallenges'])->name('api.kas.challenges');

    Route::post('/receipts/upload', [UserKasController::class, 'uploadReceipt'])->name('api.kas.receipts.upload');

    Route::post('/export', [UserKasController::class, 'exportData'])->name('api.kas.export');
    Route::post('/reports/generate', [UserKasController::class, 'generateReport'])->name('api.kas.reports.generate');
});

// Network Diagnostic API (Mahasiswa)
Route::middleware(['web', 'auth:mahasiswa'])->prefix('network')->group(function () {
    Route::get('/health', [\App\Http\Controllers\Api\NetworkDiagnosticController::class, 'health'])->name('api.network.health');
    Route::get('/speed-test/download', [\App\Http\Controllers\Api\NetworkDiagnosticController::class, 'downloadTest'])->name('api.network.download');
    Route::post('/speed-test/upload', [\App\Http\Controllers\Api\NetworkDiagnosticController::class, 'uploadTest'])->name('api.network.upload');
});
