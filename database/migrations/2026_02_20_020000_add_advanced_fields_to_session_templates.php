<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('session_templates', function (Blueprint $table) {
            $table->string('category')->default('regular')->after('description');
            $table->json('tags')->nullable()->after('category');
            $table->integer('qr_refresh_interval')->default(30)->after('duration_minutes');
            $table->integer('allow_late_minutes')->default(15)->after('qr_refresh_interval');
            $table->integer('grace_period_minutes')->default(5)->after('allow_late_minutes');
            $table->boolean('require_selfie')->default(false)->after('grace_period_minutes');
            $table->string('selfie_verification_level')->default('basic')->after('require_selfie');
            $table->boolean('require_location')->default(false)->after('selfie_verification_level');
            $table->integer('location_radius_meters')->default(100)->after('require_location');
            $table->boolean('anti_spoofing')->default(false)->after('location_radius_meters');
            $table->integer('max_attempts')->default(3)->after('anti_spoofing');
            $table->string('auto_activate_time')->nullable()->after('auto_activate');
            $table->boolean('auto_deactivate')->default(false)->after('auto_activate_time');
            $table->string('auto_deactivate_time')->nullable()->after('auto_deactivate');
            $table->boolean('send_reminder')->default(false)->after('auto_deactivate_time');
            $table->integer('reminder_minutes_before')->default(15)->after('send_reminder');
            $table->boolean('is_draft')->default(false)->after('is_active');
            $table->boolean('is_favorite')->default(false)->after('is_draft');
        });
    }

    public function down(): void
    {
        Schema::table('session_templates', function (Blueprint $table) {
            $table->dropColumn([
                'category', 'tags', 'qr_refresh_interval', 'allow_late_minutes',
                'grace_period_minutes', 'require_selfie', 'selfie_verification_level',
                'require_location', 'location_radius_meters', 'anti_spoofing',
                'max_attempts', 'auto_activate_time', 'auto_deactivate',
                'auto_deactivate_time', 'send_reminder', 'reminder_minutes_before',
                'is_draft', 'is_favorite',
            ]);
        });
    }
};
