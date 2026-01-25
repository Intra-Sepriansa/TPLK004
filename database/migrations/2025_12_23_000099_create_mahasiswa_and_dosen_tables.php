<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create mahasiswa table first
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->id();
            $table->string('nim')->unique();
            $table->string('nama');
            $table->string('email')->nullable();
            $table->string('fakultas')->nullable();
            $table->string('kelas')->nullable();
            $table->string('password');
            $table->string('avatar_url')->nullable();
            $table->string('phone')->nullable();
            $table->rememberToken();
            $table->timestamp('last_activity_at')->nullable();
            $table->string('theme_preference')->default('system');
            $table->timestamps();
        });

        // Create dosen table
        Schema::create('dosen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('nidn')->unique();
            $table->string('nama');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('password');
            $table->json('settings')->nullable();
            $table->rememberToken();
            $table->timestamp('last_activity_at')->nullable();
            $table->string('theme_preference')->default('system');
            $table->timestamps();
        });

        // Create mata_kuliah table
        Schema::create('mata_kuliah', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kode')->nullable();
            $table->integer('sks')->default(3);
            $table->unsignedBigInteger('dosen_id')->nullable();
            $table->timestamps();
            
            $table->foreign('dosen_id')->references('id')->on('dosen')->nullOnDelete();
        });

        // Create pertemuan table
        Schema::create('pertemuan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mata_kuliah_id');
            $table->integer('pertemuan_ke');
            $table->date('tanggal')->nullable();
            $table->string('topik')->nullable();
            $table->enum('status', ['BELUM', 'SELESAI'])->default('BELUM');
            $table->timestamps();
            
            $table->foreign('mata_kuliah_id')->references('id')->on('mata_kuliah')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pertemuan');
        Schema::dropIfExists('mata_kuliah');
        Schema::dropIfExists('dosen');
        Schema::dropIfExists('mahasiswa');
    }
};
