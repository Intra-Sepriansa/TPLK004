<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->timestamps();
        });

        DB::table('settings')->insert([
            [
                'key' => 'token_ttl_seconds',
                'value' => '180',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'geofence_lat',
                'value' => '-6.3460957',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'geofence_lng',
                'value' => '106.6915144',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'geofence_radius_m',
                'value' => '100',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'late_minutes',
                'value' => '10',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'selfie_required',
                'value' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
