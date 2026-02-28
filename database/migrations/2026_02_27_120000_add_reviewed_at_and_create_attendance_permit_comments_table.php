<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_permits', function (Blueprint $table) {
            if (! Schema::hasColumn('attendance_permits', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('approved_at');
            }
        });

        Schema::create('attendance_permit_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('attendance_permit_id');
            $table->enum('sender_type', ['mahasiswa', 'dosen']);
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_name');
            $table->text('message');
            $table->timestamps();

            $table->foreign('attendance_permit_id')
                ->references('id')
                ->on('attendance_permits')
                ->onDelete('cascade');

            $table->index(['attendance_permit_id', 'created_at']);
            $table->index(['sender_type', 'sender_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_permit_comments');

        Schema::table('attendance_permits', function (Blueprint $table) {
            if (Schema::hasColumn('attendance_permits', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }
        });
    }
};
