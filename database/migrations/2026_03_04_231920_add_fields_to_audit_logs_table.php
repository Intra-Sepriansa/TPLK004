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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('severity')->default('medium');
            $table->string('status')->default('open');
            $table->integer('security_score')->default(50);
            $table->string('threat_level')->default('medium');
            $table->json('device_info')->nullable();
            $table->json('network_info')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn([
                'severity',
                'status',
                'security_score',
                'threat_level',
                'device_info',
                'network_info'
            ]);
        });
    }
};
