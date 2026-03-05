<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use InvalidArgumentException;

class DosenUMLDocumentationService
{
    public const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml';

    /**
     * @return array<int, string>
     */
    public function diagramTypes(): array
    {
        return ['activity_existing', 'use_case', 'activity', 'sequence', 'class'];
    }

    /**
     * @return array<string, string>
     */
    public function diagramFileNames(): array
    {
        return [
            'activity_existing' => 'activity-eksisting.uml',
            'use_case' => 'use-case.uml',
            'activity' => 'activity-baru.uml',
            'sequence' => 'sequence.uml',
            'class' => 'class.uml',
        ];
    }

    /**
     * @return array<int, array<string, string>>
     */
    public function diagramTypeMetadata(): array
    {
        return [
            [
                'id' => 'activity_existing',
                'name' => 'Activity Diagram Eksisting',
                'description' => 'Alur sistem saat ini sebelum enhancement.',
            ],
            [
                'id' => 'use_case',
                'name' => 'Use Case Diagram',
                'description' => 'Interaksi aktor dengan kapabilitas menu.',
            ],
            [
                'id' => 'activity',
                'name' => 'Activity Diagram Baru',
                'description' => 'Alur baru hasil improvement desain proses.',
            ],
            [
                'id' => 'sequence',
                'name' => 'Sequence Diagram',
                'description' => 'Urutan komunikasi antar komponen sistem.',
            ],
            [
                'id' => 'class',
                'name' => 'Class Diagram',
                'description' => 'Struktur kelas, atribut, method, dan relasi.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function menusWithDiagrams(): array
    {
        $menus = [];

        foreach ($this->menuDefinitions() as $menu) {
            $diagrams = [];
            $previewUrls = [];
            $explanations = [];
            $filePaths = [];
            $availableCount = 0;

            foreach ($this->diagramTypes() as $diagramType) {
                $path = $this->resourceDiagramPath($menu['id'], $diagramType);
                $exists = File::exists($path);
                if ($exists) {
                    $availableCount++;
                }

                // UML source belum di-host terpisah, jadi sementara kosong.
                $code = $exists ? (string) File::get($path) : '';
                $diagrams[$diagramType] = $code;
                $previewUrls[$diagramType] = $code !== ''
                    ? $this->previewUrlFromCode($code, 'svg')
                    : '';
                $explanations[$diagramType] = $this->explanation($menu['id'], $diagramType);
                $filePaths[$diagramType] = $this->relativeResourceDiagramPath($menu['id'], $diagramType);
            }

            $totalTypes = count($this->diagramTypes());
            $completionPercentage = $totalTypes > 0
                ? (int) round(($availableCount / $totalTypes) * 100)
                : 0;

            $menus[] = [
                'id' => $menu['id'],
                'name' => $menu['name'],
                'icon' => $menu['icon'],
                'color' => $menu['color'],
                'description' => $menu['description'],
                'diagrams' => $diagrams,
                'preview_urls' => $previewUrls,
                'explanations' => $explanations,
                'features' => $menu['features'],
                'actors' => $menu['actors'],
                'architecture_notes' => $menu['architecture_notes'],
                'risk_improvements' => $menu['risk_improvements'],
                'completion' => [
                    'available' => $availableCount,
                    'total' => $totalTypes,
                    'percentage' => $completionPercentage,
                ],
                'quality_badge' => $this->qualityBadge($completionPercentage),
                'file_paths' => $filePaths,
                'status' => 'development',
            ];
        }

        return $menus;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function menu(string $menuId): ?array
    {
        foreach ($this->menuDefinitions() as $menu) {
            if ($menu['id'] === $menuId) {
                return $menu;
            }
        }

        return null;
    }

    public function getDiagramCode(string $menuId, string $diagramType): string
    {
        if (!in_array($diagramType, $this->diagramTypes(), true)) {
            throw new InvalidArgumentException("Diagram type '{$diagramType}' tidak valid.");
        }

        $menu = $this->menu($menuId);
        if (!$menu) {
            throw new InvalidArgumentException("Menu '{$menuId}' tidak ditemukan.");
        }

        $resourcePath = $this->resourceDiagramPath($menuId, $diagramType);
        if (File::exists($resourcePath)) {
            return (string) File::get($resourcePath);
        }

        return '';
    }

    public function explanation(string $menuId, string $diagramType): array
    {
        $menu = $this->menu($menuId);
        if (!$menu) {
            return [
                'title' => 'Penjelasan tidak tersedia',
                'description' => 'Menu tidak ditemukan.',
                'highlights' => [],
                'technical_notes' => [],
                'backend_components' => [],
                'frontend_components' => [],
                'risk_improvements' => [],
            ];
        }

        $baseTitle = match ($diagramType) {
            'activity_existing' => 'Activity Diagram Eksisting',
            'use_case' => 'Use Case Diagram',
            'activity' => 'Activity Diagram Baru',
            'sequence' => 'Sequence Diagram',
            'class' => 'Class Diagram',
            default => 'Diagram',
        };

        $description = match ($diagramType) {
            'activity_existing' => 'Activity eksisting untuk menu ini sedang dalam proses penyusunan.',
            'use_case' => 'Use case untuk menu ini sedang dalam proses penyusunan.',
            'activity' => 'Activity improvement untuk menu ini sedang dalam proses penyusunan.',
            'sequence' => 'Sequence diagram untuk menu ini sedang dalam proses penyusunan.',
            'class' => 'Class diagram untuk menu ini sedang dalam proses penyusunan.',
            default => 'Dokumentasi diagram sedang dalam pengembangan.',
        };

        return [
            'title' => "{$baseTitle} - {$menu['name']}",
            'description' => $description . ' Menunggu layanan UML ter-host.',
            'highlights' => array_slice(
                $diagramType === 'activity' ? $menu['advanced_flows'] : $menu['features'],
                0,
                6,
            ),
            'technical_notes' => [
                'Ringkasan fungsi menu: ' . $menu['description'],
                'Aktor utama: ' . implode(', ', $menu['actors']),
                'Status saat ini: dokumentasi UML masih tahap pengembangan.',
                'Catatan: konten UML akan disesuaikan dengan alur aktual menu ini.',
                'Rencana: aktivasi setelah service UML eksternal selesai di-host.',
            ],
            'backend_components' => $menu['backend_components'],
            'frontend_components' => $menu['frontend_components'],
            'risk_improvements' => $menu['risk_improvements'],
        ];
    }

    public function previewUrl(string $menuId, string $diagramType, string $format = 'svg'): string
    {
        $code = $this->getDiagramCode($menuId, $diagramType);
        if (trim($code) === '') {
            return '';
        }
        return $this->previewUrlFromCode($code, $format);
    }

    public function previewUrlFromCode(string $code, string $format = 'svg'): string
    {
        if (trim($code) === '') {
            return '';
        }

        $allowed = ['svg', 'png', 'txt'];
        $selectedFormat = in_array($format, $allowed, true) ? $format : 'svg';

        $preparedCode = trim($code);
        if (!Str::startsWith($preparedCode, '@startuml')) {
            $preparedCode = "@startuml\n{$preparedCode}\n@enduml";
        }

        $encoded = $this->encodePlantUml($preparedCode);
        return sprintf('%s/%s/%s', self::PLANTUML_SERVER, $selectedFormat, $encoded);
    }

    public function encodePlantUml(string $text): string
    {
        $compressed = gzdeflate($text, 9);
        if ($compressed === false) {
            throw new InvalidArgumentException('Gagal melakukan kompresi PlantUML.');
        }

        return $this->encode64($compressed);
    }

    protected function encode64(string $data): string
    {
        $len = strlen($data);
        $res = '';

        for ($i = 0; $i < $len; $i += 3) {
            $b1 = ord($data[$i]);
            $b2 = ($i + 1 < $len) ? ord($data[$i + 1]) : 0;
            $b3 = ($i + 2 < $len) ? ord($data[$i + 2]) : 0;
            $res .= $this->append3bytes($b1, $b2, $b3);
        }

        return $res;
    }

    protected function append3bytes(int $b1, int $b2, int $b3): string
    {
        $c1 = $b1 >> 2;
        $c2 = (($b1 & 0x3) << 4) | ($b2 >> 4);
        $c3 = (($b2 & 0xF) << 2) | ($b3 >> 6);
        $c4 = $b3 & 0x3F;

        return $this->encode6bit($c1 & 0x3F)
            . $this->encode6bit($c2 & 0x3F)
            . $this->encode6bit($c3 & 0x3F)
            . $this->encode6bit($c4 & 0x3F);
    }

    protected function encode6bit(int $b): string
    {
        if ($b < 10) {
            return chr(48 + $b);
        }
        $b -= 10;
        if ($b < 26) {
            return chr(65 + $b);
        }
        $b -= 26;
        if ($b < 26) {
            return chr(97 + $b);
        }
        $b -= 26;
        if ($b === 0) {
            return '-';
        }
        if ($b === 1) {
            return '_';
        }

        return '?';
    }

    protected function relativeResourceDiagramPath(string $menuId, string $diagramType): string
    {
        $fileName = $this->diagramFileNames()[$diagramType] ?? ($diagramType . '.uml');
        return "resources/uml/dosen/{$menuId}/{$fileName}";
    }

    protected function resourceDiagramPath(string $menuId, string $diagramType): string
    {
        return base_path($this->relativeResourceDiagramPath($menuId, $diagramType));
    }

    protected function qualityBadge(int $completionPercentage): string
    {
        if ($completionPercentage === 0) {
            return 'Development';
        }
        if ($completionPercentage >= 100) {
            return 'Excellent';
        }
        if ($completionPercentage >= 60) {
            return 'Good';
        }

        return 'Basic';
    }

    /**
     * @param  array<string, mixed>  $menu
     */
    protected function generateDiagramFromTemplate(array $menu, string $diagramType): string
    {
        return match ($diagramType) {
            'activity_existing' => $this->templateActivityExisting($menu),
            'use_case' => $this->templateUseCase($menu),
            'activity' => $this->templateActivityEnhanced($menu),
            'sequence' => $this->templateSequence($menu),
            'class' => $this->templateClass($menu),
            default => throw new InvalidArgumentException("Template '{$diagramType}' tidak tersedia."),
        };
    }

    /**
     * @param  array<string, mixed>  $menu
     */
    protected function templateActivityExisting(array $menu): string
    {
        $mainSteps = implode("\n", array_map(
            fn (string $step) => ' :' . $this->safeText($step) . ';',
            array_slice($menu['features'], 0, 4),
        ));

        return <<<PUML
@startuml
!theme cerulean
title Activity Diagram {$menu['name']} (Eksisting)

start
:Dosen membuka menu {$menu['name']};
:Sistem memvalidasi sesi dan hak akses;
:Sistem memuat data inti modul;
{$mainSteps}

if (Perlu aksi detail?) then (ya)
  :Dosen memilih item spesifik;
  :Sistem menampilkan detail data;
else (tidak)
  :Dosen tetap pada ringkasan menu;
endif

:Sistem mencatat log aktivitas;
stop
@enduml
PUML;
    }

    /**
     * @param  array<string, mixed>  $menu
     */
    protected function templateUseCase(array $menu): string
    {
        $actorLines = [];
        $actorLinks = [];
        foreach ($menu['actors'] as $idx => $actor) {
            $alias = 'A' . ($idx + 1);
            $actorLines[] = "actor \"{$this->safeText($actor)}\" as {$alias}";
        }

        $useCaseLines = [];
        foreach ($menu['features'] as $index => $feature) {
            $alias = 'UC' . ($index + 1);
            $useCaseLines[] = "  usecase \"{$this->safeText($feature)}\" as {$alias}";
            $actorLinks[] = "A1 --> {$alias}";
            if (($index < 2) && count($menu['actors']) > 1) {
                $actorLinks[] = "A2 --> {$alias}";
            }
        }

        $actorBlock = implode("\n", $actorLines);
        $useCaseBlock = implode("\n", $useCaseLines);
        $linkBlock = implode("\n", array_values(array_unique($actorLinks)));

        return <<<PUML
@startuml
!theme cerulean
title Use Case Diagram {$menu['name']}

left to right direction
{$actorBlock}

rectangle "{$menu['name']}" {
{$useCaseBlock}
}

{$linkBlock}
@enduml
PUML;
    }

    /**
     * @param  array<string, mixed>  $menu
     */
    protected function templateActivityEnhanced(array $menu): string
    {
        $advancedSteps = implode("\n", array_map(
            fn (string $step) => '    :' . $this->safeText($step) . ';',
            array_slice($menu['advanced_flows'], 0, 5),
        ));

        return <<<PUML
@startuml
!theme cerulean
title Activity Diagram {$menu['name']} (Baru)

start
:Dosen mengakses {$menu['name']};
:Sistem menjalankan validasi dan preloading;

partition "Proses Paralel" {
  fork
{$advancedSteps}
  fork again
    :Sistem menyiapkan notifikasi dan audit trail;
  fork again
    :Sistem sinkronkan data cache dan database;
  end fork
}

repeat
  :Dosen melakukan aksi inti;
  if (Terjadi error bisnis?) then (ya)
    :Sistem tampilkan pesan error terstruktur;
    :Sistem jalankan fallback process;
  else (tidak)
    :Sistem commit perubahan data;
  endif
repeat while (Masih di halaman?) is (ya)

stop
@enduml
PUML;
    }

    /**
     * @param  array<string, mixed>  $menu
     */
    protected function templateSequence(array $menu): string
    {
        return <<<PUML
@startuml
!theme cerulean
title Sequence Diagram {$menu['name']}

actor Dosen
participant "UI\\n(React)" as UI
participant "{$menu['controller']}" as Controller
participant "{$menu['service']}" as Service
participant "Cache\\n(Redis)" as Cache
participant "Database\\n(MySQL)" as DB

Dosen -> UI: Buka {$menu['name']}
UI -> Controller: Request data modul
Controller -> Cache: Check cache data

alt Cache Hit
  Cache --> Controller: Return cached payload
  Controller --> UI: Data siap render
else Cache Miss
  Cache --> Controller: Cache miss
  Controller -> Service: Proses business logic
  Service -> DB: Query data utama
  DB --> Service: Hasil query
  Service -> Service: Validasi & agregasi
  Service --> Controller: Payload siap kirim
  Controller -> Cache: Simpan cache (TTL)
  Cache --> Controller: OK
  Controller --> UI: Response final
end

UI --> Dosen: Render halaman + insight + aksi
@enduml
PUML;
    }

    /**
     * @param  array<string, mixed>  $menu
     */
    protected function templateClass(array $menu): string
    {
        $classes = [];
        foreach ($menu['classes'] as $className) {
            $classes[] = <<<PUML
class {$className} {
  +id: int
  +nama: string
  +created_at: datetime
  +updated_at: datetime
}
PUML;
        }

        $relations = [];
        for ($i = 0; $i < count($menu['classes']) - 1; $i++) {
            $left = $menu['classes'][$i];
            $right = $menu['classes'][$i + 1];
            $relations[] = "{$left} --> {$right} : uses";
        }

        $classBlock = implode("\n\n", $classes);
        $relationBlock = implode("\n", $relations);

        return <<<PUML
@startuml
!theme cerulean
title Class Diagram {$menu['name']}

{$classBlock}

{$relationBlock}
@enduml
PUML;
    }

    protected function safeText(string $text): string
    {
        return str_replace('"', "'", trim($text));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function menuDefinitions(): array
    {
        return [
            $this->buildMenu('dashboard', 'Dashboard Dosen', 'Layers', 'from-blue-500 to-cyan-500', 'Overview statistik mengajar dan aktivitas harian dosen.', 'DashboardController', 'DashboardService', ['Dosen', 'Sistem'], ['Melihat statistik mengajar', 'Melihat jadwal hari ini', 'Melihat notifikasi terbaru', 'Akses quick actions', 'Export ringkasan dashboard']),
            $this->buildMenu('sesi-absen', 'Sesi Absen', 'ClipboardCheck', 'from-emerald-500 to-teal-500', 'Kelola sesi absensi dan monitoring kehadiran real-time.', 'SesiAbsenController', 'AttendanceSessionService', ['Dosen', 'Mahasiswa', 'Sistem Verifikasi'], ['Membuat sesi absensi', 'Aktivasi/penutupan sesi', 'Monitoring scan real-time', 'Verifikasi status hadir/terlambat', 'Export rekap sesi']),
            $this->buildMenu('jadwal', 'Jadwal Mengajar', 'Calendar', 'from-violet-500 to-fuchsia-500', 'Manajemen jadwal perkuliahan dan sinkronisasi agenda dosen.', 'JadwalController', 'JadwalService', ['Dosen', 'Sistem Akademik'], ['Melihat jadwal mingguan', 'Filter jadwal per mata kuliah', 'Melihat detail sesi', 'Sinkronisasi kalender', 'Deteksi konflik jadwal']),
            $this->buildMenu('mata-kuliah', 'Mata Kuliah', 'BookOpen', 'from-indigo-500 to-purple-500', 'Informasi mata kuliah, kelas, dan performa akademik.', 'CourseController', 'CourseService', ['Dosen', 'Mahasiswa', 'Sistem'], ['Melihat daftar mata kuliah', 'Melihat detail kelas', 'Melihat performa kelas', 'Analisis kehadiran kelas', 'Export laporan mata kuliah']),
            $this->buildMenu('mahasiswa', 'Mahasiswa', 'Users', 'from-sky-500 to-blue-500', 'Monitoring data dan performa mahasiswa per kelas.', 'MahasiswaController', 'MahasiswaService', ['Dosen', 'Mahasiswa', 'Wali Akademik'], ['Melihat daftar mahasiswa', 'Search nama/NIM', 'Lihat profil akademik', 'Lihat riwayat aktivitas', 'Kirim feedback akademik']),
            $this->buildMenu('absensi-rekapan', 'Absensi / Rekapan', 'FileCheck', 'from-cyan-500 to-indigo-500', 'Rekapitulasi kehadiran, pola keterlambatan, dan insight absensi.', 'RekapanController', 'AttendanceAnalyticsService', ['Dosen', 'Sistem'], ['Melihat statistik kehadiran', 'Filter periode rekap', 'Analisis tren keterlambatan', 'Lihat detail log kehadiran', 'Export laporan rekap']),
            $this->buildMenu('tugas', 'Tugas', 'ClipboardList', 'from-amber-500 to-orange-500', 'Pembuatan tugas dan pemantauan submission mahasiswa.', 'TugasController', 'TugasService', ['Dosen', 'Mahasiswa', 'Asisten Dosen'], ['Membuat tugas', 'Atur deadline', 'Monitoring pengumpulan', 'Penilaian dan feedback', 'Export penilaian tugas']),
            $this->buildMenu('tugas-kelompok', 'Tugas Kelompok', 'Users2', 'from-pink-500 to-rose-500', 'Pembentukan kelompok, monitoring kontribusi, dan evaluasi kolaborasi.', 'TugasKelompokController', 'GroupAssignmentService', ['Dosen', 'Mahasiswa', 'Sistem'], ['Buat assignment kelompok', 'Atur mode pembentukan', 'Pantau progres kelompok', 'Nilai kontribusi anggota', 'Tangani konflik kelompok']),
            $this->buildMenu('ujian', 'Ujian', 'FileText', 'from-red-500 to-rose-500', 'Pengelolaan jadwal ujian, pelaksanaan, dan evaluasi hasil.', 'UjianController', 'ExamService', ['Dosen', 'Mahasiswa', 'Pengawas'], ['Atur jadwal ujian', 'Kelola komponen nilai ujian', 'Monitoring pelaksanaan', 'Validasi hasil ujian', 'Export laporan evaluasi']),
            $this->buildMenu('nilai', 'Nilai / Penilaian', 'GraduationCap', 'from-lime-500 to-green-500', 'Kalkulasi nilai akhir dan distribusi performa mahasiswa.', 'GradingController', 'GradingService', ['Dosen', 'Mahasiswa', 'Koordinator'], ['Input nilai komponen', 'Hitung nilai akhir', 'Distribusi nilai kelas', 'Override nilai dengan audit', 'Export nilai final']),
            $this->buildMenu('dokumentasi', 'Dokumentasi', 'BookText', 'from-cyan-500 to-indigo-500', 'Knowledge base panduan penggunaan sistem dosen.', 'DocumentationController', 'DocumentationService', ['Dosen', 'Sistem Dokumentasi'], ['Lihat daftar panduan', 'Baca materi dokumentasi', 'Bookmark panduan', 'Feedback konten', 'Akses mode offline']),
            $this->buildMenu('notifikasi', 'Notifikasi', 'Bell', 'from-fuchsia-500 to-purple-500', 'Broadcast dan pengelolaan notifikasi akademik.', 'NotificationController', 'NotificationService', ['Dosen', 'Mahasiswa', 'Sistem Broadcast'], ['Buat notifikasi', 'Target penerima', 'Lihat status baca', 'Mark as read', 'Hapus notifikasi']),
            $this->buildMenu('pengaturan', 'Pengaturan', 'Settings', 'from-slate-500 to-gray-700', 'Konfigurasi profil, keamanan akun, dan preferensi.', 'SettingsController', 'SettingsService', ['Dosen', 'Sistem Keamanan'], ['Update profil', 'Ganti password', 'Atur preferensi tampilan', 'Preferensi notifikasi', 'Audit keamanan akun']),
            $this->buildMenu('profil', 'Profil', 'UserCircle', 'from-blue-500 to-indigo-500', 'Pengelolaan profil personal dosen dan identitas akademik.', 'ProfileController', 'ProfileService', ['Dosen', 'Sistem'], ['Lihat profil dosen', 'Update biodata', 'Update avatar', 'Perbarui kontak', 'Riwayat update profil']),
            $this->buildMenu('chat', 'Chat', 'MessageCircle', 'from-emerald-500 to-cyan-500', 'Komunikasi real-time antara dosen dan mahasiswa.', 'ChatController', 'ConversationService', ['Dosen', 'Mahasiswa'], ['Buka percakapan', 'Kirim pesan', 'Kelola lampiran', 'Tandai pesan penting', 'Monitoring status online']),
            $this->buildMenu('bantuan', 'Bantuan', 'LifeBuoy', 'from-orange-500 to-amber-500', 'Pusat bantuan, FAQ, dan troubleshooting sistem dosen.', 'HelpController', 'HelpService', ['Dosen', 'Tim Support'], ['Lihat FAQ', 'Cari solusi troubleshooting', 'Kirim feedback bantuan', 'Lihat kontak support', 'Tracking ticket bantuan']),
        ];
    }

    /**
     * @param  array<int, string>  $actors
     * @param  array<int, string>  $features
     * @return array<string, mixed>
     */
    protected function buildMenu(
        string $id,
        string $name,
        string $icon,
        string $color,
        string $description,
        string $controller,
        string $service,
        array $actors,
        array $features,
    ): array {
        return [
            'id' => $id,
            'name' => $name,
            'icon' => $icon,
            'color' => $color,
            'description' => $description,
            'controller' => $controller,
            'service' => $service,
            'actors' => $actors,
            'features' => $features,
            'advanced_flows' => [
                'Optimasi validasi input dan business rule secara terstruktur',
                'Penggunaan cache strategis untuk menekan latency',
                'Audit trail untuk semua aksi kritikal',
                'Fallback process pada kegagalan integrasi eksternal',
                'Telemetry dan monitoring untuk peningkatan berkelanjutan',
            ],
            'classes' => [$controller, $service, 'DomainModel', 'Repository', 'Policy'],
            'backend_components' => [$controller, $service, 'Policy', 'Event', 'Queue'],
            'frontend_components' => ['Inertia Page', 'Form State', 'Realtime Hook', 'Analytics Widget'],
            'architecture_notes' => [
                'Gunakan service layer untuk menjaga controller tetap tipis.',
                'Pisahkan concern validasi, orchestration, dan persistence.',
                'Tambahkan observability untuk trace error lintas request.',
            ],
            'risk_improvements' => [
                'Risk: query berat tanpa cache pada jam sibuk.',
                'Risk: race condition di aksi real-time multi user.',
                'Improvement: tambahkan idempotency key untuk aksi kritikal.',
                'Improvement: tambah circuit breaker untuk dependency eksternal.',
            ],
        ];
    }
}
