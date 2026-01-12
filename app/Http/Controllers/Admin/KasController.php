<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KasController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $month = $request->get('month', now()->format('Y-m'));

        // Get all mahasiswa with their kas status for the month
        $query = Mahasiswa::query()->orderBy('nama');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        $mahasiswaList = $query->get()->map(function ($mhs) use ($month) {
            $monthStart = \Carbon\Carbon::parse($month)->startOfMonth();
            $monthEnd = \Carbon\Carbon::parse($month)->endOfMonth();

            $kasRecords = Kas::where('mahasiswa_id', $mhs->id)
                ->whereBetween('period_date', [$monthStart, $monthEnd])
                ->get();

            $totalPaid = $kasRecords->where('status', 'paid')->sum('amount');
            $totalUnpaid = $kasRecords->where('status', 'unpaid')->sum('amount');

            return [
                'id' => $mhs->id,
                'nama' => $mhs->nama,
                'nim' => $mhs->nim,
                'kelas' => $mhs->kelas,
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalUnpaid,
                'status' => $totalUnpaid > 0 ? 'unpaid' : ($totalPaid > 0 ? 'paid' : 'no_record'),
                'records' => $kasRecords->map(fn($k) => [
                    'id' => $k->id,
                    'amount' => $k->amount,
                    'status' => $k->status,
                    'period_date' => $k->period_date->format('Y-m-d'),
                    'description' => $k->description,
                ]),
            ];
        });

        if ($status !== 'all') {
            $mahasiswaList = $mahasiswaList->filter(fn($m) => $m['status'] === $status)->values();
        }

        // Summary
        $summary = KasSummary::getSummary();
        
        // Monthly stats
        $monthStart = \Carbon\Carbon::parse($month)->startOfMonth();
        $monthEnd = \Carbon\Carbon::parse($month)->endOfMonth();
        
        $monthlyIncome = Kas::where('type', 'income')
            ->where('status', 'paid')
            ->whereBetween('period_date', [$monthStart, $monthEnd])
            ->sum('amount');
            
        $monthlyExpense = Kas::where('type', 'expense')
            ->whereBetween('period_date', [$monthStart, $monthEnd])
            ->sum('amount');

        $paidCount = $mahasiswaList->where('status', 'paid')->count();
        $unpaidCount = $mahasiswaList->where('status', 'unpaid')->count();

        // Recent transactions
        $recentTransactions = Kas::with(['mahasiswa', 'creator'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'mahasiswa' => $k->mahasiswa?->nama ?? '-',
                'type' => $k->type,
                'amount' => $k->amount,
                'status' => $k->status,
                'description' => $k->description,
                'category' => $k->category,
                'period_date' => $k->period_date->format('d M Y'),
                'created_at' => $k->created_at->diffForHumans(),
            ]);

        // Expense records
        $expenses = Kas::where('type', 'expense')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'amount' => $k->amount,
                'description' => $k->description,
                'category' => $k->category,
                'period_date' => $k->period_date->format('d M Y'),
                'created_at' => $k->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('admin/kas', [
            'mahasiswaList' => $mahasiswaList,
            'summary' => [
                'total_balance' => $summary->total_balance,
                'total_income' => $summary->total_income,
                'total_expense' => $summary->total_expense,
                'monthly_income' => $monthlyIncome,
                'monthly_expense' => $monthlyExpense,
                'paid_count' => $paidCount,
                'unpaid_count' => $unpaidCount,
            ],
            'recentTransactions' => $recentTransactions,
            'expenses' => $expenses,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'month' => $month,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'category' => 'required|string',
            'period_date' => 'required|date',
            'status' => 'required|in:paid,unpaid,partial',
        ]);

        Kas::create([
            'mahasiswa_id' => $request->mahasiswa_id,
            'type' => 'income',
            'amount' => $request->amount,
            'description' => $request->description,
            'category' => $request->category,
            'period_date' => $request->period_date,
            'status' => $request->status,
            'created_by' => auth()->id(),
        ]);

        KasSummary::recalculate();

        return back()->with('success', 'Data kas berhasil ditambahkan.');
    }

    public function update(Request $request, Kas $ka): RedirectResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'status' => 'required|in:paid,unpaid,partial',
        ]);

        $ka->update([
            'amount' => $request->amount,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        KasSummary::recalculate();

        return back()->with('success', 'Data kas berhasil diperbarui.');
    }

    public function markPaid(Request $request): RedirectResponse
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'amount' => 'required|numeric|min:0',
            'period_date' => 'required|date',
        ]);

        // Check if record exists
        $existing = Kas::where('mahasiswa_id', $request->mahasiswa_id)
            ->where('period_date', $request->period_date)
            ->first();

        if ($existing) {
            $existing->update(['status' => 'paid']);
        } else {
            Kas::create([
                'mahasiswa_id' => $request->mahasiswa_id,
                'type' => 'income',
                'amount' => $request->amount,
                'description' => 'Kas Mingguan',
                'category' => 'kas_mingguan',
                'period_date' => $request->period_date,
                'status' => 'paid',
                'created_by' => auth()->id(),
            ]);
        }

        KasSummary::recalculate();

        return back()->with('success', 'Pembayaran kas berhasil dicatat.');
    }

    public function addExpense(Request $request): RedirectResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
            'category' => 'required|string',
            'period_date' => 'required|date',
        ]);

        Kas::create([
            'mahasiswa_id' => Mahasiswa::first()->id, // dummy, expense tidak perlu mahasiswa
            'type' => 'expense',
            'amount' => $request->amount,
            'description' => $request->description,
            'category' => $request->category,
            'period_date' => $request->period_date,
            'status' => 'paid',
            'created_by' => auth()->id(),
        ]);

        KasSummary::recalculate();

        return back()->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function destroy(Kas $ka): RedirectResponse
    {
        $ka->delete();
        KasSummary::recalculate();

        return back()->with('success', 'Data kas berhasil dihapus.');
    }

    public function bulkMarkPaid(Request $request): RedirectResponse
    {
        $request->validate([
            'mahasiswa_ids' => 'required|array',
            'mahasiswa_ids.*' => 'exists:mahasiswa,id',
            'amount' => 'required|numeric|min:0',
            'period_date' => 'required|date',
        ]);

        foreach ($request->mahasiswa_ids as $mahasiswaId) {
            $existing = Kas::where('mahasiswa_id', $mahasiswaId)
                ->where('period_date', $request->period_date)
                ->first();

            if ($existing) {
                $existing->update(['status' => 'paid']);
            } else {
                Kas::create([
                    'mahasiswa_id' => $mahasiswaId,
                    'type' => 'income',
                    'amount' => $request->amount,
                    'description' => 'Kas Mingguan',
                    'category' => 'kas_mingguan',
                    'period_date' => $request->period_date,
                    'status' => 'paid',
                    'created_by' => auth()->id(),
                ]);
            }
        }

        KasSummary::recalculate();

        return back()->with('success', 'Pembayaran kas berhasil dicatat untuk ' . count($request->mahasiswa_ids) . ' mahasiswa.');
    }
}
