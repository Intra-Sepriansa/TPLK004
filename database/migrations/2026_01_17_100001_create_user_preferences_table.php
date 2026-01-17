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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->morphs('preferable'); // preferable_id, preferable_type (Mahasiswa/Dosen/User)
            $table->string('category'); // general, notifications, appearance, privacy, security, data
            $table->json('settings');
            $table->timestamps();

            // Ensure one preference per category per user
            $table->unique(['preferable_id', 'preferable_type', 'category'], 'user_pref_unique');
            
            // Index for faster lookups
            $table->index(['preferable_id', 'preferable_type'], 'user_pref_preferable_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
