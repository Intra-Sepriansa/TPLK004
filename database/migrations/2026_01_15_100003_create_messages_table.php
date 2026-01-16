<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->string('sender_type'); // User or Mahasiswa
            $table->unsignedBigInteger('sender_id');
            $table->text('content')->nullable();
            $table->enum('type', ['text', 'image', 'file', 'system'])->default('text');
            $table->foreignId('reply_to_id')->nullable()->constrained('messages')->nullOnDelete();
            $table->foreignId('forwarded_from_id')->nullable()->constrained('messages')->nullOnDelete();
            $table->timestamp('edited_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->index('conversation_id');
            $table->index(['sender_type', 'sender_id']);
            $table->index('created_at');
            $table->fullText('content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
