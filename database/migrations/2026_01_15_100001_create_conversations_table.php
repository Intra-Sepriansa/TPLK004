<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['personal', 'group'])->default('personal');
            $table->string('name')->nullable(); // For group chats
            $table->text('description')->nullable(); // For group chats
            $table->string('avatar_url')->nullable(); // Group avatar
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->string('created_by_type'); // User or Mahasiswa
            $table->unsignedBigInteger('created_by_id');
            $table->timestamps();
            
            $table->index('type');
            $table->index('course_id');
            $table->index(['created_by_type', 'created_by_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
