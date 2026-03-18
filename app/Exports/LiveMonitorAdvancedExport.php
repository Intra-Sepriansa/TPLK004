<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class LiveMonitorAdvancedExport implements WithMultipleSheets
{
    protected $logs;
    protected $stats;
    protected $filters;

    public function __construct($logs, $stats = [], $filters = [])
    {
        $this->logs = $logs;
        $this->stats = $stats;
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        return [
            new Sheets\DashboardSheet($this->logs, $this->stats, $this->filters),
            new Sheets\RawDataSheet($this->logs),
            new Sheets\AnalyticsSheet($this->logs, $this->stats),
            new Sheets\RiskAnalysisSheet($this->logs),
        ];
    }
}
