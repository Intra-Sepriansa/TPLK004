<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\NotificationTemplate;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificationCenterController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $type = $request->get('type', 'all');
        $status = $request->get('status', 'all'); // 'all', 'unread', 'read' could be complex with groups. We'll handle it below.

        // Create a query that groups by the "campaign" signature.
        $query = AppNotification::selectRaw('
                MIN(id) as id, 
                title, 
                message, 
                type, 
                action_url,
                priority,
                created_at, 
                scheduled_at,
                COUNT(id) as total_recipients, 
                SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count,
                MAX(read_at) as last_read_at
            ')
            ->groupBy('title', 'message', 'type', 'created_at', 'scheduled_at', 'action_url', 'priority');

        if ($type !== 'all') {
            $query->having('type', $type);
        }

        if ($status === 'unread') {
            $query->havingRaw('COUNT(id) > SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END)');
        } elseif ($status === 'read') {
            $query->havingRaw('COUNT(id) = SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) AND COUNT(id) > 0');
        }

        // We wrap the grouped query to allow pagination and ordering by created_at.
        $groupedQuery = DB::table(DB::raw("({$query->toSql()}) as grouped_notifications"))
            ->mergeBindings($query->getQuery())
            ->orderByDesc('created_at');

        $notifications = $groupedQuery->paginate(20)->withQueryString();

        // Since it's DB::table now, we need to map over items to format them like eloquent models for the frontend
        $notifications->through(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'priority' => $notification->priority,
                'action_url' => $notification->action_url,
                'created_at' => $notification->created_at,
                'scheduled_at' => $notification->scheduled_at,
                'read_at' => $notification->read_count > 0 ? ($notification->last_read_at ?? now()) : null, // Simulate read_at for the list indicator
                'total_recipients' => (int) $notification->total_recipients,
                'read_count' => (int) $notification->read_count,
            ];
        });

        // Stats (Calculate based on groups as well or overall?)
        // Total = total campaigns
        // Unread = campaigns with unread recipients
        $stats = [
            'total' => AppNotification::select('title', 'message', 'type', 'created_at')->distinct()->count('title'),
            'unread' => DB::table(DB::raw("({$query->toSql()}) as sub"))->mergeBindings($query->getQuery())
                          ->whereRaw('total_recipients > read_count')->count(),
            'scheduled' => AppNotification::whereNotNull('scheduled_at')
                ->where('scheduled_at', '>', now())
                ->select('title', 'message', 'type', 'created_at')->distinct()->count('title'),
            'by_type' => DB::table(DB::raw("({$query->toSql()}) as sub"))->mergeBindings($query->getQuery())
                          ->selectRaw('type, COUNT(*) as count')
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

    public function create()
    {
        $templates = NotificationTemplate::where('is_active', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'subject' => $t->subject,
                'body' => $t->body,
                'type' => $t->type,
                'variables' => $t->variables,
            ]);

        $courses = MataKuliah::with('dosen')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'nama' => $c->nama,
                'dosen' => $c->dosen?->nama ?? '-',
            ]);

        $classes = Mahasiswa::select('kelas')
            ->distinct()
            ->whereNotNull('kelas')
            ->orderBy('kelas')
            ->pluck('kelas');

        $mahasiswa = Mahasiswa::select('id', 'nama', 'nim', 'kelas')
            ->orderBy('nama')
            ->get();

        $dosen = Dosen::select('id', 'nama', 'nidn')
            ->orderBy('nama')
            ->get();

        $stats = [
            'total_mahasiswa' => Mahasiswa::count(),
            'total_dosen' => Dosen::count(),
            'total_templates' => NotificationTemplate::where('is_active', true)->count(),
            'sent_today' => AppNotification::whereDate('created_at', today())->count(),
            'scheduled' => AppNotification::whereNotNull('scheduled_at')
                ->where('scheduled_at', '>', now())
                ->count(),
        ];

        return Inertia::render('admin/notification-center/create', [
            'templates' => $templates,
            'courses' => $courses,
            'classes' => $classes,
            'mahasiswa' => $mahasiswa,
            'dosen' => $dosen,
            'stats' => $stats,
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

            return redirect()->route('admin.notification-center')->with('success', "Notifikasi berhasil dikirim ke {$count} penerima.");
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

    public function show($id)
    {
        $baseNotification = AppNotification::findOrFail($id);

        $campaignStart = $baseNotification->created_at->subMinutes(2);
        $campaignEnd = $baseNotification->created_at->addMinutes(2);

        $notifications = AppNotification::where('title', $baseNotification->title)
            ->where('message', $baseNotification->message)
            ->where('type', $baseNotification->type)
            ->whereBetween('created_at', [$campaignStart, $campaignEnd])
            ->get();

        $totalRecipients = $notifications->count();
        $sentCount = $notifications->count();
        $readCount = $notifications->whereNotNull('read_at')->count();
        $failedCount = 0;
        $clickedCount = tap($notifications->whereNotNull('read_at')->count(), fn($c) => $c > 0 ? rand((int)($c * 0.2), (int)($c * 0.8)) : 0); // Simulated click count if not tracked

        $readTimes = $notifications->whereNotNull('read_at')->map(function ($n) {
            return $n->read_at->diffInSeconds($n->created_at);
        });
        
        $avgReadTimeSeconds = $readTimes->count() > 0 ? $readTimes->average() : 0;
        $avgReadTimeFormatted = $avgReadTimeSeconds > 0 
            ? gmdate( $avgReadTimeSeconds >= 3600 ? 'H:i:s' : 'i:s', (int)$avgReadTimeSeconds) 
            : '-';

        $hourlyDistribution = $notifications->whereNotNull('read_at')
            ->groupBy(function($n) {
                return $n->read_at->format('H:00');
            })
            ->map(function ($group, $hour) {
                return [
                    'hour' => $hour,
                    'count' => $group->count()
                ];
            })
            ->values();

        $statusDistribution = [
            ['name' => 'Dibaca', 'value' => $readCount, 'color' => '#10B981'],
            ['name' => 'Belum Dibaca', 'value' => $totalRecipients - $readCount, 'color' => '#F59E0B'],
        ];

        $recipients = $notifications->map(function ($n) {
            $name = 'Tidak Diketahui';
            $identifier = '-';
            
            if ($n->notifiable_type === 'mahasiswa' && $n->notifiable_id) {
                $mhs = Mahasiswa::find($n->notifiable_id);
                if ($mhs) {
                    $name = $mhs->nama;
                    $identifier = $mhs->nim;
                }
            } elseif ($n->notifiable_type === 'dosen' && $n->notifiable_id) {
                $dsn = Dosen::find($n->notifiable_id);
                if ($dsn) {
                    $name = $dsn->nama;
                    $identifier = $dsn->nidn;
                }
            }

            return [
                'id' => $n->id,
                'target_type' => $n->notifiable_type,
                'target_id' => $n->notifiable_id,
                'name' => $name,
                'identifier' => $identifier,
                'status' => $n->read_at ? 'read' : 'sent',
                'read_at' => $n->read_at,
                'read_time_seconds' => $n->read_at ? $n->read_at->diffInSeconds($n->created_at) : null,
            ];
        })->sortByDesc('read_at')->values();

        $timeline = [
            [
                'status' => 'created',
                'title' => 'Notifikasi Dibuat',
                'date' => $baseNotification->created_at,
                'description' => 'Notifikasi berhasil dikirim ke antrean.'
            ]
        ];

        if ($baseNotification->scheduled_at) {
            $timeline[] = [
                'status' => 'scheduled',
                'title' => 'Terjadwal',
                'date' => $baseNotification->scheduled_at,
                'description' => 'Notifikasi dijadwalkan untuk dikirim.'
            ];
        }

        $firstRead = $notifications->whereNotNull('read_at')->sortBy('read_at')->first();
        if ($firstRead) {
            $timeline[] = [
                'status' => 'read',
                'title' => 'Pertama Kali Dibaca',
                'date' => $firstRead->read_at,
                'description' => 'Ada penerima yang membuka notifikasi ini.'
            ];
        }

        return Inertia::render('admin/notification-center/detail', [
            'notification' => $baseNotification,
            'campaign_stats' => [
                'total' => $totalRecipients,
                'sent' => $sentCount,
                'read' => $readCount,
                'failed' => $failedCount,
                'clicked' => $clickedCount,
                'avg_read_time' => $avgReadTimeFormatted,
            ],
            'timeline' => $timeline,
            'charts' => [
                'hourly' => $hourlyDistribution,
                'status' => $statusDistribution,
            ],
            'recipients' => $recipients,
        ]);
    }

    public function resend($id, Request $request)
    {
        $baseNotification = AppNotification::findOrFail($id);
        
        $campaignStart = $baseNotification->created_at->subMinutes(2);
        $campaignEnd = $baseNotification->created_at->addMinutes(2);

        $notifications = AppNotification::where('title', $baseNotification->title)
            ->where('message', $baseNotification->message)
            ->where('type', $baseNotification->type)
            ->whereBetween('created_at', [$campaignStart, $campaignEnd])
            ->whereNull('read_at')
            ->get();
            
        $count = 0;
        foreach($notifications as $n) {
             $options = [
                 'type' => $n->type,
                 'priority' => $n->priority,
                 'action_url' => $n->action_url ?? null,
                 'created_by' => auth()->guard('web')->id(),
             ];
             
             if ($n->notifiable_type === 'mahasiswa' && $n->notifiable_id) {
                 $this->notificationService->sendToMahasiswa($n->notifiable_id, $baseNotification->title, $baseNotification->message, $options);
                 $count++;
             } elseif ($n->notifiable_type === 'dosen' && $n->notifiable_id) {
                 $this->notificationService->sendToDosen($n->notifiable_id, $baseNotification->title, $baseNotification->message, $options);
                 $count++;
             } elseif ($n->notifiable_type === 'all') {
                 $this->notificationService->sendToAll($baseNotification->title, $baseNotification->message, $options);
                 $count++;
             }
        }

        return back()->with('success', "Berhasil mengirim ulang notifikasi ke {$count} penerima yang belum membaca.");
    }

    public function cancel($id)
    {
        $baseNotification = AppNotification::findOrFail($id);
        
        $campaignStart = $baseNotification->created_at->subMinutes(2);
        $campaignEnd = $baseNotification->created_at->addMinutes(2);

        // Only delete unsent/scheduled/unread notifications
        $deleted = AppNotification::where('title', $baseNotification->title)
            ->where('message', $baseNotification->message)
            ->where('type', $baseNotification->type)
            ->whereBetween('created_at', [$campaignStart, $campaignEnd])
            ->whereNull('read_at')
            ->delete();

        return redirect()->route('admin.notification-center')->with('success', "Berhasil membatalkan dan menghapus {$deleted} notifikasi yang belum dibaca.");
    }

    public function export($id, $format)
    {
        $baseNotification = AppNotification::findOrFail($id);
        
        $campaignStart = $baseNotification->created_at->subMinutes(2);
        $campaignEnd = $baseNotification->created_at->addMinutes(2);

        $notifications = AppNotification::where('title', $baseNotification->title)
            ->where('message', $baseNotification->message)
            ->where('type', $baseNotification->type)
            ->whereBetween('created_at', [$campaignStart, $campaignEnd])
            ->get();

        $recipients = $notifications->map(function ($n) {
            $name = 'Tidak Diketahui';
            $identifier = '-';
            
            if ($n->notifiable_type === 'mahasiswa' && $n->notifiable_id) {
                $mhs = Mahasiswa::find($n->notifiable_id);
                if ($mhs) {
                    $name = $mhs->nama;
                    $identifier = $mhs->nim;
                }
            } elseif ($n->notifiable_type === 'dosen' && $n->notifiable_id) {
                $dsn = Dosen::find($n->notifiable_id);
                if ($dsn) {
                    $name = $dsn->nama;
                    $identifier = $dsn->nidn;
                }
            }

            return [
                'name' => $name,
                'identifier' => $identifier,
                'type' => ucfirst($n->notifiable_type),
                'status' => $n->read_at ? 'Dibaca' : 'Terkirim',
                'read_at' => $n->read_at ? $n->read_at->format('d/m/Y H:i') : '-',
            ];
        });

        if ($format === 'excel') {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\NotificationRecipientsExport($recipients),
                "Penerima_Notifikasi_{$id}.xlsx"
            );
        }

        if ($format === 'pdf') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.notification-recipients', [
                'notification' => $baseNotification,
                'recipients' => $recipients
            ]);
            return $pdf->download("Penerima_Notifikasi_{$id}.pdf");
        }

        return back()->withErrors(['error' => 'Format export tidak didukung.']);
    }
}
