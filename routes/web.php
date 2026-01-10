<?php

use App\Http\Controllers\Admin\AttendanceLogController;
use App\Http\Controllers\Admin\AttendanceSessionController;
use App\Http\Controllers\Admin\AttendanceTokenController;
use App\Http\Controllers\Admin\AiAttendanceController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
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
    Route::post('mahasiswa', [MahasiswaController::class, 'store'])->name('mahasiswa.store');
    Route::get('mahasiswa/export.csv', [MahasiswaController::class, 'export'])->name('mahasiswa.export');
    Route::delete('mahasiswa/{mahasiswa}', [MahasiswaController::class, 'destroy'])->name('mahasiswa.destroy');
});

Route::post('login/mahasiswa', [MahasiswaAuthController::class, 'store'])->name('mahasiswa.login');
Route::post('logout/mahasiswa', [MahasiswaAuthController::class, 'destroy'])->name('mahasiswa.logout');

Route::middleware(['auth:mahasiswa'])->group(function () {
    Route::get('user', [AbsensiController::class, 'dashboard'])->name('user.dashboard');
    Route::get('user/dashboard', [AbsensiController::class, 'dashboard'])->name('user.dashboard.alt');
    Route::get('user/absen', [AbsensiController::class, 'create'])->name('user.absen');
    Route::post('user/absen', [AbsensiController::class, 'store'])->name('user.absen.store');
    Route::get('user/rekapan', [AbsensiController::class, 'rekapan'])->name('user.rekapan');
    Route::get('user/bukti-masuk', [AbsensiController::class, 'buktiMasuk'])->name('user.bukti-masuk');
    Route::get('user/history', [AbsensiController::class, 'history'])->name('user.history');
    Route::get('user/achievements', [AbsensiController::class, 'achievements'])->name('user.achievements');
    Route::get('user/profile', [ProfileController::class, 'edit'])->name('user.profile');
    Route::patch('user/profile', [ProfileController::class, 'update'])->name('user.profile.update');
    Route::get('user/password', [PasswordController::class, 'edit'])->name('user.password');
    Route::patch('user/password', [PasswordController::class, 'update'])->name('user.password.update');
});

require __DIR__.'/settings.php';
