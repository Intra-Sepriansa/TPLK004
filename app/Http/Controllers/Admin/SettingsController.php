<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token_ttl_seconds' => ['required', 'integer', 'min:10', 'max:300'],
            'late_minutes' => ['required', 'integer', 'min:0', 'max:120'],
            'selfie_required' => ['nullable', 'boolean'],
            'notify_rejected' => ['nullable', 'boolean'],
            'notify_selfie_blur' => ['nullable', 'boolean'],
        ]);

        Setting::setValue('token_ttl_seconds', (string) $validated['token_ttl_seconds']);
        Setting::setValue('late_minutes', (string) $validated['late_minutes']);
        Setting::setValue('selfie_required', ! empty($validated['selfie_required']) ? '1' : '0');
        Setting::setValue('notify_rejected', ! empty($validated['notify_rejected']) ? '1' : '0');
        Setting::setValue('notify_selfie_blur', ! empty($validated['notify_selfie_blur']) ? '1' : '0');

        return back()->with('success', 'Pengaturan disimpan.');
    }

    public function updateGeofence(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'geofence_lat' => ['required', 'numeric'],
            'geofence_lng' => ['required', 'numeric'],
            'geofence_radius_m' => ['required', 'integer', 'min:10', 'max:2000'],
        ]);

        Setting::setValue('geofence_lat', (string) $validated['geofence_lat']);
        Setting::setValue('geofence_lng', (string) $validated['geofence_lng']);
        Setting::setValue('geofence_radius_m', (string) $validated['geofence_radius_m']);

        return back()->with('success', 'Geofence diperbarui.');
    }
}
