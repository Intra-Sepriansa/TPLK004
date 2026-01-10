<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('dosen', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('dosen', 'nidn')) {
                $table->string('nidn')->unique()->nullable()->after('nama');
            }
            if (!Schema::hasColumn('dosen', 'email')) {
                $table->string('email')->unique()->nullable()->after('nidn');
            }
            if (!Schema::hasColumn('dosen', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('dosen', 'avatar_url')) {
                $table->string('avatar_url')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('dosen', 'password')) {
                $table->string('password')->nullable()->after('avatar_url');
            }
            if (!Schema::hasColumn('dosen', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('password');
            }
            if (!Schema::hasColumn('dosen', 'remember_token')) {
                $table->rememberToken()->after('is_active');
            }
            if (!Schema::hasColumn('dosen', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    public function down(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'nidn', 'email', 'phone', 'avatar_url', 'password', 'is_active', 'remember_token']);
        });
    }
};
