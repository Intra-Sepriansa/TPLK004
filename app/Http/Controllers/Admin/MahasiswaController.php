<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MahasiswaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $fakultas = $request->get('fakultas', 'all');
        $kelas = $request->get('kelas', 'all');
        $sortBy = $request->get('sort_by', 'nama');
        $sortDir = $request->get('sort_dir', 'asc');
        
        $query = Mahasiswa::query();
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nim', 'like', "%{$search}%");
            });
        }
        
        if ($fakultas !== 'all') {
            $query->where('fakultas', $fakultas);
        }
        
        if ($kelas !== 'all') {
            $query->where('kelas', $kelas);
        }
        
        $query->orderBy($sortBy, $sortDir);
        
        $mahasiswa = $query->paginate(15)->withQueryString();
        
        // Statistics
        $stats = $this->getStats();
        
        // Attendance summary per student
        $attendanceSummary = $this->getAttendanceSummary();
        
        // Filter options
        $fakultasList = Mahasiswa::distinct()->whereNotNull('fakultas')->pluck('fakultas');
        $kelasList = Mahasiswa::distinct()->whereNotNull('kelas')->pluck('kelas');
        
        // Top performers
        $topPerformers = $this->getTopPerformers();
        
        // Low attendance students
        $lowAttendance = $this->getLowAttendanceStudents();
        
        // Registration trend
        $registrationTrend = $this->getRegistrationTrend();
        
        return Inertia::render('admin/mahasiswa', [
            'mahasiswa' => $mahasiswa,
            'stats' => $stats,
            'attendanceSummary' => $attendanceSummary,
            'fakultasList' => $fakultasList,
            'kelasList' => $kelasList,
            'topPerformers' => $topPerformers,
            'lowAttendance' => $lowAttendance,
            'registrationTrend' => $registrationTrend,
            'filters' => [
                'search' => $search,
                'fakultas' => $fakultas,
                'kelas' => $kelas,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nim' => 'required|string|max:20|unique:mahasiswa,nim',
            'fakultas' => 'nullable|string|max:100',
            'kelas' => 'nullable|string|max:20',
            'semester' => 'nullable|integer|min:1|max:14',
        ]);
        
        $lastTwoDigits = substr($request->nim, -2);
        $defaultPassword = 'tplk004#' . $lastTwoDigits;
        
        Mahasiswa::create([
            'nama' => $request->nama,
            'nim' => $request->nim,
            'fakultas' => $request->fakultas,
            'kelas' => $request->kelas,
            'semester' => $request->semester,
            'password' => Hash::make($defaultPassword),
        ]);
        
        return back()->with('success', 'Mahasiswa berhasil ditambahkan.');
    }
    
    public function update(Request $request, Mahasiswa $mahasiswa)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nim' => 'required|string|max:20|unique:mahasiswa,nim,' . $mahasiswa->id,
            'fakultas' => 'nullable|string|max:100',
            'kelas' => 'nullable|string|max:20',
            'semester' => 'nullable|integer|min:1|max:14',
        ]);
        
        $mahasiswa->update($request->only(['nama', 'nim', 'fakultas', 'kelas', 'semester']));
        
        return back()->with('success', 'Data mahasiswa berhasil diperbarui.');
    }
    
    public function destroy(Mahasiswa $mahasiswa)
    {
        $mahasiswa->delete();
        return back()->with('success', 'Mahasiswa berhasil dihapus.');
    }
    
    public function resetPassword(Mahasiswa $mahasiswa)
    {
        $lastTwoDigits = substr($mahasiswa->nim, -2);
        $defaultPassword = 'tplk004#' . $lastTwoDigits;
        
        $mahasiswa->update(['password' => Hash::make($defaultPassword)]);
        
        return back()->with('success', 'Password berhasil direset ke default.');
    }
    
    public function exportPdf(Request $request)
    {
        $query = Mahasiswa::query();
        
        if ($request->fakultas && $request->fakultas !== 'all') {
            $query->where('fakultas', $request->fakultas);
        }
        
        if ($request->kelas && $request->kelas !== 'all') {
            $query->where('kelas', $request->kelas);
        }
        
        $mahasiswa = $query->orderBy('nama')->get();
        $stats = $this->getStats();
        
        $data = [
            'mahasiswa' => $mahasiswa,
            'stats' => $stats,
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.mahasiswa', $data);
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf->download('Data_Mahasiswa_' . now()->format('Y-m-d') . '.pdf');
    }
    
    private function getStats()
    {
        $total = Mahasiswa::count();
        $byFakultas = Mahasiswa::select('fakultas', DB::raw('count(*) as total'))
            ->whereNotNull('fakultas')
            ->groupBy('fakultas')
            ->pluck('total', 'fakultas');
        
        $activeThisMonth = AttendanceLog::whereMonth('scanned_at', now()->month)
            ->whereYear('scanned_at', now()->year)
            ->distinct('mahasiswa_id')
            ->count('mahasiswa_id');
        
        $avgAttendance = AttendanceLog::whereIn('status', ['present', 'late'])
            ->whereMonth('scanned_at', now()->month)
            ->count();
        
        return [
            'total' => $total,
            'by_fakultas' => $byFakultas,
            'active_this_month' => $activeThisMonth,
            'avg_attendance' => $avgAttendance,
        ];
    }
    
    private function getAttendanceSummary()
    {
        return Mahasiswa::withCount([
            'attendanceLogs as total_attendance',
            'attendanceLogs as present_count' => fn($q) => $q->where('status', 'present'),
            'attendanceLogs as late_count' => fn($q) => $q->where('status', 'late'),
        ])
        ->orderByDesc('total_attendance')
        ->take(10)
        ->get()
        ->map(fn($m) => [
            'id' => $m->id,
            'nama' => $m->nama,
            'nim' => $m->nim,
            'total' => $m->total_attendance,
            'present' => $m->present_count,
            'late' => $m->late_count,
        ]);
    }
    
    private function getTopPerformers()
    {
        return Mahasiswa::withCount([
            'attendanceLogs as attendance_count' => fn($q) => $q->whereIn('status', ['present', 'late'])
        ])
        ->orderByDesc('attendance_count')
        ->take(5)
        ->get()
        ->map(fn($m) => [
            'id' => $m->id,
            'nama' => $m->nama,
            'nim' => $m->nim,
            'count' => $m->attendance_count,
        ]);
    }
    
    private function getLowAttendanceStudents()
    {
        return Mahasiswa::withCount([
            'attendanceLogs as attendance_count' => fn($q) => $q->whereIn('status', ['present', 'late'])
        ])
        ->having('attendance_count', '<', 3)
        ->orderBy('attendance_count')
        ->take(5)
        ->get()
        ->map(fn($m) => [
            'id' => $m->id,
            'nama' => $m->nama,
            'nim' => $m->nim,
            'count' => $m->attendance_count,
        ]);
    }
    
    private function getRegistrationTrend()
    {
        // Since mahasiswa doesn't have timestamps, we'll use attendance data
        $trend = AttendanceLog::selectRaw('DATE(MIN(scanned_at)) as first_scan, mahasiswa_id')
            ->groupBy('mahasiswa_id')
            ->get()
            ->groupBy(fn($item) => substr($item->first_scan, 0, 7))
            ->map(fn($items) => $items->count())
            ->take(6);
        
        return [
            'labels' => $trend->keys()->toArray(),
            'values' => $trend->values()->toArray(),
        ];
    }
}
