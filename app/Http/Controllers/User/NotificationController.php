<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        $notifications = AppNotification::forUser('mahasiswa', $mahasiswa->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $unreadCount = AppNotification::forUser('mahasiswa', $mahasiswa->id)
            ->unread()
            ->count();

        return Inertia::render('user/notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead($id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        $notification = AppNotification::find($id);

        if ($notification) {
            // Allow marking as read if it's for this mahasiswa OR if it's a broadcast to all
            if ($notification->notifiable_type === 'all' || 
                ($notification->notifiable_type === 'mahasiswa' && $notification->notifiable_id === $mahasiswa->id)) {
                $notification->update(['read_at' => now()]);
            }
        }

        return back();
    }

    public function markAllAsRead()
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        AppNotification::forUser('mahasiswa', $mahasiswa->id)
            ->unread()
            ->update(['read_at' => now()]);

        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }

    public function destroy($id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        $notification = AppNotification::find($id);
        
        if ($notification) {
            // Allow deleting if it's for this mahasiswa OR if it's a broadcast to all
            if ($notification->notifiable_type === 'all' || 
                ($notification->notifiable_type === 'mahasiswa' && $notification->notifiable_id === $mahasiswa->id)) {
                $notification->delete();
                return back()->with('success', 'Notifikasi berhasil dihapus.');
            }
        }

        return back()->with('error', 'Notifikasi tidak ditemukan.');
    }
}
