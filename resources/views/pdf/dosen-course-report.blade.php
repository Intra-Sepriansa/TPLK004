<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Kehadiran - {{ $course->nama }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 1cm 1cm 1cm 1cm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            font-size: 9px; 
            line-height: 1.2; 
            color: #333; 
        }
        .container { 
            width: 100%;
            max-width: 100%;
        }
        
        /* Header Kop Surat */
        .header { 
            display: table; 
            width: 100%; 
            border-bottom: 2px solid #1e3a8a; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
        }
        .header-logo { 
            display: table-cell; 
            width: 60px; 
            vertical-align: middle; 
        }
        .header-logo img { 
            width: 50px; 
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
            width: 60px; 
            vertical-align: middle; 
            text-align: right; 
        }
        .header-logo-right img { 
            width: 50px; 
            height: auto; 
        }
        .university-name { 
            font-size: 14px; 
            font-weight: bold; 
            color: #1e3a8a;
            text-transform: uppercase; 
            letter-spacing: 0.5px;
        }
        .faculty-name { 
            font-size: 12px; 
            font-weight: bold; 
            color: #333;
            text-transform: uppercase; 
        }
        .department-name {
            font-size: 11px; 
            font-weight: bold;
        }
        .address { 
            font-size: 8px; 
            color: #555;
            margin-top: 3px; 
        }
        
        /* Judul Dokumen */
        .title { 
            text-align: center; 
            margin: 10px 0 15px 0; 
        }
        .title h1 { 
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            color: #111;
            padding-bottom: 3px;
            border-bottom: 1px dashed #ccc;
            display: inline-block;
        }
        
        /* Info & Stats Grid - Compact 2 Columns */
        .top-grid {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .info-col, .stats-col {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }
        .info-box { 
            background: #f8fafc;
            border: 1px solid #cbd5e1; 
            padding: 8px; 
            border-radius: 4px;
            margin-right: 5px;
        }
        .info-row { 
            display: table; 
            width: 100%; 
            margin-bottom: 4px; 
        }
        .info-label { 
            display: table-cell; 
            width: 90px; 
            font-weight: bold;
            color: #475569;
        }
        .info-value { 
            display: table-cell; 
            font-weight: bold;
            color: #0f172a;
        }
        
        .stats-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 8px;
            border-radius: 4px;
            margin-left: 5px;
        }
        .stat-grid {
            display: table;
            width: 100%;
        }
        .stat-item {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            border-right: 1px dotted #93c5fd;
        }
        .stat-item:last-child {
            border-right: none;
        }
        .stat-val {
            font-size: 14px;
            font-weight: bold;
            color: #1d4ed8;
            margin-top: 2px;
        }
        .stat-lbl {
            font-size: 8px;
            color: #3b82f6;
            text-transform: uppercase;
        }

        /* Data Table */
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 8px; 
        }
        .data-table th, .data-table td { 
            border: 1px solid #ccc; 
            padding: 4px 3px; 
        }
        .data-table th { 
            background-color: #1e3a8a; 
            color: white;
            font-weight: bold; 
            text-align: center; 
        }
        .data-table tbody tr:nth-child(even) { 
            background-color: #f8fafc; 
        }
        
        /* Status Cells */
        .status-h { background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center; }
        .status-t { background-color: #fef08a; color: #854d0e; font-weight: bold; text-align: center; }
        .status-a { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; }
        .status-i { background-color: #dbeafe; color: #1e40af; font-weight: bold; text-align: center; }
        
        .summary-row { 
            background-color: #e2e8f0; 
            font-weight: bold; 
        }
        
        /* Legend */
        .legend { 
            margin: 5px 0 10px 0; 
            font-size: 8px; 
            text-align: left;
            background: #f1f5f9;
            padding: 5px;
            border-radius: 4px; border: 1px solid #e2e8f0;
        }
        .legend-item { 
            display: inline-block; 
            margin-right: 12px; 
        }
        .legend-box { 
            display: inline-block; 
            width: 10px; 
            height: 10px; 
            vertical-align: middle; 
            margin-right: 3px; 
            border: 1px solid #94a3b8; 
            border-radius: 2px;
        }
        
        /* Signature Section */
        .signature-section { 
            margin-top: 20px; 
        }
        .signature-row { 
            display: table; 
            width: 100%; 
        }
        .signature-box { 
            display: table-cell; 
            width: 50%; 
            text-align: center; 
            vertical-align: top;
        }
        .signature-space { 
            height: 40px; 
        }
        .signature-name { 
            font-weight: bold; 
            text-decoration: underline; 
            font-size: 10px;
        }
        .signature-nip {
            font-size: 8px;
            color: #64748b;
        }
        
        /* Footer */
        .footer { 
            position: fixed;
            bottom: -5px;
            left: 0;
            right: 0;
            border-top: 1px solid #e2e8f0; 
            text-align: center; 
            font-size: 7px; 
            color: #94a3b8; 
            padding-top: 3px;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Kop Surat -->
        <div class="header">
            <div class="header-logo">
                @if(file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="header-text">
                <div class="university-name">Universitas Pamulang</div>
                <div class="faculty-name">Fakultas Ilmu Komputer</div>
                <div class="department-name">Program Studi Teknik Informatika</div>
                <div class="address">
                    Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan, Banten 15417<br>
                    Telp: (021) 7412566 | Email: fikom@unpam.ac.id | Web: unpam.ac.id
                </div>
            </div>
            <div class="header-logo-right">
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <!-- Judul Dokumen -->
        <div class="title">
            <h1>Laporan Komprehensif Kehadiran Perkuliahan</h1>
        </div>

        <!-- Grid Info & Stats -->
        <div class="top-grid">
            <div class="info-col">
                <div class="info-box">
                    <div class="info-row">
                        <div class="info-label">Mata Kuliah</div>
                        <div class="info-value">: {{ $course->nama }} ({{ $course->kode ?? '-' }})</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">SKS / SMT</div>
                        <div class="info-value">: {{ $course->sks ?? '-' }} SKS / SMT {{ $semester ?? 'Ganjil' }} ({{ date('Y') }}/{{ date('Y') + 1 }})</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Dosen Pengampu</div>
                        <div class="info-value">: {{ $course->dosen?->nama ?? '-' }}</div>
                    </div>
                </div>
            </div>
            <div class="stats-col">
                <div class="stats-box">
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-lbl">Mhs / Sesi</div>
                            <div class="stat-val">{{ $stats['total_students'] }} / {{ $stats['total_sessions'] }}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-lbl">P / L / A</div>
                            <div class="stat-val">{{ $stats['present'] }} / {{ $stats['late'] }} / {{ $stats['absent'] }}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-lbl">Rate</div>
                            <div class="stat-val">{{ $stats['attendance_rate'] }}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="legend">
            <strong>Keterangan:</strong> 
            <span class="legend-item"><span class="legend-box" style="background: #dcfce7; border-color: #166534;"></span> H = Hadir</span>
            <span class="legend-item"><span class="legend-box" style="background: #fef08a; border-color: #854d0e;"></span> T = Terlambat</span>
            <span class="legend-item"><span class="legend-box" style="background: #fee2e2; border-color: #991b1b;"></span> A = Alpa/Tidak Hadir</span>
            <span class="legend-item"><span class="legend-box" style="background: #dbeafe; border-color: #1e40af;"></span> I = Izin/Sakit</span>
        </div>

        <!-- Tabel Rekap -->
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 20px;">No</th>
                    <th style="width: 60px;">NIM</th>
                    <th style="auto">Nama Mahasiswa</th>
                    @foreach($sessions as $session)
                    <th style="width: 14px; font-size: 6px;">
                        P{{ $session->meeting_number }}<br>
                        {{ $session->start_at?->format('d/m') }}
                    </th>
                    @endforeach
                    <th style="width: 18px;">H</th>
                    <th style="width: 18px;">T</th>
                    <th style="width: 18px;">A</th>
                    <th style="width: 25px;">%</th>
                </tr>
            </thead>
            <tbody>
                @forelse($students as $index => $student)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ $student['nim'] }}</td>
                    <td>{{ $student['nama'] }}</td>
                    @foreach($sessions as $session)
                        @php
                            $attendance = $student['attendances'][$session->id] ?? null;
                            $statusClass = 'status-a';
                            $statusText = 'A';
                            if ($attendance) {
                                if ($attendance->status === 'present') {
                                    $statusClass = 'status-h';
                                    $statusText = 'H';
                                } elseif ($attendance->status === 'late') {
                                    $statusClass = 'status-t';
                                    $statusText = 'T';
                                } elseif ($attendance->status === 'permit' || $attendance->status === 'sick') {
                                    $statusClass = 'status-i';
                                    $statusText = 'I';
                                }
                            }
                        @endphp
                        <td class="{{ $statusClass }}">{{ $statusText }}</td>
                    @endforeach
                    <td class="text-center font-bold" style="color: #166534; background: #f0fdf4;">{{ $student['present_count'] }}</td>
                    <td class="text-center font-bold" style="color: #854d0e; background: #fefce8;">{{ $student['late_count'] }}</td>
                    <td class="text-center font-bold" style="color: #991b1b; background: #fef2f2;">{{ $student['absent_count'] }}</td>
                    <td class="text-center font-bold" style="background: #f8fafc;">{{ $student['rate'] }}%</td>
                </tr>
                @empty
                <tr>
                    <td colspan="{{ 7 + count($sessions) }}" class="text-center" style="padding: 10px;">
                        Belum ada mahasiswa / data absensi.
                    </td>
                </tr>
                @endforelse
                
                @if(count($students) > 0)
                <tr class="summary-row">
                    <td colspan="3" class="text-center">TOTAL HADIR PER SESI</td>
                    @foreach($sessions as $session)
                        @php
                            $sessionPresent = collect($students)->sum(function($s) use ($session) {
                                $att = $s['attendances'][$session->id] ?? null;
                                return $att && in_array($att->status, ['present', 'late']) ? 1 : 0;
                            });
                        @endphp
                        <td class="text-center">{{ $sessionPresent }}</td>
                    @endforeach
                    <td class="text-center">{{ collect($students)->sum('present_count') }}</td>
                    <td class="text-center">{{ collect($students)->sum('late_count') }}</td>
                    <td class="text-center">{{ collect($students)->sum('absent_count') }}</td>
                    <td class="text-center">{{ $stats['attendance_rate'] }}%</td>
                </tr>
                @endif
            </tbody>
        </table>

        <!-- Tanda Tangan -->
        <div class="signature-section">
            <div class="signature-row">
                <div class="signature-box"></div>
                <div class="signature-box">
                    <p>{{ $tempat ?? 'Tangerang Selatan' }}, {{ $tanggal ?? now()->timezone('Asia/Jakarta')->translatedFormat('d F Y') }}</p>
                    <p>Dosen Pengampu,</p>
                    <div class="signature-space"></div>
                    <p class="signature-name">{{ $course->dosen?->nama ?? '_______________________' }}</p>
                    <p class="signature-nip">NIDN. {{ $course->dosen?->nidn ?? '_______________' }}</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            Dokumen ini dicetak otomatis oleh Sistem Presensi Berbasis AI - UNPAM pada {{ now()->timezone('Asia/Jakarta')->translatedFormat('l, d F Y H:i:s') }} WIB
        </div>
    </div>
</body>
</html>
