<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add starred messages table
        Schema::create('starred_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->string('user_type');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            
            $table->unique(['message_id', 'user_type', 'user_id'], 'unique_starred');
            $table->index(['user_type', 'user_id']);
        });

        // Add pinned messages table
        Schema::create('pinned_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->string('pinned_by_type');
            $table->unsignedBigInteger('pinned_by_id');
            $table->timestamps();
            
            $table->unique(['conversation_id', 'message_id'], 'unique_pinned');
        });

        // Add is_pinned and is_archived to conversation_participants
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->boolean('is_pinned')->default(false)->after('is_muted');
            $table->boolean('is_archived')->default(false)->after('is_pinned');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pinned_messages');
        Schema::dropIfExists('starred_messages');
        
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->dropColumn(['is_pinned', 'is_archived']);
        });
    }
};
