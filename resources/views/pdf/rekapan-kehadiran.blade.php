<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rekapan Kehadiran Mahasiswa</title>
    <style>
        @page {
            margin: 22px 26px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #111827;
            line-height: 1.42;
            background: #ffffff;
        }

        .document-shell {
            border: 1px solid #d1d5db;
            border-radius: 12px;
            overflow: hidden;
        }

        .hero {
            background: #1e3a8a;
            color: #ffffff;
            padding: 14px 16px 10px;
            border-bottom: 4px solid #ec4899;
        }

        .hero-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .hero-grid td {
            vertical-align: middle;
        }

        .hero-logo {
            width: 86px;
            text-align: center;
        }

        .hero-logo img {
            width: 64px;
            height: 64px;
            object-fit: contain;
            border-radius: 10px;
            background: #ffffff;
            padding: 4px;
        }

        .hero-title {
            text-align: center;
            padding: 0 10px;
        }

        .hero-title .org-1 {
            font-size: 14px;
            font-weight: 700;
            letter-spacing: .2px;
            text-transform: uppercase;
        }

        .hero-title .org-2 {
            font-size: 12px;
            margin-top: 2px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .hero-title .org-3 {
            font-size: 10px;
            margin-top: 2px;
            color: #dbeafe;
        }

        .hero-title .doc-name {
            margin-top: 8px;
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .6px;
            text-transform: uppercase;
            background: #ffffff;
            color: #1e3a8a;
        }

        .hero-subline {
            margin-top: 8px;
            font-size: 9px;
            color: #c7d2fe;
        }

        .content {
            padding: 12px 14px 16px;
        }

        .section-title {
            margin: 8px 0 6px;
            background: #eef2ff;
            color: #312e81;
            border: 1px solid #c7d2fe;
            border-radius: 8px;
            padding: 6px 10px;
            font-weight: 700;
            font-size: 10px;
            letter-spacing: .4px;
            text-transform: uppercase;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .meta-table td {
            border: 1px solid #dbe2f0;
            padding: 6px 8px;
            vertical-align: top;
        }

        .meta-label {
            width: 110px;
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 10px;
        }

        .meta-value {
            font-size: 11px;
            font-weight: 600;
            color: #0f172a;
        }

        .stats-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px;
            margin: 2px -6px 8px;
        }

        .stat-card {
            width: 25%;
            border-radius: 10px;
            border: 1px solid #dbe2f0;
            background: #ffffff;
            padding: 8px 7px;
            text-align: center;
        }

        .stat-label {
            color: #64748b;
            font-size: 9px;
            margin-bottom: 3px;
            text-transform: uppercase;
            letter-spacing: .3px;
        }

        .stat-value {
            color: #111827;
            font-size: 16px;
            font-weight: 700;
            line-height: 1.1;
        }

        .stat-value.small {
            font-size: 13px;
        }

        .table-wrap {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            overflow: hidden;
        }

        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }

        .attendance-table th,
        .attendance-table td {
            border: 1px solid #dbe2f0;
            padding: 6px 6px;
            vertical-align: middle;
        }

        .attendance-table th {
            background: #111827;
            color: #ffffff;
            font-weight: 700;
            font-size: 9px;
            letter-spacing: .3px;
            text-transform: uppercase;
            text-align: center;
        }

        .attendance-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .text-center {
            text-align: center;
        }

        .badge {
            display: inline-block;
            min-width: 70px;
            padding: 2px 8px;
            border-radius: 999px;
            text-align: center;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .3px;
            border: 1px solid transparent;
        }

        .badge-hadir {
            color: #065f46;
            background: #d1fae5;
            border-color: #6ee7b7;
        }

        .badge-terlambat {
            color: #92400e;
            background: #fef3c7;
            border-color: #fcd34d;
        }

        .badge-izin,
        .badge-sakit {
            color: #1d4ed8;
            background: #dbeafe;
            border-color: #93c5fd;
        }

        .badge-absen,
        .badge-ditolak {
            color: #991b1b;
            background: #fee2e2;
            border-color: #fca5a5;
        }

        .signature-box {
            margin-top: 20px;
            width: 260px;
            margin-left: auto;
            text-align: center;
            font-size: 10px;
        }

        .signature-space {
            height: 56px;
        }

        .signature-name {
            border-top: 1px solid #111827;
            padding-top: 4px;
            font-size: 11px;
            font-weight: 700;
        }

        .footer {
            margin-top: 14px;
            border-top: 1px dashed #94a3b8;
            padding-top: 6px;
            color: #64748b;
            font-size: 9px;
            text-align: center;
            line-height: 1.5;
        }

        .muted {
            color: #64748b;
            font-size: 9px;
        }
    </style>
</head>
<body>
    @php
        $totalMahasiswa = count($attendanceLogs);
        $hadir = collect($attendanceLogs)->where('status', 'Hadir')->count();
        $terlambat = collect($attendanceLogs)->where('status', 'Terlambat')->count();
        $izin = collect($attendanceLogs)->where('status', 'Izin')->count();
        $sakit = collect($attendanceLogs)->where('status', 'Sakit')->count();
        $absen = collect($attendanceLogs)->where('status', 'Absen')->count();
        $ditolak = collect($attendanceLogs)->where('status', 'Ditolak')->count();
        $kehadiranEfektif = $totalMahasiswa > 0
            ? round((($hadir + $terlambat + $izin + $sakit) / $totalMahasiswa) * 100, 1)
            : 0;

        $statusClass = static function (string $status): string {
            return match ($status) {
                'Hadir' => 'badge-hadir',
                'Terlambat' => 'badge-terlambat',
                'Izin', 'Sakit' => 'badge-izin',
                'Absen', 'Ditolak' => 'badge-absen',
                default => 'badge-absen',
            };
        };
    @endphp

    <div class="document-shell">
        <div class="hero">
            <table class="hero-grid">
                <tr>
                    <td class="hero-logo">
                        @if(!empty($logoUnpam) && file_exists($logoUnpam))
                            <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                        @endif
                    </td>
                    <td class="hero-title">
                        <div class="org-1">Universitas Pamulang</div>
                        <div class="org-2">Fakultas Ilmu Komputer - Teknik Informatika</div>
                        <div class="hero-subline">Jl. Surya Kencana No. 1 Pamulang, Tangerang Selatan | fikom@unpam.ac.id</div>
                        <div class="doc-name">Laporan Detail Kehadiran</div>
                    </td>
                    <td class="hero-logo">
                        @if(!empty($logoSasmita) && file_exists($logoSasmita))
                            <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <div class="content">
            <div class="section-title">Informasi Sesi</div>
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Mata Kuliah</td>
                    <td class="meta-value">{{ $course->nama ?? '-' }}</td>
                    <td class="meta-label">SKS</td>
                    <td class="meta-value">{{ $course->sks ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Pertemuan</td>
                    <td class="meta-value">Ke-{{ $session->meeting_number ?? '-' }} {{ !empty($session->title) ? ' - ' . $session->title : '' }}</td>
                    <td class="meta-label">Tanggal</td>
                    <td class="meta-value">{{ $tanggal }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Dosen</td>
                    <td class="meta-value">{{ $dosen->nama ?? '-' }}</td>
                    <td class="meta-label">Rentang Waktu</td>
                    <td class="meta-value">
                        {{ $session->start_at?->timezone('Asia/Jakarta')->format('H:i') ?? '-' }} - {{ $session->end_at?->timezone('Asia/Jakarta')->format('H:i') ?? '-' }} WIB
                    </td>
                </tr>
            </table>

            <div class="section-title">Ringkasan Statistik</div>
            <table class="stats-table">
                <tr>
                    <td class="stat-card">
                        <div class="stat-label">Total Mahasiswa</div>
                        <div class="stat-value">{{ $totalMahasiswa }}</div>
                    </td>
                    <td class="stat-card">
                        <div class="stat-label">Hadir</div>
                        <div class="stat-value">{{ $hadir }}</div>
                    </td>
                    <td class="stat-card">
                        <div class="stat-label">Terlambat</div>
                        <div class="stat-value">{{ $terlambat }}</div>
                    </td>
                    <td class="stat-card">
                        <div class="stat-label">Kehadiran Efektif</div>
                        <div class="stat-value small">{{ $kehadiranEfektif }}%</div>
                    </td>
                </tr>
                <tr>
                    <td class="stat-card">
                        <div class="stat-label">Izin</div>
                        <div class="stat-value">{{ $izin }}</div>
                    </td>
                    <td class="stat-card">
                        <div class="stat-label">Sakit</div>
                        <div class="stat-value">{{ $sakit }}</div>
                    </td>
                    <td class="stat-card">
                        <div class="stat-label">Absen</div>
                        <div class="stat-value">{{ $absen }}</div>
                    </td>
                    <td class="stat-card">
                        <div class="stat-label">Ditolak</div>
                        <div class="stat-value">{{ $ditolak }}</div>
                    </td>
                </tr>
            </table>

            <div class="section-title">Daftar Hadir Mahasiswa</div>
            <div class="table-wrap">
                <table class="attendance-table">
                    <thead>
                        <tr>
                            <th style="width: 32px;">No</th>
                            <th style="width: 110px;">NIM</th>
                            <th>Nama Mahasiswa</th>
                            <th style="width: 72px;">Kelas</th>
                            <th style="width: 72px;">Reguler</th>
                            <th style="width: 85px;">Status</th>
                            <th style="width: 78px;">Waktu Scan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($attendanceLogs as $log)
                            <tr>
                                <td class="text-center">{{ $log['no'] }}</td>
                                <td>{{ $log['nim'] }}</td>
                                <td>{{ $log['nama'] }}</td>
                                <td class="text-center">{{ $log['kelas'] }}</td>
                                <td class="text-center">{{ $log['jenis_reguler'] }}</td>
                                <td class="text-center">
                                    <span class="badge {{ $statusClass($log['status']) }}">{{ $log['status'] }}</span>
                                </td>
                                <td class="text-center">{{ $log['waktu'] }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center" style="padding: 16px;">Belum ada data kehadiran untuk sesi ini.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="signature-box">
                <p>{{ $tempat }}, {{ $tanggal }}</p>
                <p style="margin-top: 4px;">Dosen Pengampu</p>
                <div class="signature-space"></div>
                <p class="signature-name">{{ $dosen->nama ?? '-' }}</p>
                <p class="muted">NIDN: {{ $dosen->nidn ?? '-' }}</p>
            </div>

            <div class="footer">
                Sistem Presensi UNPAM - Dokumen ini dihasilkan otomatis oleh sistem.<br>
                Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB
            </div>
        </div>
    </div>
</body>
</html>
