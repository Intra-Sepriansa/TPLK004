<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel tugas
        Schema::create('tugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('mata_kuliah')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi');
            $table->text('instruksi')->nullable();
            $table->enum('jenis', ['tugas', 'quiz', 'project', 'presentasi', 'lainnya'])->default('tugas');
            $table->datetime('deadline');
            $table->enum('prioritas', ['rendah', 'sedang', 'tinggi'])->default('sedang');
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
            $table->string('lampiran_url')->nullable();
            $table->string('lampiran_nama')->nullable();
            
            // Creator info - bisa dosen atau admin
            $table->enum('created_by_type', ['dosen', 'admin'])->default('dosen');
            $table->unsignedBigInteger('created_by_id');
            
            // Editor info
            $table->enum('edited_by_type', ['dosen', 'admin'])->nullable();
            $table->unsignedBigInteger('edited_by_id')->nullable();
            $table->datetime('edited_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['course_id', 'status']);
            $table->index(['deadline']);
        });

        // Tabel diskusi/chat tugas
        Schema::create('tugas_diskusi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
            
            // Pengirim - bisa mahasiswa, dosen, atau admin
            $table->enum('sender_type', ['mahasiswa', 'dosen', 'admin']);
            $table->unsignedBigInteger('sender_id');
            
            $table->text('pesan');
            $table->string('lampiran_url')->nullable();
            $table->string('lampiran_nama')->nullable();
            
            // Visibility - public (semua bisa lihat) atau private (hanya pengirim & penerima)
            $table->enum('visibility', ['public', 'private'])->default('public');
            
            // Untuk private message, siapa penerimanya
            $table->enum('recipient_type', ['mahasiswa', 'dosen', 'admin'])->nullable();
            $table->unsignedBigInteger('recipient_id')->nullable();
            
            // Reply to another message
            $table->foreignId('reply_to_id')->nullable()->constrained('tugas_diskusi')->onDelete('set null');
            
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
            
            $table->index(['tugas_id', 'visibility']);
            $table->index(['sender_type', 'sender_id']);
        });

        // Tabel untuk tracking siapa yang sudah baca tugas
        Schema::create('tugas_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
            $table->unsignedBigInteger('mahasiswa_id');
            $table->datetime('read_at');
            
            $table->unique(['tugas_id', 'mahasiswa_id']);
            $table->index(['mahasiswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tugas_reads');
        Schema::dropIfExists('tugas_diskusi');
        Schema::dropIfExists('tugas');
    }
};
