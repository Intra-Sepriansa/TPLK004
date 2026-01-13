<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImportLog;
use App\Services\ImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BulkImportController extends Controller
{
    public function __construct(
        private ImportService $importService
    ) {}

    public function index()
    {
        $logs = ImportLog::orderByDesc('created_at')
            ->take(20)
            ->get();

        $stats = [
            'total_imports' => ImportLog::count(),
            'successful' => ImportLog::where('status', 'completed')->count(),
            'failed' => ImportLog::where('status', 'failed')->count(),
            'total_records' => ImportLog::sum('success_count'),
        ];

        return Inertia::render('admin/bulk-import', [
            'logs' => $logs,
            'stats' => $stats,
            'templates' => [
                'mahasiswa' => $this->importService->generateTemplate('mahasiswa'),
                'mata_kuliah' => $this->importService->generateTemplate('mata_kuliah'),
                'jadwal' => $this->importService->generateTemplate('jadwal'),
            ],
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'type' => 'required|in:mahasiswa,mata_kuliah,jadwal',
        ]);

        try {
            $preview = $this->importService->previewImport(
                $request->file('file'),
                $request->input('type')
            );

            return response()->json([
                'success' => true,
                'preview' => $preview,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'type' => 'required|in:mahasiswa,mata_kuliah,jadwal',
        ]);

        $type = $request->input('type');
        $file = $request->file('file');

        try {
            $log = match($type) {
                'mahasiswa' => $this->importService->importMahasiswa($file, auth()->id()),
                'mata_kuliah' => $this->importService->importMataKuliah($file, auth()->id()),
                default => throw new \Exception('Tipe import tidak valid'),
            };

            if ($log->status === 'completed') {
                return back()->with('success', sprintf(
                    'Import berhasil! %d data ditambahkan, %d dilewati, %d error.',
                    $log->success_count,
                    $log->skip_count,
                    $log->error_count
                ));
            } else {
                return back()->with('error', 'Import gagal: ' . ($log->errors[0]['message'] ?? 'Unknown error'));
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Import gagal: ' . $e->getMessage());
        }
    }

    public function downloadTemplate(string $type)
    {
        $template = $this->importService->generateTemplate($type);
        
        if (empty($template)) {
            abort(404, 'Template tidak ditemukan');
        }

        $filename = "template_{$type}.csv";
        $content = implode(',', $template['columns']) . "\n";
        
        foreach ($template['sample'] as $row) {
            $content .= implode(',', $row) . "\n";
        }

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    public function showLog(ImportLog $log)
    {
        return response()->json($log);
    }
}
