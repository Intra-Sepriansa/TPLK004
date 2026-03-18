<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use Carbon\Carbon;

class DashboardSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    protected $logs;
    protected $stats;
    protected $filters;

    public function __construct($logs, $stats, $filters)
    {
        $this->logs = $logs;
        $this->stats = $stats;
        $this->filters = $filters;
    }

    public function title(): string
    {
        return '📊 DASHBOARD';
    }

    public function array(): array
    {
        $hadir = $this->logs->where('status', 'present')->count();
        $terlambat = $this->logs->where('status', 'late')->count();
        $izin = $this->logs->where('status', 'excused')->count();
        $anomali = $this->logs->whereIn('status', ['rejected', 'absent'])->count();
        $total = $this->logs->count();
        $attendanceRate = $total > 0 ? round(($hadir / $total) * 100, 1) : 0;
        $riskHigh = $this->logs->where('risk_score', '>=', 70)->count();
        $riskMedium = $this->logs->whereBetween('risk_score', [30, 69])->count();
        $riskLow = $this->logs->where('risk_score', '<', 30)->where('risk_score', '>', 0)->count();

        $rows = [];

        // Header section
        $rows[] = ['', '', '', 'LAPORAN MONITORING ABSENSI REAL-TIME', '', '', '', '', '', ''];
        $rows[] = ['', '', '', 'SISTEM ABSENSI CERDAS BERBASIS AI', '', '', '', '', '', ''];
        $rows[] = ['', '', '', 'UNIVERSITAS PAMULANG - FAKULTAS ILMU KOMPUTER', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Report ID', 'LM-' . now()->format('YmdHis'), '', 'Periode', $this->filters['start_date'] ?? now()->format('d/m/Y'), '-', $this->filters['end_date'] ?? now()->format('d/m/Y'), '', 'Dicetak', now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') . ' WIB'];
        $rows[] = [''];

        // KPI Section
        $rows[] = ['═══ KEY PERFORMANCE INDICATORS ═══', '', '', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['TOTAL SCAN', $total, '', 'TINGKAT KEHADIRAN', $attendanceRate . '%', '', 'RISIKO TINGGI', $riskHigh, '', ''];
        $rows[] = [''];

        // Attendance Breakdown
        $rows[] = ['═══ RINGKASAN KEHADIRAN HARI INI ═══', '', '', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Status', 'Jumlah', 'Persentase', '', '', '', '', '', '', ''];
        $rows[] = ['✅ Hadir', $hadir, $total > 0 ? round(($hadir / $total) * 100, 1) . '%' : '0%'];
        $rows[] = ['⏰ Terlambat', $terlambat, $total > 0 ? round(($terlambat / $total) * 100, 1) . '%' : '0%'];
        $rows[] = ['📋 Izin', $izin, $total > 0 ? round(($izin / $total) * 100, 1) . '%' : '0%'];
        $rows[] = ['⚠️ Anomali/Ditolak', $anomali, $total > 0 ? round(($anomali / $total) * 100, 1) . '%' : '0%'];
        $rows[] = ['TOTAL', $total, '100%'];
        $rows[] = [''];

        // Summary by Course
        $rows[] = ['═══ RINGKASAN PER MATA KULIAH ═══', '', '', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Mata Kuliah', 'Total Scan', 'Hadir', 'Terlambat', 'Izin', 'Anomali', 'Rate (%)', 'Risk Avg', '', ''];

        $byCourse = $this->logs->groupBy(fn($log) => $log->session?->course?->nama ?? 'Unknown');
        foreach ($byCourse as $course => $courseLogs) {
            $cTotal = $courseLogs->count();
            $cHadir = $courseLogs->where('status', 'present')->count();
            $cLate = $courseLogs->where('status', 'late')->count();
            $cIzin = $courseLogs->where('status', 'excused')->count();
            $cAnomali = $courseLogs->whereIn('status', ['rejected', 'absent'])->count();
            $cRate = $cTotal > 0 ? round(($cHadir / $cTotal) * 100, 1) : 0;
            $cRiskAvg = $courseLogs->avg('risk_score') ?? 0;
            $rows[] = [$course, $cTotal, $cHadir, $cLate, $cIzin, $cAnomali, $cRate . '%', round($cRiskAvg, 1)];
        }

        $rows[] = [''];

        // Risk Summary
        $rows[] = ['═══ RINGKASAN RISIKO ═══', '', '', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Level Risiko', 'Jumlah', 'Persentase', '', '', '', '', '', '', ''];
        $rows[] = ['🟢 Rendah (0-29)', $riskLow, $total > 0 ? round(($riskLow / $total) * 100, 1) . '%' : '0%'];
        $rows[] = ['🟡 Sedang (30-69)', $riskMedium, $total > 0 ? round(($riskMedium / $total) * 100, 1) . '%' : '0%'];
        $rows[] = ['🔴 Tinggi (70-100)', $riskHigh, $total > 0 ? round(($riskHigh / $total) * 100, 1) . '%' : '0%'];

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        // Title section
        $sheet->mergeCells('D1:H1');
        $sheet->mergeCells('D2:H2');
        $sheet->mergeCells('D3:H3');

        $sheet->getStyle('D1')->getFont()->setBold(true)->setSize(18)->getColor()->setRGB('1a365d');
        $sheet->getStyle('D2')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('2b6cb0');
        $sheet->getStyle('D3')->getFont()->setSize(11)->getColor()->setRGB('4a5568');

        $sheet->getStyle('D1:D3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // KPI row
        $sheet->getStyle('A7')->getFont()->setBold(true)->setSize(12)->getColor()->setRGB('1a365d');
        $sheet->getStyle('A9')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('B9')->getFont()->setBold(true)->setSize(20)->getColor()->setRGB('2b6cb0');
        $sheet->getStyle('D9')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('E9')->getFont()->setBold(true)->setSize(20)->getColor()->setRGB('38a169');
        $sheet->getStyle('G9')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('H9')->getFont()->setBold(true)->setSize(20)->getColor()->setRGB('e53e3e');

        // Section headers
        foreach ([11, 19, 29] as $row) {
            $sheet->getStyle("A{$row}")->getFont()->setBold(true)->setSize(12)->getColor()->setRGB('1a365d');
        }

        // Table headers
        foreach ([13, 21] as $headerRow) {
            $lastCol = $headerRow === 13 ? 'C' : 'H';
            $sheet->getStyle("A{$headerRow}:{$lastCol}{$headerRow}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1f4e79']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);
        }

        // Metadata row
        $sheet->getStyle('A5:J5')->getFont()->setSize(9)->getColor()->setRGB('4a5568');

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 22, 'B' => 16, 'C' => 14, 'D' => 22, 'E' => 16,
            'F' => 8, 'G' => 18, 'H' => 14, 'I' => 12, 'J' => 22,
        ];
    }
}
