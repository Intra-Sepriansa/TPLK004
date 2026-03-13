<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add allow_force_assign to group_assignments
        Schema::table('group_assignments', function (Blueprint $table) {
            $table->boolean('allow_force_assign')->default(true)->after('is_locked');
        });

        // Add force-assign tracking columns to ga_group_members
        Schema::table('ga_group_members', function (Blueprint $table) {
            $table->boolean('is_forced')->default(false)->after('joined_at');
            $table->unsignedBigInteger('forced_by')->nullable()->after('is_forced');
            $table->string('forced_by_type', 20)->nullable()->after('forced_by'); // 'admin' or 'dosen'
            $table->text('forced_reason')->nullable()->after('forced_by_type');
            $table->timestamp('forced_at')->nullable()->after('forced_reason');
        });

        // Create force_assign_logs table for audit trail
        Schema::create('force_assign_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assignment_id');
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('admin_id');
            $table->string('admin_type', 20)->default('admin'); // 'admin' or 'dosen'
            $table->string('action', 30)->default('force_assign'); // 'force_assign', 'auto_assign', 'remove', 'move'
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('assignment_id')->references('id')->on('group_assignments')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['assignment_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('force_assign_logs');

        Schema::table('ga_group_members', function (Blueprint $table) {
            $table->dropColumn(['is_forced', 'forced_by', 'forced_by_type', 'forced_reason', 'forced_at']);
        });

        Schema::table('group_assignments', function (Blueprint $table) {
            $table->dropColumn('allow_force_assign');
        });
    }
};
