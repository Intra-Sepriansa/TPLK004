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
        if (Schema::hasTable('help_faq_votes')) {
            return;
        }

        Schema::create('help_faq_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('faq_id');
            $table->string('user_type', 30);
            $table->unsignedBigInteger('user_id');
            $table->enum('vote_type', ['helpful', 'not_helpful']);
            $table->timestamps();

            $table->index('faq_id');
            $table->index(['user_type', 'user_id'], 'help_faq_votes_user_idx');
            $table->unique(['faq_id', 'user_type', 'user_id'], 'help_faq_votes_unique_vote_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('help_faq_votes');
    }
};

