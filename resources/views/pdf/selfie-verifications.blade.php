<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Verifikasi Selfie</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ddd; padding-bottom: 15px; }
        .header h1 { margin: 0 0 5px 0; font-size: 18px; color: #111; }
        .header p { margin: 0; color: #555; }
        .info { margin-bottom: 20px; width: 100%; border-collapse: collapse; }
        .info td { padding: 4px 0; }
        .info td.label { font-weight: bold; width: 120px; color: #555; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th, table.data td { border: 1px solid #ddd; padding: 8px 6px; text-align: left; }
        table.data th { background-color: #f8f9fa; font-weight: bold; color: #333; text-transform: uppercase; font-size: 9px; }
        .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
        .status-pending { background: #fdf6e3; color: #b58900; }
        .status-approved { background: #e8f5e9; color: #2e7d32; }
        .status-rejected { background: #ffebee; color: #c62828; }
        .risk-low { color: #2e7d32; }
        .risk-medium { color: #f57f17; }
        .risk-high { color: #c62828; }
        .risk-critical { color: #b71c1c; font-weight: bold; }
        .footer { margin-top: 30px; text-align: right; font-size: 9px; color: #777; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Rekapitulasi Verifikasi Selfie Mahasiswa</h1>
        <p>Aplikasi Absensi TPLK004</p>
    </div>

    <table class="info">
        <tr>
            <td class="label">Nama Dosen</td>
            <td>: {{ $dosen->nama }}</td>
        </tr>
        <tr>
            <td class="label">NIDN</td>
            <td>: {{ $dosen->nidn }}</td>
        </tr>
        <tr>
            <td class="label">Waktu Export</td>
            <td>: {{ $date }}</td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">Mahasiswa Info</th>
                <th width="18%">Mata Kuliah / Sesi</th>
                <th width="12%">Waktu</th>
                <th width="10%">Status</th>
                <th width="20%">AI Stats</th>
                <th width="20%">Meta</th>
            </tr>
        </thead>
        <tbody>
            @forelse($verifications as $index => $v)
                @php
                    $log = $v->attendanceLog;
                    $m = $log?->mahasiswa;
                    $session = $log?->session;
                    
                    $riskScore = $log?->risk_score;
                    $riskLevel = 'LOW';
                    $riskClass = 'risk-low';
                    if ($riskScore !== null) {
                        if ($riskScore > 85) { $riskLevel = 'CRITICAL'; $riskClass = 'risk-critical'; }
                        elseif ($riskScore > 65) { $riskLevel = 'HIGH'; $riskClass = 'risk-high'; }
                        elseif ($riskScore > 40) { $riskLevel = 'MEDIUM'; $riskClass = 'risk-medium'; }
                    }

                    $statusClass = 'status-pending';
                    if ($v->status === 'approved') $statusClass = 'status-approved';
                    if ($v->status === 'rejected') $statusClass = 'status-rejected';

                    $aiConf = $log?->ai_confidence ?? 0;
                    $faceMatch = $log?->face_match_score ?? 0;
                @endphp
                <tr>
                    <td align="center">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $m?->nama ?? '-' }}</strong><br>
                        <span style="color: #666; font-size: 8px;">{{ $m?->nim ?? '-' }}</span>
                    </td>
                    <td>
                        {{ $session?->course?->nama ?? '-' }}<br>
                        <span style="color: #666; font-size: 8px;">Pertemuan: {{ $session?->meeting_number ?? '-' }}</span>
                    </td>
                    <td>
                        {{ $v->created_at?->format('d M Y') }}<br>
                        <span style="color: #666; font-size: 8px;">{{ $v->created_at?->format('H:i') }}</span>
                    </td>
                    <td align="center">
                        <span class="status-badge {{ $statusClass }}">{{ strtoupper($v->status) }}</span>
                    </td>
                    <td style="font-size: 9px; line-height: 1.4;">
                        Confidence: <strong>{{ $aiConf }}%</strong><br>
                        Face Match: <strong>{{ $faceMatch }}%</strong><br>
                        Risk: <span class="{{ $riskClass }}">{{ $riskLevel }}</span>
                    </td>
                    <td style="font-size: 9px; line-height: 1.4;">
                        Jarak: {{ $log?->distance_m ?? '-' }}m<br>
                        Device: {{ Str::limit($log?->device_model ?? $log?->device_type ?? '-', 15) }}<br>
                        Verifikator: {{ $v->verified_by_name ?? 'Sistem' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" align="center" style="padding: 20px;">Tidak ada data verifikasi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak secara otomatis oleh sistem pada {{ $date }}.
    </div>
</body>
</html>
