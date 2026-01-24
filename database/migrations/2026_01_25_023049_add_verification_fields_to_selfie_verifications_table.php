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
        Schema::table('selfie_verifications', function (Blueprint $table) {
            if (!Schema::hasColumn('selfie_verifications', 'verified_by_type')) {
                $table->string('verified_by_type')->nullable()->after('verified_by'); // 'admin' or 'dosen'
            }
            if (!Schema::hasColumn('selfie_verifications', 'verified_by_name')) {
                $table->string('verified_by_name')->nullable()->after('verified_by_type');
            }
            if (!Schema::hasColumn('selfie_verifications', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verified_by_name');
            }
            if (!Schema::hasColumn('selfie_verifications', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('verified_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('selfie_verifications', function (Blueprint $table) {
            $table->dropColumn(['verified_by_type', 'verified_by_name', 'verified_at', 'rejection_reason']);
        });
    }
};
