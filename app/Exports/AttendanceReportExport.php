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

class AttendanceReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths
{
    protected $reportData;

    public function __construct($reportData)
    {
        $this->reportData = $reportData;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $data = collect();

        foreach ($this->reportData['raw_data'] as $record) {
            $data->push([
                'NIM' => $record->mahasiswa->nim ?? '-',
                'Nama' => $record->mahasiswa->nama ?? '-',
                'Kelas' => $record->mahasiswa->kelas ?? '-',
                'Mata Kuliah' => $record->session->mataKuliah->nama ?? '-',
                'Dosen' => $record->session->dosen->nama ?? '-',
                'Tanggal' => $record->created_at->format('d/m/Y'),
                'Jam' => $record->check_in_at ? \Carbon\Carbon::parse($record->check_in_at)->format('H:i') : '-',
                'Status' => ucfirst($record->status),
                'Terlambat' => $record->is_late ? 'Ya' : 'Tidak',
                'Lokasi' => $record->location ?? '-',
            ]);
        }

        return $data;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'NIM',
            'Nama',
            'Kelas',
            'Mata Kuliah',
            'Dosen',
            'Tanggal',
            'Jam',
            'Status',
            'Terlambat',
            'Lokasi',
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
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '10B981']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Laporan Kehadiran';
    }

    /**
     * @return array
     */
    public function columnWidths(): array
    {
        return [
            'A' => 15, // NIM
            'B' => 30, // Nama
            'C' => 10, // Kelas
            'D' => 35, // Mata Kuliah
            'E' => 25, // Dosen
            'F' => 12, // Tanggal
            'G' => 10, // Jam
            'H' => 12, // Status
            'I' => 12, // Terlambat
            'J' => 40, // Lokasi
        ];
    }
}
