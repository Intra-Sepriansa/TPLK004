<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

class AktivitasTerbaruExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths
{
    protected $logs;

    public function __construct($logs)
    {
        $this->logs = $logs;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->logs->map(function ($log) {
            return [
                'NIM' => $log->mahasiswa->nim ?? '-',
                'Nama' => $log->mahasiswa->nama ?? '-',
                'Program Studi' => $log->mahasiswa->prodi ?? 'Manajemen Informatika',
                'Mata Kuliah' => $log->session->course->nama ?? $log->session->judul ?? '-',
                'Pertemuan' => $log->session->meeting_number ?? '-',
                'Waktu Scan' => Carbon::parse($log->scanned_at)->format('d M Y H:i:s'),
                'Status' => strtoupper($log->status),
                'Metode' => 'Aplikasi',
                'Jarak (m)' => $log->location_distance ?? '-',
                'Device / OS' => $log->device_os ?? 'Unknown',
                'Browser' => $log->device_browser ?? 'Unknown',
                'IP Address' => $log->ip_address ?? '-',
                'Lokasi Geo' => $log->location_address ?? '-',
            ];
        });
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'NIM',
            'Nama',
            'Program Studi',
            'Mata Kuliah',
            'Pertemuan',
            'Waktu Scan',
            'Status',
            'Metode',
            'Jarak (m)',
            'Device / OS',
            'Browser',
            'IP Address',
            'Lokasi Geo',
        ];
    }

    /**
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'] // Indigo 600
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            // Freeze top row
            'A1:M1' => [
                'borders' => [
                    'bottom' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
                        'color' => ['argb' => '00000000'],
                    ],
                ]
            ],
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Log Aktivitas Terbaru';
    }

    /**
     * @return array
     */
    public function columnWidths(): array
    {
        return [
            'A' => 18, // NIM
            'B' => 30, // Nama
            'C' => 25, // Prodi
            'D' => 35, // Mata Kuliah
            'E' => 12, // Pertemuan
            'F' => 22, // Waktu
            'G' => 15, // Status
            'H' => 15, // Metode
            'I' => 12, // Jarak
            'J' => 20, // Device
            'K' => 20, // Browser
            'L' => 18, // IP
            'M' => 45, // Lokasi Geo
        ];
    }
}
