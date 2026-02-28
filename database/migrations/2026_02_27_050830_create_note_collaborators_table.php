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
        Schema::create('note_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_note_id')->constrained()->onDelete('cascade');
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade');
            $table->enum('role', ['viewer', 'editor'])->default('viewer');
            $table->timestamps();
            
            $table->unique(['academic_note_id', 'mahasiswa_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_collaborators');
    }
};
