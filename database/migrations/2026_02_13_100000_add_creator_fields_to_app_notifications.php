<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->string('created_by_type')->nullable()->after('created_by'); // 'admin', 'dosen', 'system'
            $table->unsignedBigInteger('created_by_id')->nullable()->after('created_by_type');
            $table->json('metadata')->nullable()->after('data'); // Additional data like course info
        });
    }

    public function down(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropColumn(['created_by_type', 'created_by_id', 'metadata']);
        });
    }
};
