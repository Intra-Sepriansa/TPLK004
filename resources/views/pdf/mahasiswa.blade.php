<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Mahasiswa</title>
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
        .title h1 { font-size: 13px; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
        .stats-grid { display: table; width: 100%; margin: 12px 0; }
        .stat-box { display: table-cell; width: 25%; padding: 6px 4px; text-align: center; border: 1px solid #ddd; }
        .stat-value { font-size: 14px; font-weight: bold; color: #1a365d; }
        .stat-label { font-size: 8px; color: #666; margin-top: 2px; }
        .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9px; }
        .data-table th, .data-table td { border: 1px solid #333; padding: 5px 3px; }
        .data-table th { background-color: #1a365d; color: white; font-weight: bold; text-align: center; }
        .data-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        .signature-section { margin-top: 25px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 160px; }
        .signature-space { height: 45px; }
        .signature-name { font-weight: bold; text-decoration: underline; }
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; text-align: center; font-size: 7px; color: #666; }
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
            <h1>Data Mahasiswa</h1>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total'] }}</div>
                <div class="stat-label">Total Mahasiswa</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['active_this_month'] }}</div>
                <div class="stat-label">Aktif Bulan Ini</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['avg_attendance'] }}</div>
                <div class="stat-label">Total Kehadiran</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ count($stats['by_fakultas']) }}</div>
                <div class="stat-label">Fakultas</div>
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th>Nama</th>
                    <th style="width: 80px;">NIM</th>
                    <th>Fakultas</th>
                    <th>Prodi</th>
                    <th style="width: 40px;">Kelas</th>
                    <th style="width: 35px;">Smt</th>
                </tr>
            </thead>
            <tbody>
                @forelse($mahasiswa as $index => $m)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $m->nama }}</td>
                    <td>{{ $m->nim }}</td>
                    <td>{{ $m->fakultas ?? '-' }}</td>
                    <td>{{ $m->prodi ?? '-' }}</td>
                    <td style="text-align: center;">{{ $m->kelas ?? '-' }}</td>
                    <td style="text-align: center;">{{ $m->semester ?? '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 15px;">Tidak ada data</td>
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
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</p>
        </div>
    </div>
</body>
</html>
