<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\Wizard;
use Carbon\Carbon;

class RawDataSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    protected $logs;

    public function __construct($logs)
    {
        $this->logs = $logs;
    }

    public function title(): string
    {
        return '📋 DATA MENTAH';
    }

    public function headings(): array
    {
        return [
            'No',
            'Timestamp',
            'NIM',
            'Nama Mahasiswa',
            'Mata Kuliah',
            'Kode MK',
            'Dosen',
            'Pertemuan',
            'Status Kehadiran',
            'Waktu Check-in',
            'Latitude',
            'Longitude',
            'Akurasi GPS (m)',
            'Jarak (m)',
            'Face Match (%)',
            'Liveness Score',
            'Risk Level',
            'Risk Score',
            'Device',
            'Browser',
            'IP Address',
            'Suspicious',
            'AI Confidence',
            'Catatan',
        ];
    }

    public function collection()
    {
        return $this->logs->values()->map(function ($log, $index) {
            $riskScore = $log->risk_score ?? 0;
            $riskLevel = 'Low';
            if ($riskScore >= 70) $riskLevel = 'High';
            elseif ($riskScore >= 30) $riskLevel = 'Medium';

            return [
                'no' => $index + 1,
                'timestamp' => Carbon::parse($log->scanned_at)->format('d/m/Y H:i:s'),
                'nim' => $log->mahasiswa->nim ?? '-',
                'nama' => $log->mahasiswa->nama ?? '-',
                'matkul' => $log->session?->course?->nama ?? '-',
                'kode_mk' => $log->session?->course?->kode ?? '-',
                'dosen' => $log->session?->dosen?->nama ?? '-',
                'pertemuan' => $log->session?->meeting_number ?? '-',
                'status' => strtoupper($log->status),
                'waktu' => Carbon::parse($log->scanned_at)->format('H:i:s'),
                'lat' => $log->latitude ?? '-',
                'lng' => $log->longitude ?? '-',
                'accuracy' => $log->accuracy ?? '-',
                'distance' => $log->distance_m ?? '-',
                'face_match' => $log->face_match_score ?? '-',
                'liveness' => $log->is_live_photo ? 'YES' : 'NO',
                'risk_level' => $riskLevel,
                'risk_score' => $riskScore,
                'device' => ($log->device_model ?? '') . ' ' . ($log->device_os ?? ''),
                'browser' => $log->browser ?? '-',
                'ip' => $log->ip_address ?? '-',
                'suspicious' => $log->is_suspicious ? '⚠️ YES' : '✅ NO',
                'ai_confidence' => $log->ai_confidence ?? '-',
                'note' => $log->note ?? '-',
            ];
        });
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $this->logs->count() + 1;

        // Header row
        $sheet->getStyle('A1:X1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1f4e79']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(30);

        // Freeze first row
        $sheet->freezePane('A2');

        // Auto filter
        $sheet->setAutoFilter("A1:X{$lastRow}");

        // Data rows borders
        if ($lastRow > 1) {
            $sheet->getStyle("A2:X{$lastRow}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'e2e8f0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Alternating row colors
            for ($row = 2; $row <= $lastRow; $row++) {
                if ($row % 2 === 0) {
                    $sheet->getStyle("A{$row}:X{$row}")->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('f8f9fa');
                }
            }

            // Status column conditional coloring (column I)
            for ($row = 2; $row <= $lastRow; $row++) {
                $val = strtoupper($sheet->getCell("I{$row}")->getValue());
                $color = 'd4edda'; // green
                if (in_array($val, ['LATE', 'TERLAMBAT'])) $color = 'fff3cd';
                elseif (in_array($val, ['EXCUSED', 'IZIN'])) $color = 'cce5ff';
                elseif (in_array($val, ['REJECTED', 'ABSENT', 'ALPHA'])) $color = 'f8d7da';

                $sheet->getStyle("I{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB($color);
                $sheet->getStyle("I{$row}")->getFont()->setBold(true);
                $sheet->getStyle("I{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            // Risk Level coloring (column Q)
            for ($row = 2; $row <= $lastRow; $row++) {
                $val = $sheet->getCell("Q{$row}")->getValue();
                $color = 'd4edda';
                if ($val === 'High') $color = 'f8d7da';
                elseif ($val === 'Medium') $color = 'fff3cd';

                $sheet->getStyle("Q{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB($color);
                $sheet->getStyle("Q{$row}")->getFont()->setBold(true);
                $sheet->getStyle("Q{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
        }

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,  'B' => 20, 'C' => 16, 'D' => 28, 'E' => 30,
            'F' => 12, 'G' => 25, 'H' => 12, 'I' => 16, 'J' => 12,
            'K' => 12, 'L' => 12, 'M' => 14, 'N' => 10, 'O' => 14,
            'P' => 12, 'Q' => 12, 'R' => 12, 'S' => 22, 'T' => 16,
            'U' => 16, 'V' => 12, 'W' => 14, 'X' => 20,
        ];
    }
}
