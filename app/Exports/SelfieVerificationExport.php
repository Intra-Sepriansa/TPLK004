<?php

namespace App\Exports;

use App\Models\SelfieVerification;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SelfieVerificationExport implements FromCollection, WithHeadings, WithMapping
{
    protected $courseIds;

    public function __construct($courseIds)
    {
        $this->courseIds = $courseIds;
    }

    public function collection()
    {
        return SelfieVerification::with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $this->courseIds))
            ->latest()
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID Verification',
            'NIM',
            'Nama Mahasiswa',
            'Mata Kuliah',
            'Pertemuan Ke',
            'Tanggal',
            'Waktu',
            'Status',
            'AI Confidence',
            'Face Match Score',
            'Liveness Score',
            'Risk Level',
            'Jarak (m)',
            'Diverifikasi Oleh'
        ];
    }

    /**
     * @param SelfieVerification $verification
     */
    public function map($verification): array
    {
        $log = $verification->attendanceLog;
        $m = $log?->mahasiswa;
        $session = $log?->session;

        $riskScore = $log?->risk_score;
        $riskLevel = 'LOW';
        if ($riskScore !== null) {
            if ($riskScore > 85) $riskLevel = 'CRITICAL';
            elseif ($riskScore > 65) $riskLevel = 'HIGH';
            elseif ($riskScore > 40) $riskLevel = 'MEDIUM';
        }

        $aiAnalysis = $log?->ai_analysis_json;

        return [
            $verification->id,
            $m?->nim ?? '-',
            $m?->nama ?? '-',
            $session?->course?->nama ?? '-',
            $session?->meeting_number ?? '-',
            $verification->created_at?->format('Y-m-d') ?? '-',
            $verification->created_at?->format('H:i:s') ?? '-',
            strtoupper($verification->status),
            ($log?->ai_confidence ?? 0) . '%',
            ($log?->face_match_score ?? 0) . '%',
            ($aiAnalysis['liveness_detection']['liveness_score'] ?? 0) . '%',
            $riskLevel,
            $log?->distance_m ?? '-',
            $verification->verified_by_name ?? 'Sistem'
        ];
    }
}
