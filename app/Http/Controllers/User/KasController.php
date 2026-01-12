<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Kas;
use App\Models\KasSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KasController extends Controller
{
    public function index(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        // Get kas records for this mahasiswa
        $kasRecords = Kas::where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->orderBy('period_date', 'desc')
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'amount' => $k->amount,
                'status' => $k->status,
                'period_date' => $k->period_date->format('d M Y'),
                'period_month' => $k->period_date->format('F Y'),
                'description' => $k->description,
                'category' => $k->category,
            ]);

        // Calculate personal stats
        $totalPaid = Kas::where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->sum('amount');

        $totalUnpaid = Kas::where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'unpaid')
            ->sum('amount');

        $paidCount = Kas::where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->count();

        $unpaidCount = Kas::where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'unpaid')
            ->count();

        // Class summary (read-only)
        $summary = KasSummary::getSummary();

        // Recent expenses (class expenses)
        $recentExpenses = Kas::where('type', 'expense')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'amount' => $k->amount,
                'description' => $k->description,
                'period_date' => $k->period_date->format('d M Y'),
            ]);

        // Monthly breakdown
        $monthlyBreakdown = $kasRecords->groupBy('period_month')->map(function ($records, $month) {
            return [
                'month' => $month,
                'total' => $records->sum('amount'),
                'paid' => $records->where('status', 'paid')->sum('amount'),
                'unpaid' => $records->where('status', 'unpaid')->sum('amount'),
            ];
        })->values();

        return Inertia::render('user/kas', [
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
            'kasRecords' => $kasRecords,
            'personalStats' => [
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalUnpaid,
                'paid_count' => $paidCount,
                'unpaid_count' => $unpaidCount,
            ],
            'classSummary' => [
                'total_balance' => $summary->total_balance,
                'total_income' => $summary->total_income,
                'total_expense' => $summary->total_expense,
            ],
            'recentExpenses' => $recentExpenses,
            'monthlyBreakdown' => $monthlyBreakdown,
        ]);
    }
}
