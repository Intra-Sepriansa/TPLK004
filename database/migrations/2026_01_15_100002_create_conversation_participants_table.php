<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->string('participant_type'); // User or Mahasiswa
            $table->unsignedBigInteger('participant_id');
            $table->enum('role', ['admin', 'member'])->default('member');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('last_read_at')->nullable();
            $table->boolean('is_muted')->default(false);
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();
            
            $table->unique(['conversation_id', 'participant_type', 'participant_id'], 'unique_participant');
            $table->index(['participant_type', 'participant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_participants');
    }
};
