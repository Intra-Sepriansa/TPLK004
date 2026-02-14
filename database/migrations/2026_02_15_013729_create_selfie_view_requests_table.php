<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('selfie_view_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selfie_verification_id')->constrained('selfie_verifications')->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->text('response_note')->nullable();
            $table->timestamps();
            
            $table->index(['mahasiswa_id', 'status']);
            $table->index(['selfie_verification_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('selfie_view_requests');
    }
};
