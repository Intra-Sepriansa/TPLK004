<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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
        $startMonth = $request->get('start_month', $month);
        $endMonth = $request->get('end_month', $startMonth);
        [$periodStart, $periodEnd, $startMonth, $endMonth] = $this->resolveMonthPeriod($startMonth, $endMonth);

        // Get all pertemuan dates (Kamis)
        $pertemuanDates = Kas::where('type', 'income')
            ->select('period_date')
            ->distinct()
            ->orderBy('period_date', 'desc')
            ->pluck('period_date')
            ->map(fn ($d) => $d->format('Y-m-d'));

        // Get all mahasiswa with their kas status
        $query = Mahasiswa::query()->orderBy('nama');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        $mahasiswaList = $query->get()->map(function ($mhs) use ($pertemuan, $periodStart, $periodEnd) {
            $kasQuery = Kas::where('mahasiswa_id', $mhs->id)->where('type', 'income');

            if ($pertemuan !== 'all') {
                $kasQuery->whereDate('period_date', $pertemuan);
            } else {
                $kasQuery->whereBetween('period_date', [$periodStart, $periodEnd]);
            }

            $kasRecords = $kasQuery->orderBy('period_date', 'desc')->get();
            $totalPaid = $kasRecords->where('status', 'paid')->sum('amount');
            $totalUnpaid = $kasRecords->where('status', 'unpaid')->sum('amount');

            // Calculate global unpaid
            $globalUnpaid = Kas::where('mahasiswa_id', $mhs->id)
                ->where('type', 'income')
                ->where('status', 'unpaid')
                ->sum('amount');

            return [
                'id' => $mhs->id,
                'nama' => $mhs->nama,
                'nim' => $mhs->nim,
                'kelas' => $mhs->kelas,
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalUnpaid,
                'global_unpaid' => $globalUnpaid,
                'status' => $totalUnpaid > 0 ? 'unpaid' : ($totalPaid > 0 ? 'paid' : 'no_record'),
                'records' => $kasRecords->map(fn ($k) => [
                    'id' => $k->id,
                    'amount' => $k->amount,
                    'status' => $k->status,
                    'period_date' => $k->period_date->format('Y-m-d'),
                    'description' => $k->description,
                    'payment_method' => $k->payment_method,
                    'payment_reference' => $k->payment_reference,
                    'payment_note' => $k->payment_note,
                    'paid_at' => $k->paid_at?->toDateTimeString(),
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
            $transactionQuery->whereBetween('period_date', [$periodStart, $periodEnd]);
        }

        // Calculate period stats
        $periodIncome = (clone $transactionQuery)->where('type', 'income')->where('status', 'paid')->sum('amount');
        $periodExpense = (clone $transactionQuery)->where('type', 'expense')->sum('amount');

        $paidCount = $mahasiswaList->where('status', 'paid')->count();
        $unpaidCount = $mahasiswaList->where('status', 'unpaid')->count();

        // All transactions (for ledger view)
        $allTransactionsQuery = Kas::with(['mahasiswa', 'creator']);

        if ($pertemuan !== 'all') {
            $allTransactionsQuery->whereDate('period_date', $pertemuan);
        } else {
            $allTransactionsQuery->whereBetween('period_date', [$periodStart, $periodEnd]);
        }

        $allTransactions = $allTransactionsQuery
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
                    'payment_method' => $k->payment_method,
                    'payment_reference' => $k->payment_reference,
                    'payment_note' => $k->payment_note,
                    'paid_at' => $k->paid_at?->toDateTimeString(),
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
                'month' => $startMonth,
                'start_month' => $startMonth,
                'end_month' => $endMonth,
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
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'period_date' => 'required|date',
            'payment_method' => ['nullable', Rule::in(['cash', 'transfer', 'qris'])],
            'payment_reference' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn () => in_array($request->input('payment_method'), ['transfer', 'qris'], true)),
            ],
            'payment_note' => 'nullable|string|max:1000',
        ]);

        $paymentAttributes = $this->buildPaymentAttributes($validated);

        // Check if record exists for this date
        $existing = Kas::where('mahasiswa_id', $validated['mahasiswa_id'])
            ->where('type', 'income')
            ->whereDate('period_date', $validated['period_date'])
            ->first();

        if ($existing) {
            $existing->update([
                'status' => 'paid',
                ...$paymentAttributes,
            ]);
        } else {
            Kas::create([
                'mahasiswa_id' => $validated['mahasiswa_id'],
                'type' => 'income',
                'amount' => self::KAS_AMOUNT,
                'description' => 'Kas Mingguan',
                'category' => 'kas_mingguan',
                'period_date' => $validated['period_date'],
                'status' => 'paid',
                ...$paymentAttributes,
                'created_by' => auth()->id(),
            ]);
        }

        KasSummary::recalculate();

        return back()->with('success', 'Pembayaran kas berhasil dicatat.');
    }

    public function markUnpaid(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'period_date' => 'required|date',
        ]);

        $existing = Kas::where('mahasiswa_id', $validated['mahasiswa_id'])
            ->where('type', 'income')
            ->whereDate('period_date', $validated['period_date'])
            ->first();

        if ($existing) {
            $existing->update([
                'status' => 'unpaid',
                'payment_method' => null,
                'payment_reference' => null,
                'payment_note' => null,
                'paid_at' => null,
            ]);
            KasSummary::recalculate();

            return back()->with('success', 'Pembayaran kas berhasil dibatalkan.');
        }

        return back()->with('error', 'Status pembayaran tidak ditemukan.');
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
        $validated = $request->validate([
            'mahasiswa_ids' => 'required|array',
            'mahasiswa_ids.*' => 'exists:mahasiswa,id',
            'period_date' => 'required|date',
            'payment_method' => ['nullable', Rule::in(['cash', 'transfer', 'qris'])],
            'payment_reference' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn () => in_array($request->input('payment_method'), ['transfer', 'qris'], true)),
            ],
            'payment_note' => 'nullable|string|max:1000',
        ]);

        $paymentAttributes = $this->buildPaymentAttributes($validated);

        foreach ($validated['mahasiswa_ids'] as $mahasiswaId) {
            $existing = Kas::where('mahasiswa_id', $mahasiswaId)
                ->where('type', 'income')
                ->whereDate('period_date', $validated['period_date'])
                ->first();

            if ($existing) {
                $existing->update([
                    'status' => 'paid',
                    ...$paymentAttributes,
                ]);
            } else {
                Kas::create([
                    'mahasiswa_id' => $mahasiswaId,
                    'type' => 'income',
                    'amount' => self::KAS_AMOUNT,
                    'description' => 'Kas Mingguan',
                    'category' => 'kas_mingguan',
                    'period_date' => $validated['period_date'],
                    'status' => 'paid',
                    ...$paymentAttributes,
                    'created_by' => auth()->id(),
                ]);
            }
        }

        KasSummary::recalculate();

        return back()->with('success', 'Pembayaran kas berhasil dicatat untuk '.count($validated['mahasiswa_ids']).' mahasiswa.');
    }

    public function createPertemuan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'period_date' => [
                'nullable',
                'date',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $value) {
                        return;
                    }

                    try {
                        $date = Carbon::parse($value);
                    } catch (\Throwable) {
                        return;
                    }

                    if (! $date->isThursday()) {
                        $fail('Pertemuan kas hanya bisa dibuat pada hari Kamis.');
                    }
                },
            ],
            'month' => ['nullable', 'date_format:Y-m'],
            'start_month' => ['nullable', 'date_format:Y-m'],
            'end_month' => ['nullable', 'date_format:Y-m'],
        ]);

        if (! empty($validated['period_date'])) {
            $periodDates = [Carbon::parse($validated['period_date'])->startOfDay()];
            $periodLabel = 'hari Kamis';
        } else {
            $startMonth = $validated['start_month'] ?? $validated['month'] ?? null;
            $endMonth = $validated['end_month'] ?? $startMonth;

            if (! $startMonth) {
                throw ValidationException::withMessages([
                    'start_month' => 'Bulan awal pertemuan wajib dipilih.',
                ]);
            }

            $start = Carbon::createFromFormat('Y-m-d', "{$startMonth}-01")->startOfMonth();
            $end = Carbon::createFromFormat('Y-m-d', "{$endMonth}-01")->startOfMonth();

            if ($start->gt($end)) {
                throw ValidationException::withMessages([
                    'end_month' => 'Bulan akhir tidak boleh sebelum bulan awal.',
                ]);
            }

            if ($start->diffInMonths($end) > 11) {
                throw ValidationException::withMessages([
                    'end_month' => 'Rentang pertemuan kas maksimal 12 bulan.',
                ]);
            }

            $periodDates = $this->getThursdayDatesForMonthRange($startMonth, $endMonth);
            $periodLabel = $startMonth === $endMonth ? '1 bulan' : 'rentang bulan';
        }

        $mahasiswaList = Mahasiswa::query()->select('id')->get();
        $createdRecords = 0;
        $now = now();

        foreach ($periodDates as $periodDate) {
            $periodDateString = $periodDate->toDateString();
            $existingMahasiswaIds = Kas::whereNotNull('mahasiswa_id')
                ->where('type', 'income')
                ->whereDate('period_date', $periodDateString)
                ->pluck('mahasiswa_id')
                ->mapWithKeys(fn ($id) => [(int) $id => true]);

            $records = [];

            foreach ($mahasiswaList as $mhs) {
                if ($existingMahasiswaIds->has((int) $mhs->id)) {
                    continue;
                }

                $records[] = [
                    'mahasiswa_id' => $mhs->id,
                    'type' => 'income',
                    'amount' => self::KAS_AMOUNT,
                    'description' => 'Kas Mingguan',
                    'category' => 'kas_mingguan',
                    'period_date' => $periodDateString,
                    'status' => 'unpaid',
                    'created_by' => auth()->id(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($records !== []) {
                Kas::insert($records);
                $createdRecords += count($records);
            }
        }

        $dateCount = count($periodDates);
        $message = $dateCount === 1
            ? "Pertemuan kas {$periodLabel} berhasil dibuat ({$createdRecords} tagihan baru)."
            : "Pertemuan kas {$periodLabel} berhasil dibuat untuk {$dateCount} hari Kamis ({$createdRecords} tagihan baru).";

        return back()->with('success', $message);
    }

    public function destroyPertemuan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'period_date' => 'required|date',
        ]);

        $deleted = Kas::where('type', 'income')
            ->whereDate('period_date', $validated['period_date'])
            ->delete();

        if ($deleted === 0) {
            return back()->with('error', 'Pertemuan kas tidak ditemukan.');
        }

        KasSummary::recalculate();

        return back()->with('success', 'Pertemuan kas berhasil dihapus.');
    }

    private function buildPaymentAttributes(array $validated): array
    {
        $method = $validated['payment_method'] ?? 'cash';

        return [
            'payment_method' => $method,
            'payment_reference' => $validated['payment_reference'] ?? null,
            'payment_note' => $validated['payment_note'] ?? null,
            'paid_at' => now(),
        ];
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: string, 3: string}
     */
    private function resolveMonthPeriod(?string $startMonth, ?string $endMonth): array
    {
        $normalizedStartMonth = $this->normalizeMonth($startMonth) ?? now()->format('Y-m');
        $normalizedEndMonth = $this->normalizeMonth($endMonth) ?? $normalizedStartMonth;

        $start = Carbon::createFromFormat('Y-m-d', "{$normalizedStartMonth}-01")->startOfMonth();
        $end = Carbon::createFromFormat('Y-m-d', "{$normalizedEndMonth}-01")->startOfMonth();

        if ($start->gt($end)) {
            $end = $start->copy();
            $normalizedEndMonth = $normalizedStartMonth;
        }

        if ($start->diffInMonths($end) > 11) {
            $end = $start->copy()->addMonthsNoOverflow(11);
            $normalizedEndMonth = $end->format('Y-m');
        }

        return [
            $start->copy()->startOfMonth(),
            $end->copy()->endOfMonth(),
            $normalizedStartMonth,
            $normalizedEndMonth,
        ];
    }

    private function normalizeMonth(?string $month): ?string
    {
        if (! is_string($month) || ! preg_match('/^\d{4}-\d{2}$/', $month)) {
            return null;
        }

        try {
            return Carbon::createFromFormat('Y-m-d', "{$month}-01")->format('Y-m');
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array<int, Carbon>
     */
    private function getThursdayDatesForMonth(string $month): array
    {
        $cursor = Carbon::createFromFormat('Y-m-d', "{$month}-01")->startOfDay();
        $endOfMonth = $cursor->copy()->endOfMonth();
        $dates = [];

        while (! $cursor->isThursday()) {
            $cursor->addDay();
        }

        while ($cursor->lte($endOfMonth)) {
            $dates[] = $cursor->copy();
            $cursor->addWeek();
        }

        return $dates;
    }

    /**
     * @return array<int, Carbon>
     */
    private function getThursdayDatesForMonthRange(string $startMonth, string $endMonth): array
    {
        $cursor = Carbon::createFromFormat('Y-m-d', "{$startMonth}-01")->startOfMonth();
        $end = Carbon::createFromFormat('Y-m-d', "{$endMonth}-01")->endOfMonth();
        $dates = [];

        while ($cursor->lte($end)) {
            $dates = [
                ...$dates,
                ...$this->getThursdayDatesForMonth($cursor->format('Y-m')),
            ];

            $cursor->addMonthNoOverflow()->startOfMonth();
        }

        return $dates;
    }

    public function exportPdf(Request $request): Response
    {
        $type = $request->get('type', 'pertemuan'); // pertemuan, keseluruhan, or matrix
        $date = $request->get('date'); // For pertemuan
        $month = $request->get('month'); // For monthly
        $hasPeriodFilter = $request->filled('month') || $request->filled('start_month') || $request->filled('end_month');
        $startMonth = $request->get('start_month', $month);
        $endMonth = $request->get('end_month', $startMonth);
        [$periodStart, $periodEnd, $startMonth, $endMonth] = $this->resolveMonthPeriod($startMonth, $endMonth);
        $periodSubtitle = $startMonth === $endMonth
            ? $periodStart->translatedFormat('F Y')
            : $periodStart->translatedFormat('F Y').' - '.$periodEnd->translatedFormat('F Y');
        $periodFilename = $startMonth === $endMonth ? $startMonth : "{$startMonth}-sd-{$endMonth}";

        // Matrix-style report (Excel-like)
        if ($type === 'matrix') {
            return $this->exportMatrixPdf($hasPeriodFilter ? $startMonth : null, $hasPeriodFilter ? $endMonth : null);
        }

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

            if ($hasPeriodFilter) {
                $query->whereBetween('period_date', [$periodStart, $periodEnd]);
                $subtitle = $periodSubtitle;
            } else {
                $subtitle = 'Semua Periode';
            }

            $transactions = $query->get();

            // Group by date and calculate running balance
            $grouped = $transactions->groupBy(fn ($t) => $t->period_date->format('Y-m-d'));
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
                'title' => 'Laporan Kas '.($hasPeriodFilter ? 'Periode' : 'Keseluruhan'),
                'subtitle' => $subtitle,
                'ledger' => $ledger,
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'final_balance' => $totalIncome - $totalExpense,
                'type' => 'keseluruhan',
            ];
        }

        $pdf = Pdf::loadView('pdf.kas-report', $data);
        $filename = 'laporan-kas-'.($date ?? ($hasPeriodFilter ? $periodFilename : 'keseluruhan')).'.pdf';

        return $pdf->download($filename);
    }

    private function exportMatrixPdf(?string $startMonth = null, ?string $endMonth = null): Response
    {
        $periodStart = null;
        $periodEnd = null;

        // Get all pertemuan dates
        $pertemuanQuery = Kas::where('type', 'income')
            ->select('period_date')
            ->distinct()
            ->orderBy('period_date', 'asc');

        if ($startMonth) {
            [$periodStart, $periodEnd, $startMonth, $endMonth] = $this->resolveMonthPeriod($startMonth, $endMonth);
            $pertemuanQuery->whereBetween('period_date', [$periodStart, $periodEnd]);
            $subtitle = $startMonth === $endMonth
                ? $periodStart->translatedFormat('F Y')
                : $periodStart->translatedFormat('F Y').' - '.$periodEnd->translatedFormat('F Y');
        } else {
            $subtitle = 'Semua Periode';
        }

        $pertemuanDates = $pertemuanQuery->pluck('period_date')
            ->map(fn ($d) => $d->format('Y-m-d'))
            ->toArray();

        // Get all mahasiswa with their payment status per date
        $mahasiswaList = Mahasiswa::orderBy('nama')->get();

        $mahasiswaMatrix = [];
        $totalPaid = 0;
        $totalUnpaid = 0;
        $dateTotals = [];

        foreach ($pertemuanDates as $date) {
            $dateTotals[$date] = 0;
        }

        foreach ($mahasiswaList as $mhs) {
            $payments = [];
            $mhsTotalPaid = 0;
            $mhsTunggakan = 0;

            foreach ($pertemuanDates as $date) {
                $kasRecord = Kas::where('mahasiswa_id', $mhs->id)
                    ->where('type', 'income')
                    ->whereDate('period_date', $date)
                    ->first();

                if ($kasRecord) {
                    $payments[$date] = $kasRecord->status;
                    if ($kasRecord->status === 'paid') {
                        $mhsTotalPaid += $kasRecord->amount;
                        $dateTotals[$date]++;
                    } else {
                        $mhsTunggakan += $kasRecord->amount;
                    }
                }
            }

            $totalPaid += $mhsTotalPaid;
            $totalUnpaid += $mhsTunggakan;

            $mahasiswaMatrix[] = [
                'id' => $mhs->id,
                'nama' => $mhs->nama,
                'nim' => $mhs->nim,
                'payments' => $payments,
                'total_paid' => $mhsTotalPaid,
                'tunggakan' => $mhsTunggakan,
            ];
        }

        // Get expenses
        $expenseQuery = Kas::where('type', 'expense')->orderBy('period_date', 'desc');
        if ($periodStart && $periodEnd) {
            $expenseQuery->whereBetween('period_date', [$periodStart, $periodEnd]);
        }
        $expenses = $expenseQuery->get();
        $totalExpense = $expenses->sum('amount');

        // Calculate saldo
        $saldoKas = $totalPaid - $totalExpense;

        $data = [
            'subtitle' => $subtitle,
            'pertemuanDates' => $pertemuanDates,
            'mahasiswaMatrix' => $mahasiswaMatrix,
            'dateTotals' => $dateTotals,
            'totalPaid' => $totalPaid,
            'totalUnpaid' => $totalUnpaid,
            'totalExpense' => $totalExpense,
            'saldoKas' => $saldoKas,
            'expenses' => $expenses,
            'kasAmount' => self::KAS_AMOUNT,
            'tempat' => 'Tangerang Selatan',
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'logoUnpam' => public_path('images/logo-unpam.png'),
            'logoSasmita' => public_path('images/logo-sasmita.png'),
        ];

        $pdf = Pdf::loadView('pdf.kas-matrix', $data);
        $pdf->setPaper('A4', 'landscape');
        $filename = 'laporan-kas-matrix-'.($startMonth ? ($startMonth === $endMonth ? $startMonth : "{$startMonth}-sd-{$endMonth}") : 'keseluruhan').'.pdf';

        return $pdf->download($filename);
    }
}
