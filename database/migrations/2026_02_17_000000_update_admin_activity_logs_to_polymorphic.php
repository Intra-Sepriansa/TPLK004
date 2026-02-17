<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admin_activity_logs', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['user_id']);
            
            // Add user_type column
            $table->string('user_type')->after('user_id')->nullable();
        });

        // Set default user_type for existing records (assuming they are all App\Models\User)
        DB::statement("UPDATE admin_activity_logs SET user_type = 'App\\\\Models\\\\User' WHERE user_type IS NULL");

        Schema::table('admin_activity_logs', function (Blueprint $table) {
            // Make user_type not null after populating data
            $table->string('user_type')->nullable(false)->change();
            
            // Add index for polymorphic relationship
            $table->index(['user_type', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admin_activity_logs', function (Blueprint $table) {
            $table->dropIndex(['user_type', 'user_id']);
            $table->dropColumn('user_type');
            
            // Re-add foreign key (might fail if there are non-User records)
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
