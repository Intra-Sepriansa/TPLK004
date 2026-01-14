<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationCenterController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $type = $request->get('type', 'all');
        $status = $request->get('status', 'all');

        $query = AppNotification::orderByDesc('created_at');

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate(20)->withQueryString();

        // Stats
        $stats = [
            'total' => AppNotification::count(),
            'unread' => AppNotification::whereNull('read_at')->count(),
            'scheduled' => AppNotification::whereNotNull('scheduled_at')
                ->where('scheduled_at', '>', now())
                ->count(),
            'by_type' => AppNotification::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];

        return Inertia::render('admin/notification-center', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filters' => [
                'type' => $type,
                'status' => $status,
            ],
            'mahasiswaCount' => Mahasiswa::count(),
            'dosenCount' => Dosen::count(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'target' => 'required|in:all,mahasiswa,dosen,specific',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:reminder,announcement,alert,achievement,warning,info',
            'priority' => 'required|in:low,normal,high,urgent',
            'action_url' => 'nullable|string|max:255',
            'scheduled_at' => 'nullable|date',
        ];

        // Only validate target_ids and target_type when target is 'specific'
        if ($request->input('target') === 'specific') {
            $rules['target_ids'] = 'required|array|min:1';
            $rules['target_ids.*'] = 'integer';
            $rules['target_type'] = 'required|in:mahasiswa,dosen';
        }

        $validated = $request->validate($rules);

        // Get admin ID from the correct guard
        $adminId = null;
        if (auth()->guard('web')->check()) {
            $adminId = auth()->guard('web')->id();
        }

        $options = [
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'action_url' => $validated['action_url'] ?? null,
            'scheduled_at' => !empty($validated['scheduled_at']) ? $validated['scheduled_at'] : null,
            'created_by' => $adminId,
        ];

        $count = 0;

        try {
            if ($validated['target'] === 'all') {
                $this->notificationService->sendToAll(
                    $validated['title'],
                    $validated['message'],
                    $options
                );
                $count = 1;
            } elseif ($validated['target'] === 'mahasiswa') {
                $ids = Mahasiswa::pluck('id')->toArray();
                if (empty($ids)) {
                    return back()->with('success', 'Tidak ada mahasiswa untuk dikirim notifikasi.');
                }
                $count = $this->notificationService->sendBulkToMahasiswa(
                    $ids,
                    $validated['title'],
                    $validated['message'],
                    $options
                );
            } elseif ($validated['target'] === 'dosen') {
                $ids = Dosen::pluck('id')->toArray();
                if (empty($ids)) {
                    return back()->with('success', 'Tidak ada dosen untuk dikirim notifikasi.');
                }
                foreach ($ids as $id) {
                    $this->notificationService->sendToDosen($id, $validated['title'], $validated['message'], $options);
                    $count++;
                }
            } elseif ($validated['target'] === 'specific') {
                if (empty($validated['target_ids'])) {
                    return back()->withErrors(['target_ids' => 'Pilih minimal satu penerima.']);
                }
                foreach ($validated['target_ids'] as $id) {
                    if ($validated['target_type'] === 'mahasiswa') {
                        $this->notificationService->sendToMahasiswa($id, $validated['title'], $validated['message'], $options);
                    } else {
                        $this->notificationService->sendToDosen($id, $validated['title'], $validated['message'], $options);
                    }
                    $count++;
                }
            }

            return back()->with('success', "Notifikasi berhasil dikirim ke {$count} penerima.");
        } catch (\Exception $e) {
            \Log::error('Notification send error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $validated
            ]);
            return back()->withErrors(['error' => 'Gagal mengirim notifikasi: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $notification = AppNotification::findOrFail($id);
        $notification->delete();
        return back()->with('success', 'Notifikasi berhasil dihapus.');
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:app_notifications,id',
        ]);

        AppNotification::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' notifikasi berhasil dihapus.');
    }

    public function templates()
    {
        $templates = [
            [
                'name' => 'Reminder Absensi',
                'title' => '⏰ Jangan Lupa Absen!',
                'message' => 'Kelas akan segera dimulai. Pastikan kamu sudah siap untuk absen.',
                'type' => 'reminder',
                'priority' => 'high',
            ],
            [
                'name' => 'Pengumuman Umum',
                'title' => '📢 Pengumuman',
                'message' => '[Isi pengumuman di sini]',
                'type' => 'announcement',
                'priority' => 'normal',
            ],
            [
                'name' => 'Peringatan Kehadiran',
                'title' => '⚠️ Peringatan Kehadiran',
                'message' => 'Kehadiran kamu sudah mendekati batas minimum. Harap tingkatkan kehadiran.',
                'type' => 'warning',
                'priority' => 'high',
            ],
            [
                'name' => 'Maintenance',
                'title' => '🔧 Maintenance Sistem',
                'message' => 'Sistem akan mengalami maintenance pada [tanggal]. Mohon maaf atas ketidaknyamanannya.',
                'type' => 'info',
                'priority' => 'normal',
            ],
        ];

        return response()->json($templates);
    }
}
