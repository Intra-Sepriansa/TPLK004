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
    Route::post('/verify/quick-verify', [VerificationController::class, 'quickVerify'])->name('verify.quick-verify');
    Route::post('/verify/ai-auto-verify', [VerificationController::class, 'aiAutoVerify'])->name('verify.ai-auto-verify');
    Route::post('/verify/export', [VerificationController::class, 'export'])->name('verify.export');
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
    Route::get('/tugas/create', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'index'])->name('tugas.create');
    Route::post('/tugas/create', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'store'])->name('tugas.create.store');
    Route::post('/tugas/create/bulk', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'bulkStore'])->name('tugas.create.bulk-store');
    Route::post('/tugas/create/bulk/preview', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'bulkPreview'])->name('tugas.create.bulk-preview');
    Route::post('/tugas/create/bulk/import', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'bulkImport'])->name('tugas.create.bulk-import');
    Route::get('/tugas/create/bulk/template', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'downloadTemplate'])->name('tugas.create.bulk-template');
    Route::post('/tugas/create/upload', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'uploadAttachment'])->name('tugas.create.upload');
    Route::post('/tugas/create/ai/suggest-title', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'suggestTitle'])->name('tugas.create.ai.suggest-title');
    Route::post('/tugas/create/ai/generate-description', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'generateDescription'])->name('tugas.create.ai.generate-description');
    Route::post('/tugas/create/ai/predict-deadline', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'predictDeadline'])->name('tugas.create.ai.predict-deadline');
    Route::get('/tugas/create/templates', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'templates'])->name('tugas.create.templates.index');
    Route::post('/tugas/create/templates', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'saveTemplate'])->name('tugas.create.templates.store');
    Route::post('/tugas/create/templates/{id}/apply', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'applyTemplate'])->name('tugas.create.templates.apply');
    Route::patch('/tugas/create/templates/{id}/favorite', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'toggleTemplateFavorite'])->name('tugas.create.templates.favorite');
    Route::delete('/tugas/create/templates/{id}', [\App\Http\Controllers\Dosen\TugasCreateController::class, 'deleteTemplate'])->name('tugas.create.templates.destroy');
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
    Route::post('/permits/{permit}/comment', [\App\Http\Controllers\Dosen\PermitController::class, 'addComment'])->name('permits.comment');
    Route::post('/permits/bulk-approve', [\App\Http\Controllers\Dosen\PermitController::class, 'bulkApprove'])->name('permits.bulk-approve');
    
    // Grading
    Route::get('/grading', [\App\Http\Controllers\Dosen\GradingController::class, 'index'])->name('grading');
    Route::get('/grading/export', [\App\Http\Controllers\Dosen\GradingController::class, 'export'])->name('grading.export');
    Route::get('/grading/export-pdf', [\App\Http\Controllers\Dosen\GradingController::class, 'exportPdf'])->name('grading.export-pdf');
    Route::get('/grading/student/{mahasiswaId}', [\App\Http\Controllers\Dosen\GradingController::class, 'studentReport'])->name('grading.student');
    Route::post('/grading/override', [\App\Http\Controllers\Dosen\GradingController::class, 'override'])->name('grading.override');
    
    // Grading Detail (Individual Student)
    Route::get('/grading/detail/{mahasiswaId}', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'show'])->name('grading.detail');
    Route::get('/grading/detail/{mahasiswaId}/export', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'export'])->name('grading.detail.export');
    Route::get('/grading/detail/{mahasiswaId}/print', [\App\Http\Controllers\Dosen\GradingDetailController::class, 'printView'])->name('grading.detail.print');
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
    Route::get('/docs', function (\App\Services\DocumentationService $documentationService) {
        $dosen = auth()->guard('dosen')->user();
        abort_if(!$dosen, 403);
        
        $guides = $documentationService->getGuidesWithProgress($dosen, 'dosen')->values();
        $stats = $documentationService->getStats($dosen, 'dosen');
        
        return inertia('dosen/docs', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ],
            'guides' => $guides,
            'stats' => $stats,
            'categories' => $guides->pluck('category')->unique()->values(),
        ]);
    })->name('docs');
    
    Route::get('/docs/{guideId}', function (\App\Services\DocumentationService $documentationService, string $guideId) {
        $dosen = auth()->guard('dosen')->user();
        abort_if(!$dosen, 403);

        $guide = $documentationService->getGuide($guideId, 'dosen');
        abort_if(!$guide, 404);

        $progress = $documentationService->getGuideProgress($dosen, $guideId);
        $completedSections = $progress?->completed_sections ?? [];

        $guideWithProgress = array_merge($guide, [
            'progress' => [
                'completed_sections' => $completedSections,
                'is_completed' => $progress?->is_completed ?? false,
                'completion_percentage' => $progress?->getCompletionPercentage() ?? 0,
            ],
        ]);

        $relatedGuides = $documentationService
            ->getGuidesWithProgress($dosen, 'dosen')
            ->filter(fn ($item) => $item['id'] !== $guideId && $item['category'] === ($guide['category'] ?? null))
            ->take(4)
            ->values();

        return inertia('dosen/docs-detail', [
            'guide' => $guideWithProgress,
            'relatedGuides' => $relatedGuides,
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ],
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
    
    // Tugas Kelompok (Group Assignments)
    Route::get('/tugas-kelompok', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'index'])->name('tugas-kelompok');
    Route::get('/tugas-kelompok/create', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'create'])->name('tugas-kelompok.create');
    Route::post('/tugas-kelompok', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'store'])->name('tugas-kelompok.store');
    Route::get('/tugas-kelompok/{id}', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'show'])->name('tugas-kelompok.show');
    Route::delete('/tugas-kelompok/{id}', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'destroy'])->name('tugas-kelompok.destroy');
    Route::post('/tugas-kelompok/{id}/random-groups', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'formRandomGroups'])->name('tugas-kelompok.random-groups');
    Route::post('/tugas-kelompok/{id}/assign-student', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'assignStudentToGroup'])->name('tugas-kelompok.assign-student');
    Route::post('/tugas-kelompok/{id}/create-group', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'createGroup'])->name('tugas-kelompok.create-group');
    Route::patch('/tugas-kelompok/{id}/toggle-lock', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'toggleLock'])->name('tugas-kelompok.toggle-lock');
    Route::post('/tugas-kelompok/{id}/grade', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'gradeSubmission'])->name('tugas-kelompok.grade');
    Route::post('/tugas-kelompok/{id}/conflicts/{reportId}/resolve', [\App\Http\Controllers\Dosen\TugasKelompokController::class, 'resolveConflict'])->name('tugas-kelompok.resolve-conflict');
});
