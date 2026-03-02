<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Riwayat Kehadiran Mahasiswa</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #1e293b;
            background: #ffffff;
            line-height: 1.35;
        }
        .container {
            padding: 20px 40px;
        }

        /* ===== HEADER ===== */
        .header {
            display: table;
            width: 100%;
            border-bottom: 3px solid #be123c;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header-logo {
            display: table-cell;
            width: 50px;
            vertical-align: middle;
        }
        .header-logo img { width: 50px; height: 50px; }
        .header-text {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 0 8px;
        }
        .header-text h1 {
            font-size: 15px;
            font-weight: bold;
            color: #be123c;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 2px;
        }
        .header-text p {
            font-size: 9px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header-logo-right {
            display: table-cell;
            width: 50px;
            vertical-align: middle;
            text-align: right;
        }
        .header-logo-right img { width: 50px; height: 50px; }

        /* ===== INFO SECTION ===== */
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }
        .info-section td { vertical-align: top; }

        .student-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
        }
        .sc-label {
            font-size: 7px;
            font-weight: bold;
            color: #be123c;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 4px;
        }
        .sc-name {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 1px;
        }
        .sc-nim {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 6px;
        }
        .sc-meta {
            width: 100%;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
        .sc-meta td { font-size: 8px; padding: 0; }
        .meta-label {
            display: block;
            color: #94a3b8;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 6.5px;
            margin-bottom: 1px;
        }
        .meta-val {
            font-weight: bold;
            color: #334155;
            font-size: 8.5px;
        }

        /* Stats */
        .stats-col { padding-left: 8px; }
        .stats-row { width: 100%; margin-bottom: 5px; }
        .stats-row td { padding: 0; }
        .stat-box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 4px;
            text-align: center;
            background: #fff;
        }
        .stat-icon {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            margin: 0 auto 3px;
            text-align: center;
            line-height: 22px;
            font-size: 11px;
            font-weight: bold;
        }
        .ic-green { background: #d1fae5; color: #059669; }
        .ic-amber { background: #fef3c7; color: #d97706; }
        .ic-red { background: #fee2e2; color: #dc2626; }
        .stat-num {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
            line-height: 1;
        }
        .stat-lbl {
            font-size: 6.5px;
            font-weight: bold;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
        }

        .summary-bar {
            background: #4f46e5;
            border-radius: 6px;
            padding: 8px 10px;
            color: #fff;
        }
        .summary-bar td { vertical-align: middle; padding: 0; }
        .sb-label {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.85;
        }
        .sb-value {
            font-size: 16px;
            font-weight: bold;
        }

        /* ===== TABLE ===== */
        .table-wrap {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        .table-bar {
            background: #f8fafc;
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .table-bar h3 {
            font-size: 8px;
            font-weight: bold;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 2px;
            display: inline;
        }
        .table-bar .pill {
            float: right;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 1px 8px;
            font-size: 7px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        table.dtable {
            width: 100%;
            border-collapse: collapse;
        }
        table.dtable thead th {
            background: #f8fafc;
            font-size: 7px;
            font-weight: bold;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
        }
        table.dtable tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            font-size: 9px;
        }
        table.dtable tbody tr:last-child td { border-bottom: none; }
        .td-no { color: #94a3b8; font-weight: bold; width: 20px; text-align: center; }
        .c-name { font-weight: bold; color: #0f172a; font-size: 9px; }
        .c-meet { font-size: 7px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1px; }
        .d-main { font-weight: bold; color: #334155; font-size: 9px; }
        .d-time { font-size: 7.5px; color: #94a3b8; margin-top: 1px; }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .b-hadir { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .b-late { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
        .b-absent { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .b-pending { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .empty-cell { text-align: center; color: #94a3b8; font-style: italic; padding: 20px 8px; }

        /* ===== FOOTER ===== */
        .footer {
            display: table;
            width: 100%;
            margin-top: 6px;
        }
        .footer td { vertical-align: top; }
        .val-title {
            font-size: 7px;
            font-weight: bold;
            color: #be123c;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }
        .val-text { font-size: 7px; color: #94a3b8; line-height: 1.4; }
        .sig-block { text-align: center; }
        .sig-title { font-size: 7.5px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .sig-role { font-size: 8px; color: #334155; font-weight: bold; margin-bottom: 30px; }
        .sig-line { border-top: 1px dashed #cbd5e1; width: 80%; margin: 0 auto 3px; }
        .sig-name { font-size: 8px; font-weight: bold; color: #0f172a; }
        .sig-ph { font-size: 7.5px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="container">

    {{-- HEADER --}}
    <div class="header">
        <div class="header-logo">
            @if(file_exists($logoUnpam))
                <img src="{{ $logoUnpam }}" alt="UNPAM">
            @endif
        </div>
        <div class="header-text">
            <h1>Laporan Kehadiran</h1>
            <p>Universitas Pamulang &bull; Yayasan Sasmita Jaya</p>
        </div>
        <div class="header-logo-right">
            @if(file_exists($logoSasmita))
                <img src="{{ $logoSasmita }}" alt="Sasmita">
            @endif
        </div>
    </div>

    {{-- INFO: Student Card + Stats --}}
    <table class="info-section" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 40%;">
                <div class="student-card">
                    <div class="sc-label">Informasi Mahasiswa</div>
                    <div class="sc-name">{{ $mahasiswa->nama }}</div>
                    <div class="sc-nim">NIM: {{ $mahasiswa->nim }}</div>
                    <table class="sc-meta" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <span class="meta-label">Tanggal Cetak</span>
                                <span class="meta-val">{{ now()->timezone('Asia/Jakarta')->format('d/m/Y') }}</span>
                            </td>
                            <td style="text-align: right;">
                                <span class="meta-label">Periode</span>
                                <span class="meta-val">{{ $periodStart }} - {{ $periodEnd }}</span>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td class="stats-col">
                <table class="stats-row" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="width: 33%; padding-right: 4px;">
                            <div class="stat-box">
                                <div class="stat-icon ic-green">&#10003;</div>
                                <div class="stat-num">{{ $stats['present'] }}</div>
                                <div class="stat-lbl">Hadir</div>
                            </div>
                        </td>
                        <td style="width: 33%; padding-right: 4px;">
                            <div class="stat-box">
                                <div class="stat-icon ic-amber">!</div>
                                <div class="stat-num">{{ $stats['late'] }}</div>
                                <div class="stat-lbl">Terlambat</div>
                            </div>
                        </td>
                        <td style="width: 34%;">
                            <div class="stat-box">
                                <div class="stat-icon ic-red">X</div>
                                <div class="stat-num">{{ $stats['absent'] }}</div>
                                <div class="stat-lbl">Tidak Hadir</div>
                            </div>
                        </td>
                    </tr>
                </table>
                <table class="summary-bar" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <div class="sb-label">Total Sesi</div>
                            <div class="sb-value">{{ $stats['total'] }} Sesi</div>
                        </td>
                        <td style="text-align: right;">
                            <div class="sb-label">Longest Streak</div>
                            <div class="sb-value">{{ $stats['longestStreak'] }} Hari</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- TABLE --}}
    <div class="table-wrap">
        <div class="table-bar">
            <h3>Detail Riwayat Terakhir</h3>
            <span class="pill">{{ count($records) }} Data</span>
        </div>
        <table class="dtable" cellpadding="0" cellspacing="0">
            <thead>
                <tr>
                    <th style="width: 20px;">No</th>
                    <th>Mata Kuliah</th>
                    <th style="width: 100px;">Tanggal / Waktu</th>
                    <th style="width: 70px; text-align: center;">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $index => $record)
                <tr>
                    <td class="td-no">{{ $index + 1 }}</td>
                    <td>
                        <div class="c-name">{{ Str::limit($record['course'], 40) }}</div>
                        <div class="c-meet">Pertemuan #{{ $record['meetingNumber'] }}</div>
                    </td>
                    <td>
                        <div class="d-main">{{ \Carbon\Carbon::parse($record['date'])->format('d M Y') }}</div>
                        <div class="d-time">Jam {{ $record['checkInTime'] ?? '-' }}</div>
                    </td>
                    <td style="text-align: center;">
                        @php
                            $bc = match($record['status']) {
                                'present' => 'b-hadir',
                                'late' => 'b-late',
                                'absent', 'rejected' => 'b-absent',
                                default => 'b-pending',
                            };
                            $bt = match($record['status']) {
                                'present' => 'Hadir',
                                'late' => 'Terlambat',
                                'absent' => 'Tidak Hadir',
                                'rejected' => 'Ditolak',
                                'pending' => 'Pending',
                                default => ucfirst($record['status']),
                            };
                        @endphp
                        <span class="badge {{ $bc }}">{{ $bt }}</span>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="4" class="empty-cell">Belum ada data riwayat kehadiran.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- FOOTER --}}
    <table class="footer" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 45%; padding-right: 10px;">
                <div class="val-title">Validasi Dokumen</div>
                <div class="val-text">
                    Dokumen ini dicetak secara otomatis oleh Sistem Akademik
                    Universitas Pamulang pada {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i') }} WIB.
                    Keabsahan data dapat diverifikasi melalui portal resmi.
                </div>
            </td>
            <td>
                <table cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                        <td class="sig-block" style="width: 48%;">
                            <div class="sig-title">Mengetahui,</div>
                            <div class="sig-role">Petugas Akademik</div>
                            <div class="sig-line"></div>
                            <div class="sig-ph">(Nama Terang)</div>
                        </td>
                        <td style="width: 4%;"></td>
                        <td class="sig-block" style="width: 48%;">
                            <div class="sig-title">Tangerang Selatan,</div>
                            <div class="sig-role">Mahasiswa</div>
                            <div class="sig-line"></div>
                            <div class="sig-name">{{ $mahasiswa->nama }}</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</div>
</body>
</html>
