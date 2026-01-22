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
        Schema::create('scheduled_reports', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('template_id');
            $table->json('criteria')->nullable();
            $table->json('recipients'); // Email addresses
            $table->enum('frequency', ['daily', 'weekly', 'monthly']);
            $table->enum('format', ['pdf', 'excel', 'csv', 'json'])->default('pdf');
            $table->timestamp('next_run_at')->nullable();
            $table->timestamp('last_run_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('run_count')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->index('next_run_at');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_reports');
    }
};
