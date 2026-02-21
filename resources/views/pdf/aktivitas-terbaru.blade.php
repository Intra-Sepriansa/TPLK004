<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Activity Log - Aktivitas Terbaru</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10px; line-height: 1.4; color: #333; }
        .container { padding: 15px 20px; }
        .header { display: table; width: 100%; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 15px; }
        .header-logo { display: table-cell; width: 60px; vertical-align: middle; }
        .header-logo img { width: 50px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
        .header-logo-right { display: table-cell; width: 60px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 50px; height: auto; }
        .university-name { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #1a365d; }
        .faculty-name { font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .address { font-size: 8px; margin-top: 3px; }
        .title { text-align: center; margin: 15px 0; }
        .title h1 { font-size: 14px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 5px; }
        .subtitle { font-size: 10px; margin-top: 5px; color: #555; }
        
        .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9px; }
        .data-table th, .data-table td { border: 1px solid #333; padding: 6px 4px; }
        .data-table th { background-color: #1a365d; color: white; font-weight: bold; text-align: center; }
        .data-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        
        .status-present { color: #059669; font-weight: bold; }
        .status-late { color: #d97706; font-weight: bold; }
        .status-rejected { color: #dc2626; font-weight: bold; }
        .status-excused { color: #2563eb; font-weight: bold; }
        
        .signature-section { margin-top: 35px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 180px; }
        .signature-space { height: 60px; }
        .signature-name { font-weight: bold; text-decoration: underline; }
        
        .footer { margin-top: 25px; padding-top: 8px; border-top: 1px solid #ddd; text-align: center; font-size: 8px; color: #666; }
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
                <div class="faculty-name">Fakultas Ilmu Komputer</div>
                <div style="font-size: 10px; font-weight: bold;">Jurusan Teknik Informatika</div>
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

        <div class="title">
            <h1>Laporan Aktivitas Presensi (Real-time)</h1>
            <div class="subtitle">
                Filter: {{ $filter_status == 'all' ? 'Semua Status' : ucfirst($filter_status) }} 
                | Sesi: {{ $filter_session == 'all' ? 'Semua Sesi' : 'Sesi Tertentu' }}
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 20px;">No</th>
                    <th>Mahasiswa</th>
                    <th>NIM</th>
                    <th>Mata Kuliah / Sesi</th>
                    <th style="width: 70px;">Waktu</th>
                    <th style="width: 50px;">Status</th>
                    <th style="width: 45px;">Jarak (m)</th>
                    <th>Lokasi (Geo)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($logs as $index => $log)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $log->mahasiswa->nama ?? '-' }}</td>
                    <td style="text-align: center;">{{ $log->mahasiswa->nim ?? '-' }}</td>
                    <td>{{ $log->session->course->nama ?? $log->session->judul ?? '-' }}</td>
                    <td style="text-align: center;">{{ \Carbon\Carbon::parse($log->scanned_at)->format('d/m/Y H:i:s') }}</td>
                    <td style="text-align: center;">
                        @php
                            $s = strtolower($log->status);
                            $class = 'status-present';
                            if(in_array($s, ['late', 'terlambat'])) $class = 'status-late';
                            elseif(in_array($s, ['rejected', 'ditolak', 'absent', 'alpha'])) $class = 'status-rejected';
                            elseif(in_array($s, ['excused', 'izin', 'sakit'])) $class = 'status-excused';
                        @endphp
                        <span class="{{ $class }}">{{ strtoupper($log->status) }}</span>
                    </td>
                    <td style="text-align: center;">{{ $log->location_distance ?? '-' }}</td>
                    <td style="font-size: 8px;">{{ \Illuminate\Support\Str::limit($log->location_address ?? 'Tidak diketahui', 45) }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px;">Tidak ada data log aktivitas.</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box">
                <p>Tangerang Selatan, {{ now()->timezone('Asia/Jakarta')->format('d F Y') }}</p>
                <p style="margin-top: 5px;">Administrator Sistem,</p>
                <div class="signature-space"></div>
                <p class="signature-name">_______________________</p>
                <p style="font-size: 8px; margin-top: 3px;">NIDN: .....................</p>
            </div>
        </div>

        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis (Sistem Presensi Administrator)</p>
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</p>
        </div>
    </div>
</body>
</html>
