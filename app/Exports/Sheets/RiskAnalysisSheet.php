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

class RiskAnalysisSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    protected $logs;

    public function __construct($logs)
    {
        $this->logs = $logs;
    }

    public function title(): string
    {
        return '⚠️ RISK ANALYSIS';
    }

    public function array(): array
    {
        $rows = [];

        // Header
        $rows[] = ['ANALISIS RISIKO KEHADIRAN', '', '', '', '', '', '', '', ''];
        $rows[] = ['Laporan Deteksi Anomali & Aktivitas Mencurigakan', '', '', '', '', '', '', '', ''];
        $rows[] = [''];

        // Risk Distribution Summary
        $total = $this->logs->count();
        $high = $this->logs->where('risk_score', '>=', 70)->count();
        $medium = $this->logs->whereBetween('risk_score', [30, 69])->count();
        $low = $this->logs->where('risk_score', '<', 30)->count();
        $suspicious = $this->logs->where('is_suspicious', true)->count();
        $spoofing = $this->logs->where('spoofing_detected', true)->count();

        $rows[] = ['DISTRIBUSI RISIKO', '', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['Kategori', 'Jumlah', 'Persentase', 'Indikator', '', '', '', '', ''];
        $rows[] = ['🔴 Risiko Tinggi (70-100)', $high, $total > 0 ? round(($high / $total) * 100, 1) . '%' : '0%', 'KRITIS'];
        $rows[] = ['🟡 Risiko Sedang (30-69)', $medium, $total > 0 ? round(($medium / $total) * 100, 1) . '%' : '0%', 'PERHATIAN'];
        $rows[] = ['🟢 Risiko Rendah (0-29)', $low, $total > 0 ? round(($low / $total) * 100, 1) . '%' : '0%', 'AMAN'];
        $rows[] = [''];
        $rows[] = ['⚠️ Suspicious Activity', $suspicious, '', ''];
        $rows[] = ['🎭 Spoofing Detected', $spoofing, '', ''];
        $rows[] = [''];
        $rows[] = [''];

        // Detailed suspicious activities
        $rows[] = ['DETAIL AKTIVITAS MENCURIGAKAN', '', '', '', '', '', '', '', ''];
        $rows[] = [''];
        $rows[] = ['No', 'Waktu', 'NIM', 'Nama', 'Status', 'Risk Score', 'Jarak (m)', 'AI Confidence', 'Keterangan'];

        $suspiciousLogs = $this->logs->filter(function ($log) {
            return ($log->risk_score ?? 0) >= 30 || $log->is_suspicious || $log->spoofing_detected || $log->status === 'rejected';
        })->values();

        foreach ($suspiciousLogs as $index => $log) {
            $reason = [];
            if (($log->risk_score ?? 0) >= 70) $reason[] = 'Risk Score Tinggi';
            if ($log->is_suspicious) $reason[] = 'Terdeteksi Suspicious';
            if ($log->spoofing_detected) $reason[] = 'Spoofing Detected';
            if ($log->status === 'rejected') $reason[] = 'Status Ditolak';
            if (($log->distance_m ?? 0) > 500) $reason[] = 'Jarak > 500m';
            if (($log->face_match_score ?? 100) < 70) $reason[] = 'Face Match Rendah';

            $rows[] = [
                $index + 1,
                Carbon::parse($log->scanned_at)->format('d/m/Y H:i:s'),
                $log->mahasiswa->nim ?? '-',
                $log->mahasiswa->nama ?? '-',
                strtoupper($log->status),
                $log->risk_score ?? 0,
                $log->distance_m ?? '-',
                ($log->ai_confidence ?? '-') . '%',
                implode(', ', $reason),
            ];
        }

        if ($suspiciousLogs->isEmpty()) {
            $rows[] = ['', '', '', '✅ Tidak ada aktivitas mencurigakan terdeteksi', '', '', '', '', ''];
        }

        $rows[] = [''];
        $rows[] = [''];

        // Recommendations
        $rows[] = ['REKOMENDASI KEAMANAN', '', '', '', '', '', '', '', ''];
        $rows[] = [''];

        if ($high > 0) {
            $rows[] = ['1.', 'URGENT: Terdapat ' . $high . ' aktivitas dengan risiko tinggi yang memerlukan investigasi segera.', '', '', '', '', '', '', ''];
        }
        if ($spoofing > 0) {
            $rows[] = ['2.', 'WARNING: Terdeteksi ' . $spoofing . ' percobaan spoofing. Pertimbangkan untuk memperketat verifikasi biometrik.', '', '', '', '', '', '', ''];
        }
        if ($suspicious > 0) {
            $rows[] = ['3.', 'PERHATIAN: ' . $suspicious . ' aktivitas mencurigakan terdeteksi. Review manual diperlukan.', '', '', '', '', '', '', ''];
        }
        if ($high === 0 && $spoofing === 0 && $suspicious === 0) {
            $rows[] = ['✅', 'Tidak ada ancaman keamanan signifikan yang terdeteksi pada periode ini.', '', '', '', '', '', '', ''];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        // Title
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setRGB('c62828');
        $sheet->getStyle('A2')->getFont()->setSize(11)->setItalic(true)->getColor()->setRGB('666666');

        // Risk distribution header
        $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('1a365d');

        // Table headers
        $sheet->getStyle('A6:D6')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'c62828']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        // Risk rows coloring
        $sheet->getStyle('A7:D7')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ffebee');
        $sheet->getStyle('A8:D8')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('fff8e1');
        $sheet->getStyle('A9:D9')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('e8f5e9');

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6, 'B' => 22, 'C' => 16, 'D' => 28, 'E' => 14,
            'F' => 14, 'G' => 12, 'H' => 14, 'I' => 45,
        ];
    }
}
