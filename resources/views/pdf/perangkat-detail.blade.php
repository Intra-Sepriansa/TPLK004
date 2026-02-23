<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Detail Perangkat - {{ $deviceInfo['model'] }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; line-height: 1.4; color: #1e293b; background-color: #f8fafc; }
        .page { padding: 30px; background: white; margin: 0 auto; max-width: 800px; }
        
        /* HEADER */
        .header { display: table; width: 100%; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
        .header-logo { display: table-cell; width: 65px; vertical-align: middle; }
        .header-logo img { width: 55px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 15px; }
        .header-logo-right { display: table-cell; width: 65px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 55px; height: auto; }
        .univ-name { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; }
        .fac-name { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 2px; }
        .address { font-size: 8px; color: #64748b; margin-top: 4px; }
        
        /* TITLE BANNER */
        .title-banner { background: #f1f5f9; border-radius: 8px; padding: 12px 15px; margin-bottom: 20px; text-align: center; border-left: 4px solid #6366f1; }
        .title-banner h1 { font-size: 14px; color: #1e293b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
        .title-banner p { font-size: 9px; color: #64748b; }
        
        /* DEVICE HERO */
        .hero { display: table; width: 100%; margin-bottom: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .hero-icon { display: table-cell; width: 60px; vertical-align: top; text-align: center; }
        .hero-icon img { width: 50px; height: auto; opacity: 0.9; }
        .hero-details { display: table-cell; vertical-align: top; padding-left: 15px; }
        .hero-model { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; margin-right: 5px; }
        .badge-active { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-suspicious { background: #fef08a; color: #854d0e; border: 1px solid #fde047; }
        .badge-blocked { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .badge-os { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .hero-meta { font-size: 10px; color: #475569; margin-top: 5px; }

        /* GRID LAYOUTS */
        .grid-2 { display: table; width: 100%; margin-bottom: 15px; table-layout: fixed; }
        .col-half { display: table-cell; width: 50%; padding-right: 7.5px; vertical-align: top; }
        .col-half:last-child { padding-right: 0; padding-left: 7.5px; }
        
        /* CARDS */
        .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 15px; background: #ffffff; }
        .card-header { font-size: 11px; font-weight: bold; color: #0f172a; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* DATA LIST */
        .data-list { width: 100%; border-collapse: collapse; }
        .data-list td { padding: 4px 0; font-size: 9px; vertical-align: top; border-bottom: 1px dashed #e2e8f0; }
        .data-list td:first-child { color: #64748b; width: 40%; }
        .data-list td:last-child { color: #1e293b; font-weight: 500; text-align: right; }
        
        /* STUDENT INFO */
        .student-box { display: table; width: 100%; }
        .student-photo { display: table-cell; width: 40px; vertical-align: top; }
        .student-photo img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
        .student-photo .placeholder { width: 40px; height: 40px; background: #e2e8f0; border-radius: 4px; text-align: center; line-height: 40px; color: #64748b; font-size: 14px; font-weight: bold; }
        .student-details { display: table-cell; padding-left: 10px; vertical-align: top; }
        .student-name { font-weight: bold; color: #0f172a; font-size: 11px; margin-bottom: 2px; }
        .student-nim { font-size: 9px; color: #64748b; }
        
        /* STATS HIGHLIGHT */
        .stat-highlight { display: table; width: 100%; margin-top: 5px; }
        .stat-item { display: table-cell; text-align: center; width: 33.33%; border-right: 1px solid #e2e8f0; }
        .stat-item:last-child { border-right: none; }
        .stat-val { font-size: 14px; font-weight: bold; color: #6366f1; }
        .stat-lbl { font-size: 7px; color: #64748b; text-transform: uppercase; }

        /* SECURITY & ANOMALY */
        .security-score { text-align: center; margin-bottom: 10px; }
        .score-circle { display: inline-block; width: 50px; height: 50px; border-radius: 25px; line-height: 50px; text-align: center; font-size: 16px; font-weight: bold; color: white; }
        .score-safe { background: #22c55e; }
        .score-warn { background: #eab308; }
        .score-danger { background: #ef4444; }
        
        .check-item { margin-bottom: 4px; font-size: 9px; }
        .check-pass { color: #16a34a; }
        .check-fail { color: #dc2626; }
        
        .anomaly-item { background: #fef2f2; border-left: 3px solid #ef4444; padding: 6px; margin-bottom: 5px; font-size: 9px; }
        .anomaly-title { font-weight: bold; color: #991b1b; }
        .anomaly-desc { color: #7f1d1d; margin-top: 2px; }

        /* TABLE */
        .log-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 8px; }
        .log-table th { background: #f8fafc; padding: 6px 4px; text-align: left; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; }
        .log-table td { padding: 5px 4px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        .log-table tbody tr:nth-child(even) { background: #fcfcfc; }
        
        /* FOOTER */
        .footer { margin-top: 30px; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; display: table; width: 100%; }
        .footer-left { display: table-cell; text-align: left; }
        .footer-right { display: table-cell; text-align: right; }
    </style>
</head>
<body>
    <div class="page">
        <!-- HEADER -->
        <div class="header">
            <div class="header-logo">
                @if(file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="header-text">
                <div class="univ-name">Universitas Pamulang</div>
                <div class="fac-name">Sistem Presensi Mahasiswa</div>
                <div class="address">
                    Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan, Banten 15417<br>
                    Telp: (021) 7412566 | Email: fikom@unpam.ac.id
                </div>
            </div>
            <div class="header-logo-right">
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <!-- TITLE -->
        <div class="title-banner">
            <h1>Laporan Analisis Mendalam Perangkat</h1>
            <p>ID Referensi: {{ substr($deviceInfo['id'], 0, 15) }}... | Diekspor pada: {{ $tanggal }}</p>
        </div>

        <!-- HERO INFO -->
        <div class="hero">
            <div class="hero-icon">
                @if(file_exists($iconPerangkat))
                    <img src="{{ $iconPerangkat }}" alt="Icon">
                @endif
            </div>
            <div class="hero-details">
                <div class="hero-model">{{ $deviceInfo['model'] }}</div>
                <div>
                    <span class="badge badge-os">{{ $deviceInfo['os'] }}</span>
                    @if($deviceInfo['status'] === 'active')
                        <span class="badge badge-active">AKTIF</span>
                    @elseif($deviceInfo['status'] === 'suspicious')
                        <span class="badge badge-suspicious">MENCURIGAKAN</span>
                    @else
                        <span class="badge badge-blocked">DIBLOKIR</span>
                    @endif
                </div>
                <div class="hero-meta">
                    Terakhir diakses: {{ $stats['lastAccess'] }} | Resolusi Layar: {{ $deviceInfo['resolution'] }}
                </div>
            </div>
        </div>

        <!-- GRID 1: Technical & Student -->
        <div class="grid-2">
            <!-- Col 1: Tech Specs -->
            <div class="col-half">
                <div class="card">
                    <div class="card-header">Spesifikasi Teknis</div>
                    <table class="data-list">
                        <tr><td>Sistem Operasi</td><td>{{ $deviceInfo['os'] }}</td></tr>
                        <tr><td>Browser</td><td>{{ $deviceInfo['browser'] }}</td></tr>
                        <tr><td>Arsitektur</td><td>{{ $deviceInfo['processor'] }}</td></tr>
                        <tr><td>Resolusi</td><td>{{ $deviceInfo['resolution'] }}</td></tr>
                        <tr><td colspan="2" style="border-bottom: none; padding-top: 8px;">
                            <div style="font-size: 7px; color: #94a3b8; word-break: break-all; text-align: left;">
                                User Agent: {{ $deviceInfo['userAgent'] }}
                            </div>
                        </td></tr>
                    </table>
                </div>
            </div>
            
            <!-- Col 2: Student Owner -->
            <div class="col-half">
                <div class="card">
                    <div class="card-header">Pengguna Terkait</div>
                    <div class="student-box">
                        <div class="student-photo">
                            @if($student['foto'] && file_exists($student['foto']))
                                <img src="{{ $student['foto'] }}" alt="Foto">
                            @else
                                <div class="placeholder">{{ substr($student['nama'], 0, 1) }}</div>
                            @endif
                        </div>
                        <div class="student-details">
                            <div class="student-name">{{ $student['nama'] }}</div>
                            <div class="student-nim">NIM: {{ $student['nim'] }} | {{ $student['prodi'] }}</div>
                        </div>
                    </div>
                    
                    <div class="stat-highlight" style="margin-top: 15px;">
                        <div class="stat-item">
                            <div class="stat-val">{{ $student['totalAbsen'] }}</div>
                            <div class="stat-lbl">Total Scan</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-val">{{ $student['kehadiran'] }}%</div>
                            <div class="stat-lbl">Kehadiran</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-val" style="color: #10b981;">Aman</div>
                            <div class="stat-lbl">Status</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- GRID 2: Security & Insights -->
        <div class="grid-2">
            <!-- Col 1: Security -->
            <div class="col-half">
                <div class="card">
                    <div class="card-header">Analisis Keamanan</div>
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; width: 60px; vertical-align: middle;">
                            <div class="security-score">
                                @php
                                    $scoreClass = $security['score'] >= 80 ? 'score-safe' : ($security['score'] >= 50 ? 'score-warn' : 'score-danger');
                                @endphp
                                <div class="score-circle {{ $scoreClass }}">{{ $security['score'] }}</div>
                            </div>
                        </div>
                        <div style="display: table-cell; vertical-align: middle; padding-left: 10px;">
                            @foreach($security['checks'] as $check)
                                <div class="check-item">
                                    <span class="{{ $check['passed'] ? 'check-pass' : 'check-fail' }}">
                                        {{ $check['passed'] ? '✓' : '✗' }}
                                    </span> 
                                    {{ $check['label'] }}
                                </div>
                            @endforeach
                        </div>
                    </div>
                    
                    @if(count($anomalies['list']) > 0)
                        <div style="margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
                            <div style="font-size: 8px; font-weight: bold; margin-bottom: 5px; color: #ef4444;">⚠ ANOMALI TERDETEKSI:</div>
                            @foreach($anomalies['list'] as $anomaly)
                                <div class="anomaly-item">
                                    <div class="anomaly-title">{{ $anomaly['type'] }}</div>
                                    <div class="anomaly-desc">{{ $anomaly['description'] }}</div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div style="margin-top: 10px; text-align: center; font-size: 9px; color: #10b981; background: #ecfdf5; padding: 5px; border-radius: 4px;">
                            ✓ Tidak ada aktivitas mencurigakan terdeteksi.
                        </div>
                    @endif
                </div>
            </div>
            
            <!-- Col 2: Usage Stats -->
            <div class="col-half">
                <div class="card">
                    <div class="card-header">Statistik Penggunaan (7 Hari)</div>
                    <table class="data-list">
                        <tr><td>Total Scan Mingguan</td><td>{{ $timeline['totalWeek'] }} kali</td></tr>
                        <tr><td>Rata-rata Harian</td><td>{{ $timeline['avgDaily'] }} scan/hari</td></tr>
                        <tr><td>Hari Teraktif</td><td>{{ $timeline['peakDay'] }}</td></tr>
                        <tr><td>Tren Penggunaan</td>
                            <td>
                                <div style="display: inline-block; width: 100%; height: 20px; text-align: right;">
                                    @php $maxVal = max(1, max($timeline['values']->toArray())); @endphp
                                    @foreach($timeline['values'] as $val)
                                        <div style="display: inline-block; width: 8px; background: #818cf8; margin-left: 2px; height: {{ ($val/$maxVal)*100 }}%; border-radius: 1px 1px 0 0;"></div>
                                    @endforeach
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- ACTIVITY LOG -->
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header">Riwayat Aktivitas Terbaru</div>
            <table class="log-table">
                <thead>
                    <tr>
                        <th width="15%">Tanggal</th>
                        <th width="12%">Waktu</th>
                        <th width="28%">Aktivitas</th>
                        <th width="30%">Lokasi & IP</th>
                        <th width="15%">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($activities as $act)
                        <tr>
                            <td>{{ $act['date'] }}</td>
                            <td>{{ $act['time'] }}</td>
                            <td>{{ $act['action'] }}</td>
                            <td>
                                <div>{{ Str::limit($act['location'], 25) }}</div>
                                <div style="font-size: 7px; color: #94a3b8;">IP: {{ $act['ip'] }}</div>
                            </td>
                            <td>
                                @if($act['status'] === 'success')
                                    <span style="color: #10b981; font-weight: bold;">BERHASIL</span>
                                @else
                                    <span style="color: #f59e0b; font-weight: bold;">PERINGATAN</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 10px;">Belum ada riwayat aktivitas.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <div class="footer-left">
                Dokumen ini dicetak otomatis oleh Sistem Presensi UNPAM<br>
                ID Dokumen: SEC-DEV-{{ strtoupper(substr(md5($deviceInfo['id'].time()), 0, 8)) }}
            </div>
            <div class="footer-right">
                Halaman 1 dari 1<br>
                Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB
            </div>
        </div>
    </div>
</body>
</html>
