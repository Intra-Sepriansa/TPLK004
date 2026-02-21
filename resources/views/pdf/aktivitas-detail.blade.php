<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Detail Aktivitas - {{ $log->mahasiswa->nim ?? '' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11px; line-height: 1.5; color: #111; padding: 0; }
        .container { padding: 30px 40px; }
        .header { display: table; width: 100%; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 25px; }
        .header-logo { display: table-cell; width: 80px; vertical-align: middle; }
        .header-logo img { width: 70px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
        .header-logo-right { display: table-cell; width: 80px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 70px; height: auto; }
        .university-name { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #1a365d; }
        .faculty-name { font-size: 14px; font-weight: bold; text-transform: uppercase; }
        .address { font-size: 10px; margin-top: 5px; }
        .title { text-align: center; margin: 25px 0 30px 0; }
        .title h1 { font-size: 18px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 5px; }
        .subtitle { font-size: 12px; color: #444; }
        
        .section-title { font-size: 13px; font-weight: bold; color: #1a365d; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin: 25px 0 15px 0; text-transform: uppercase; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table th, .info-table td { padding: 8px 10px; text-align: left; vertical-align: top; border-bottom: 1px dashed #eee; }
        .info-table th { width: 30%; font-weight: bold; color: #555; }
        
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 10px; color: white; }
        .status-present { background-color: #059669; }
        .status-late { background-color: #d97706; }
        .status-rejected { background-color: #dc2626; }
        .status-excused { background-color: #2563eb; }

        .image-container { text-align: center; margin: 15px 0; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 8px; }
        .selfie-image { max-width: 200px; max-height: 200px; border-radius: 4px; border: 1px solid #ccc; }
        
        .signature-section { margin-top: 50px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 200px; }
        .signature-space { height: 70px; }
        .signature-name { font-weight: bold; text-decoration: underline; font-size: 12px; }
        
        .footer { position: fixed; bottom: 20px; left: 40px; right: 40px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 9px; color: #666; }
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
                <div style="font-size: 12px; font-weight: bold;">Jurusan Teknik Informatika</div>
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
            <h1>Detail Log Aktivitas Presensi</h1>
            <div class="subtitle">
                ID Log: {{ $log->id }} | Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }}
            </div>
        </div>

        <div class="section-title">Informasi Mahasiswa</div>
        <table class="info-table">
            <tr>
                <th>Nama Lengkap</th>
                <td style="font-weight: bold; font-size: 13px;">{{ $log->mahasiswa->nama ?? 'Data Tidak Ditemukan' }}</td>
            </tr>
            <tr>
                <th>Nomor Induk Mahasiswa (NIM)</th>
                <td>{{ $log->mahasiswa->nim ?? '-' }}</td>
            </tr>
            <tr>
                <th>Program Studi</th>
                <td>{{ $log->mahasiswa->prodi ?? 'Manajemen Informatika' }}</td>
            </tr>
            <tr>
                <th>Mata Kuliah / Sesi</th>
                <td>{{ $log->session->course->nama ?? $log->session->judul ?? '-' }} - Pertemuan {{ $log->session->meeting_number ?? '-' }}</td>
            </tr>
        </table>

        <div class="section-title">Informasi Presensi</div>
        <table class="info-table">
            <tr>
                <th>Waktu Scan</th>
                <td>{{ \Carbon\Carbon::parse($log->scanned_at)->format('d F Y, H:i:s') }}</td>
            </tr>
            <tr>
                <th>Status Akhir</th>
                <td>
                    @php
                        $s = strtolower($log->status);
                        $class = 'status-present';
                        $statusText = strtoupper($log->status);
                        if(in_array($s, ['late', 'terlambat'])) {
                            $class = 'status-late';
                        } elseif(in_array($s, ['rejected', 'ditolak', 'absent', 'alpha'])) {
                            $class = 'status-rejected';
                        } elseif(in_array($s, ['excused', 'izin', 'sakit'])) {
                            $class = 'status-excused';
                        }
                    @endphp
                    <span class="status-badge {{ $class }}">{{ $statusText }}</span>
                </td>
            </tr>
            <tr>
                <th>Status Verifikasi Selfie</th>
                <td>{{ strtoupper($log->selfieVerification->status ?? 'TIDAK ADA') }}</td>
            </tr>
             <tr>
                <th>Jarak ke Pusat (Radius GPS)</th>
                <td>{{ $log->location_distance ?? 'Tidak diketahui' }} meter</td>
            </tr>
            <tr>
                <th>Alamat Lokasi Scan</th>
                <td>{{ $log->location_address ?? 'Detail lokasi tidak direkam pada perangkat pengguna' }}</td>
            </tr>
        </table>

        <div class="section-title">Informasi Teknis (Perangkat)</div>
        <table class="info-table">
            <tr>
                <th>Alamat IP (IP Address)</th>
                <td>{{ $log->ip_address ?? 'Tidak terekam' }}</td>
            </tr>
            <tr>
                <th>Sistem Operasi (OS)</th>
                <td>{{ $log->device_os ?? 'Tidak disetel' }}</td>
            </tr>
            <tr>
                <th>Browser Terdeteksi</th>
                <td>{{ $log->device_browser ?? 'Tidak disetel' }}</td>
            </tr>
             <tr>
                <th>Detail Informasi Perangkat</th>
                <td style="font-size: 9px; color: #666;">{{ $log->device_info ?? 'Detail User-Agent tidak ditemkan dalam basis data.' }}</td>
            </tr>
        </table>

        <div class="signature-section">
            <div class="signature-box">
                <p>Tangerang Selatan, {{ now()->timezone('Asia/Jakarta')->format('d F Y') }}</p>
                <p style="margin-top: 5px;">Administrator Sistem,</p>
                <div class="signature-space"></div>
                <p class="signature-name">_______________________</p>
                <p style="font-size: 10px; margin-top: 3px;">NIDN: .....................</p>
            </div>
        </div>

        <div class="footer">
            <p>Sistem Informasi Akademik dan Kehadiran Terpadu (Presensi UNPAM)</p>
            <p>Hash: {{ md5($log->id . $log->scanned_at) }}</p>
        </div>
    </div>
</body>
</html>
