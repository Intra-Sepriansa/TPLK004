<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->string('fakultas', 100)->nullable()->after('nim');
            $table->string('prodi', 100)->nullable()->after('fakultas');
            $table->string('kelas', 20)->nullable()->after('prodi');
            $table->enum('jenis_reguler', ['Reguler A', 'Reguler B', 'Reguler C'])->nullable()->after('kelas');
            $table->string('semester', 10)->nullable()->after('jenis_reguler');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropColumn(['fakultas', 'prodi', 'kelas', 'jenis_reguler', 'semester']);
        });
    }
};
