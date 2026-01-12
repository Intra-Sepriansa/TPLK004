<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Kehadiran Admin</title>
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
        .subtitle { font-size: 10px; margin-top: 5px; }
        .stats-grid { display: table; width: 100%; margin: 12px 0; }
        .stat-box { display: table-cell; width: 12.5%; padding: 6px 4px; text-align: center; border: 1px solid #ddd; }
        .stat-value { font-size: 14px; font-weight: bold; color: #1a365d; }
        .stat-label { font-size: 8px; color: #666; margin-top: 2px; }
        .section-title { font-size: 11px; font-weight: bold; margin: 12px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9px; }
        .data-table th, .data-table td { border: 1px solid #333; padding: 5px 3px; }
        .data-table th { background-color: #1a365d; color: white; font-weight: bold; text-align: center; }
        .data-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        .status-hadir { color: #065f46; font-weight: bold; }
        .status-terlambat { color: #92400e; font-weight: bold; }
        .status-ditolak { color: #991b1b; font-weight: bold; }
        .rate-high { background-color: #d1fae5; color: #065f46; }
        .rate-medium { background-color: #fef3c7; color: #92400e; }
        .rate-low { background-color: #fee2e2; color: #991b1b; }
        .two-column { display: table; width: 100%; }
        .column { display: table-cell; width: 50%; vertical-align: top; padding-right: 10px; }
        .column:last-child { padding-right: 0; padding-left: 10px; }
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
            <h1>Laporan Rekap Kehadiran Mahasiswa</h1>
            <div class="subtitle">
                Periode: {{ \Carbon\Carbon::parse($dateFrom)->format('d/m/Y') }} - {{ \Carbon\Carbon::parse($dateTo)->format('d/m/Y') }}
                @if($selectedCourse)
                    <br>Mata Kuliah: {{ $selectedCourse->nama }}
                @endif
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total'] }}</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #059669;">{{ $stats['present'] }}</div>
                <div class="stat-label">Hadir</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #d97706;">{{ $stats['late'] }}</div>
                <div class="stat-label">Terlambat</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #dc2626;">{{ $stats['rejected'] }}</div>
                <div class="stat-label">Ditolak</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total_sessions'] }}</div>
                <div class="stat-label">Sesi</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['unique_students'] }}</div>
                <div class="stat-label">Mahasiswa</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['avg_per_session'] }}</div>
                <div class="stat-label">Rata-rata</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #0891b2;">{{ $stats['attendance_rate'] }}%</div>
                <div class="stat-label">Rate</div>
            </div>
        </div>

        <div class="section-title">Ringkasan Per Mata Kuliah</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Mata Kuliah</th>
                    <th>Dosen</th>
                    <th>Sesi</th>
                    <th>Hadir</th>
                    <th>Terlambat</th>
                    <th>Rate</th>
                </tr>
            </thead>
            <tbody>
                @forelse($courseSummary as $course)
                <tr>
                    <td>{{ $course['nama'] }}</td>
                    <td>{{ $course['dosen'] }}</td>
                    <td style="text-align: center;">{{ $course['total_sessions'] }}</td>
                    <td style="text-align: center;" class="status-hadir">{{ $course['present'] }}</td>
                    <td style="text-align: center;" class="status-terlambat">{{ $course['late'] }}</td>
                    <td style="text-align: center;" class="@if($course['rate'] >= 80) rate-high @elseif($course['rate'] >= 60) rate-medium @else rate-low @endif">
                        {{ $course['rate'] }}%
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 15px;">Tidak ada data</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="section-title">Detail Kehadiran</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th style="width: 80px;">Waktu</th>
                    <th>Nama Mahasiswa</th>
                    <th style="width: 70px;">NIM</th>
                    <th>Mata Kuliah</th>
                    <th style="width: 50px;">Pert.</th>
                    <th style="width: 55px;">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($attendanceLogs as $index => $log)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $log->scanned_at?->format('d/m H:i') }}</td>
                    <td>{{ $log->mahasiswa?->nama ?? '-' }}</td>
                    <td>{{ $log->mahasiswa?->nim ?? '-' }}</td>
                    <td>{{ $log->session?->course?->nama ?? '-' }}</td>
                    <td style="text-align: center;">{{ $log->session?->meeting_number ?? '-' }}</td>
                    <td style="text-align: center;" class="@if($log->status == 'present') status-hadir @elseif($log->status == 'late') status-terlambat @else status-ditolak @endif">
                        @if($log->status == 'present') Hadir
                        @elseif($log->status == 'late') Terlambat
                        @else Ditolak
                        @endif
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 15px;">Tidak ada data kehadiran</td>
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
