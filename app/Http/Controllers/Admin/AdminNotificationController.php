<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function markAsRead($id)
    {
        $notification = AppNotification::find($id);
        
        if ($notification) {
            $notification->markAsRead();
        }
        
        return back();
    }

    public function markAllAsRead()
    {
        $user = auth()->user();
        
        AppNotification::forUser('admin', $user->id)
            ->unread()
            ->update(['read_at' => now()]);
        
        return back();
    }

    public function destroy($id)
    {
        $notification = AppNotification::find($id);
        
        if ($notification) {
            $notification->delete();
        }
        
        return back();
    }
}
