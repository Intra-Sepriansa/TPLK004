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
use Carbon\Carbon;

class AnalyticsSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    protected $logs;
    protected $stats;

    public function __construct($logs, $stats)
    {
        $this->logs = $logs;
        $this->stats = $stats;
    }

    public function title(): string
    {
        return '📈 ANALYTICS';
    }

    public function array(): array
    {
        $rows = [];

        // ─── Section 1: Attendance by Class ───
        $rows[] = ['ANALISIS KEHADIRAN PER KELAS', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Kelas', 'Total', 'Hadir', 'Terlambat', 'Izin', 'Anomali', 'Rate (%)', 'Trend'];

        $byClass = $this->logs->groupBy(fn($l) => $l->mahasiswa?->kelas ?? 'N/A');
        foreach ($byClass as $kelas => $group) {
            $t = $group->count();
            $h = $group->where('status', 'present')->count();
            $l = $group->where('status', 'late')->count();
            $i = $group->where('status', 'excused')->count();
            $a = $group->whereIn('status', ['rejected', 'absent'])->count();
            $rate = $t > 0 ? round(($h / $t) * 100, 1) : 0;
            $trend = $rate >= 80 ? '↗️ Baik' : ($rate >= 60 ? '→ Cukup' : '↘️ Perlu Perhatian');
            $rows[] = [$kelas, $t, $h, $l, $i, $a, $rate . '%', $trend];
        }

        $rows[] = [''];
        $rows[] = [''];

        // ─── Section 2: Hourly Distribution ───
        $rows[] = ['DISTRIBUSI SCAN PER JAM', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Jam', 'Total Scan', 'Hadir', 'Terlambat', 'Izin', 'Anomali', 'Rate (%)', ''];

        $byHour = $this->logs->groupBy(fn($l) => Carbon::parse($l->scanned_at)->format('H'));
        for ($h = 6; $h <= 22; $h++) {
            $hour = str_pad($h, 2, '0', STR_PAD_LEFT);
            $group = $byHour->get($hour, collect());
            $t = $group->count();
            $present = $group->where('status', 'present')->count();
            $late = $group->where('status', 'late')->count();
            $excused = $group->where('status', 'excused')->count();
            $rejected = $group->whereIn('status', ['rejected', 'absent'])->count();
            $rate = $t > 0 ? round(($present / $t) * 100, 1) : 0;
            $rows[] = [$hour . ':00', $t, $present, $late, $excused, $rejected, $rate . '%', ''];
        }

        $rows[] = [''];
        $rows[] = [''];

        // ─── Section 3: Status Summary ───
        $rows[] = ['RINGKASAN STATUS KEHADIRAN', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Status', 'Jumlah', 'Persentase', 'Indikator', '', '', '', ''];

        $total = $this->logs->count();
        $statuses = [
            ['PRESENT', $this->logs->where('status', 'present')->count(), '✅'],
            ['LATE', $this->logs->where('status', 'late')->count(), '⏰'],
            ['EXCUSED', $this->logs->where('status', 'excused')->count(), '📋'],
            ['REJECTED', $this->logs->whereIn('status', ['rejected', 'absent'])->count(), '❌'],
        ];

        foreach ($statuses as [$status, $count, $icon]) {
            $pct = $total > 0 ? round(($count / $total) * 100, 1) : 0;
            $rows[] = [$status, $count, $pct . '%', $icon];
        }
        $rows[] = ['TOTAL', $total, '100%', '📊'];

        // ─── Section 4: Top Performing by Dosen ───
        $rows[] = [''];
        $rows[] = [''];
        $rows[] = ['RINGKASAN PER DOSEN', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Dosen', 'Sesi', 'Total Scan', 'Hadir', 'Rate (%)', 'Risk Avg', '', ''];

        $byDosen = $this->logs->groupBy(fn($l) => $l->session?->dosen?->nama ?? 'Unknown');
        foreach ($byDosen as $dosen => $group) {
            $t = $group->count();
            $h = $group->where('status', 'present')->count();
            $sessions = $group->pluck('attendance_session_id')->unique()->count();
            $rate = $t > 0 ? round(($h / $t) * 100, 1) : 0;
            $riskAvg = round($group->avg('risk_score') ?? 0, 1);
            $rows[] = [$dosen, $sessions, $t, $h, $rate . '%', $riskAvg];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        // Section headers
        $sectionRows = [1];
        $currentRow = 5 + count($this->logs->groupBy(fn($l) => $l->mahasiswa?->kelas ?? 'N/A'));
        $sectionRows[] = $currentRow + 2; // Hourly section

        foreach ($sectionRows as $row) {
            $sheet->getStyle("A{$row}")->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('1a365d');
        }

        // Table headers
        $tableHeaderRows = [3];
        foreach ($tableHeaderRows as $row) {
            $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '37474f']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);
        }

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 28, 'B' => 14, 'C' => 12, 'D' => 14,
            'E' => 10, 'F' => 12, 'G' => 12, 'H' => 18,
        ];
    }
}
