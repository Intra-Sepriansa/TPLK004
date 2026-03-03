<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GradingDetailExport implements FromArray, WithStyles, WithTitle, WithColumnWidths, WithEvents
{
    private array $rows = [];
    private array $sectionRows = [];
    private int $timelineHeaderRow = 0;
    private int $timelineDataStartRow = 0;
    private int $timelineDataEndRow = 0;
    private int $notesHeaderRow = 0;
    private int $notesDataStartRow = 0;
    private int $notesDataEndRow = 0;

    public function __construct(
        private readonly array $report,
        private readonly string $scope = 'full',
        private readonly bool $includeTimeline = true,
        private readonly bool $includeNotes = true,
    ) {
    }

    public function array(): array
    {
        if ($this->rows === []) {
            $this->buildRows();
        }

        return $this->rows;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Grading Detail';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 16,
            'C' => 32,
            'D' => 16,
            'E' => 14,
            'F' => 12,
            'G' => 16,
            'H' => 44,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                if ($this->rows === []) {
                    $this->buildRows();
                }

                $sheet = $event->sheet->getDelegate();
                $lastRow = max(1, count($this->rows));

                $sheet->mergeCells('A1:H1');
                $sheet->freezePane('A2');

                // Global styling
                $sheet->getStyle("A1:H{$lastRow}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
                $sheet->getStyle("A1:H{$lastRow}")->getAlignment()->setWrapText(true);

                // Section headers
                foreach ($this->sectionRows as $row) {
                    $sheet->mergeCells("A{$row}:H{$row}");
                    $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['rgb' => '312E81']],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'E0E7FF'],
                        ],
                    ]);
                }

                // Timeline heading and borders
                if ($this->timelineHeaderRow > 0) {
                    $sheet->getStyle("A{$this->timelineHeaderRow}:H{$this->timelineHeaderRow}")->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => '111827'],
                        ],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                        ],
                    ]);

                    if ($this->timelineDataEndRow >= $this->timelineDataStartRow) {
                        $sheet->getStyle("A{$this->timelineHeaderRow}:H{$this->timelineDataEndRow}")->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['rgb' => 'D1D5DB'],
                                ],
                            ],
                        ]);

                        $sheet->setAutoFilter("A{$this->timelineHeaderRow}:H{$this->timelineDataEndRow}");
                    }
                }

                if ($this->notesHeaderRow > 0) {
                    $sheet->getStyle("A{$this->notesHeaderRow}:H{$this->notesHeaderRow}")->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => '374151'],
                        ],
                    ]);

                    if ($this->notesDataEndRow >= $this->notesDataStartRow) {
                        $sheet->getStyle("A{$this->notesHeaderRow}:H{$this->notesDataEndRow}")->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['rgb' => 'D1D5DB'],
                                ],
                            ],
                        ]);
                    }
                }
            },
        ];
    }

    private function buildRows(): void
    {
        $student = $this->report['student'] ?? [];
        $course = $this->report['course'] ?? [];
        $grade = $this->report['gradeData'] ?? [];
        $breakdown = $grade['status_breakdown'] ?? [];
        $pointsBreakdown = $grade['points_breakdown'] ?? [];

        $rows = [];
        $rows[] = ['LAPORAN DETAIL PENILAIAN KEHADIRAN'];
        $rows[] = ['Generated At', now()->format('d M Y H:i:s')];
        $rows[] = [];

        $this->sectionRows[] = count($rows) + 1;
        $rows[] = ['INFORMASI MAHASISWA'];
        $rows[] = ['Nama', $student['nama'] ?? '-', 'NIM', $student['nim'] ?? '-', 'Program Studi', $student['prodi'] ?? '-', '', ''];
        $rows[] = ['Mata Kuliah', $course['nama'] ?? '-', 'Kode', $course['kode'] ?? '-', 'SKS', (string) ($course['sks'] ?? '-'), '', ''];
        $rows[] = [];

        $this->sectionRows[] = count($rows) + 1;
        $rows[] = ['RINGKASAN NILAI'];
        $rows[] = ['Total Sesi', (string) ($grade['total_sessions'] ?? 0), 'Hadir', (string) ($grade['attended_sessions'] ?? 0), 'Rate', (string) (($grade['attendance_rate'] ?? 0) . '%'), 'Grade', (string) ($grade['grade_letter'] ?? '-')];
        $rows[] = ['Rata-rata Poin', (string) ($grade['average_points'] ?? 0), 'Peringkat', '#' . (string) ($grade['rank_in_class'] ?? 0), 'Total Mahasiswa', (string) ($grade['total_students'] ?? 0), 'Eligible UAS', !empty($grade['can_take_uas']) ? 'Ya' : 'Tidak'];
        $rows[] = [];

        $this->sectionRows[] = count($rows) + 1;
        $rows[] = ['RINGKASAN STATUS'];
        $rows[] = ['Hadir', (string) ($breakdown['present'] ?? 0), 'Terlambat', (string) ($breakdown['late'] ?? 0), 'Izin', (string) ($breakdown['permit'] ?? 0), 'Sakit', (string) ($breakdown['sick'] ?? 0)];
        $rows[] = ['Absen', (string) ($breakdown['absent'] ?? 0), 'Ditolak', (string) ($breakdown['rejected'] ?? 0), 'Total Poin', (string) ($pointsBreakdown['total_points'] ?? 0), 'Max Poin', (string) ($pointsBreakdown['max_possible_points'] ?? 0)];

        if ($this->scope === 'full' && $this->includeTimeline) {
            $timeline = $this->report['attendanceRecords'] ?? [];
            if ($timeline !== []) {
                $rows[] = [];
                $this->sectionRows[] = count($rows) + 1;
                $rows[] = ['RIWAYAT KEHADIRAN'];

                $this->timelineHeaderRow = count($rows) + 1;
                $rows[] = ['No', 'Pertemuan', 'Judul Sesi', 'Tanggal', 'Jam', 'Status', 'Poin', 'Catatan'];
                $this->timelineDataStartRow = count($rows) + 1;

                foreach ($timeline as $index => $record) {
                    $rows[] = [
                        (string) ($index + 1),
                        (string) ($record['meeting_number'] ?? '-'),
                        (string) ($record['session_title'] ?? '-'),
                        (string) ($record['session_date'] ?? '-'),
                        (string) ($record['check_in_time'] ?? '-'),
                        (string) ($record['status'] ?? '-'),
                        (string) ($record['points'] ?? 0),
                        (string) ($record['notes'] ?? '-'),
                    ];
                }

                $this->timelineDataEndRow = count($rows);
            }
        }

        if ($this->includeNotes) {
            $notes = $this->report['dosenNotes'] ?? [];
            if ($notes !== []) {
                $rows[] = [];
                $this->sectionRows[] = count($rows) + 1;
                $rows[] = ['CATATAN DOSEN'];

                $this->notesHeaderRow = count($rows) + 1;
                $rows[] = ['No', 'Judul', 'Konten', 'Dibuat Oleh', 'Tanggal', '', '', ''];
                $this->notesDataStartRow = count($rows) + 1;

                foreach ($notes as $index => $note) {
                    $rows[] = [
                        (string) ($index + 1),
                        (string) ($note['title'] ?? '-'),
                        (string) ($note['content'] ?? '-'),
                        (string) ($note['created_by'] ?? '-'),
                        (string) ($note['created_at'] ?? '-'),
                        '',
                        '',
                        '',
                    ];
                }

                $this->notesDataEndRow = count($rows);
            }
        }

        $this->rows = $rows;
    }
}
