<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Audit Keamanan</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11px; line-height: 1.4; color: #333; }
        .container { padding: 20px 30px; }
        .header { display: table; width: 100%; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 20px; }
        .header-logo { display: table-cell; width: 70px; vertical-align: middle; }
        .header-logo img { width: 60px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
        .header-logo-right { display: table-cell; width: 70px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 60px; height: auto; }
        .university-name { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #1a365d; }
        .faculty-name { font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .address { font-size: 9px; margin-top: 3px; }
        .title { text-align: center; margin: 20px 0; }
        .title h1 { font-size: 14px; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
        .subtitle { font-size: 11px; margin-top: 5px; }
        .info-section { margin-bottom: 15px; }
        .info-table td { padding: 2px 0; vertical-align: top; }
        .info-table td:first-child { width: 120px; }
        .info-table td:nth-child(2) { width: 10px; }
        .stats-grid { display: table; width: 100%; margin: 15px 0; }
        .stat-box { display: table-cell; width: 25%; padding: 8px; text-align: center; border: 1px solid #ddd; }
        .stat-value { font-size: 18px; font-weight: bold; color: #1a365d; }
        .stat-label { font-size: 9px; color: #666; margin-top: 3px; }
        .audit-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10px; }
        .audit-table th, .audit-table td { border: 1px solid #333; padding: 6px 4px; }
        .audit-table th { background-color: #1a365d; color: white; font-weight: bold; text-align: center; }
        .audit-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        .event-badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; }
        .event-expired { background-color: #fef3c7; color: #92400e; }
        .event-duplicate { background-color: #fee2e2; color: #991b1b; }
        .event-geofence { background-color: #fce7f3; color: #9d174d; }
        .event-login { background-color: #dbeafe; color: #1e40af; }
        .event-success { background-color: #d1fae5; color: #065f46; }
        .signature-section { margin-top: 30px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 180px; }
        .signature-space { height: 50px; }
        .signature-name { font-weight: bold; text-decoration: underline; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 8px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-logo">
                @if(file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="header-text">
                <div class="university-name">Universitas Pamulang</div>
                <div class="faculty-name">Fakultas Teknik</div>
                <div class="address">
                    Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan, Banten 15417<br>
                    Telp: (021) 7412566 | Email: ft@unpam.ac.id
                </div>
            </div>
            <div class="header-logo-right">
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <div class="title">
            <h1>Laporan Audit Keamanan Sistem</h1>
            <div class="subtitle">Periode: {{ \Carbon\Carbon::parse($dateFrom)->format('d/m/Y') }} - {{ \Carbon\Carbon::parse($dateTo)->format('d/m/Y') }}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $securityStats['total_events'] }}</div>
                <div class="stat-label">Total Event</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #dc2626;">{{ $securityStats['token_duplicate'] }}</div>
                <div class="stat-label">Token Duplikat</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #ea580c;">{{ $securityStats['geofence_violation'] }}</div>
                <div class="stat-label">Pelanggaran Zona</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #ca8a04;">{{ $securityStats['token_expired'] }}</div>
                <div class="stat-label">Token Expired</div>
            </div>
        </div>

        <h3 style="margin: 15px 0 10px; font-size: 12px;">Distribusi Event</h3>
        <table class="audit-table">
            <thead>
                <tr>
                    <th>Tipe Event</th>
                    <th>Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($eventDistribution as $event)
                <tr>
                    <td>{{ ucwords(str_replace('_', ' ', $event->event_type)) }}</td>
                    <td style="text-align: center;">{{ $event->total }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <h3 style="margin: 15px 0 10px; font-size: 12px;">Detail Log Audit</h3>
        <table class="audit-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th style="width: 100px;">Waktu</th>
                    <th style="width: 100px;">Tipe Event</th>
                    <th>Pesan</th>
                    <th style="width: 120px;">Mahasiswa</th>
                </tr>
            </thead>
            <tbody>
                @forelse($auditLogs as $index => $log)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $log->created_at->format('d/m/Y H:i') }}</td>
                    <td>
                        <span class="event-badge 
                            @if($log->event_type == 'token_expired') event-expired
                            @elseif($log->event_type == 'token_duplicate') event-duplicate
                            @elseif($log->event_type == 'geofence_violation') event-geofence
                            @elseif(str_contains($log->event_type, 'login')) event-login
                            @else event-success
                            @endif
                        ">
                            {{ ucwords(str_replace('_', ' ', $log->event_type)) }}
                        </span>
                    </td>
                    <td>{{ Str::limit($log->message, 50) }}</td>
                    <td>{{ $log->mahasiswa?->nama ?? '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">Tidak ada data audit</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box">
                <p>{{ $tempat }}, {{ $tanggal }}</p>
                <p style="margin-top: 5px;">Administrator Sistem,</p>
                <div class="signature-space"></div>
                <p class="signature-name">_______________________</p>
            </div>
        </div>

        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Presensi UNPAM</p>
            <p>Dicetak pada: {{ now()->format('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
