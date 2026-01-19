<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    /**
     * Show settings page
     */
    public function page()
    {
        $dosen = auth()->guard('dosen')->user();
        
        return inertia('dosen/settings', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ]
        ]);
    }

    /**
     * Get dosen settings
     */
    public function index()
    {
        $dosen = auth()->guard('dosen')->user();
        
        // Get settings from cache or database
        $settings = Cache::remember("dosen_settings_{$dosen->id}", 3600, function () use ($dosen) {
            $dosenSettings = $dosen->settings ?? [];
            
            return [
                'general' => [
                    'language' => $dosenSettings['language'] ?? 'id',
                    'timezone' => $dosenSettings['timezone'] ?? 'Asia/Jakarta',
                    'dateFormat' => $dosenSettings['dateFormat'] ?? 'DD/MM/YYYY',
                ],
                'teaching' => [
                    'autoApproveAttendance' => $dosenSettings['autoApproveAttendance'] ?? true,
                    'strictGradingMode' => $dosenSettings['strictGradingMode'] ?? false,
                ],
                'classManagement' => [
                    'lateLimit' => $dosenSettings['lateLimit'] ?? 15,
                    'minimumAttendance' => $dosenSettings['minimumAttendance'] ?? 75,
                ],
                'notifications' => [
                    'emailNewAttendance' => $dosenSettings['emailNewAttendance'] ?? true,
                    'emailPermitRequest' => $dosenSettings['emailPermitRequest'] ?? true,
                ],
                'privacy' => [
                    'publicProfile' => $dosenSettings['publicProfile'] ?? true,
                    'anonymousAnalytics' => $dosenSettings['anonymousAnalytics'] ?? false,
                ],
            ];
        });

        return response()->json($settings);
    }

    /**
     * Update general settings
     */
    public function updateGeneral(Request $request)
    {
        $validated = $request->validate([
            'language' => 'required|in:id,en',
            'timezone' => 'required|string',
            'dateFormat' => 'required|string',
        ]);

        $dosen = auth()->guard('dosen')->user();
        $settings = $dosen->settings ?? [];
        $settings = array_merge($settings, $validated);
        
        $dosen->update(['settings' => $settings]);
        Cache::forget("dosen_settings_{$dosen->id}");

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan umum berhasil disimpan',
            'settings' => $validated
        ]);
    }

    /**
     * Update teaching settings
     */
    public function updateTeaching(Request $request)
    {
        $validated = $request->validate([
            'autoApproveAttendance' => 'required|boolean',
            'strictGradingMode' => 'required|boolean',
        ]);

        $dosen = auth()->guard('dosen')->user();
        $settings = $dosen->settings ?? [];
        $settings = array_merge($settings, $validated);
        
        $dosen->update(['settings' => $settings]);
        Cache::forget("dosen_settings_{$dosen->id}");

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan pengajaran berhasil disimpan',
            'settings' => $validated
        ]);
    }

    /**
     * Update class management settings
     */
    public function updateClassManagement(Request $request)
    {
        $validated = $request->validate([
            'lateLimit' => 'required|integer|min:0|max:60',
            'minimumAttendance' => 'required|integer|min:0|max:100',
        ]);

        $dosen = auth()->guard('dosen')->user();
        $settings = $dosen->settings ?? [];
        $settings = array_merge($settings, $validated);
        
        $dosen->update(['settings' => $settings]);
        Cache::forget("dosen_settings_{$dosen->id}");

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan manajemen kelas berhasil disimpan',
            'settings' => $validated
        ]);
    }

    /**
     * Update notification settings
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'emailNewAttendance' => 'required|boolean',
            'emailPermitRequest' => 'required|boolean',
        ]);

        $dosen = auth()->guard('dosen')->user();
        $settings = $dosen->settings ?? [];
        $settings = array_merge($settings, $validated);
        
        $dosen->update(['settings' => $settings]);
        Cache::forget("dosen_settings_{$dosen->id}");

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan notifikasi berhasil disimpan',
            'settings' => $validated
        ]);
    }

    /**
     * Update privacy settings
     */
    public function updatePrivacy(Request $request)
    {
        $validated = $request->validate([
            'publicProfile' => 'required|boolean',
            'anonymousAnalytics' => 'required|boolean',
        ]);

        $dosen = auth()->guard('dosen')->user();
        $settings = $dosen->settings ?? [];
        $settings = array_merge($settings, $validated);
        
        $dosen->update(['settings' => $settings]);
        Cache::forget("dosen_settings_{$dosen->id}");

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan privasi berhasil disimpan',
            'settings' => $validated
        ]);
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $dosen = auth()->guard('dosen')->user();

        if (!Hash::check($validated['current_password'], $dosen->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak sesuai'
            ], 422);
        }

        $dosen->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah'
        ]);
    }

    /**
     * Reset all settings to default
     */
    public function reset()
    {
        $dosen = auth()->guard('dosen')->user();
        
        $defaultSettings = [
            'language' => 'id',
            'timezone' => 'Asia/Jakarta',
            'dateFormat' => 'DD/MM/YYYY',
            'autoApproveAttendance' => true,
            'strictGradingMode' => false,
            'lateLimit' => 15,
            'minimumAttendance' => 75,
            'emailNewAttendance' => true,
            'emailPermitRequest' => true,
            'publicProfile' => true,
            'anonymousAnalytics' => false,
        ];

        $dosen->update(['settings' => $defaultSettings]);
        Cache::forget("dosen_settings_{$dosen->id}");

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan berhasil direset ke default',
            'settings' => $defaultSettings
        ]);
    }

    /**
     * Export settings data
     */
    public function export()
    {
        $dosen = auth()->guard('dosen')->user();
        
        $data = [
            'dosen' => [
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ],
            'settings' => $dosen->settings ?? [],
            'exported_at' => now()->toIso8601String(),
        ];

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="dosen-settings-' . $dosen->nidn . '.json"');
    }

    /**
     * Export settings as PDF
     */
    public function exportPdf()
    {
        $dosen = auth()->guard('dosen')->user();
        $settings = $dosen->settings ?? [];
        
        // Prepare data for PDF
        $data = [
            'dosen' => $dosen,
            'settings' => [
                'general' => [
                    'language' => $settings['language'] ?? 'id',
                    'timezone' => $settings['timezone'] ?? 'Asia/Jakarta',
                    'dateFormat' => $settings['dateFormat'] ?? 'DD/MM/YYYY',
                ],
                'teaching' => [
                    'autoApproveAttendance' => $settings['autoApproveAttendance'] ?? true,
                    'strictGradingMode' => $settings['strictGradingMode'] ?? false,
                ],
                'classManagement' => [
                    'lateLimit' => $settings['lateLimit'] ?? 15,
                    'minimumAttendance' => $settings['minimumAttendance'] ?? 75,
                ],
                'notifications' => [
                    'emailNewAttendance' => $settings['emailNewAttendance'] ?? true,
                    'emailPermitRequest' => $settings['emailPermitRequest'] ?? true,
                ],
                'privacy' => [
                    'publicProfile' => $settings['publicProfile'] ?? true,
                    'anonymousAnalytics' => $settings['anonymousAnalytics'] ?? false,
                ],
            ],
            'exported_at' => now()->format('d F Y H:i:s'),
        ];

        $pdf = \PDF::loadView('pdf.dosen-settings', $data);
        
        return $pdf->download('pengaturan-dosen-' . $dosen->nidn . '.pdf');
    }
}
