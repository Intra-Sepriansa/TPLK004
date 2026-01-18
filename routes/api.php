<?php

use App\Http\Controllers\Api\DocumentationController;
use App\Http\Controllers\Api\HelpCenterController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TutorialController;
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
    Route::get('/faqs/{category}', [HelpCenterController::class, 'faqsByCategory'])->name('api.help.faqs.category');
    Route::get('/search', [HelpCenterController::class, 'search'])->name('api.help.search');
    Route::get('/troubleshooting', [HelpCenterController::class, 'troubleshooting'])->name('api.help.troubleshooting');
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
