<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_online_status', function (Blueprint $table) {
            $table->id();
            $table->string('user_type'); // User or Mahasiswa
            $table->unsignedBigInteger('user_id');
            $table->boolean('is_online')->default(false);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            
            $table->unique(['user_type', 'user_id'], 'unique_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_online_status');
    }
};
