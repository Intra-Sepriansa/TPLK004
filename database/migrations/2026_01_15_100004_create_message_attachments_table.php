<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path', 500);
            $table->string('file_type', 50);
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type', 100);
            $table->timestamps();
            
            $table->index('message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
    }
};
