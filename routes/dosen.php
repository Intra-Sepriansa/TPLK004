<?php

use App\Http\Controllers\Auth\DosenAuthController;
use App\Http\Controllers\Dosen\CourseController;
use App\Http\Controllers\Dosen\DashboardController;
use App\Http\Controllers\Dosen\ProfileController;
use App\Http\Controllers\Dosen\RekapanController;
use App\Http\Controllers\Dosen\SesiAbsenController;
use App\Http\Controllers\Dosen\SessionController;
use App\Http\Controllers\Dosen\VerificationController;
use Illuminate\Support\Facades\Route;

// Dosen Auth Routes - Login handled by main login page
Route::post('dosen/logout', [DosenAuthController::class, 'destroy'])->name('dosen.logout');

// Dosen Protected Routes
Route::middleware(['auth:dosen'])->prefix('dosen')->name('dosen.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.alt');

    // Sesi Absen
    Route::get('/sesi-absen', [SesiAbsenController::class, 'index'])->name('sesi-absen');
    Route::get('/sesi-absen/create', [SesiAbsenController::class, 'create'])->name('sesi-absen.create');
    Route::get('/sesi-absen/{session}', [SesiAbsenController::class, 'show'])->name('sesi-absen.show');
    Route::get('/sesi-absen/{session}/export-pdf', [SesiAbsenController::class, 'exportPdf'])->name('sesi-absen.export-pdf');
    Route::post('/sesi-absen/{session}/send-reminder', [SesiAbsenController::class, 'sendReminder'])->name('sesi-absen.send-reminder');

    // Courses
    Route::get('/courses', [CourseController::class, 'index'])->name('courses');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/courses/{course}/export-pdf', [CourseController::class, 'exportPdf'])->name('courses.export-pdf');
    Route::get('/courses/{course}/students', [CourseController::class, 'students'])->name('courses.students');
    Route::get('/courses/{course}/students/{mahasiswa}', [CourseController::class, 'studentDetail'])->name('courses.student-detail');

    // Sessions
    Route::post('/sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::post('/attendance-sessions', [SessionController::class, 'store'])->name('attendance-sessions.store.dosen');
    Route::get('/sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');
    Route::patch('/sessions/{session}/activate', [SessionController::class, 'activate'])->name('sessions.activate');
    Route::patch('/sessions/{session}/close', [SessionController::class, 'close'])->name('sessions.close');
    Route::patch('/sessions/{session}/regenerate-qr', [SessionController::class, 'regenerateQr'])->name('sessions.regenerate-qr');
    Route::patch('/attendance-sessions/{session}/activate', [SessionController::class, 'activate'])->name('attendance-sessions.activate.dosen');
    Route::patch('/attendance-sessions/{session}/close', [SessionController::class, 'close'])->name('attendance-sessions.close.dosen');

    // Verification (AI-Powered)
    Route::get('/verify', [VerificationController::class, 'index'])->name('verify');
    Route::get('/verify/{verification}', [VerificationController::class, 'show'])->name('verify.show');
    Route::patch('/verify/{verification}/approve', [VerificationController::class, 'approve'])->name('verify.approve');
    Route::patch('/verify/{verification}/reject', [VerificationController::class, 'reject'])->name('verify.reject');
    Route::post('/verify/{verification}/scan-ai', [VerificationController::class, 'scanAI'])->name('verify.scan-ai');

    // Rekapan
    Route::get('/rekapan', [RekapanController::class, 'index'])->name('rekapan');
    Route::get('/rekapan/pdf', [RekapanController::class, 'exportPdf'])->name('rekapan.pdf');
    Route::get('/rekapan/{log}', [RekapanController::class, 'show'])->name('rekapan.show');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // Tugas
    Route::get('/tugas', [\App\Http\Controllers\Dosen\TugasController::class, 'index'])->name('tugas');
    Route::post('/tugas', [\App\Http\Controllers\Dosen\TugasController::class, 'store'])->name('tugas.store');
    Route::get('/tugas/{tuga}', [\App\Http\Controllers\Dosen\TugasController::class, 'show'])->name('tugas.show');
    Route::patch('/tugas/{tuga}', [\App\Http\Controllers\Dosen\TugasController::class, 'update'])->name('tugas.update');
    Route::delete('/tugas/{tuga}', [\App\Http\Controllers\Dosen\TugasController::class, 'destroy'])->name('tugas.destroy');
    Route::post('/tugas/{tuga}/message', [\App\Http\Controllers\Dosen\TugasController::class, 'sendMessage'])->name('tugas.message');
    Route::patch('/tugas/diskusi/{diskusi}/pin', [\App\Http\Controllers\Dosen\TugasController::class, 'togglePin'])->name('tugas.diskusi.pin');
    Route::delete('/tugas/diskusi/{diskusi}', [\App\Http\Controllers\Dosen\TugasController::class, 'deleteMessage'])->name('tugas.diskusi.delete');

    // Tugas Grading
    Route::get('/tugas/{tuga}/grading', [\App\Http\Controllers\Dosen\TugasGradingController::class, 'index'])->name('tugas.grading');
    Route::patch('/tugas/submission/{submission}/grade', [\App\Http\Controllers\Dosen\TugasGradingController::class, 'grade'])->name('tugas.submission.grade');
    Route::post('/tugas/{tuga}/bulk-grade', [\App\Http\Controllers\Dosen\TugasGradingController::class, 'bulkGrade'])->name('tugas.bulk-grade');

    // Permits (Izin/Sakit)
    Route::get('/permits', [\App\Http\Controllers\Dosen\PermitController::class, 'index'])->name('permits');
    Route::get('/permits/{permit}', [\App\Http\Controllers\Dosen\PermitController::class, 'show'])->name('permits.show');
    Route::patch('/permits/{permit}/approve', [\App\Http\Controllers\Dosen\PermitController::class, 'approve'])->name('permits.approve');
    Route::patch('/permits/{permit}/reject', [\App\Http\Controllers\Dosen\PermitController::class, 'reject'])->name('permits.reject');
    Route::post('/permits/bulk-approve', [\App\Http\Controllers\Dosen\PermitController::class, 'bulkApprove'])->name('permits.bulk-approve');
    
    // Grading
    Route::get('/grading', [\App\Http\Controllers\Dosen\GradingController::class, 'index'])->name('grading');
    Route::get('/grading/export', [\App\Http\Controllers\Dosen\GradingController::class, 'export'])->name('grading.export');
    Route::get('/grading/export-pdf', [\App\Http\Controllers\Dosen\GradingController::class, 'exportPdf'])->name('grading.export-pdf');
    Route::get('/grading/student/{mahasiswaId}', [\App\Http\Controllers\Dosen\GradingController::class, 'studentReport'])->name('grading.student');
    Route::post('/grading/override', [\App\Http\Controllers\Dosen\GradingController::class, 'override'])->name('grading.override');
    
    // Grading Detail (Individual Student)
    Route::get('/grading/detail/{mahasiswaId}', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'show'])->name('grading.detail');
    Route::post('/grading/detail/update-status', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'updateStatus'])->name('grading.detail.update-status');
    Route::post('/grading/detail/add-note', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'addNote'])->name('grading.detail.add-note');
    Route::delete('/grading/detail/note/{noteId}', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'deleteNote'])->name('grading.detail.delete-note');
    
    // Class Insights
    Route::get('/class-insights', [\App\Http\Controllers\Dosen\ClassInsightsController::class, 'index'])->name('class-insights');
    Route::post('/class-insights/export-csv', [\App\Http\Controllers\Dosen\ClassInsightsController::class, 'exportCsv'])->name('class-insights.export-csv');
    Route::post('/class-insights/export-pdf', [\App\Http\Controllers\Dosen\ClassInsightsController::class, 'exportPdf'])->name('class-insights.export-pdf');
    Route::post('/class-insights/export-excel', [\App\Http\Controllers\Dosen\ClassInsightsController::class, 'exportExcel'])->name('class-insights.export-excel');
    Route::post('/class-insights/export-json', [\App\Http\Controllers\Dosen\ClassInsightsController::class, 'exportJson'])->name('class-insights.export-json');
    
    // Session Templates
    Route::get('/session-templates/create', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'create'])->name('session-templates.create');
    Route::get('/session-templates/{template}/edit', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'edit'])->name('session-templates.edit');
    Route::post('/session-templates/advanced', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'storeAdvanced'])->name('session-templates.store-advanced');
    Route::put('/session-templates/{template}/advanced', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'updateAdvanced'])->name('session-templates.update-advanced');
    Route::post('/session-templates/draft', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'saveDraft'])->name('session-templates.draft');
    Route::get('/session-templates', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'index'])->name('session-templates');
    Route::post('/session-templates', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'store'])->name('session-templates.store');
    Route::patch('/session-templates/{template}', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'update'])->name('session-templates.update');
    Route::delete('/session-templates/{template}', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'destroy'])->name('session-templates.destroy');
    Route::post('/session-templates/{template}/generate', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'generateSessions'])->name('session-templates.generate');
    Route::post('/session-templates/{template}/create-session', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'createFromTemplate'])->name('session-templates.create-session');
    Route::post('/session-templates/{template}/duplicate', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'duplicate'])->name('session-templates.duplicate');
    Route::patch('/session-templates/{template}/toggle-active', [\App\Http\Controllers\Dosen\SessionTemplateController::class, 'toggleActive'])->name('session-templates.toggle-active');
    
    // Notifications
    Route::get('/notifications/create', [\App\Http\Controllers\Dosen\NotificationController::class, 'create'])->name('notifications.create');
    Route::get('/notifications', [\App\Http\Controllers\Dosen\NotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications', [\App\Http\Controllers\Dosen\NotificationController::class, 'store'])->name('notifications.store');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Dosen\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Dosen\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Dosen\NotificationController::class, 'destroy'])->name('notifications.destroy');
    
    // Settings Page (Inertia)
    Route::get('/settings', [\App\Http\Controllers\Dosen\SettingsController::class, 'page'])->name('settings');
    Route::get('/docs', function (\App\Services\DocumentationService $docsService) {
        $dosen = auth()->guard('dosen')->user();
        
        $guides = $docsService->getGuidesWithProgress($dosen, 'dosen');
        $stats = $docsService->getStats($dosen, 'dosen');
        
        return inertia('dosen/docs', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ],
            'guides' => $guides,
            'stats' => $stats
        ]);
    })->name('docs');
    Route::get('/docs/{guideId}', function ($guideId) {
        $dosen = auth()->guard('dosen')->user();
        return inertia('dosen/docs-detail', [
            'guideId' => $guideId,
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ]
        ]);
    })->name('docs.detail');
    
    // Help Center
    Route::get('/help', fn () => inertia('dosen/help'))->name('help');
    Route::get('/help/faqs', [\App\Http\Controllers\Dosen\HelpController::class, 'faqs']);
    Route::get('/help/troubleshooting', [\App\Http\Controllers\Dosen\HelpController::class, 'troubleshooting']);
    Route::get('/help/contact', [\App\Http\Controllers\Dosen\HelpController::class, 'contact']);
    Route::post('/help/feedback', [\App\Http\Controllers\Dosen\HelpController::class, 'submitFeedback']);
    Route::post('/help/faq/{id}/helpful', [\App\Http\Controllers\Dosen\HelpController::class, 'markFaqHelpful']);
    Route::post('/help/faq/{id}/not-helpful', [\App\Http\Controllers\Dosen\HelpController::class, 'markFaqNotHelpful']);
    Route::get('/help/search', [\App\Http\Controllers\Dosen\HelpController::class, 'search']);
});
