<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ga_invitations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('inviter_id');
            $table->unsignedBigInteger('invitee_id');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('inviter_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('invitee_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['invitee_id', 'status']);
            $table->index(['group_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ga_invitations');
    }
};
