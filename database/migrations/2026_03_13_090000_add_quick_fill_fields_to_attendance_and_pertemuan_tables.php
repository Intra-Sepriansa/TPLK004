<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_sessions', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
        });

        Schema::table('pertemuan', function (Blueprint $table) {
            if (!Schema::hasColumn('pertemuan', 'deskripsi')) {
                $table->text('deskripsi')->nullable()->after('topik');
            }

            if (!Schema::hasColumn('pertemuan', 'mode')) {
                $table->string('mode', 20)->nullable()->after('deskripsi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('attendance_sessions', 'description')) {
                $table->dropColumn('description');
            }
        });

        Schema::table('pertemuan', function (Blueprint $table) {
            if (Schema::hasColumn('pertemuan', 'mode')) {
                $table->dropColumn('mode');
            }

            if (Schema::hasColumn('pertemuan', 'deskripsi')) {
                $table->dropColumn('deskripsi');
            }
        });
    }
};
