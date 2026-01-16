<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->string('reactor_type'); // User or Mahasiswa
            $table->unsignedBigInteger('reactor_id');
            $table->string('emoji', 10);
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['message_id', 'reactor_type', 'reactor_id', 'emoji'], 'unique_reaction');
            $table->index('message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reactions');
    }
};
