<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'token_ttl_seconds' => '180',
            'geofence_lat' => '-6.3460957',
            'geofence_lng' => '106.6915144',
            'geofence_radius_m' => '100',
            'late_minutes' => '10',
            'selfie_required' => '1',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
