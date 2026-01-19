<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('help_feedback', function (Blueprint $table) {
            $table->id();
            $table->string('user_type'); // dosen, mahasiswa, admin
            $table->unsignedBigInteger('user_id');
            $table->string('user_name');
            $table->string('user_email');
            $table->string('category')->default('general'); // general, bug, feature, question
            $table->string('subject');
            $table->text('message');
            $table->string('status')->default('pending'); // pending, replied, closed
            $table->text('admin_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('help_feedback');
    }
};
