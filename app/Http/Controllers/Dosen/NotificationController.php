<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('login');
        }

        // Get notifications FOR this dosen (received)
        $receivedNotifications = AppNotification::forUser('dosen', $dosen->id)
            ->orderByDesc('created_at')
            ->get();

        // Get notifications SENT BY this dosen
        $sentNotifications = AppNotification::where('created_by_type', 'dosen')
            ->where('created_by_id', $dosen->id)
            ->orderByDesc('created_at')
            ->get();

        // Merge and paginate
        $allNotifications = $receivedNotifications->merge($sentNotifications)
            ->sortByDesc('created_at')
            ->values();

        // Paginate manually
        $perPage = 20;
        $currentPage = request()->get('page', 1);
        $notifications = new \Illuminate\Pagination\LengthAwarePaginator(
            $allNotifications->forPage($currentPage, $perPage),
            $allNotifications->count(),
            $perPage,
            $currentPage,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        $unreadCount = AppNotification::forUser('dosen', $dosen->id)
            ->unread()
            ->count();

        // Get dosen's course for notification creation
        $course = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->first();
        
        // Get mahasiswa in dosen's course
        $mahasiswa = [];
        if ($course) {
            $mahasiswa = \App\Models\Mahasiswa::all();
        }

        return Inertia::render('dosen/notifications', [
            'dosen' => $dosen,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'course' => $course,
            'mahasiswa' => $mahasiswa,
            'sentNotifications' => $sentNotifications->take(10),
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
