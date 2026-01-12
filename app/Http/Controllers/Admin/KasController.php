<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KasController extends Controller
{
    private const KAS_AMOUNT = 5000; // Rp 5.000 per minggu

    public function index(Request $request): InertiaResponse
    {
        $search = $request->get('search', '');
        $pertemuan = $request->get('pertemuan', 'all'); // Filter by pertemuan date
        $month = $request->get('month', now()->format('Y-m'));

        // Get all pertemuan dates (Kamis)
        $pertemuanDates = Kas::where('type', 'income')
            ->select('period_date')
            ->distinct()
            ->orderBy('period_date', 'desc')
            ->pluck('period_date')
            ->map(fn($d) => $d->format('Y-m-d'));

        // Get all mahasiswa with their kas status
        $query = Mahasiswa::query()->orderBy('nama');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        $mahasiswaList = $query->get()->map(function ($mhs) use ($pertemuan, $month) {
            $kasQuery = Kas::where('mahasiswa_id', $mhs->id)->where('type', 'income');

            if ($pertemuan !== 'all') {
                $kasQuery->whereDate('period_date', $pertemuan);
            } else {
                $monthStart = \Carbon\Carbon::parse($month)->startOfMonth();
                $monthEnd = \Carbon\Carbon::parse($month)->endOfMonth();
                $kasQuery->whereBetween('period_date', [$monthStart, $monthEnd]);
            }

            $kasRecords = $kasQuery->orderBy('period_date', 'desc')->get();
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

        // Summary
        $summary = KasSummary::getSummary();
        
        // Get transactions for the selected period
        $transactionQuery = Kas::query();
        if ($pertemuan !== 'all') {
            $transactionQuery->whereDate('period_date', $pertemuan);
        } else {
            $monthStart = \Carbon\Carbon::parse($month)->startOfMonth();
            $monthEnd = \Carbon\Carbon::parse($month)->endOfMonth();
            $transactionQuery->whereBetween('period_date', [$monthStart, $monthEnd]);
        }

        // Calculate period stats
        $periodIncome = (clone $transactionQuery)->where('type', 'income')->where('status', 'paid')->sum('amount');
        $periodExpense = (clone $transactionQuery)->where('type', 'expense')->sum('amount');

        $paidCount = $mahasiswaList->where('status', 'paid')->count();
        $unpaidCount = $mahasiswaList->where('status', 'unpaid')->count();

        // All transactions (for ledger view)
        $allTransactions = Kas::with(['mahasiswa', 'creator'])
            ->orderBy('period_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($k) {
                return [
                    'id' => $k->id,
                    'mahasiswa' => $k->type === 'income' ? ($k->mahasiswa?->nama ?? '-') : null,
                    'type' => $k->type,
                    'amount' => $k->amount,
                    'status' => $k->status,
                    'description' => $k->description,
                    'category' => $k->category,
                    'period_date' => $k->period_date->format('Y-m-d'),
                    'period_display' => $k->period_date->translatedFormat('l, d F Y'),
                    'created_at' => $k->created_at->format('d M Y H:i'),
                ];
            });

        // Group transactions by date for ledger
        $ledger = $allTransactions->groupBy('period_date')->map(function ($transactions, $date) {
            $income = $transactions->where('type', 'income')->where('status', 'paid')->sum('amount');
            $expense = $transactions->where('type', 'expense')->sum('amount');
            
            return [
                'date' => $date,
                'display_date' => \Carbon\Carbon::parse($date)->translatedFormat('l, d F Y'),
                'income' => $income,
                'expense' => $expense,
                'transactions' => $transactions->values(),
            ];
        })->values();

        // Calculate running balance for ledger
        $runningBalance = 0;
        $ledgerWithBalance = $ledger->reverse()->map(function ($item) use (&$runningBalance) {
            $runningBalance += $item['income'] - $item['expense'];
            $item['balance'] = $runningBalance;
            return $item;
        })->reverse()->values();

        return Inertia::render('admin/kas', [
            'mahasiswaList' => $mahasiswaList,
            'summary' => [
                'total_balance' => $summary->total_balance,
                'total_income' => $summary->total_income,
                'total_expense' => $summary->total_expense,
                'period_income' => $periodIncome,
                'period_expense' => $periodExpense,
                'paid_count' => $paidCount,
                'unpaid_count' => $unpaidCount,
            ],
            'ledger' => $ledgerWithBalance,
            'pertemuanDates' => $pertemuanDates,
            'filters' => [
                'search' => $search,
                'pertemuan' => $pertemuan,
                'month' => $month,
            ],
            'kasAmount' => self::KAS_AMOUNT,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'period_date' => 'required|date',
            'status' => 'required|in:paid,unpaid',
        ]);

        Kas::create([
            'mahasiswa_id' => $request->mahasiswa_id,
            'type' => 'income',
            'amount' => $request->amount,
            'description' => $request->description ?? 'Kas Mingguan',
            'category' => 'kas_mingguan',
            'period_date' => $request->period_date,
            'status' => $request->status,
            'created_by' => auth()->id(),
        ]);

        KasSummary::recalculate();

        return back()->with('success', 'Data kas berhasil ditambahkan.');
    }

    public function markPaid(Request $request): RedirectResponse
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'period_date' => 'required|date',
        ]);

        // Check if record exists for this date
        $existing = Kas::where('mahasiswa_id', $request->mahasiswa_id)
            ->where('type', 'income')
            ->whereDate('period_date', $request->period_date)
            ->first();

        if ($existing) {
            $existing->update(['status' => 'paid']);
        } else {
            Kas::create([
                'mahasiswa_id' => $request->mahasiswa_id,
                'type' => 'income',
                'amount' => self::KAS_AMOUNT,
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
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
            'category' => 'required|string',
            'period_date' => 'required|date',
        ]);

        // For expense, we don't need mahasiswa_id
        Kas::create([
            'mahasiswa_id' => null,
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
            'period_date' => 'required|date',
        ]);

        foreach ($request->mahasiswa_ids as $mahasiswaId) {
            $existing = Kas::where('mahasiswa_id', $mahasiswaId)
                ->where('type', 'income')
                ->whereDate('period_date', $request->period_date)
                ->first();

            if ($existing) {
                $existing->update(['status' => 'paid']);
            } else {
                Kas::create([
                    'mahasiswa_id' => $mahasiswaId,
                    'type' => 'income',
                    'amount' => self::KAS_AMOUNT,
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

    public function createPertemuan(Request $request): RedirectResponse
    {
        $request->validate([
            'period_date' => 'required|date',
        ]);

        // Create kas record for all mahasiswa for this pertemuan
        $mahasiswaList = Mahasiswa::all();
        
        foreach ($mahasiswaList as $mhs) {
            // Check if already exists
            $exists = Kas::where('mahasiswa_id', $mhs->id)
                ->where('type', 'income')
                ->whereDate('period_date', $request->period_date)
                ->exists();

            if (!$exists) {
                Kas::create([
                    'mahasiswa_id' => $mhs->id,
                    'type' => 'income',
                    'amount' => self::KAS_AMOUNT,
                    'description' => 'Kas Mingguan',
                    'category' => 'kas_mingguan',
                    'period_date' => $request->period_date,
                    'status' => 'unpaid',
                    'created_by' => auth()->id(),
                ]);
            }
        }

        return back()->with('success', 'Pertemuan kas berhasil dibuat untuk ' . $mahasiswaList->count() . ' mahasiswa.');
    }

    public function exportPdf(Request $request): Response
    {
        $type = $request->get('type', 'pertemuan'); // pertemuan or keseluruhan
        $date = $request->get('date'); // For pertemuan
        $month = $request->get('month'); // For monthly

        if ($type === 'pertemuan' && $date) {
            // Export single pertemuan
            $transactions = Kas::with('mahasiswa')
                ->whereDate('period_date', $date)
                ->orderBy('type')
                ->orderBy('created_at')
                ->get();

            $income = $transactions->where('type', 'income')->where('status', 'paid')->sum('amount');
            $expense = $transactions->where('type', 'expense')->sum('amount');
            $balance = $income - $expense;

            $data = [
                'title' => 'Laporan Kas Pertemuan',
                'subtitle' => \Carbon\Carbon::parse($date)->translatedFormat('l, d F Y'),
                'transactions' => $transactions,
                'income' => $income,
                'expense' => $expense,
                'balance' => $balance,
                'type' => 'pertemuan',
            ];
        } else {
            // Export keseluruhan or monthly
            $query = Kas::with('mahasiswa')->orderBy('period_date')->orderBy('created_at');
            
            if ($month) {
                $monthStart = \Carbon\Carbon::parse($month)->startOfMonth();
                $monthEnd = \Carbon\Carbon::parse($month)->endOfMonth();
                $query->whereBetween('period_date', [$monthStart, $monthEnd]);
                $subtitle = \Carbon\Carbon::parse($month)->translatedFormat('F Y');
            } else {
                $subtitle = 'Semua Periode';
            }

            $transactions = $query->get();

            // Group by date and calculate running balance
            $grouped = $transactions->groupBy(fn($t) => $t->period_date->format('Y-m-d'));
            $ledger = [];
            $runningBalance = 0;

            foreach ($grouped as $date => $items) {
                $income = $items->where('type', 'income')->where('status', 'paid')->sum('amount');
                $expense = $items->where('type', 'expense')->sum('amount');
                $runningBalance += $income - $expense;

                $ledger[] = [
                    'date' => \Carbon\Carbon::parse($date)->translatedFormat('d/m/Y'),
                    'display_date' => \Carbon\Carbon::parse($date)->translatedFormat('l, d F Y'),
                    'income' => $income,
                    'expense' => $expense,
                    'balance' => $runningBalance,
                    'transactions' => $items,
                ];
            }

            $totalIncome = $transactions->where('type', 'income')->where('status', 'paid')->sum('amount');
            $totalExpense = $transactions->where('type', 'expense')->sum('amount');

            $data = [
                'title' => 'Laporan Kas ' . ($month ? 'Bulanan' : 'Keseluruhan'),
                'subtitle' => $subtitle,
                'ledger' => $ledger,
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'final_balance' => $totalIncome - $totalExpense,
                'type' => 'keseluruhan',
            ];
        }

        $pdf = Pdf::loadView('pdf.kas-report', $data);
        $filename = 'laporan-kas-' . ($date ?? $month ?? 'keseluruhan') . '.pdf';

        return $pdf->download($filename);
    }
}
