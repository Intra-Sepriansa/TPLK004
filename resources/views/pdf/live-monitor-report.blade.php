<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Monitoring Absensi Real-Time</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 9px; line-height: 1.5; color: #2d3748; }
        .container { padding: 12px 18px; }

        /* ════ HEADER ════ */
        .header { display: table; width: 100%; border-bottom: 3px double #1a365d; padding-bottom: 10px; margin-bottom: 12px; }
        .header-logo { display: table-cell; width: 55px; vertical-align: middle; }
        .header-logo img { width: 48px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 8px; }
        .header-logo-right { display: table-cell; width: 55px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 48px; height: auto; }
        .university-name { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; }
        .faculty-name { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #2d3748; }
        .program-name { font-size: 10px; font-weight: bold; color: #4a5568; }
        .address { font-size: 7.5px; margin-top: 2px; color: #718096; }

        /* ════ REPORT TITLE ════ */
        .report-title { text-align: center; margin: 12px 0 10px; }
        .report-title h1 { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #1a365d; text-decoration: underline; letter-spacing: 0.8px; margin-bottom: 3px; }
        .report-title .subtitle { font-size: 10px; color: #4a5568; font-style: italic; }

        /* ════ METADATA ════ */
        .metadata { display: table; width: 100%; margin-bottom: 12px; font-size: 8px; color: #4a5568; }
        .metadata .left { display: table-cell; width: 50%; }
        .metadata .right { display: table-cell; width: 50%; text-align: right; }
        .metadata strong { color: #2d3748; }

        /* ════ EXECUTIVE SUMMARY ════ */
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1a365d; border-bottom: 2px solid #2b6cb0; padding-bottom: 3px; margin: 14px 0 8px; }

        .stats-grid { display: table; width: 100%; margin-bottom: 10px; }
        .stat-card { display: table-cell; width: 25%; padding: 6px; text-align: center; }
        .stat-box { border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 4px; background: #f7fafc; }
        .stat-value { font-size: 20px; font-weight: bold; color: #1a365d; }
        .stat-label { font-size: 7.5px; color: #718096; text-transform: uppercase; margin-top: 2px; }
        .stat-pct { font-size: 8px; color: #38a169; font-weight: bold; margin-top: 1px; }

        .stat-box.hadir { border-left: 3px solid #38a169; }
        .stat-box.terlambat { border-left: 3px solid #d69e2e; }
        .stat-box.izin { border-left: 3px solid #3182ce; }
        .stat-box.anomali { border-left: 3px solid #e53e3e; }

        /* ════ DATA TABLE ════ */
        .data-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 8px; }
        .data-table th { background: #1a365d; color: white; font-weight: bold; text-align: center; padding: 5px 3px; border: 1px solid #1a365d; font-size: 7.5px; }
        .data-table td { border: 1px solid #cbd5e0; padding: 4px 3px; }
        .data-table tbody tr:nth-child(even) { background: #f7fafc; }
        .data-table tbody tr:hover { background: #edf2f7; }

        .status-present { color: #276749; font-weight: bold; background: #c6f6d5; padding: 1px 4px; border-radius: 2px; }
        .status-late { color: #975a16; font-weight: bold; background: #fefcbf; padding: 1px 4px; border-radius: 2px; }
        .status-excused { color: #2b6cb0; font-weight: bold; background: #bee3f8; padding: 1px 4px; border-radius: 2px; }
        .status-rejected { color: #9b2c2c; font-weight: bold; background: #fed7d7; padding: 1px 4px; border-radius: 2px; }

        .risk-high { color: #fff; background: #e53e3e; padding: 1px 4px; border-radius: 2px; font-size: 7px; font-weight: bold; }
        .risk-medium { color: #744210; background: #fefcbf; padding: 1px 4px; border-radius: 2px; font-size: 7px; font-weight: bold; }
        .risk-low { color: #276749; background: #c6f6d5; padding: 1px 4px; border-radius: 2px; font-size: 7px; font-weight: bold; }

        /* ════ RISK SECTION ════ */
        .risk-alert { border: 1px solid #fed7d7; background: #fff5f5; border-radius: 4px; padding: 8px; margin: 6px 0; }
        .risk-alert .title { color: #c53030; font-weight: bold; font-size: 9px; }
        .risk-alert .desc { color: #742a2a; font-size: 8px; margin-top: 2px; }

        /* ════ SIGNATURE ════ */
        .signature-section { margin-top: 28px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 170px; }
        .signature-space { height: 55px; }
        .signature-name { font-weight: bold; text-decoration: underline; }

        /* ════ FOOTER ════ */
        .footer { margin-top: 18px; padding-top: 6px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 7px; color: #a0aec0; }
        .footer .confidential { color: #e53e3e; font-weight: bold; font-size: 7.5px; text-transform: uppercase; }

        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div class="container">
        {{-- ════ PAGE 1: HEADER + EXECUTIVE SUMMARY + STATS ════ --}}

        <div class="header">
            <div class="header-logo">
                @if(file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="header-text">
                <div class="university-name">Universitas Pamulang</div>
                <div class="faculty-name">Fakultas Ilmu Komputer</div>
                <div class="program-name">Program Studi Teknik Informatika</div>
                <div class="address">
                    Jl. Surya Kencana No. 1, Pamulang, Tangerang Selatan, Banten 15417<br>
                    Telp: (021) 7412566 | Email: fikom@unpam.ac.id | Web: unpam.ac.id
                </div>
            </div>
            <div class="header-logo-right">
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <div class="report-title">
            <h1>Laporan Monitoring Absensi Real-Time</h1>
            <div class="subtitle">Sistem Absensi Cerdas Berbasis AI — {{ $reportPeriod ?? now()->timezone('Asia/Jakarta')->format('d F Y') }}</div>
        </div>

        <div class="metadata">
            <div class="left">
                <strong>Report ID:</strong> LM-{{ now()->format('YmdHis') }}<br>
                <strong>Filter Status:</strong> {{ $filterStatus ?? 'Semua Status' }}<br>
                <strong>Filter Kelas:</strong> {{ $filterClass ?? 'Semua Kelas' }}
            </div>
            <div class="right">
                <strong>Dicetak oleh:</strong> Administrator<br>
                <strong>Tanggal Cetak:</strong> {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB<br>
                <strong>Total Data:</strong> {{ $logs->count() }} record
            </div>
        </div>

        {{-- ════ EXECUTIVE SUMMARY STATS ════ --}}
        <div class="section-title">Ringkasan Eksekutif</div>

        @php
            $hadir = $logs->where('status', 'present')->count();
            $terlambat = $logs->where('status', 'late')->count();
            $izin = $logs->where('status', 'excused')->count();
            $anomali = $logs->whereIn('status', ['rejected', 'absent'])->count();
            $total = $logs->count();
            $rate = $total > 0 ? round(($hadir / $total) * 100, 1) : 0;
            $riskHigh = $logs->where('risk_score', '>=', 70)->count();
            $suspicious = $logs->where('is_suspicious', true)->count();
        @endphp

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-box hadir">
                    <div class="stat-value" style="color: #38a169;">{{ $hadir }}</div>
                    <div class="stat-label">Hadir</div>
                    <div class="stat-pct">{{ $total > 0 ? round(($hadir/$total)*100,1) : 0 }}%</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-box terlambat">
                    <div class="stat-value" style="color: #d69e2e;">{{ $terlambat }}</div>
                    <div class="stat-label">Terlambat</div>
                    <div class="stat-pct" style="color: #d69e2e;">{{ $total > 0 ? round(($terlambat/$total)*100,1) : 0 }}%</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-box izin">
                    <div class="stat-value" style="color: #3182ce;">{{ $izin }}</div>
                    <div class="stat-label">Izin / Sakit</div>
                    <div class="stat-pct" style="color: #3182ce;">{{ $total > 0 ? round(($izin/$total)*100,1) : 0 }}%</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-box anomali">
                    <div class="stat-value" style="color: #e53e3e;">{{ $anomali }}</div>
                    <div class="stat-label">Anomali / Ditolak</div>
                    <div class="stat-pct" style="color: #e53e3e;">{{ $total > 0 ? round(($anomali/$total)*100,1) : 0 }}%</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; font-size: 10px; margin: 6px 0 12px; padding: 6px; background: #ebf8ff; border-radius: 4px; border: 1px solid #bee3f8;">
            <strong>Tingkat Kehadiran Keseluruhan: {{ $rate }}%</strong>
            &nbsp;|&nbsp; Total Scan: {{ $total }}
            &nbsp;|&nbsp; Risiko Tinggi: <span style="color: #e53e3e; font-weight: bold;">{{ $riskHigh }}</span>
            &nbsp;|&nbsp; Suspicious: <span style="color: #d69e2e; font-weight: bold;">{{ $suspicious }}</span>
        </div>

        {{-- ════ DATA TABLE ════ --}}
        <div class="section-title">Detail Data Absensi</div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 18px;">No</th>
                    <th>Nama</th>
                    <th>NIM</th>
                    <th>Mata Kuliah</th>
                    <th>Pertemuan</th>
                    <th style="width: 55px;">Waktu</th>
                    <th style="width: 44px;">Status</th>
                    <th style="width: 38px;">Jarak (m)</th>
                    <th style="width: 38px;">Risk</th>
                    <th style="width: 44px;">AI Conf</th>
                </tr>
            </thead>
            <tbody>
                @forelse($logs as $index => $log)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $log->mahasiswa->nama ?? '-' }}</td>
                    <td style="text-align: center; font-size: 7.5px;">{{ $log->mahasiswa->nim ?? '-' }}</td>
                    <td style="font-size: 7.5px;">{{ $log->session?->course?->nama ?? '-' }}</td>
                    <td style="text-align: center;">{{ $log->session?->meeting_number ?? '-' }}</td>
                    <td style="text-align: center; font-size: 7.5px;">{{ \Carbon\Carbon::parse($log->scanned_at)->format('d/m H:i') }}</td>
                    <td style="text-align: center;">
                        @php
                            $s = strtolower($log->status);
                            $cls = 'status-present';
                            if(in_array($s, ['late','terlambat'])) $cls = 'status-late';
                            elseif(in_array($s, ['rejected','ditolak','absent','alpha'])) $cls = 'status-rejected';
                            elseif(in_array($s, ['excused','izin','sakit'])) $cls = 'status-excused';
                        @endphp
                        <span class="{{ $cls }}">{{ strtoupper($s) }}</span>
                    </td>
                    <td style="text-align: center;">{{ $log->distance_m ?? '-' }}</td>
                    <td style="text-align: center;">
                        @php
                            $rs = $log->risk_score ?? 0;
                            $riskCls = 'risk-low';
                            if($rs >= 70) $riskCls = 'risk-high';
                            elseif($rs >= 30) $riskCls = 'risk-medium';
                        @endphp
                        <span class="{{ $riskCls }}">{{ $rs }}</span>
                    </td>
                    <td style="text-align: center; font-size: 7px;">{{ $log->ai_confidence ? $log->ai_confidence . '%' : '-' }}</td>
                </tr>
                @empty
                <tr><td colspan="10" style="text-align: center; padding: 16px;">Tidak ada data log aktivitas.</td></tr>
                @endforelse
            </tbody>
        </table>

        {{-- ════ RISK ANALYSIS SECTION ════ --}}
        @if($riskHigh > 0 || $suspicious > 0)
        <div class="section-title" style="color: #c53030; border-color: #e53e3e;">Analisis Risiko & Anomali</div>

        @foreach($logs->filter(fn($l) => ($l->risk_score ?? 0) >= 70 || $l->is_suspicious)->take(5) as $riskLog)
        <div class="risk-alert">
            <div class="title">⚠️ {{ $riskLog->mahasiswa->nama ?? 'Unknown' }} ({{ $riskLog->mahasiswa->nim ?? '-' }})</div>
            <div class="desc">
                Status: {{ strtoupper($riskLog->status) }}
                | Risk Score: {{ $riskLog->risk_score ?? 0 }}
                | Jarak: {{ $riskLog->distance_m ?? '-' }}m
                | AI Conf: {{ $riskLog->ai_confidence ?? '-' }}%
                @if($riskLog->spoofing_detected) | 🎭 Spoofing Detected @endif
                @if($riskLog->is_suspicious) | ⚠️ Suspicious @endif
            </div>
        </div>
        @endforeach
        @endif

        {{-- ════ SIGNATURE ════ --}}
        <div class="signature-section">
            <div class="signature-box">
                <p>Tangerang Selatan, {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y') }}</p>
                <p style="margin-top: 4px;">Administrator Sistem,</p>
                <div class="signature-space"></div>
                <p class="signature-name">_______________________</p>
                <p style="font-size: 7.5px; margin-top: 2px;">NIDN: .......................</p>
            </div>
        </div>

        {{-- ════ FOOTER ════ --}}
        <div class="footer">
            <p class="confidential">DOKUMEN RAHASIA — HANYA UNTUK PENGGUNAAN INTERNAL</p>
            <p>Sistem Presensi Cerdas Berbasis AI — TPLK004 © {{ now()->year }} Universitas Pamulang</p>
            <p>Dicetak otomatis pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB — Report ID: LM-{{ now()->format('YmdHis') }}</p>
        </div>
    </div>
</body>
</html>
