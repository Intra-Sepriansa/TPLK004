<?php

namespace App\Services;

use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class KasAnalyticsService
{
    public function getFinancialIntelligence(Mahasiswa $mahasiswa): array
    {
        $records = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->orderBy('period_date')
            ->get();

        if ($records->isEmpty()) {
            return $this->defaultFinancialIntelligence();
        }

        $paidRecords = $records->where('status', 'paid')->values();
        $paidCount = $paidRecords->count();
        $totalCount = $records->count();

        $earlyCount = 0;
        $onTimeCount = 0;
        $lateCount = 0;

        foreach ($paidRecords as $record) {
            $deadline = Carbon::parse($record->period_date)->endOfDay();
            $paidAt = Carbon::parse($record->updated_at ?? $record->created_at ?? now());

            if ($paidAt->lt($deadline->copy()->subDay())) {
                $earlyCount++;
            } elseif ($paidAt->lte($deadline)) {
                $onTimeCount++;
            } else {
                $lateCount++;
            }
        }

        $completionRate = $totalCount > 0
            ? round(($paidCount / $totalCount) * 100)
            : 0;

        $onTimeRate = $paidCount > 0
            ? round((($earlyCount + $onTimeCount) / $paidCount) * 100)
            : 0;

        $consistencyScore = $this->calculateConsistencyScore($paidRecords);
        $healthScore = (int) round(($completionRate * 0.45) + ($onTimeRate * 0.35) + ($consistencyScore * 0.20));
        $healthScore = max(0, min(100, $healthScore));

        $paymentStreak = $this->calculateCurrentStreak($records);
        $longestStreak = $this->calculateLongestStreak($records);

        $behaviorScore = [
            'early' => $paidCount > 0 ? round(($earlyCount / $paidCount) * 100) : 0,
            'ontime' => $paidCount > 0 ? round(($onTimeCount / $paidCount) * 100) : 0,
            'late' => $paidCount > 0 ? round(($lateCount / $paidCount) * 100) : 0,
        ];

        $behaviorType = $this->determineBehaviorType($behaviorScore, $paidCount);
        $healthCategory = $this->determineHealthCategory($healthScore);

        $insights = $this->buildInsights(
            completionRate: $completionRate,
            onTimeRate: $onTimeRate,
            streak: $paymentStreak,
            lateCount: $lateCount,
            unpaidCount: $records->where('status', 'unpaid')->count(),
        );

        $recommendations = $this->buildRecommendations(
            healthScore: $healthScore,
            behaviorType: $behaviorType,
            unpaidCount: $records->where('status', 'unpaid')->count(),
            lateCount: $lateCount,
        );

        $payload = [
            'healthScore' => $healthScore,
            'healthCategory' => $healthCategory,
            'paymentStreak' => $paymentStreak,
            'longestStreak' => $longestStreak,
            'behaviorType' => $behaviorType,
            'behaviorScore' => $behaviorScore,
            'insights' => $insights,
            'recommendations' => $recommendations,
        ];

        $this->storeFinancialIntelligence($mahasiswa->id, $payload);

        return $payload;
    }

    public function getPaymentPrediction(Mahasiswa $mahasiswa): array
    {
        $records = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->orderBy('period_date')
            ->get();

        $paidRecords = $records->where('status', 'paid')->values();
        $unpaidRecords = $records->where('status', 'unpaid')->values();

        $confidenceLevel = match (true) {
            $paidRecords->count() >= 6 => 'high',
            $paidRecords->count() >= 3 => 'medium',
            default => 'low',
        };

        $nextDue = $unpaidRecords
            ->filter(fn ($record) => Carbon::parse($record->period_date)->gte(now()->startOfDay()))
            ->sortBy('period_date')
            ->first();

        $avgIntervalDays = $this->averagePaymentInterval($paidRecords);
        $predictedDate = $nextDue
            ? Carbon::parse($nextDue->period_date)->subDays(1)
            : now()->addDays($avgIntervalDays);

        $optimalDate = $nextDue
            ? Carbon::parse($nextDue->period_date)->subDays(2)
            : $predictedDate->copy()->subDay();

        $lateRatio = $this->lateRatio($paidRecords);

        $riskFactors = [];
        $riskScore = 0;

        if ($unpaidRecords->count() > 0) {
            $riskScore += 45;
            $riskFactors[] = 'Masih ada tagihan yang belum dibayar.';
        }

        if ($lateRatio >= 0.3) {
            $riskScore += 35;
            $riskFactors[] = 'Riwayat keterlambatan pembayaran cukup tinggi.';
        }

        if ($paidRecords->count() < 3) {
            $riskScore += 20;
            $riskFactors[] = 'Data historis pembayaran masih terbatas.';
        }

        $riskLevel = $this->determineRiskLevel($riskScore);

        $cashFlowForecast = $this->buildCashFlowForecast();

        $payload = [
            'nextPaymentDate' => $predictedDate->toDateString(),
            'confidenceLevel' => $confidenceLevel,
            'riskLevel' => $riskLevel,
            'riskFactors' => $riskFactors,
            'optimalPaymentDate' => $optimalDate->toDateString(),
            'cashFlowForecast' => $cashFlowForecast,
        ];

        $this->storePaymentPrediction($mahasiswa->id, $payload);

        return $payload;
    }

    public function getPaymentPlanning(Mahasiswa $mahasiswa): array
    {
        $records = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->orderBy('period_date')
            ->get();

        $calendar = $records->map(function ($record) {
            $date = Carbon::parse($record->period_date);
            $status = $record->status === 'paid'
                ? 'paid'
                : ($date->lt(now()->startOfDay()) ? 'overdue' : 'upcoming');

            return [
                'date' => $date->toDateString(),
                'amount' => (float) $record->amount,
                'status' => $status,
                'description' => $record->description ?: 'Kas mingguan',
            ];
        })->values()->all();

        $monthlyBudget = (int) round(max(50000, $records->avg('amount') ?? 0));

        $spentThisMonth = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');

        $remainingBudget = max(0, $monthlyBudget - (int) $spentThisMonth);
        $budgetPercentage = $monthlyBudget > 0
            ? min(100, (int) round(($spentThisMonth / $monthlyBudget) * 100))
            : 0;

        $totalPaid = (float) Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->sum('amount');

        $savingsTarget = (int) max(100000, round($totalPaid * 1.2));
        $savingsPercentage = $savingsTarget > 0
            ? min(100, (int) round(($totalPaid / $savingsTarget) * 100))
            : 0;

        $avgMonthlyPaid = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->selectRaw('DATE_FORMAT(period_date, "%Y-%m") as month_key, SUM(amount) as total')
            ->groupBy('month_key')
            ->pluck('total')
            ->avg() ?? 0;

        $remainingToGoal = max(0, $savingsTarget - $totalPaid);
        $etaMonths = $avgMonthlyPaid > 0 ? (int) ceil($remainingToGoal / $avgMonthlyPaid) : 0;

        $estimatedCompletion = $etaMonths > 0
            ? now()->addMonths($etaMonths)->toDateString()
            : now()->toDateString();

        $installments = $records
            ->where('status', 'unpaid')
            ->take(3)
            ->map(function ($record) {
                $installmentCount = 3;
                $amount = (float) $record->amount;

                return [
                    'totalAmount' => $amount,
                    'installmentCount' => $installmentCount,
                    'amountPerInstallment' => (float) round($amount / $installmentCount, 2),
                    'paidInstallments' => 0,
                    'remainingInstallments' => $installmentCount,
                ];
            })
            ->values()
            ->all();

        return [
            'calendar' => $calendar,
            'budget' => [
                'monthly' => $monthlyBudget,
                'spent' => (float) $spentThisMonth,
                'remaining' => (float) $remainingBudget,
                'percentage' => $budgetPercentage,
            ],
            'savingsGoal' => [
                'target' => $savingsTarget,
                'current' => $totalPaid,
                'percentage' => $savingsPercentage,
                'estimatedCompletion' => $estimatedCompletion,
            ],
            'installments' => $installments,
        ];
    }

    public function getAdvancedAnalytics(Mahasiswa $mahasiswa): array
    {
        $startDate = now()->subDays(90)->startOfDay();

        $heatmap = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->where('updated_at', '>=', $startDate)
            ->selectRaw('DATE(updated_at) as payment_date, COUNT(*) as count, SUM(amount) as amount')
            ->groupBy('payment_date')
            ->orderBy('payment_date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->payment_date,
                'count' => (int) $row->count,
                'amount' => (float) $row->amount,
            ])
            ->values()
            ->all();

        $personalRate = $this->calculateRateForMahasiswa($mahasiswa->id);

        $classRate = $this->calculateClassAverageRate();
        $previousSemesterRate = $this->calculatePreviousSemesterRate($mahasiswa->id);

        $expenseTotals = Kas::query()
            ->where('type', 'expense')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        $overallExpense = (float) ($expenseTotals->sum('total') ?: 0);

        $expenseBreakdown = $expenseTotals->map(function ($row) use ($overallExpense) {
            $currentMonth = (float) Kas::query()
                ->where('type', 'expense')
                ->where('category', $row->category)
                ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('amount');

            $previousMonth = (float) Kas::query()
                ->where('type', 'expense')
                ->where('category', $row->category)
                ->whereBetween('period_date', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])
                ->sum('amount');

            $trend = 'stable';
            if ($currentMonth > $previousMonth) {
                $trend = 'up';
            } elseif ($currentMonth < $previousMonth) {
                $trend = 'down';
            }

            return [
                'category' => (string) $row->category,
                'amount' => (float) $row->total,
                'percentage' => $overallExpense > 0 ? round(((float) $row->total / $overallExpense) * 100, 1) : 0,
                'trend' => $trend,
            ];
        })->values()->all();

        $financialIntelligence = $this->getFinancialIntelligence($mahasiswa);

        $monthlyReport = [
            'month' => now()->translatedFormat('F Y'),
            'totalPaid' => (float) Kas::query()
                ->where('mahasiswa_id', $mahasiswa->id)
                ->where('type', 'income')
                ->where('status', 'paid')
                ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('amount'),
            'totalUnpaid' => (float) Kas::query()
                ->where('mahasiswa_id', $mahasiswa->id)
                ->where('type', 'income')
                ->where('status', 'unpaid')
                ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('amount'),
            'healthScore' => $financialIntelligence['healthScore'],
            'insights' => $financialIntelligence['insights'],
            'recommendations' => $financialIntelligence['recommendations'],
        ];

        return [
            'heatmap' => $heatmap,
            'comparison' => [
                'personal' => $personalRate,
                'classAverage' => $classRate,
                'previousSemester' => $previousSemesterRate,
                'target' => 95,
            ],
            'expenseBreakdown' => $expenseBreakdown,
            'monthlyReport' => $monthlyReport,
        ];
    }

    public function getSocialFeatures(Mahasiswa $mahasiswa): array
    {
        $totalStudents = Mahasiswa::query()->count();

        $paidStudents = (int) Kas::query()
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->distinct('mahasiswa_id')
            ->count('mahasiswa_id');

        $unpaidStudents = max(0, $totalStudents - $paidStudents);
        $paymentRate = $totalStudents > 0
            ? round(($paidStudents / $totalStudents) * 100)
            : 0;

        $ranking = DB::table('kas')
            ->selectRaw('mahasiswa_id, SUM(amount) as total_paid')
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereNotNull('mahasiswa_id')
            ->groupBy('mahasiswa_id')
            ->orderByDesc('total_paid')
            ->get();

        $rank = $ranking->search(fn ($row) => (int) $row->mahasiswa_id === (int) $mahasiswa->id);
        $yourRank = $rank === false ? ($ranking->count() + 1) : ($rank + 1);
        $totalPeers = max(1, $ranking->count());

        $percentile = (int) round((1 - (($yourRank - 1) / $totalPeers)) * 100);
        $category = match (true) {
            $percentile >= 80 => 'Top Performer',
            $percentile >= 60 => 'Above Average',
            $percentile >= 40 => 'Average',
            default => 'Need Improvement',
        };

        $feed = Kas::query()
            ->with('mahasiswa:id,nama')
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereNotNull('mahasiswa_id')
            ->latest('updated_at')
            ->take(8)
            ->get()
            ->map(function ($record) {
                $name = $record->mahasiswa?->nama ?? 'Mahasiswa';
                $anonName = $this->maskName($name);

                return [
                    'id' => (string) $record->id,
                    'type' => 'payment',
                    'message' => sprintf('%s menyelesaikan pembayaran kas %s', $anonName, Carbon::parse($record->period_date)->translatedFormat('d M Y')),
                    'anonymous' => true,
                    'reactions' => [
                        'clap' => max(1, (int) floor(((float) $record->amount) / 25000)),
                        'fire' => max(0, (int) floor(((float) $record->amount) / 100000)),
                        'muscle' => 1,
                    ],
                    'comments' => [],
                    'timestamp' => ($record->updated_at ?? $record->created_at)?->diffForHumans() ?? 'baru saja',
                ];
            })
            ->values()
            ->all();

        return [
            'paymentFeed' => $feed,
            'classStats' => [
                'totalStudents' => $totalStudents,
                'paidStudents' => $paidStudents,
                'unpaidStudents' => $unpaidStudents,
                'paymentRate' => $paymentRate,
                'target' => 95,
            ],
            'peerComparison' => [
                'yourRank' => $yourRank,
                'totalPeers' => $totalPeers,
                'percentile' => max(0, min(100, $percentile)),
                'category' => $category,
            ],
        ];
    }

    private function calculateConsistencyScore(Collection $paidRecords): int
    {
        if ($paidRecords->count() < 3) {
            return 70;
        }

        $dates = $paidRecords
            ->map(fn ($record) => Carbon::parse($record->updated_at ?? $record->created_at ?? $record->period_date))
            ->sort()
            ->values();

        $intervals = [];
        for ($i = 1; $i < $dates->count(); $i++) {
            $intervals[] = $dates[$i - 1]->diffInDays($dates[$i]);
        }

        if (count($intervals) === 0) {
            return 70;
        }

        $average = array_sum($intervals) / count($intervals);
        if ($average <= 0) {
            return 70;
        }

        $variance = array_sum(array_map(
            fn ($interval) => pow($interval - $average, 2),
            $intervals,
        )) / count($intervals);

        $stdDev = sqrt($variance);

        $score = 100 - min(100, ($stdDev / $average) * 100);

        return (int) round(max(0, min(100, $score)));
    }

    private function calculateCurrentStreak(Collection $records): int
    {
        $sorted = $records->sortByDesc('period_date')->values();

        $streak = 0;
        foreach ($sorted as $record) {
            if ($record->status === 'paid') {
                $streak++;
                continue;
            }

            break;
        }

        return $streak;
    }

    private function calculateLongestStreak(Collection $records): int
    {
        $sorted = $records->sortBy('period_date')->values();

        $longest = 0;
        $current = 0;

        foreach ($sorted as $record) {
            if ($record->status === 'paid') {
                $current++;
                $longest = max($longest, $current);
            } else {
                $current = 0;
            }
        }

        return $longest;
    }

    private function determineBehaviorType(array $behaviorScore, int $paidCount): string
    {
        if ($paidCount === 0) {
            return 'inconsistent';
        }

        $maxBehavior = max($behaviorScore);

        if ($maxBehavior < 45) {
            return 'inconsistent';
        }

        if ($maxBehavior === $behaviorScore['early']) {
            return 'early';
        }

        if ($maxBehavior === $behaviorScore['ontime']) {
            return 'ontime';
        }

        return 'late';
    }

    private function determineHealthCategory(int $healthScore): string
    {
        return match (true) {
            $healthScore >= 90 => 'excellent',
            $healthScore >= 75 => 'good',
            $healthScore >= 60 => 'fair',
            default => 'poor',
        };
    }

    private function buildInsights(int $completionRate, int $onTimeRate, int $streak, int $lateCount, int $unpaidCount): array
    {
        $insights = [];

        $insights[] = sprintf('Rasio penyelesaian pembayaran Anda saat ini %d%%.', $completionRate);
        $insights[] = sprintf('Akurasi pembayaran tepat waktu tercatat %d%%.', $onTimeRate);
        $insights[] = sprintf('Streak pembayaran aktif: %d pertemuan berturut-turut.', $streak);

        if ($lateCount > 0) {
            $insights[] = sprintf('Terdapat %d pembayaran terlambat pada histori Anda.', $lateCount);
        }

        if ($unpaidCount > 0) {
            $insights[] = sprintf('Masih ada %d tagihan aktif yang perlu dilunasi.', $unpaidCount);
        }

        return $insights;
    }

    private function buildRecommendations(int $healthScore, string $behaviorType, int $unpaidCount, int $lateCount): array
    {
        $recommendations = [];

        if ($healthScore < 75) {
            $recommendations[] = 'Aktifkan pengingat H-3 dan H-1 agar jadwal pembayaran lebih konsisten.';
        }

        if ($behaviorType === 'late' || $lateCount > 0) {
            $recommendations[] = 'Usahakan menyelesaikan pembayaran minimal 1 hari sebelum deadline.';
        }

        if ($unpaidCount > 0) {
            $recommendations[] = 'Prioritaskan tagihan tertua terlebih dahulu untuk menurunkan risiko keterlambatan.';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Pertahankan kebiasaan pembayaran Anda. Performanya sudah sangat baik.';
        }

        return $recommendations;
    }

    private function defaultFinancialIntelligence(): array
    {
        return [
            'healthScore' => 0,
            'healthCategory' => 'poor',
            'paymentStreak' => 0,
            'longestStreak' => 0,
            'behaviorType' => 'inconsistent',
            'behaviorScore' => [
                'early' => 0,
                'ontime' => 0,
                'late' => 0,
            ],
            'insights' => ['Belum ada histori pembayaran yang cukup untuk dianalisis.'],
            'recommendations' => ['Mulai dengan pembayaran pertama tepat waktu untuk membangun skor finansial.'],
        ];
    }

    private function averagePaymentInterval(Collection $paidRecords): int
    {
        if ($paidRecords->count() < 2) {
            return 7;
        }

        $dates = $paidRecords
            ->map(fn ($record) => Carbon::parse($record->updated_at ?? $record->created_at ?? $record->period_date))
            ->sort()
            ->values();

        $intervals = [];
        for ($i = 1; $i < $dates->count(); $i++) {
            $intervals[] = $dates[$i - 1]->diffInDays($dates[$i]);
        }

        if (empty($intervals)) {
            return 7;
        }

        return max(1, (int) round(array_sum($intervals) / count($intervals)));
    }

    private function lateRatio(Collection $paidRecords): float
    {
        if ($paidRecords->isEmpty()) {
            return 0.0;
        }

        $lateCount = 0;
        foreach ($paidRecords as $record) {
            $deadline = Carbon::parse($record->period_date)->endOfDay();
            $paidAt = Carbon::parse($record->updated_at ?? $record->created_at ?? now());

            if ($paidAt->gt($deadline)) {
                $lateCount++;
            }
        }

        return $lateCount / max(1, $paidRecords->count());
    }

    private function determineRiskLevel(int $riskScore): string
    {
        return match (true) {
            $riskScore >= 70 => 'high',
            $riskScore >= 40 => 'medium',
            default => 'low',
        };
    }

    private function buildCashFlowForecast(): array
    {
        $summary = KasSummary::getSummary();
        $currentBalance = (float) $summary->total_balance;

        $avgIncome = (float) (Kas::query()
            ->where('type', 'income')
            ->where('status', 'paid')
            ->where('period_date', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw('DATE_FORMAT(period_date, "%Y-%m") as month_key, SUM(amount) as total')
            ->groupBy('month_key')
            ->pluck('total')
            ->avg() ?? 0);

        $avgExpense = (float) (Kas::query()
            ->where('type', 'expense')
            ->where('period_date', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw('DATE_FORMAT(period_date, "%Y-%m") as month_key, SUM(amount) as total')
            ->groupBy('month_key')
            ->pluck('total')
            ->avg() ?? 0);

        $forecast = [];
        for ($i = 1; $i <= 3; $i++) {
            $month = now()->addMonths($i);
            $predictedBalance = $currentBalance + (($avgIncome - $avgExpense) * $i);

            $forecast[] = [
                'month' => $month->translatedFormat('F Y'),
                'predictedBalance' => round($predictedBalance, 2),
                'predictedIncome' => round($avgIncome, 2),
                'predictedExpense' => round($avgExpense, 2),
            ];
        }

        return $forecast;
    }

    private function calculateRateForMahasiswa(int $mahasiswaId): int
    {
        $total = Kas::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('type', 'income')
            ->count();

        if ($total === 0) {
            return 0;
        }

        $paid = Kas::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->count();

        return (int) round(($paid / $total) * 100);
    }

    private function calculateClassAverageRate(): int
    {
        $rates = Kas::query()
            ->selectRaw('mahasiswa_id, AVG(CASE WHEN status = "paid" THEN 1 ELSE 0 END) * 100 as rate')
            ->where('type', 'income')
            ->whereNotNull('mahasiswa_id')
            ->groupBy('mahasiswa_id')
            ->pluck('rate');

        if ($rates->isEmpty()) {
            return 0;
        }

        return (int) round($rates->avg());
    }

    private function calculatePreviousSemesterRate(int $mahasiswaId): int
    {
        $start = now()->subMonths(12)->startOfMonth();
        $end = now()->subMonths(6)->endOfMonth();

        $total = Kas::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('type', 'income')
            ->whereBetween('period_date', [$start, $end])
            ->count();

        if ($total === 0) {
            return 0;
        }

        $paid = Kas::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereBetween('period_date', [$start, $end])
            ->count();

        return (int) round(($paid / $total) * 100);
    }

    private function maskName(string $name): string
    {
        $trimmed = trim($name);
        if ($trimmed === '') {
            return 'Mahasiswa';
        }

        $parts = explode(' ', $trimmed);
        $first = $parts[0] ?? 'M';

        return strtoupper(substr($first, 0, 1)) . str_repeat('*', max(2, strlen($first) - 1));
    }

    private function storeFinancialIntelligence(int $mahasiswaId, array $payload): void
    {
        if (! Schema::hasTable('kas_financial_intelligence')) {
            return;
        }

        DB::table('kas_financial_intelligence')->updateOrInsert(
            ['mahasiswa_id' => $mahasiswaId],
            [
                'health_score' => $payload['healthScore'],
                'payment_streak' => $payload['paymentStreak'],
                'longest_streak' => $payload['longestStreak'],
                'behavior_type' => $payload['behaviorType'],
                'insights' => json_encode($payload['insights']),
                'recommendations' => json_encode($payload['recommendations']),
                'last_calculated_at' => now(),
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
    }

    private function storePaymentPrediction(int $mahasiswaId, array $payload): void
    {
        if (! Schema::hasTable('kas_payment_predictions')) {
            return;
        }

        DB::table('kas_payment_predictions')->updateOrInsert(
            ['mahasiswa_id' => $mahasiswaId],
            [
                'predicted_date' => $payload['nextPaymentDate'],
                'confidence_level' => $payload['confidenceLevel'],
                'risk_level' => $payload['riskLevel'],
                'risk_factors' => json_encode($payload['riskFactors']),
                'optimal_payment_date' => $payload['optimalPaymentDate'],
                'forecast' => json_encode($payload['cashFlowForecast']),
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
    }
}
