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
        // Add theme_preference to users table
        Schema::table('users', function (Blueprint $table) {
            $table->enum('theme_preference', ['light', 'dark', 'auto'])->default('light')->after('remember_token');
        });

        // Add theme_preference to mahasiswa table
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->enum('theme_preference', ['light', 'dark', 'auto'])->default('light')->after('remember_token');
        });

        // Add theme_preference to dosen table
        Schema::table('dosen', function (Blueprint $table) {
            $table->enum('theme_preference', ['light', 'dark', 'auto'])->default('light')->after('remember_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('theme_preference');
        });

        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropColumn('theme_preference');
        });

        Schema::table('dosen', function (Blueprint $table) {
            $table->dropColumn('theme_preference');
        });
    }
};
