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
            return redirect()->route('dosen.login');
        }

        $notifications = AppNotification::forUser('dosen', $dosen->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $unreadCount = AppNotification::forUser('dosen', $dosen->id)
            ->unread()
            ->count();

        return Inertia::render('dosen/notifications', [
            'dosen' => $dosen,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead($id)
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen) {
            return redirect()->route('dosen.login');
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
            return redirect()->route('dosen.login');
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
            return redirect()->route('dosen.login');
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
}
