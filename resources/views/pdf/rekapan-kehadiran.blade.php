<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rekapan Kehadiran Mahasiswa</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
        }
        .container {
            padding: 20px 40px;
        }
        .header {
            display: table;
            width: 100%;
            border-bottom: 3px double #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-logo {
            display: table-cell;
            width: 80px;
            vertical-align: middle;
        }
        .header-logo img {
            width: 70px;
            height: auto;
        }
        .header-text {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 0 10px;
        }
        .header-logo-right {
            display: table-cell;
            width: 80px;
            vertical-align: middle;
            text-align: right;
        }
        .header-logo-right img {
            width: 70px;
            height: auto;
        }
        .university-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            color: #1a365d;
        }
        .faculty-name {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .address {
            font-size: 10px;
            margin-top: 5px;
        }
        .title {
            text-align: center;
            margin: 25px 0;
        }
        .title h1 {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-table {
            width: 100%;
        }
        .info-table td {
            padding: 3px 0;
            vertical-align: top;
        }
        .info-table td:first-child {
            width: 150px;
        }
        .info-table td:nth-child(2) {
            width: 10px;
        }
</style>
</head>
<body>
    <div class="container">
        <!-- Header with Logos -->
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

        <!-- Title -->
        <div class="title">
            <h1>Daftar Hadir Mahasiswa</h1>
        </div>

        <!-- Course Info -->
        <div class="info-section">
            <table class="info-table">
                <tr>
                    <td>Mata Kuliah</td>
                    <td>:</td>
                    <td><strong>{{ $course->nama ?? '-' }}</strong></td>
                </tr>
                <tr>
                    <td>SKS</td>
                    <td>:</td>
                    <td>{{ $course->sks ?? '-' }} SKS</td>
                </tr>
                <tr>
                    <td>Pertemuan Ke</td>
                    <td>:</td>
                    <td>{{ $session->meeting_number ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Tanggal</td>
                    <td>:</td>
                    <td>{{ $tanggal }}</td>
                </tr>
                <tr>
                    <td>Dosen Pengampu</td>
                    <td>:</td>
                    <td>{{ $dosen->nama ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- Attendance Table -->
        <table class="attendance-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th style="width: 100px;">NIM</th>
                    <th>Nama Mahasiswa</th>
                    <th style="width: 80px;">Kelas</th>
                    <th style="width: 70px;">Jenis</th>
                    <th style="width: 60px;">Status</th>
                    <th style="width: 60px;">Waktu</th>
                </tr>
            </thead>
            <tbody>
                @forelse($attendanceLogs as $log)
                <tr>
                    <td style="text-align: center;">{{ $log['no'] }}</td>
                    <td>{{ $log['nim'] }}</td>
                    <td>{{ $log['nama'] }}</td>
                    <td style="text-align: center;">{{ $log['kelas'] }}</td>
                    <td style="text-align: center;">{{ $log['jenis_reguler'] }}</td>
                    <td style="text-align: center;">
                        <span class="status-{{ strtolower(str_replace(' ', '-', $log['status'])) }}">
                            {{ $log['status'] }}
                        </span>
                    </td>
                    <td style="text-align: center;">{{ $log['waktu'] }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">Belum ada data kehadiran</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary">
            <table>
                <tr>
                    <td>Total Mahasiswa</td>
                    <td>:</td>
                    <td><strong>{{ count($attendanceLogs) }} orang</strong></td>
                </tr>
                <tr>
                    <td>Hadir</td>
                    <td>:</td>
                    <td>{{ collect($attendanceLogs)->where('status', 'Hadir')->count() }} orang</td>
                </tr>
                <tr>
                    <td>Terlambat</td>
                    <td>:</td>
                    <td>{{ collect($attendanceLogs)->where('status', 'Terlambat')->count() }} orang</td>
                </tr>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <p>{{ $tempat }}, {{ $tanggal }}</p>
                <p style="margin-top: 5px;">Dosen Pengampu,</p>
                <div class="signature-space"></div>
                <p class="signature-name">{{ $dosen->nama ?? '-' }}</p>
                <p style="font-size: 10px;">NIDN: {{ $dosen->nidn ?? '-' }}</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Presensi UNPAM</p>
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</p>
        </div>
    </div>

    <style>
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        .attendance-table th,
        .attendance-table td {
            border: 1px solid #333;
            padding: 8px 5px;
        }
        .attendance-table th {
            background-color: #1a365d;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        .attendance-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .status-hadir {
            color: #166534;
            font-weight: bold;
        }
        .status-terlambat {
            color: #ca8a04;
            font-weight: bold;
        }
        .status-tidak-hadir {
            color: #dc2626;
            font-weight: bold;
        }
        .summary {
            margin: 20px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
        }
        .summary table td {
            padding: 3px 10px 3px 0;
        }
        .signature-section {
            margin-top: 40px;
            text-align: right;
        }
        .signature-box {
            display: inline-block;
            text-align: center;
            min-width: 200px;
        }
        .signature-space {
            height: 60px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 9px;
            color: #666;
        }
    </style>
</body>
</html>
