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
        Schema::create('audit_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_log_id')->constrained()->onDelete('cascade');
            $table->string('action_type');
            $table->text('description')->nullable();
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_actions');
    }
};
