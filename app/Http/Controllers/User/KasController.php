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
                'period_date' => $k->period_date->format('Y-m-d'),
                'period_display' => $k->period_date->translatedFormat('l, d F Y'),
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
            ->orderBy('period_date', 'desc')
            ->take(10)
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'amount' => $k->amount,
                'description' => $k->description,
                'period_date' => $k->period_date->format('Y-m-d'),
                'period_display' => $k->period_date->translatedFormat('l, d F Y'),
                'category' => $k->category,
            ]);

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
        ]);
    }
}
