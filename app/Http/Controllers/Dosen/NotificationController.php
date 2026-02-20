<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function create()
    {
        $dosen = Auth::guard('dosen')->user();

        if (!$dosen) {
            return redirect()->route('login');
        }

        // Get courses taught by this dosen with mahasiswa count
        $courses = \App\Models\MataKuliah::where('dosen_id', $dosen->id)
            ->get()
            ->map(function ($course) {
                $count = \App\Models\Mahasiswa::count(); // all mahasiswa for now
                return [
                    'id' => $course->id,
                    'nama' => $course->nama,
                    'kode' => $course->id, // use id as code fallback
                    'mahasiswa_count' => $count,
                ];
            });

        // Get all mahasiswa (accessible by this dosen)
        $mahasiswa = \App\Models\Mahasiswa::all()->map(function ($m) {
            return [
                'id' => $m->id,
                'nama' => $m->nama,
                'nim' => $m->nim,
                'kelas' => $m->kelas ?? '-',
            ];
        });

        // Get notification templates
        $templates = \App\Models\NotificationTemplate::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'type' => $t->type,
                    'title' => $t->subject,
                    'message' => $t->body,
                    'usage_count' => 0,
                ];
            });

        return Inertia::render('dosen/notification-detail', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ],
            'courses' => $courses,
            'mahasiswa' => $mahasiswa,
            'templates' => $templates,
        ]);
    }

    public function index()
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('login');
        }

        // 1. Received Notifications (Paginated)
        $receivedQuery = AppNotification::forUser('dosen', $dosen->id)
            ->orderByDesc('created_at');
            
        $totalReceived = $receivedQuery->count();
        $unreadCount = (clone $receivedQuery)->unread()->count();
        $notifications = $receivedQuery->paginate(20, ['*'], 'page');

        // 2. Sent Notifications (Paginated)
        $sentQuery = AppNotification::where('created_by_type', 'dosen')
            ->where('created_by_id', $dosen->id)
            ->orderByDesc('created_at');
            
        $sentNotifications = $sentQuery->paginate(20, ['*'], 'sent_page');

        // 3. Stats Calculation
        $now = now();
        $stats = [
            'total' => $totalReceived,
            'unread' => $unreadCount,
            'read' => $totalReceived - $unreadCount,
            'sent_today' => (clone $sentQuery)->whereDate('created_at', $now->toDateString())->count(),
            'sent_this_week' => (clone $sentQuery)->whereBetween('created_at', [$now->startOfWeek(), $now->copy()->endOfWeek()])->count(),
            'sent_this_month' => (clone $sentQuery)->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->count(),
        ];

        // 4. Courses and Mahasiswa
        $courses = \App\Models\MataKuliah::where('dosen_id', $dosen->id)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'nama' => $c->nama,
                    'kode' => $c->id,
                ];
            });
            
        $mahasiswa = \App\Models\Mahasiswa::select('id', 'nama', 'nim')->get();

        return Inertia::render('dosen/notifications', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
            ],
            'notifications' => $notifications,
            'sentNotifications' => $sentNotifications,
            'stats' => $stats,
            'courses' => $courses,
            'mahasiswa' => $mahasiswa,
        ]);
    }

    public function markAsRead($id)
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('login');
        }

        $notification = AppNotification::find($id);
        
        if ($notification) {
            // Allow marking as read if it's for this dosen OR if it's a broadcast to all
            if ($notification->notifiable_type === 'all' || 
                ($notification->notifiable_type === 'dosen' && $notification->notifiable_id === $dosen->id)) {
                $notification->update(['read_at' => now()]);
            }
        }

        return back();
    }

    public function markAllAsRead()
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('login');
        }

        AppNotification::forUser('dosen', $dosen->id)
            ->unread()
            ->update(['read_at' => now()]);

        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }

    public function destroy($id)
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('login');
        }

        $notification = AppNotification::find($id);
        
        if ($notification) {
            // Allow deleting if it's for this dosen OR if it's a broadcast to all
            if ($notification->notifiable_type === 'all' || 
                ($notification->notifiable_type === 'dosen' && $notification->notifiable_id === $dosen->id)) {
                $notification->delete();
                return back()->with('success', 'Notifikasi berhasil dihapus.');
            }
        }

        return back()->with('error', 'Notifikasi tidak ditemukan.');
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,reminder,announcement,alert,warning',
            'priority' => 'required|in:normal,high,urgent',
            'target_type' => 'required|in:all,specific',
            'target_mahasiswa' => 'nullable|array',
            'target_mahasiswa.*' => 'exists:mahasiswa,id',
            'action_url' => 'nullable|url',
            'scheduled_at' => 'nullable|date',
        ]);

        // Get dosen's course
        $course = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->first();
        
        if (!$course) {
            return back()->with('error', 'Anda belum mengampu mata kuliah.');
        }

        // Determine recipients
        if ($validated['target_type'] === 'all') {
            // Send to all mahasiswa
            $mahasiswaIds = \App\Models\Mahasiswa::pluck('id');
        } else {
            // Send to specific mahasiswa
            $mahasiswaIds = $validated['target_mahasiswa'] ?? [];
        }

        // Create notifications for each mahasiswa
        foreach ($mahasiswaIds as $mahasiswaId) {
            AppNotification::create([
                'notifiable_type' => 'mahasiswa',  // Changed from 'user' to 'mahasiswa'
                'notifiable_id' => $mahasiswaId,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'],
                'priority' => $validated['priority'],
                'action_url' => $validated['action_url'],
                'created_by_type' => 'dosen',
                'created_by_id' => $dosen->id,
                'metadata' => json_encode([
                    'course_id' => $course->id,
                    'course_name' => $course->nama,
                    'dosen_name' => $dosen->nama,
                ]),
            ]);
        }

        return back()->with('success', 'Notifikasi berhasil dikirim ke ' . count($mahasiswaIds) . ' mahasiswa.');
    }
}
