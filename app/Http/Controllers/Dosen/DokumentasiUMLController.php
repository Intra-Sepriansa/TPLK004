<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Services\DosenUMLDocumentationService;
use App\Services\UmlDocumentationApiClient;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DokumentasiUMLController extends Controller
{
    public function __construct(
        protected DosenUMLDocumentationService $umlService,
        protected UmlDocumentationApiClient $umlApiClient,
    ) {
    }

    public function index(): InertiaResponse
    {
        $strictMode = (bool) config('services.uml_docs.strict', false);
        $menus = [];
        $diagramTypes = [];
        $stats = [];

        if ($this->umlApiClient->isEnabled()) {
            try {
                $payload = $this->umlApiClient->fetchIndexPayload();
                if (is_array($payload)) {
                    $menus = is_array($payload['menus'] ?? null) ? $payload['menus'] : [];
                    $diagramTypes = is_array($payload['diagramTypes'] ?? null)
                        ? $payload['diagramTypes']
                        : [];
                    $stats = is_array($payload['stats'] ?? null) ? $payload['stats'] : [];
                }
            } catch (\Throwable $exception) {
                Log::warning('UML API index fetch failed, fallback to local.', [
                    'error' => $exception->getMessage(),
                ]);
            }

            if ($strictMode && empty($menus)) {
                abort(503, 'UML Documentation API sedang tidak tersedia.');
            }
        }

        if (empty($menus)) {
            $menus = $this->umlService->menusWithDiagrams();
        }
        if (empty($diagramTypes)) {
            $diagramTypes = $this->umlService->diagramTypeMetadata();
        }
        if (empty($stats)) {
            $stats = [
                'total_menus' => count($menus),
                'diagram_types' => count($diagramTypes),
                'total_diagrams' => count($menus) * count($diagramTypes),
                'last_updated' => $this->resolveLastUpdated(),
            ];
        }

        return Inertia::render('dosen/dokumentasi-uml', [
            'menus' => $menus,
            'diagramTypes' => $diagramTypes,
            'stats' => $stats,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $strictMode = (bool) config('services.uml_docs.strict', false);
        $validated = $request->validate([
            'menu_id' => 'required|string',
            'diagram_type' => 'required|in:activity_existing,use_case,activity,sequence,class',
        ]);

        $menuId = (string) $validated['menu_id'];
        $diagramType = (string) $validated['diagram_type'];

        if ($this->umlApiClient->isEnabled()) {
            try {
                $payload = $this->umlApiClient->fetchHistoryPayload($menuId, $diagramType);
                if (is_array($payload)) {
                    return response()->json($payload);
                }
            } catch (\Throwable $exception) {
                Log::warning('UML API history fetch failed, fallback to local.', [
                    'menu_id' => $menuId,
                    'diagram_type' => $diagramType,
                    'error' => $exception->getMessage(),
                ]);
            }

            if ($strictMode) {
                return response()->json([
                    'message' => 'UML Documentation API sedang tidak tersedia.',
                    'data' => [],
                ], 503);
            }
        }

        $rows = [];

        if (Schema::hasTable('diagram_versions')) {
            $rows = DB::table('diagram_versions')
                ->where('menu', $menuId)
                ->where('diagram_type', $diagramType)
                ->orderByDesc('version')
                ->limit(20)
                ->get()
                ->map(function ($item): array {
                    return [
                        'id' => (int) $item->id,
                        'version' => (int) $item->version,
                        'description' => $item->description,
                        'code' => (string) $item->code,
                        'created_at' => Carbon::parse($item->created_at)->format('d M Y H:i'),
                        'editor' => [
                            'nama' => 'Editor',
                        ],
                    ];
                })
                ->values()
                ->all();
        }

        if (empty($rows)) {
            $fallbackCode = $this->umlService->getDiagramCode($menuId, $diagramType);
            $path = $this->diagramAbsolutePath($menuId, $diagramType);
            $createdAt = File::exists($path)
                ? Carbon::createFromTimestamp((int) File::lastModified($path))->format('d M Y H:i')
                : now()->format('d M Y H:i');

            $rows[] = [
                'id' => 0,
                'version' => 1,
                'description' => 'Versi awal dari file UML di resources.',
                'code' => $fallbackCode,
                'created_at' => $createdAt,
                'editor' => [
                    'nama' => 'System',
                ],
            ];
        }

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function export(Request $request): Response
    {
        $strictMode = (bool) config('services.uml_docs.strict', false);
        $validated = $request->validate([
            'menu_id' => 'required|string',
            'diagram_type' => 'required|in:activity_existing,use_case,activity,sequence,class',
            'format' => 'required|in:png,svg,pdf,plantuml',
            'code' => 'nullable|string',
        ]);

        $menuId = (string) $validated['menu_id'];
        $diagramType = (string) $validated['diagram_type'];
        $format = (string) $validated['format'];
        $code = trim((string) ($validated['code'] ?? ''));

        if ($this->umlApiClient->isEnabled()) {
            try {
                $remoteResponse = $this->umlApiClient->exportDiagram([
                    'menu_id' => $menuId,
                    'diagram_type' => $diagramType,
                    'format' => $format,
                    'code' => $code,
                ]);

                if ($remoteResponse !== null) {
                    $contentType = $remoteResponse->header('Content-Type', 'application/octet-stream');
                    $contentDisposition = $remoteResponse->header('Content-Disposition');

                    $headers = ['Content-Type' => $contentType];
                    if ($contentDisposition) {
                        $headers['Content-Disposition'] = $contentDisposition;
                    }

                    return response($remoteResponse->body(), 200, $headers);
                }
            } catch (\Throwable $exception) {
                Log::warning('UML API export failed, fallback to local.', [
                    'menu_id' => $menuId,
                    'diagram_type' => $diagramType,
                    'format' => $format,
                    'error' => $exception->getMessage(),
                ]);
            }

            if ($strictMode) {
                return response('UML Documentation API sedang tidak tersedia.', 503);
            }
        }

        if ($code === '') {
            $code = $this->umlService->getDiagramCode($menuId, $diagramType);
        }

        if (!Str::startsWith(trim($code), '@startuml')) {
            $code = "@startuml\n{$code}\n@enduml";
        }

        $menuName = (string) ($this->umlService->menu($menuId)['name'] ?? $menuId);
        $fileBase = Str::slug($menuName . '-' . $diagramType . '-' . now()->format('Ymd-His'));

        if ($format === 'plantuml') {
            return response($code, 200, [
                'Content-Type' => 'text/plain; charset=utf-8',
                'Content-Disposition' => "attachment; filename=\"{$fileBase}.uml\"",
            ]);
        }

        if ($format === 'svg' || $format === 'png') {
            $diagramData = $this->fetchDiagramBinary($code, $format);
            if ($diagramData === null) {
                return response('Gagal mengambil render diagram dari PlantUML.', 422);
            }

            $contentType = $format === 'svg' ? 'image/svg+xml' : 'image/png';

            return response($diagramData, 200, [
                'Content-Type' => $contentType,
                'Content-Disposition' => "attachment; filename=\"{$fileBase}.{$format}\"",
            ]);
        }

        $diagramPng = $this->fetchDiagramBinary($code, 'png');
        if ($diagramPng === null) {
            return response('Gagal mengambil render diagram PNG untuk PDF.', 422);
        }

        $pdf = Pdf::loadView('pdf.dosen-uml-diagram', [
            'menuName' => $menuName,
            'diagramType' => $diagramType,
            'generatedAt' => now()->format('d M Y H:i'),
            'imageDataUri' => 'data:image/png;base64,' . base64_encode($diagramPng),
            'sourceCode' => $code,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("{$fileBase}.pdf");
    }

    protected function fetchDiagramBinary(string $code, string $format): ?string
    {
        try {
            $url = $this->umlService->previewUrlFromCode($code, $format);
            $response = Http::timeout(20)->get($url);
            if (!$response->ok()) {
                return null;
            }

            return $response->body();
        } catch (\Throwable) {
            return null;
        }
    }

    protected function resolveLastUpdated(): string
    {
        $root = base_path('resources/uml/dosen');
        if (!File::isDirectory($root)) {
            return now()->format('d M Y H:i');
        }

        $latest = 0;
        foreach (File::allFiles($root) as $file) {
            $mtime = $file->getMTime();
            if ($mtime > $latest) {
                $latest = $mtime;
            }
        }

        if ($latest <= 0) {
            return now()->format('d M Y H:i');
        }

        return Carbon::createFromTimestamp($latest)->format('d M Y H:i');
    }

    protected function diagramAbsolutePath(string $menuId, string $diagramType): string
    {
        $fileName = $this->umlService->diagramFileNames()[$diagramType] ?? ($diagramType . '.uml');
        return base_path("resources/uml/dosen/{$menuId}/{$fileName}");
    }
}
