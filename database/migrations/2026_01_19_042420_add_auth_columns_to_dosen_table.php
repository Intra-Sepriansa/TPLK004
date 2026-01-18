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
        Schema::table('dosen', function (Blueprint $table) {
            if (!Schema::hasColumn('dosen', 'nidn')) {
                $table->string('nidn', 20)->nullable()->after('nama');
            }
            if (!Schema::hasColumn('dosen', 'email')) {
                $table->string('email', 100)->nullable()->after('nidn');
            }
            if (!Schema::hasColumn('dosen', 'password')) {
                $table->string('password')->nullable()->after('email');
            }
            if (!Schema::hasColumn('dosen', 'remember_token')) {
                $table->string('remember_token', 100)->nullable()->after('password');
            }
            if (!Schema::hasColumn('dosen', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (!Schema::hasColumn('dosen', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->dropColumn(['nidn', 'email', 'password', 'remember_token', 'created_at', 'updated_at']);
        });
    }
};
