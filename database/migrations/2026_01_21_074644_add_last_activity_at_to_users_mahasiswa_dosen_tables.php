<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable();
            }
        });

        Schema::table('mahasiswa', function (Blueprint $table) {
            if (!Schema::hasColumn('mahasiswa', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable();
            }
        });

        Schema::table('dosen', function (Blueprint $table) {
            if (!Schema::hasColumn('dosen', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_activity_at');
        });

        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropColumn('last_activity_at');
        });

        Schema::table('dosen', function (Blueprint $table) {
            $table->dropColumn('last_activity_at');
        });
    }
};
