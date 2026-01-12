<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ActivityLogController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $search = $request->get('search', '');
        $action = $request->get('action', 'all');
        $date = $request->get('date');

        $query = AdminActivityLog::with('user')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($action !== 'all') {
            $query->where('action', $action);
        }

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $logs = $query->paginate(50)->through(fn($log) => [
            'id' => $log->id,
            'user' => $log->user?->name ?? 'System',
            'action' => $log->action,
            'model_type' => $log->model_type ? class_basename($log->model_type) : null,
            'model_id' => $log->model_id,
            'description' => $log->description,
            'ip_address' => $log->ip_address,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'created_at' => $log->created_at->timezone('Asia/Jakarta')->format('d M Y H:i:s'),
        ]);

        // Get unique actions for filter
        $actions = AdminActivityLog::select('action')
            ->distinct()
            ->pluck('action')
            ->toArray();

        // Stats
        $stats = [
            'total' => AdminActivityLog::count(),
            'today' => AdminActivityLog::whereDate('created_at', today())->count(),
            'this_week' => AdminActivityLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ];

        return Inertia::render('admin/activity-log', [
            'logs' => $logs,
            'actions' => $actions,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'action' => $action,
                'date' => $date,
            ],
        ]);
    }
}
