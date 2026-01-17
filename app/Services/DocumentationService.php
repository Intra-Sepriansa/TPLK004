<?php

namespace App\Services;

use App\Models\DocumentationProgress;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DocumentationService
{
    /**
     * Cache TTL in seconds (1 hour)
     */
    protected const CACHE_TTL = 3600;

    /**
     * Path to documentation JSON files
     */
    protected string $docsPath;

    public function __construct()
    {
        $this->docsPath = resource_path('docs');
    }

    /**
     * Get all guides for a specific role.
     */
    public function getGuides(string $role): Collection
    {
        $cacheKey = "documentation_guides:{$role}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($role) {
            $guides = $this->loadGuidesFromFile($role);
            return collect($guides)->map(fn($guide) => $this->enrichGuide($guide));
        });
    }

    /**
     * Get a specific guide by ID.
     */
    public function getGuide(string $guideId, string $role): ?array
    {
        $guides = $this->getGuides($role);
        return $guides->firstWhere('id', $guideId);
    }

    /**
     * Search guides by query.
     */
    public function searchGuides(string $query, string $role): Collection
    {
        $guides = $this->getGuides($role);
        $query = Str::lower($query);

        return $guides->filter(function ($guide) use ($query) {
            // Search in title
            if (Str::contains(Str::lower($guide['title']), $query)) {
                return true;
            }

            // Search in description
            if (Str::contains(Str::lower($guide['description'] ?? ''), $query)) {
                return true;
            }

            // Search in sections content
            foreach ($guide['sections'] ?? [] as $section) {
                if (Str::contains(Str::lower($section['content'] ?? ''), $query)) {
                    return true;
                }
                if (Str::contains(Str::lower($section['title'] ?? ''), $query)) {
                    return true;
                }
            }

            // Search in FAQ
            foreach ($guide['sections'] ?? [] as $section) {
                if ($section['type'] === 'faq') {
                    foreach ($section['faqs'] ?? [] as $faq) {
                        if (Str::contains(Str::lower($faq['question'] ?? ''), $query)) {
                            return true;
                        }
                        if (Str::contains(Str::lower($faq['answer'] ?? ''), $query)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        })->values();
    }

    /**
     * Track reading progress for a user.
     */
    public function trackProgress(Model $user, string $guideId, array $completedSections): DocumentationProgress
    {
        $progress = DocumentationProgress::getOrCreate($user, $guideId);
        $progress->markSectionsComplete($completedSections);
        return $progress;
    }

    /**
     * Get reading progress for a user.
     */
    public function getProgress(Model $user): Collection
    {
        return DocumentationProgress::getAllForUser($user);
    }

    /**
     * Get progress for a specific guide.
     */
    public function getGuideProgress(Model $user, string $guideId): ?DocumentationProgress
    {
        return DocumentationProgress::where('reader_id', $user->id)
            ->where('reader_type', get_class($user))
            ->where('guide_id', $guideId)
            ->first();
    }

    /**
     * Get overall statistics for a user.
     */
    public function getStats(Model $user, string $role): array
    {
        $guides = $this->getGuides($role);
        return DocumentationProgress::getStatsForUser($user, $guides->count());
    }

    /**
     * Mark a guide as completed.
     */
    public function markGuideComplete(Model $user, string $guideId): DocumentationProgress
    {
        $progress = DocumentationProgress::getOrCreate($user, $guideId);
        $progress->markComplete();
        return $progress;
    }

    /**
     * Reset progress for a guide.
     */
    public function resetGuideProgress(Model $user, string $guideId): void
    {
        DocumentationProgress::where('reader_id', $user->id)
            ->where('reader_type', get_class($user))
            ->where('guide_id', $guideId)
            ->delete();
    }

    /**
     * Get guides with progress for a user.
     */
    public function getGuidesWithProgress(Model $user, string $role): Collection
    {
        $guides = $this->getGuides($role);
        $progress = $this->getProgress($user)->keyBy('guide_id');

        return $guides->map(function ($guide) use ($progress) {
            $guideProgress = $progress->get($guide['id']);
            
            return [
                'id' => $guide['id'],
                'menuKey' => $guide['menuKey'] ?? '',
                'title' => $guide['title'],
                'description' => $guide['description'],
                'icon' => $guide['icon'] ?? '📚',
                'category' => $guide['category'],
                'estimatedTime' => $guide['estimatedReadTime'] ?? 10,
                'progress' => $guideProgress?->getCompletionPercentage() ?? 0,
                'isCompleted' => $guideProgress?->is_completed ?? false,
                'lastReadAt' => $guideProgress?->last_read_at?->toIso8601String(),
            ];
        });
    }

    /**
     * Load guides from JSON file.
     */
    protected function loadGuidesFromFile(string $role): array
    {
        $filename = $role === 'dosen' ? 'dosen-guides.json' : 'mahasiswa-guides.json';
        $filepath = "{$this->docsPath}/{$filename}";

        if (!File::exists($filepath)) {
            // Return default guides if file doesn't exist
            return $this->getDefaultGuides($role);
        }

        $content = File::get($filepath);
        $data = json_decode($content, true);

        return $data['guides'] ?? [];
    }

    /**
     * Enrich guide with computed properties.
     */
    protected function enrichGuide(array $guide): array
    {
        // Calculate estimated read time based on content length
        $totalWords = 0;
        foreach ($guide['sections'] ?? [] as $section) {
            $totalWords += str_word_count($section['content'] ?? '');
        }
        
        // Average reading speed: 200 words per minute
        $estimatedMinutes = max(1, ceil($totalWords / 200));

        return array_merge($guide, [
            'estimatedReadTime' => $estimatedMinutes,
            'sectionCount' => count($guide['sections'] ?? []),
        ]);
    }

    /**
     * Get default guides when JSON file doesn't exist.
     */
    protected function getDefaultGuides(string $role): array
    {
        if ($role === 'dosen') {
            return $this->getDefaultDosenGuides();
        }
        return $this->getDefaultMahasiswaGuides();
    }

    /**
     * Get default dosen guides.
     */
    protected function getDefaultDosenGuides(): array
    {
        return [
            $this->createGuide('dosen-dashboard', 'Dashboard', 'Halaman utama dengan ringkasan aktivitas dan statistik', 'Home', 'core'),
            $this->createGuide('dosen-sesi-absen', 'Sesi Absen', 'Kelola sesi absensi dan token kehadiran', 'Calendar', 'core'),
            $this->createGuide('dosen-courses', 'Mata Kuliah', 'Kelola mata kuliah dan mahasiswa terdaftar', 'BookOpen', 'academic'),
            $this->createGuide('dosen-tugas', 'Informasi Tugas', 'Buat dan kelola tugas untuk mahasiswa', 'ClipboardList', 'academic'),
            $this->createGuide('dosen-permits', 'Persetujuan Izin', 'Review dan setujui permintaan izin mahasiswa', 'FileCheck', 'academic'),
            $this->createGuide('dosen-verify', 'Verifikasi', 'Verifikasi selfie dan deteksi kecurangan', 'CheckCircle', 'core'),
            $this->createGuide('dosen-rekapan', 'Rekapan', 'Laporan kehadiran dan export data', 'ClipboardList', 'analytics'),
            $this->createGuide('dosen-grading', 'Penilaian', 'Sistem penilaian dan kalkulasi nilai akhir', 'GraduationCap', 'academic'),
            $this->createGuide('dosen-class-insights', 'Class Insights', 'Analitik kelas dan tren performa mahasiswa', 'BarChart3', 'analytics'),
            $this->createGuide('dosen-session-templates', 'Session Templates', 'Buat dan kelola template sesi', 'FileText', 'core'),
            $this->createGuide('dosen-notifications', 'Notifikasi', 'Kelola notifikasi dan preferensi', 'Bell', 'communication'),
            $this->createGuide('dosen-chat', 'Chat', 'Fitur pesan dan komunikasi', 'MessageCircle', 'communication'),
        ];
    }

    /**
     * Get default mahasiswa guides.
     */
    protected function getDefaultMahasiswaGuides(): array
    {
        return [
            $this->createGuide('mahasiswa-dashboard', 'Dashboard', 'Ringkasan kehadiran dan tugas mendatang', 'Home', 'core'),
            $this->createGuide('mahasiswa-absen', 'Absen', 'Scan QR code dan verifikasi selfie', 'QrCode', 'core'),
            $this->createGuide('mahasiswa-rekapan', 'Rekapan', 'Riwayat kehadiran dan statistik', 'FileText', 'core'),
            $this->createGuide('mahasiswa-history', 'Riwayat', 'Log kehadiran detail dan filter', 'History', 'core'),
            $this->createGuide('mahasiswa-tugas', 'Informasi Tugas', 'Lihat tugas dan submit pekerjaan', 'ClipboardList', 'academic'),
            $this->createGuide('mahasiswa-permit', 'Izin/Sakit', 'Ajukan izin dan lacak status', 'FileCheck', 'academic'),
            $this->createGuide('mahasiswa-akademik', 'Akademik', 'Kalender akademik dan jadwal kuliah', 'GraduationCap', 'academic'),
            $this->createGuide('mahasiswa-personal-analytics', 'Personal Analytics', 'Metrik performa dan saran perbaikan', 'BarChart3', 'analytics'),
            $this->createGuide('mahasiswa-achievements', 'Pencapaian', 'Sistem badge dan kriteria pencapaian', 'Award', 'analytics'),
            $this->createGuide('mahasiswa-leaderboard', 'Leaderboard', 'Sistem ranking dan perhitungan poin', 'Trophy', 'analytics'),
            $this->createGuide('mahasiswa-kas', 'Uang Kas', 'Tracking pembayaran dan riwayat', 'Wallet', 'finance'),
            $this->createGuide('mahasiswa-kas-voting', 'Voting Kas', 'Proses voting dan hasil', 'Vote', 'finance'),
            $this->createGuide('mahasiswa-chat', 'Chat', 'Fitur pesan dan komunikasi', 'MessageCircle', 'communication'),
        ];
    }

    /**
     * Create a guide structure.
     */
    protected function createGuide(string $id, string $title, string $description, string $icon, string $category): array
    {
        return [
            'id' => $id,
            'menuKey' => Str::afterLast($id, '-'),
            'title' => $title,
            'description' => $description,
            'icon' => $icon,
            'category' => $category,
            'lastUpdated' => now()->toIso8601String(),
            'version' => '1.0.0',
            'sections' => [
                [
                    'id' => 'overview',
                    'title' => 'Overview',
                    'type' => 'overview',
                    'content' => "Selamat datang di panduan {$title}. {$description}.",
                ],
                [
                    'id' => 'features',
                    'title' => 'Fitur',
                    'type' => 'features',
                    'content' => "Fitur-fitur utama yang tersedia di menu {$title}.",
                ],
                [
                    'id' => 'tutorial',
                    'title' => 'Tutorial',
                    'type' => 'tutorial',
                    'content' => "Langkah-langkah menggunakan {$title}.",
                    'steps' => [],
                ],
                [
                    'id' => 'tips',
                    'title' => 'Tips & Best Practices',
                    'type' => 'tips',
                    'content' => "Tips untuk menggunakan {$title} dengan efektif.",
                ],
                [
                    'id' => 'faq',
                    'title' => 'FAQ',
                    'type' => 'faq',
                    'content' => 'Pertanyaan yang sering diajukan.',
                    'faqs' => [],
                ],
            ],
        ];
    }

    /**
     * Clear documentation cache.
     */
    public function clearCache(?string $role = null): void
    {
        if ($role) {
            Cache::forget("documentation_guides:{$role}");
        } else {
            Cache::forget('documentation_guides:dosen');
            Cache::forget('documentation_guides:mahasiswa');
        }
    }
}
