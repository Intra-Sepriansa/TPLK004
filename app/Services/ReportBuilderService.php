<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\Dosen;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportBuilderService
{
    /**
     * Build custom report based on criteria
     */
    public function buildReport(array $criteria)
    {
        $query = AttendanceLog::query()->with(['mahasiswa', 'session.mataKuliah', 'session.dosen']);

        // Apply filters
        if (isset($criteria['date_from'])) {
            $query->where('created_at', '>=', $criteria['date_from']);
        }

        if (isset($criteria['date_to'])) {
            $query->where('created_at', '<=', $criteria['date_to']);
        }

        if (isset($criteria['course_id'])) {
            $query->whereHas('session', function($q) use ($criteria) {
                $q->where('mata_kuliah_id', $criteria['course_id']);
            });
        }

        if (isset($criteria['mahasiswa_id'])) {
            $query->where('mahasiswa_id', $criteria['mahasiswa_id']);
        }

        if (isset($criteria['status'])) {
            $query->where('status', $criteria['status']);
        }

        if (isset($criteria['kelas'])) {
            $query->whereHas('mahasiswa', function($q) use ($criteria) {
                $q->where('kelas', $criteria['kelas']);
            });
        }

        // Get data
        $data = $query->get();

        // Calculate statistics
        $stats = $this->calculateStatistics($data);

        // Group data based on grouping criteria
        $groupedData = $this->groupData($data, $criteria['group_by'] ?? 'date');

        return [
            'criteria' => $criteria,
            'total_records' => $data->count(),
            'statistics' => $stats,
            'grouped_data' => $groupedData,
            'raw_data' => $data,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get available report templates
     */
    public function getReportTemplates()
    {
        return [
            [
                'id' => 'daily_attendance',
                'name' => 'Laporan Kehadiran Harian',
                'description' => 'Rekap kehadiran per hari',
                'fields' => ['date', 'course', 'total_present', 'total_absent', 'percentage'],
                'group_by' => 'date',
            ],
            [
                'id' => 'student_summary',
                'name' => 'Ringkasan Per Mahasiswa',
                'description' => 'Statistik kehadiran per mahasiswa',
                'fields' => ['nim', 'nama', 'total_sessions', 'present', 'absent', 'late', 'percentage'],
                'group_by' => 'mahasiswa',
            ],
            [
                'id' => 'course_summary',
                'name' => 'Ringkasan Per Mata Kuliah',
                'description' => 'Statistik kehadiran per mata kuliah',
                'fields' => ['course_name', 'dosen', 'total_sessions', 'avg_attendance', 'total_students'],
                'group_by' => 'course',
            ],
            [
                'id' => 'monthly_trend',
                'name' => 'Tren Bulanan',
                'description' => 'Tren kehadiran per bulan',
                'fields' => ['month', 'total_sessions', 'avg_attendance', 'trend'],
                'group_by' => 'month',
            ],
            [
                'id' => 'risk_analysis',
                'name' => 'Analisis Risiko',
                'description' => 'Mahasiswa dengan risiko kehadiran rendah',
                'fields' => ['nim', 'nama', 'attendance_rate', 'risk_level', 'recommendation'],
                'group_by' => 'risk_level',
            ],
            [
                'id' => 'punctuality_report',
                'name' => 'Laporan Ketepatan Waktu',
                'description' => 'Analisis ketepatan waktu kehadiran',
                'fields' => ['nim', 'nama', 'on_time', 'late', 'punctuality_score'],
                'group_by' => 'mahasiswa',
            ],
        ];
    }

    /**
     * Generate report from template
     */
    public function generateFromTemplate($templateId, array $params = [])
    {
        $templates = collect($this->getReportTemplates());
        $template = $templates->firstWhere('id', $templateId);

        if (!$template) {
            throw new \Exception("Template not found: {$templateId}");
        }

        $criteria = array_merge($params, [
            'group_by' => $template['group_by'],
            'fields' => $template['fields'],
        ]);

        $report = $this->buildReport($criteria);
        $report['template'] = $template;

        return $report;
    }

    /**
     * Schedule report to be sent via email
     */
    public function scheduleReport(array $config)
    {
        // Store in database for scheduled execution
        DB::table('scheduled_reports')->insert([
            'name' => $config['name'],
            'template_id' => $config['template_id'],
            'criteria' => json_encode($config['criteria']),
            'recipients' => json_encode($config['recipients']),
            'frequency' => $config['frequency'], // daily, weekly, monthly
            'format' => $config['format'], // pdf, excel, csv
            'next_run_at' => $this->calculateNextRun($config['frequency']),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [
            'success' => true,
            'message' => 'Report scheduled successfully',
            'next_run' => $this->calculateNextRun($config['frequency']),
        ];
    }

    /**
     * Get scheduled reports
     */
    public function getScheduledReports()
    {
        return DB::table('scheduled_reports')
            ->where('is_active', true)
            ->orderBy('next_run_at')
            ->get();
    }

    /**
     * Export report to various formats
     */
    public function export($reportData, $format = 'pdf')
    {
        switch ($format) {
            case 'pdf':
                return $this->exportToPDF($reportData);
            case 'excel':
                return $this->exportToExcel($reportData);
            case 'csv':
                return $this->exportToCSV($reportData);
            case 'json':
                return $this->exportToJSON($reportData);
            default:
                throw new \Exception("Unsupported format: {$format}");
        }
    }

    // Helper methods
    private function calculateStatistics($data)
    {
        $total = $data->count();
        $present = $data->where('status', 'hadir')->count();
        $absent = $data->where('status', 'alpha')->count();
        $late = $data->where('is_late', true)->count();
        $excused = $data->whereIn('status', ['izin', 'sakit'])->count();

        return [
            'total' => $total,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'excused' => $excused,
            'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
            'punctuality_rate' => $present > 0 ? round((($present - $late) / $present) * 100, 2) : 0,
        ];
    }

    private function groupData($data, $groupBy)
    {
        switch ($groupBy) {
            case 'date':
                return $data->groupBy(function($item) {
                    return Carbon::parse($item->created_at)->format('Y-m-d');
                })->map(function($group) {
                    return $this->calculateStatistics($group);
                });

            case 'mahasiswa':
                return $data->groupBy('mahasiswa_id')->map(function($group) {
                    $stats = $this->calculateStatistics($group);
                    $stats['mahasiswa'] = $group->first()->mahasiswa;
                    return $stats;
                });

            case 'course':
                return $data->groupBy(function($item) {
                    return $item->session->mata_kuliah_id;
                })->map(function($group) {
                    $stats = $this->calculateStatistics($group);
                    $stats['course'] = $group->first()->session->mataKuliah;
                    return $stats;
                });

            case 'month':
                return $data->groupBy(function($item) {
                    return Carbon::parse($item->created_at)->format('Y-m');
                })->map(function($group) {
                    return $this->calculateStatistics($group);
                });

            case 'risk_level':
                return $data->groupBy('mahasiswa_id')->map(function($group) {
                    $stats = $this->calculateStatistics($group);
                    $stats['mahasiswa'] = $group->first()->mahasiswa;
                    
                    // Determine risk level
                    $rate = $stats['attendance_rate'];
                    if ($rate < 60) {
                        $stats['risk_level'] = 'danger';
                    } elseif ($rate < 80) {
                        $stats['risk_level'] = 'warning';
                    } else {
                        $stats['risk_level'] = 'safe';
                    }
                    
                    return $stats;
                })->groupBy('risk_level');

            default:
                return $data;
        }
    }

    private function calculateNextRun($frequency)
    {
        switch ($frequency) {
            case 'daily':
                return now()->addDay()->setTime(8, 0);
            case 'weekly':
                return now()->addWeek()->startOfWeek()->setTime(8, 0);
            case 'monthly':
                return now()->addMonth()->startOfMonth()->setTime(8, 0);
            default:
                return now()->addDay();
        }
    }

    private function exportToPDF($reportData)
    {
        // Implementation using DomPDF (already installed)
        $pdf = app('dompdf.wrapper');
        $pdf->loadView('reports.pdf-template', $reportData);
        return $pdf->download('report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function exportToExcel($reportData)
    {
        // Implementation using Maatwebsite Excel
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AttendanceReportExport($reportData),
            'report-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    private function exportToCSV($reportData)
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AttendanceReportExport($reportData),
            'report-' . now()->format('Y-m-d') . '.csv',
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    private function exportToJSON($reportData)
    {
        $filename = 'report-' . now()->format('Y-m-d') . '.json';
        $content = json_encode($reportData, JSON_PRETTY_PRINT);
        
        return response($content)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
