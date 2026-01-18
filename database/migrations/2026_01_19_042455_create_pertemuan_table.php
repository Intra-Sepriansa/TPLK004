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
        if (!Schema::hasTable('pertemuan')) {
            Schema::create('pertemuan', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mata_kuliah_id');
                $table->tinyInteger('pertemuan_ke');
                $table->date('tanggal')->nullable();
                $table->string('topik')->nullable();
                $table->enum('status', ['BELUM', 'HADIR', 'LIBUR'])->default('BELUM');
                
                $table->unique(['mata_kuliah_id', 'pertemuan_ke']);
                $table->foreign('mata_kuliah_id')->references('id')->on('mata_kuliah')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pertemuan');
    }
};
