<?php

use App\Http\Controllers\Auth\DosenAuthController;
use App\Http\Controllers\Dosen\CourseController;
use App\Http\Controllers\Dosen\DashboardController;
use App\Http\Controllers\Dosen\ProfileController;
use App\Http\Controllers\Dosen\RekapanController;
use App\Http\Controllers\Dosen\SessionController;
use App\Http\Controllers\Dosen\VerificationController;
use Illuminate\Support\Facades\Route;

// Dosen Auth Routes
Route::get('dosen/login', [DosenAuthController::class, 'create'])->name('dosen.login');
Route::post('dosen/login', [DosenAuthController::class, 'store']);
Route::post('dosen/logout', [DosenAuthController::class, 'destroy'])->name('dosen.logout');

// Dosen Protected Routes
Route::middleware(['auth:dosen'])->prefix('dosen')->name('dosen.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.alt');

    // Courses
    Route::get('/courses', [CourseController::class, 'index'])->name('courses');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/courses/{course}/students', [CourseController::class, 'students'])->name('courses.students');
    Route::get('/courses/{course}/students/{mahasiswa}', [CourseController::class, 'studentDetail'])->name('courses.student-detail');

    // Sessions
    Route::post('/sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');
    Route::patch('/sessions/{session}/activate', [SessionController::class, 'activate'])->name('sessions.activate');
    Route::patch('/sessions/{session}/close', [SessionController::class, 'close'])->name('sessions.close');
    Route::patch('/sessions/{session}/regenerate-qr', [SessionController::class, 'regenerateQr'])->name('sessions.regenerate-qr');

    // Verification
    Route::get('/verify', [VerificationController::class, 'index'])->name('verify');
    Route::patch('/verify/{verification}/approve', [VerificationController::class, 'approve'])->name('verify.approve');
    Route::patch('/verify/{verification}/reject', [VerificationController::class, 'reject'])->name('verify.reject');

    // Rekapan
    Route::get('/rekapan', [RekapanController::class, 'index'])->name('rekapan');
    Route::get('/rekapan/pdf', [RekapanController::class, 'exportPdf'])->name('rekapan.pdf');

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
    Route::patch('/permits/{permit}/approve', [\App\Http\Controllers\Dosen\PermitController::class, 'approve'])->name('permits.approve');
    Route::patch('/permits/{permit}/reject', [\App\Http\Controllers\Dosen\PermitController::class, 'reject'])->name('permits.reject');
    Route::post('/permits/bulk-approve', [\App\Http\Controllers\Dosen\PermitController::class, 'bulkApprove'])->name('permits.bulk-approve');
});
