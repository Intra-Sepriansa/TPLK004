<?php

namespace App\Services;

use App\Models\TutorialCompletion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class TutorialService
{
    /**
     * Cache TTL in seconds (1 hour)
     */
    protected const CACHE_TTL = 3600;

    /**
     * Path to tutorial JSON files
     */
    protected string $tutorialsPath;

    public function __construct()
    {
        $this->tutorialsPath = resource_path('docs/tutorials');
    }

    /**
     * Get all tutorials for a role.
     */
    public function getTutorials(string $role): Collection
    {
        $cacheKey = "tutorials:{$role}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($role) {
            return collect($this->getDefaultTutorials($role));
        });
    }

    /**
     * Get a specific tutorial by ID.
     */
    public function getTutorial(string $tutorialId, string $role): ?array
    {
        $tutorials = $this->getTutorials($role);
        return $tutorials->firstWhere('id', $tutorialId);
    }

    /**
     * Start a tutorial for a user.
     */
    public function startTutorial(Model $user, string $tutorialId): TutorialCompletion
    {
        return TutorialCompletion::startForUser($user, $tutorialId);
    }

    /**
     * Complete a tutorial for a user.
     */
    public function completeTutorial(Model $user, string $tutorialId): TutorialCompletion
    {
        return TutorialCompletion::completeForUser($user, $tutorialId);
    }

    /**
     * Skip a tutorial for a user.
     */
    public function skipTutorial(Model $user, string $tutorialId): TutorialCompletion
    {
        return TutorialCompletion::skipForUser($user, $tutorialId);
    }

    /**
     * Reset a tutorial for a user.
     */
    public function resetTutorial(Model $user, string $tutorialId): TutorialCompletion
    {
        return TutorialCompletion::resetForUser($user, $tutorialId);
    }

    /**
     * Advance to next step in a tutorial.
     */
    public function advanceStep(Model $user, string $tutorialId): TutorialCompletion
    {
        $completion = TutorialCompletion::getOrCreate($user, $tutorialId);
        return $completion->advanceStep();
    }

    /**
     * Set current step in a tutorial.
     */
    public function setStep(Model $user, string $tutorialId, int $step): TutorialCompletion
    {
        $completion = TutorialCompletion::getOrCreate($user, $tutorialId);
        return $completion->setStep($step);
    }

    /**
     * Get tutorial status for a user.
     */
    public function getStatus(Model $user): array
    {
        return TutorialCompletion::getStatusForUser($user);
    }

    /**
     * Get completion record for a specific tutorial.
     */
    public function getCompletion(Model $user, string $tutorialId): ?TutorialCompletion
    {
        return TutorialCompletion::where('learner_id', $user->id)
            ->where('learner_type', get_class($user))
            ->where('tutorial_id', $tutorialId)
            ->first();
    }

    /**
     * Check if user should see a tutorial.
     */
    public function shouldShowTutorial(Model $user, string $tutorialId): bool
    {
        return TutorialCompletion::shouldShowTutorial($user, $tutorialId);
    }

    /**
     * Get tutorials with completion status for a user.
     */
    public function getTutorialsWithStatus(Model $user, string $role): Collection
    {
        $tutorials = $this->getTutorials($role);
        $completions = TutorialCompletion::getAllForUser($user)->keyBy('tutorial_id');

        return $tutorials->map(function ($tutorial) use ($completions) {
            $completion = $completions->get($tutorial['id']);

            return array_merge($tutorial, [
                'status' => [
                    'completed' => $completion?->completed ?? false,
                    'skipped' => $completion?->skipped ?? false,
                    'in_progress' => $completion?->isInProgress() ?? false,
                    'current_step' => $completion?->current_step ?? 0,
                    'started_at' => $completion?->started_at?->toIso8601String(),
                    'completed_at' => $completion?->completed_at?->toIso8601String(),
                ],
            ]);
        });
    }

    /**
     * Get statistics for a user.
     */
    public function getStats(Model $user, string $role): array
    {
        $tutorials = $this->getTutorials($role);
        $completions = TutorialCompletion::getAllForUser($user);

        $completed = $completions->where('completed', true)->count();
        $skipped = $completions->where('skipped', true)->count();
        $inProgress = $completions->filter(fn($c) => $c->isInProgress())->count();
        $total = $tutorials->count();

        return [
            'total' => $total,
            'completed' => $completed,
            'skipped' => $skipped,
            'in_progress' => $inProgress,
            'not_started' => $total - $completed - $skipped - $inProgress,
            'completion_percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
        ];
    }

    /**
     * Get default tutorials for a role.
     */
    protected function getDefaultTutorials(string $role): array
    {
        if ($role === 'dosen') {
            return $this->getDosenTutorials();
        }
        return $this->getMahasiswaTutorials();
    }

    /**
     * Get dosen tutorials.
     */
    protected function getDosenTutorials(): array
    {
        return [
            $this->createTutorial('dosen-sesi-absen-tutorial', 'Membuat Sesi Absen', 'Pelajari cara membuat dan mengelola sesi absensi', [
                ['title' => 'Buka Menu Sesi Absen', 'description' => 'Klik menu "Sesi Absen" di sidebar', 'selector' => '[data-menu="sesi-absen"]'],
                ['title' => 'Klik Tombol Buat Sesi', 'description' => 'Klik tombol "Buat Sesi Baru" di pojok kanan atas', 'selector' => '[data-action="create-session"]'],
                ['title' => 'Pilih Mata Kuliah', 'description' => 'Pilih mata kuliah dari dropdown', 'selector' => '[data-field="course"]'],
                ['title' => 'Atur Waktu', 'description' => 'Tentukan waktu mulai dan selesai sesi', 'selector' => '[data-field="time"]'],
                ['title' => 'Simpan Sesi', 'description' => 'Klik tombol "Simpan" untuk membuat sesi', 'selector' => '[data-action="save"]'],
            ]),
            $this->createTutorial('dosen-verify-tutorial', 'Verifikasi Kehadiran', 'Pelajari cara memverifikasi selfie mahasiswa', [
                ['title' => 'Buka Menu Verifikasi', 'description' => 'Klik menu "Verifikasi" di sidebar', 'selector' => '[data-menu="verify"]'],
                ['title' => 'Pilih Sesi', 'description' => 'Pilih sesi yang ingin diverifikasi', 'selector' => '[data-field="session"]'],
                ['title' => 'Review Selfie', 'description' => 'Periksa selfie mahasiswa satu per satu', 'selector' => '[data-action="review"]'],
                ['title' => 'Approve atau Reject', 'description' => 'Klik approve jika valid, reject jika tidak', 'selector' => '[data-action="approve"]'],
            ]),
            $this->createTutorial('dosen-grading-tutorial', 'Memberikan Nilai', 'Pelajari cara memberikan nilai kepada mahasiswa', [
                ['title' => 'Buka Menu Penilaian', 'description' => 'Klik menu "Penilaian" di sidebar', 'selector' => '[data-menu="grading"]'],
                ['title' => 'Pilih Mata Kuliah', 'description' => 'Pilih mata kuliah yang akan dinilai', 'selector' => '[data-field="course"]'],
                ['title' => 'Input Nilai', 'description' => 'Masukkan nilai untuk setiap mahasiswa', 'selector' => '[data-field="grade"]'],
                ['title' => 'Simpan Nilai', 'description' => 'Klik tombol "Simpan" untuk menyimpan nilai', 'selector' => '[data-action="save"]'],
            ]),
        ];
    }

    /**
     * Get mahasiswa tutorials.
     */
    protected function getMahasiswaTutorials(): array
    {
        return [
            $this->createTutorial('mahasiswa-absen-tutorial', 'Melakukan Absensi', 'Pelajari cara melakukan absensi dengan QR code', [
                ['title' => 'Buka Menu Absen', 'description' => 'Klik menu "Absen" di sidebar', 'selector' => '[data-menu="absen"]'],
                ['title' => 'Scan QR Code', 'description' => 'Arahkan kamera ke QR code yang ditampilkan dosen', 'selector' => '[data-action="scan"]'],
                ['title' => 'Ambil Selfie', 'description' => 'Ambil foto selfie untuk verifikasi', 'selector' => '[data-action="selfie"]'],
                ['title' => 'Konfirmasi', 'description' => 'Klik tombol "Konfirmasi" untuk menyelesaikan absensi', 'selector' => '[data-action="confirm"]'],
            ]),
            $this->createTutorial('mahasiswa-permit-tutorial', 'Mengajukan Izin', 'Pelajari cara mengajukan izin tidak hadir', [
                ['title' => 'Buka Menu Izin/Sakit', 'description' => 'Klik menu "Izin/Sakit" di sidebar', 'selector' => '[data-menu="permit"]'],
                ['title' => 'Klik Ajukan Izin', 'description' => 'Klik tombol "Ajukan Izin Baru"', 'selector' => '[data-action="create"]'],
                ['title' => 'Pilih Jenis Izin', 'description' => 'Pilih jenis izin (Sakit/Izin)', 'selector' => '[data-field="type"]'],
                ['title' => 'Upload Bukti', 'description' => 'Upload surat keterangan jika diperlukan', 'selector' => '[data-field="attachment"]'],
                ['title' => 'Kirim Pengajuan', 'description' => 'Klik tombol "Kirim" untuk mengajukan', 'selector' => '[data-action="submit"]'],
            ]),
            $this->createTutorial('mahasiswa-tugas-tutorial', 'Mengumpulkan Tugas', 'Pelajari cara melihat dan mengumpulkan tugas', [
                ['title' => 'Buka Menu Tugas', 'description' => 'Klik menu "Informasi Tugas" di sidebar', 'selector' => '[data-menu="tugas"]'],
                ['title' => 'Pilih Tugas', 'description' => 'Klik tugas yang ingin dikerjakan', 'selector' => '[data-action="select"]'],
                ['title' => 'Baca Instruksi', 'description' => 'Baca instruksi tugas dengan teliti', 'selector' => '[data-section="instructions"]'],
                ['title' => 'Upload File', 'description' => 'Upload file tugas yang sudah dikerjakan', 'selector' => '[data-action="upload"]'],
                ['title' => 'Submit', 'description' => 'Klik tombol "Submit" untuk mengumpulkan', 'selector' => '[data-action="submit"]'],
            ]),
        ];
    }

    /**
     * Create a tutorial structure.
     */
    protected function createTutorial(string $id, string $title, string $description, array $steps): array
    {
        return [
            'id' => $id,
            'title' => $title,
            'description' => $description,
            'totalSteps' => count($steps),
            'steps' => array_map(function ($step, $index) {
                return array_merge($step, [
                    'stepNumber' => $index + 1,
                    'action' => $step['action'] ?? 'click',
                ]);
            }, $steps, array_keys($steps)),
        ];
    }

    /**
     * Clear tutorial cache.
     */
    public function clearCache(?string $role = null): void
    {
        if ($role) {
            Cache::forget("tutorials:{$role}");
        } else {
            Cache::forget('tutorials:dosen');
            Cache::forget('tutorials:mahasiswa');
        }
    }
}
