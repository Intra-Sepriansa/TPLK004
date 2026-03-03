<?php

namespace App\Services;

use App\Models\Tugas;
use Illuminate\Support\Str;

class TugasAIService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function suggestTitle(string $partialTitle, ?int $courseId = null): array
    {
        $normalized = Str::lower(trim($partialTitle));
        if (mb_strlen($normalized) < 3) {
            return [];
        }

        $suggestions = [];

        $patterns = [
            'essay' => ['prefix' => 'Essay', 'category' => 'Tugas', 'confidence' => 0.85],
            'proyek' => ['prefix' => 'Project', 'category' => 'Project', 'confidence' => 0.88],
            'project' => ['prefix' => 'Project', 'category' => 'Project', 'confidence' => 0.90],
            'quiz' => ['prefix' => 'Quiz', 'category' => 'Quiz', 'confidence' => 0.84],
            'ujian' => ['prefix' => 'Ujian', 'category' => 'Ujian', 'confidence' => 0.83],
            'presentasi' => ['prefix' => 'Presentasi', 'category' => 'Presentasi', 'confidence' => 0.82],
            'laporan' => ['prefix' => 'Laporan', 'category' => 'Tugas', 'confidence' => 0.80],
        ];

        foreach ($patterns as $keyword => $pattern) {
            if (!Str::contains($normalized, $keyword)) {
                continue;
            }

            $title = sprintf('%s: %s', $pattern['prefix'], Str::title(trim($partialTitle)));
            $suggestions[] = [
                'title' => $title,
                'confidence' => $pattern['confidence'],
                'category' => $pattern['category'],
                'reasoning' => sprintf('Pola kata "%s" terdeteksi dari input.', $keyword),
            ];
        }

        $historicalTitles = $this->getHistoricalTitles($courseId);
        foreach ($historicalTitles as $historical) {
            $percent = 0.0;
            similar_text($normalized, Str::lower((string) $historical['title']), $percent);

            if ($percent < 50) {
                continue;
            }

            $suggestions[] = [
                'title' => $historical['title'],
                'confidence' => min(0.95, round($percent / 100, 2)),
                'category' => $historical['category'] ?? 'Tugas',
                'reasoning' => 'Mirip dengan tugas sebelumnya di mata kuliah yang sama.',
            ];
        }

        if (empty($suggestions)) {
            $suggestions[] = [
                'title' => Str::title(trim($partialTitle)),
                'confidence' => 0.70,
                'category' => 'Tugas',
                'reasoning' => 'Menggunakan normalisasi judul otomatis.',
            ];
        }

        usort($suggestions, static fn(array $a, array $b) => $b['confidence'] <=> $a['confidence']);

        return array_slice($suggestions, 0, 5);
    }

    public function generateDescription(string $title, string $category, ?int $courseId = null): string
    {
        $courseContext = $courseId ? "Mata kuliah ID: {$courseId}" : 'Mata kuliah umum';

        $templates = [
            'Tugas' => "<h2>Deskripsi Tugas</h2><p>{$title}</p><p><strong>{$courseContext}</strong></p><h3>Instruksi</h3><ol><li>Baca materi referensi yang sudah diberikan.</li><li>Susun jawaban secara sistematis.</li><li>Unggah hasil sebelum deadline.</li></ol><h3>Kriteria Penilaian</h3><ul><li>Ketepatan jawaban</li><li>Kelengkapan analisis</li><li>Kerapian penyajian</li></ul>",
            'Project' => "<h2>Project Overview</h2><p>{$title}</p><p><strong>{$courseContext}</strong></p><h3>Deliverables</h3><ol><li>Source code dan dokumentasi.</li><li>Demo singkat fitur utama.</li><li>Laporan implementasi.</li></ol><h3>Evaluasi</h3><ul><li>Fungsionalitas</li><li>Kualitas kode</li><li>Dokumentasi</li></ul>",
            'Quiz' => "<h2>Informasi Quiz</h2><p>{$title}</p><h3>Cakupan Materi</h3><ul><li>Materi pertemuan terakhir</li><li>Latihan terstruktur</li></ul><h3>Ketentuan</h3><ul><li>Waktu terbatas</li><li>Kerjakan mandiri</li></ul>",
            'Ujian' => "<h2>Informasi Ujian</h2><p>{$title}</p><h3>Instruksi</h3><ul><li>Datang tepat waktu</li><li>Pastikan perangkat siap jika ujian online</li><li>Ikuti aturan akademik</li></ul>",
            'Presentasi' => "<h2>Presentasi</h2><p>{$title}</p><h3>Output yang Diharapkan</h3><ol><li>Slide terstruktur.</li><li>Pemaparan maksimal 15 menit.</li><li>Daftar referensi.</li></ol>",
        ];

        return $templates[$category] ?? $templates['Tugas'];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function predictDeadline(string $title, string $category, ?int $estimatedHours = null): array
    {
        $now = now();
        $hours = max(1, $estimatedHours ?? 6);

        $baseDays = match (Str::lower($category)) {
            'project' => 10,
            'ujian' => 5,
            'presentasi' => 6,
            'quiz' => 3,
            default => 7,
        };

        $workloadFactor = (int) ceil($hours / 8);

        $standard = $now->copy()->addDays($baseDays + $workloadFactor);
        $conservative = $now->copy()->addDays($baseDays + $workloadFactor + 4);
        $tight = $now->copy()->addDays(max(2, $baseDays - 2));

        return [
            [
                'label' => 'Conservative',
                'date' => $conservative->toDateTimeString(),
                'reasoning' => 'Waktu longgar untuk quality check.',
            ],
            [
                'label' => 'Standard',
                'date' => $standard->toDateTimeString(),
                'reasoning' => 'Timeline seimbang untuk eksekusi tugas.',
            ],
            [
                'label' => 'Tight',
                'date' => $tight->toDateTimeString(),
                'reasoning' => 'Cocok untuk tugas prioritas cepat.',
            ],
        ];
    }

    /**
     * @return array<int, array{title: string, category: string|null}>
     */
    private function getHistoricalTitles(?int $courseId): array
    {
        if (!$courseId) {
            return [];
        }

        return Tugas::query()
            ->where('course_id', $courseId)
            ->selectRaw('judul as title, jenis as category')
            ->latest('id')
            ->limit(12)
            ->get()
            ->toArray();
    }
}
