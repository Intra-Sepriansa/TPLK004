<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use App\Services\KasAnalyticsService;
use App\Services\KasGamificationService;
use App\Services\KasReminderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class KasController extends Controller
{
    public function __construct(
        protected KasAnalyticsService $analyticsService,
        protected KasReminderService $reminderService,
        protected KasGamificationService $gamificationService,
    ) {
    }

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

        $financialIntelligence = $this->analyticsService->getFinancialIntelligence($mahasiswa);
        $paymentPrediction = $this->analyticsService->getPaymentPrediction($mahasiswa);
        $paymentPlanning = $this->analyticsService->getPaymentPlanning($mahasiswa);
        $advancedAnalytics = $this->analyticsService->getAdvancedAnalytics($mahasiswa);
        $socialFeatures = $this->analyticsService->getSocialFeatures($mahasiswa);
        $gamification = $this->gamificationService->getGamificationData($mahasiswa, $financialIntelligence);
        $reminderSettings = $this->reminderService->getReminderSettings($mahasiswa);
        $upcomingReminders = $this->reminderService->scheduleReminders($mahasiswa);
        $receiptUploadTargets = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'unpaid')
            ->orderBy('period_date')
            ->get()
            ->map(fn ($record) => [
                'id' => $record->id,
                'label' => ($record->description ?: 'Kas mingguan') . ' • ' . $record->period_date->translatedFormat('d M Y'),
                'amount' => (float) $record->amount,
            ])
            ->values();

        $receiptWorkflow = collect();
        if (Schema::hasTable('kas_payment_receipts')) {
            $receiptWorkflow = DB::table('kas_payment_receipts as r')
                ->leftJoin('kas as k', 'k.id', '=', 'r.kas_id')
                ->where('r.mahasiswa_id', $mahasiswa->id)
                ->orderByDesc('r.created_at')
                ->limit(12)
                ->get([
                    'r.id',
                    'r.kas_id',
                    'r.status',
                    'r.image_url',
                    'r.ocr_data',
                    'r.created_at',
                    'r.reviewed_at',
                    'k.amount as expected_amount',
                    'k.description as kas_description',
                    'k.period_date',
                ])
                ->map(function ($row) {
                    $ocr = json_decode((string) ($row->ocr_data ?? 'null'), true);

                    return [
                        'id' => (int) $row->id,
                        'kas_id' => (int) ($row->kas_id ?? 0),
                        'status' => (string) $row->status,
                        'image_url' => $row->image_url ? asset('storage/' . ltrim((string) $row->image_url, '/')) : null,
                        'ocr_data' => is_array($ocr) ? $ocr : null,
                        'expected_amount' => (float) ($row->expected_amount ?? 0),
                        'kas_description' => $row->kas_description ?: 'Pembayaran kas',
                        'period_date' => $row->period_date,
                        'created_at' => $row->created_at ? Carbon::parse((string) $row->created_at)->toDateTimeString() : null,
                        'reviewed_at' => $row->reviewed_at ? Carbon::parse((string) $row->reviewed_at)->toDateTimeString() : null,
                    ];
                })
                ->values();
        }

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
            'financialIntelligence' => $financialIntelligence,
            'paymentPrediction' => $paymentPrediction,
            'paymentPlanning' => $paymentPlanning,
            'advancedAnalytics' => $advancedAnalytics,
            'socialFeatures' => $socialFeatures,
            'gamification' => $gamification,
            'reminderSettings' => $reminderSettings,
            'upcomingReminders' => $upcomingReminders,
            'receiptUploadTargets' => $receiptUploadTargets,
            'receiptWorkflow' => $receiptWorkflow,
        ]);
    }

    public function getHealthScore(): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();

        return response()->json([
            'data' => $this->analyticsService->getFinancialIntelligence($mahasiswa),
        ]);
    }

    public function getPredictions(): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();

        return response()->json([
            'data' => $this->analyticsService->getPaymentPrediction($mahasiswa),
        ]);
    }

    public function getInsights(): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $intelligence = $this->analyticsService->getFinancialIntelligence($mahasiswa);
        $advanced = $this->analyticsService->getAdvancedAnalytics($mahasiswa);

        return response()->json([
            'data' => [
                'insights' => $intelligence['insights'],
                'recommendations' => $intelligence['recommendations'],
                'monthlyReport' => $advanced['monthlyReport'],
            ],
        ]);
    }

    public function updateReminderPreferences(Request $request): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $payload = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'channels' => ['sometimes', 'array'],
            'timing' => ['sometimes', 'array'],
            'preferences' => ['sometimes', 'array'],
        ]);

        $settings = $this->reminderService->updateReminderPreferences($mahasiswa, $payload);
        $upcoming = $this->reminderService->scheduleReminders($mahasiswa);

        return response()->json([
            'message' => 'Pengaturan reminder berhasil diperbarui.',
            'data' => [
                'settings' => $settings,
                'upcomingReminders' => $upcoming,
            ],
        ]);
    }

    public function snoozeReminder(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $validated = $request->validate([
            'hours' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $success = $this->reminderService->snoozeReminder($mahasiswa, $id, (int) ($validated['hours'] ?? 3));

        if (! $success) {
            return response()->json(['message' => 'Reminder tidak ditemukan.'], 404);
        }

        return response()->json([
            'message' => 'Reminder berhasil ditunda.',
            'data' => $this->reminderService->scheduleReminders($mahasiswa),
        ]);
    }

    public function getAchievements(): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $intelligence = $this->analyticsService->getFinancialIntelligence($mahasiswa);

        return response()->json([
            'data' => $this->gamificationService->getAchievements($mahasiswa, $intelligence),
        ]);
    }

    public function getLeaderboard(): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();

        return response()->json([
            'data' => $this->gamificationService->getLeaderboard($mahasiswa),
        ]);
    }

    public function getChallenges(): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $intelligence = $this->analyticsService->getFinancialIntelligence($mahasiswa);

        return response()->json([
            'data' => $this->gamificationService->getChallenges($mahasiswa, $intelligence),
        ]);
    }

    public function uploadReceipt(Request $request): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $validated = $request->validate([
            'kas_id' => ['required', 'integer', 'exists:kas,id'],
            'receipt' => ['required', 'image', 'max:4096'],
        ]);

        if (! Schema::hasTable('kas_payment_receipts')) {
            return response()->json([
                'message' => 'Tabel kas_payment_receipts belum tersedia. Jalankan migrasi terlebih dahulu.',
            ], 503);
        }

        $path = $request->file('receipt')->store('kas-receipts', 'public');

        $receiptId = DB::table('kas_payment_receipts')->insertGetId([
            'kas_id' => $validated['kas_id'],
            'mahasiswa_id' => $mahasiswa->id,
            'image_url' => $path,
            'ocr_data' => json_encode([
                'amount' => null,
                'date' => null,
                'bankName' => null,
                'confidence' => 0,
            ]),
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah.',
            'data' => [
                'id' => $receiptId,
                'status' => 'pending',
                'imageUrl' => asset('storage/' . ltrim($path, '/')),
            ],
        ]);
    }

    public function exportData(Request $request)
    {
        $mahasiswa = $this->resolveMahasiswa();
        $validated = $request->validate([
            'format' => ['required', 'in:json,csv'],
        ]);

        $records = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->orderBy('period_date')
            ->get(['id', 'period_date', 'amount', 'status', 'description', 'category']);

        if ($validated['format'] === 'json') {
            return response()->json([
                'exported_at' => now()->toIso8601String(),
                'records' => $records,
            ]);
        }

        $filename = 'kas-export-' . now()->format('Ymd-His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($records) {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['id', 'period_date', 'amount', 'status', 'description', 'category']);

            foreach ($records as $record) {
                fputcsv($stream, [
                    $record->id,
                    $record->period_date,
                    $record->amount,
                    $record->status,
                    $record->description,
                    $record->category,
                ]);
            }

            fclose($stream);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function generateReport(Request $request): JsonResponse
    {
        $mahasiswa = $this->resolveMahasiswa();
        $validated = $request->validate([
            'period' => ['nullable', 'in:monthly,semester'],
        ]);

        $period = $validated['period'] ?? 'monthly';
        $intelligence = $this->analyticsService->getFinancialIntelligence($mahasiswa);
        $prediction = $this->analyticsService->getPaymentPrediction($mahasiswa);
        $advanced = $this->analyticsService->getAdvancedAnalytics($mahasiswa);

        return response()->json([
            'data' => [
                'period' => $period,
                'generatedAt' => now()->toIso8601String(),
                'financialIntelligence' => $intelligence,
                'paymentPrediction' => $prediction,
                'monthlyReport' => $advanced['monthlyReport'],
            ],
        ]);
    }

    private function resolveMahasiswa(): Mahasiswa
    {
        /** @var Mahasiswa $mahasiswa */
        $mahasiswa = Auth::guard('mahasiswa')->user();

        return $mahasiswa;
    }
}
