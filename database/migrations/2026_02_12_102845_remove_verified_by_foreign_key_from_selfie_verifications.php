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
            // Drop the foreign key constraint
            $table->dropForeign(['verified_by']);
            
            // Change verified_by to unsignedBigInteger without foreign key
            // This allows it to reference either users.id or dosen.id
            $table->unsignedBigInteger('verified_by')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('selfie_verifications', function (Blueprint $table) {
            // Re-add the foreign key constraint to users table
            $table->foreign('verified_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }
};
