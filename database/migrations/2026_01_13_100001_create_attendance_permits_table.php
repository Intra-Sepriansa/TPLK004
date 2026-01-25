<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel untuk izin/sakit mahasiswa
        Schema::create('attendance_permits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('attendance_session_id');
            $table->enum('type', ['izin', 'sakit'])->default('izin');
            $table->text('reason'); // Alasan izin/sakit
            $table->string('attachment')->nullable(); // File surat keterangan
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('attendance_session_id')->references('id')->on('attendance_sessions')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('dosen')->onDelete('set null');
            
            $table->index(['mahasiswa_id', 'attendance_session_id']);
            $table->index('status');
        });

        // Tabel untuk menyimpan nilai keaktifan mahasiswa per mata kuliah
        Schema::create('student_activity_scores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('mata_kuliah_id');
            
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('mata_kuliah_id')->references('id')->on('mata_kuliah')->onDelete('cascade');
            $table->integer('total_sessions')->default(0);
            $table->integer('present_count')->default(0);
            $table->integer('late_count')->default(0);
            $table->integer('permit_count')->default(0);
            $table->integer('absent_count')->default(0);
            $table->decimal('attendance_percentage', 5, 2)->default(0);
            $table->decimal('activity_score', 5, 2)->default(0);
            $table->enum('risk_status', ['safe', 'warning', 'danger'])->default('safe');
            $table->timestamps();

            $table->unique(['mahasiswa_id', 'mata_kuliah_id']);
            $table->index('risk_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_activity_scores');
        Schema::dropIfExists('attendance_permits');
    }
};
