<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\SelfieVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerifikasiSelfieController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        // Get selfie queue with filters
        $selfieQuery = SelfieVerification::with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $selfieQuery->where('status', $status);
        }

        $selfieQueue = $selfieQuery->paginate(20)->through(fn($item) => [
            'id' => $item->id,
            'status' => $item->status,
            'created_at' => $item->created_at?->format('Y-m-d H:i:s'),
            'verified_at' => $item->verified_at?->format('Y-m-d H:i:s'),
            'verified_by_name' => $item->verified_by_name,
            'rejection_reason' => $item->rejection_reason,
            'note' => $item->note,
            'attendance_log' => $item->attendanceLog ? [
                'id' => $item->attendanceLog->id,
                'selfie_path' => $item->attendanceLog->selfie_path,
                'scanned_at' => $item->attendanceLog->scanned_at?->format('Y-m-d H:i:s'),
                'status' => $item->attendanceLog->status,
                'distance_m' => $item->attendanceLog->distance_m,
                'mahasiswa' => $item->attendanceLog->mahasiswa ? [
                    'id' => $item->attendanceLog->mahasiswa->id,
                    'nama' => $item->attendanceLog->mahasiswa->nama,
                    'nim' => $item->attendanceLog->mahasiswa->nim,
                ] : null,
                'course' => $item->attendanceLog->session?->course?->nama ?? '-',
            ] : null,
        ]);

        // Stats
        $stats = [
            'total' => SelfieVerification::count(),
            'pending' => SelfieVerification::where('status', 'pending')->count(),
            'approved' => SelfieVerification::where('status', 'approved')->count(),
            'rejected' => SelfieVerification::where('status', 'rejected')->count(),
            'today_pending' => SelfieVerification::where('status', 'pending')
                ->whereDate('created_at', today())->count(),
            'today_processed' => SelfieVerification::whereIn('status', ['approved', 'rejected'])
                ->whereDate('updated_at', today())->count(),
        ];

        // Daily trend
        $dailyTrend = SelfieVerification::whereDate('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, status, COUNT(*) as total')
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get();

        $trendData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayData = $dailyTrend->where('date', $date);
            $trendData[] = [
                'date' => now()->subDays($i)->format('d M'),
                'pending' => $dayData->where('status', 'pending')->sum('total'),
                'approved' => $dayData->where('status', 'approved')->sum('total'),
                'rejected' => $dayData->where('status', 'rejected')->sum('total'),
            ];
        }

        // Recent verifications by admin
        $recentVerifications = SelfieVerification::whereIn('status', ['approved', 'rejected'])
            ->orderBy('updated_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'status' => $item->status,
                'verified_at' => $item->updated_at?->format('H:i:s'),
                'verified_by_name' => $item->verified_by_name ?? 'System',
            ]);

        return Inertia::render('admin/verifikasi-selfie', [
            'selfieQueue' => $selfieQueue,
            'stats' => $stats,
            'trendData' => $trendData,
            'recentVerifications' => $recentVerifications,
            'currentFilter' => $status,
        ]);
    }

    public function approve(SelfieVerification $selfieVerification, Request $request): RedirectResponse
    {
        $user = $request->user();

        $selfieVerification->update([
            'status' => 'approved',
            'verified_by' => $user->id,
            'verified_by_type' => 'admin',
            'verified_by_name' => $user->name,
            'verified_at' => now(),
            'note' => $request->input('note'),
        ]);

        $selfieVerification->attendanceLog?->update(['status' => 'present']);

        return back()->with('success', 'Selfie berhasil disetujui.');
    }

    public function reject(SelfieVerification $selfieVerification, Request $request): RedirectResponse
    {
        $user = $request->user();

        $selfieVerification->update([
            'status' => 'rejected',
            'verified_by' => $user->id,
            'verified_by_type' => 'admin',
            'verified_by_name' => $user->name,
            'verified_at' => now(),
            'rejection_reason' => $request->input('reason', 'Selfie tidak valid'),
            'note' => $request->input('note'),
        ]);

        $selfieVerification->attendanceLog?->update(['status' => 'rejected']);

        return back()->with('success', 'Selfie berhasil ditolak.');
    }

    public function bulkApprove(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);
        $user = $request->user();

        SelfieVerification::whereIn('id', $ids)
            ->where('status', 'pending')
            ->update([
                'status' => 'approved',
                'verified_by' => $user->id,
                'verified_by_type' => 'admin',
                'verified_by_name' => $user->name,
                'verified_at' => now(),
            ]);

        // Update attendance logs
        $verifications = SelfieVerification::whereIn('id', $ids)->get();
        foreach ($verifications as $v) {
            $v->attendanceLog?->update(['status' => 'present']);
        }

        return back()->with('success', count($ids) . ' selfie berhasil disetujui.');
    }

    public function bulkReject(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);
        $user = $request->user();
        $reason = $request->input('reason', 'Selfie tidak valid');

        SelfieVerification::whereIn('id', $ids)
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'verified_by' => $user->id,
                'verified_by_type' => 'admin',
                'verified_by_name' => $user->name,
                'verified_at' => now(),
                'rejection_reason' => $reason,
            ]);

        // Update attendance logs
        $verifications = SelfieVerification::whereIn('id', $ids)->get();
        foreach ($verifications as $v) {
            $v->attendanceLog?->update(['status' => 'rejected']);
        }

        return back()->with('success', count($ids) . ' selfie berhasil ditolak.');
    }
}
