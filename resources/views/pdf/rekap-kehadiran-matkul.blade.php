<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Kehadiran - {{ $course->nama }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 2cm 1.5cm 2cm 1.5cm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 11px; 
            line-height: 1.5; 
            color: #000; 
        }
        .container { 
            width: 100%;
            max-width: 100%;
        }
        
        /* Header Kop Surat */
        .header { 
            display: table; 
            width: 100%; 
            border-bottom: 3px double #000; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .header-logo { 
            display: table-cell; 
            width: 70px; 
            vertical-align: middle; 
        }
        .header-logo img { 
            width: 60px; 
            height: auto; 
        }
        .header-text { 
            display: table-cell; 
            vertical-align: middle; 
            text-align: center; 
            padding: 0 15px; 
        }
        .header-logo-right { 
            display: table-cell; 
            width: 70px; 
            vertical-align: middle; 
            text-align: right; 
        }
        .header-logo-right img { 
            width: 60px; 
            height: auto; 
        }
        .university-name { 
            font-size: 16px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 1px;
        }
        .faculty-name { 
            font-size: 14px; 
            font-weight: bold; 
            text-transform: uppercase; 
        }
        .department-name {
            font-size: 13px; 
            font-weight: bold;
        }
        .address { 
            font-size: 10px; 
            margin-top: 5px; 
            line-height: 1.4;
        }
        
        /* Judul Dokumen */
        .title { 
            text-align: center; 
            margin: 25px 0 20px 0; 
        }
        .title h1 { 
            font-size: 14px; 
            font-weight: bold; 
            text-transform: uppercase; 
            text-decoration: underline; 
            letter-spacing: 1px;
        }
        .subtitle { 
            font-size: 11px; 
            margin-top: 8px; 
        }
        
        /* Info Box */
        .info-box { 
            border: 1px solid #000; 
            padding: 12px 15px; 
            margin: 15px 0; 
        }
        .info-row { 
            display: table; 
            width: 100%; 
            margin-bottom: 6px; 
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label { 
            display: table-cell; 
            width: 130px; 
        }
        .info-value { 
            display: table-cell; 
        }
        
        /* Stats Grid */
        .stats-grid { 
            display: table; 
            width: 100%; 
            margin: 15px 0; 
            border-collapse: collapse;
        }
        .stat-box { 
            display: table-cell; 
            width: 16.66%; 
            padding: 10px 5px; 
            text-align: center; 
            border: 1px solid #000; 
        }
        .stat-value { 
            font-size: 18px; 
            font-weight: bold; 
        }
        .stat-label { 
            font-size: 9px; 
            margin-top: 3px; 
        }
        
        /* Section Title */
        .section-title { 
            font-size: 12px; 
            font-weight: bold; 
            margin: 20px 0 10px 0; 
            border-bottom: 2px solid #000; 
            padding-bottom: 5px; 
        }
        
        /* Data Table */
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 12px 0; 
            font-size: 9px; 
        }
        .data-table th, .data-table td { 
            border: 1px solid #000; 
            padding: 5px 4px; 
        }
        .data-table th { 
            background-color: #e5e5e5; 
            font-weight: bold; 
            text-align: center; 
        }
        .data-table tbody tr:nth-child(even) { 
            background-color: #f9f9f9; 
        }
        
        /* Status Cells */
        .status-h { 
            background-color: #d4edda; 
            font-weight: bold; 
            text-align: center; 
        }
        .status-t { 
            background-color: #fff3cd; 
            font-weight: bold; 
            text-align: center; 
        }
        .status-a { 
            background-color: #f8d7da; 
            font-weight: bold; 
            text-align: center; 
        }
        .status-i { 
            background-color: #cce5ff; 
            font-weight: bold; 
            text-align: center; 
        }
        
        .summary-row { 
            background-color: #d5d5d5 !important; 
            font-weight: bold; 
        }
        
        /* Legend */
        .legend { 
            margin: 12px 0; 
            font-size: 10px; 
        }
        .legend-item { 
            display: inline-block; 
            margin-right: 20px; 
        }
        .legend-box { 
            display: inline-block; 
            width: 14px; 
            height: 14px; 
            vertical-align: middle; 
            margin-right: 4px; 
            border: 1px solid #000; 
        }
        
        /* Signature Section */
        .signature-section { 
            margin-top: 40px; 
        }
        .signature-row { 
            display: table; 
            width: 100%; 
        }
        .signature-box { 
            display: table-cell; 
            width: 50%; 
            text-align: center; 
            padding: 10px 20px; 
            vertical-align: top;
        }
        .signature-space { 
            height: 70px; 
        }
        .signature-name { 
            font-weight: bold; 
            text-decoration: underline; 
        }
        .signature-nip {
            font-size: 10px;
        }
        
        /* Footer */
        .footer { 
            margin-top: 30px; 
            padding-top: 10px; 
            border-top: 1px solid #ccc; 
            text-align: center; 
            font-size: 9px; 
            color: #666; 
        }
        
        .page-break { 
            page-break-after: always; 
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
                    Telp: (021) 7412566 | Fax: (021) 7412491 | Email: fikom@unpam.ac.id
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
            <h1>Daftar Hadir Perkuliahan</h1>
            <div class="subtitle">
                Semester {{ $semester ?? 'Ganjil' }} Tahun Akademik {{ date('Y') }}/{{ date('Y') + 1 }}
            </div>
        </div>

        <!-- Informasi Mata Kuliah -->
        <div class="info-box">
            <div class="info-row">
                <div class="info-label">Mata Kuliah</div>
                <div class="info-value">: {{ $course->nama }} ({{ $course->kode ?? '-' }})</div>
            </div>
            <div class="info-row">
                <div class="info-label">SKS</div>
                <div class="info-value">: {{ $course->sks ?? '-' }} SKS</div>
            </div>
            <div class="info-row">
                <div class="info-label">Dosen Pengampu</div>
                <div class="info-value">: {{ $course->dosen?->nama ?? '-' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Kelas</div>
                <div class="info-value">: {{ $course->kelas ?? '06TPLK004' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Periode</div>
                <div class="info-value">: {{ \Carbon\Carbon::parse($dateFrom)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($dateTo)->translatedFormat('d F Y') }}</div>
            </div>
        </div>

        <!-- Statistik Ringkasan -->
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total_sessions'] }}</div>
                <div class="stat-label">Total Pertemuan</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total_students'] }}</div>
                <div class="stat-label">Jumlah Mahasiswa</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['present'] }}</div>
                <div class="stat-label">Total Hadir</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['late'] }}</div>
                <div class="stat-label">Total Terlambat</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['absent'] }}</div>
                <div class="stat-label">Total Tidak Hadir</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['attendance_rate'] }}%</div>
                <div class="stat-label">Tingkat Kehadiran</div>
            </div>
        </div>

        <!-- Keterangan Status -->
        <div class="legend">
            <strong>Keterangan:</strong>
            <span class="legend-item"><span class="legend-box" style="background: #d4edda;"></span> H = Hadir</span>
            <span class="legend-item"><span class="legend-box" style="background: #fff3cd;"></span> T = Terlambat</span>
            <span class="legend-item"><span class="legend-box" style="background: #f8d7da;"></span> A = Tidak Hadir</span>
            <span class="legend-item"><span class="legend-box" style="background: #cce5ff;"></span> I = Izin/Sakit</span>
        </div>

        <!-- Tabel Rekap Kehadiran -->
        <div class="section-title">Rekap Kehadiran Per Pertemuan</div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th style="width: 80px;">NIM</th>
                    <th style="min-width: 130px;">Nama Mahasiswa</th>
                    @foreach($sessions as $session)
                    <th style="width: 28px; font-size: 8px;">
                        P{{ $session->meeting_number }}<br>
                        <span style="font-weight: normal; font-size: 7px;">{{ $session->start_at?->format('d/m') }}</span>
                    </th>
                    @endforeach
                    <th style="width: 28px;">H</th>
                    <th style="width: 28px;">T</th>
                    <th style="width: 28px;">A</th>
                    <th style="width: 38px;">%</th>
                </tr>
            </thead>
            <tbody>
                @forelse($students as $index => $student)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $student['nim'] }}</td>
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
                    <td class="text-center font-bold">{{ $student['present_count'] }}</td>
                    <td class="text-center font-bold">{{ $student['late_count'] }}</td>
                    <td class="text-center font-bold">{{ $student['absent_count'] }}</td>
                    <td class="text-center font-bold">{{ $student['rate'] }}%</td>
                </tr>
                @empty
                <tr>
                    <td colspan="{{ 7 + count($sessions) }}" class="text-center" style="padding: 20px;">
                        Tidak ada data mahasiswa
                    </td>
                </tr>
                @endforelse
                
                @if(count($students) > 0)
                <tr class="summary-row">
                    <td colspan="3" class="text-center">TOTAL</td>
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

        <!-- Detail Pertemuan -->
        <div class="section-title">Detail Pertemuan</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 40px;">Pert.</th>
                    <th style="width: 100px;">Tanggal</th>
                    <th style="width: 80px;">Waktu</th>
                    <th>Materi/Topik</th>
                    <th style="width: 50px;">Hadir</th>
                    <th style="width: 60px;">Terlambat</th>
                    <th style="width: 60px;">Tidak Hadir</th>
                </tr>
            </thead>
            <tbody>
                @forelse($sessions as $session)
                @php
                    $sessionStats = $sessionSummary[$session->id] ?? ['present' => 0, 'late' => 0, 'absent' => 0];
                @endphp
                <tr>
                    <td class="text-center">{{ $session->meeting_number }}</td>
                    <td>{{ $session->start_at?->translatedFormat('d F Y') }}</td>
                    <td class="text-center">{{ $session->start_at?->format('H:i') }} - {{ $session->end_at?->format('H:i') ?? '-' }}</td>
                    <td>{{ $session->topic ?? 'Pertemuan ke-' . $session->meeting_number }}</td>
                    <td class="status-h">{{ $sessionStats['present'] }}</td>
                    <td class="status-t">{{ $sessionStats['late'] }}</td>
                    <td class="status-a">{{ $sessionStats['absent'] }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 15px;">Tidak ada data pertemuan</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Tanda Tangan -->
        <div class="signature-section">
            <div class="signature-row">
                <div class="signature-box">
                    <p>Mengetahui,</p>
                    <p>Ketua Program Studi</p>
                    <div class="signature-space"></div>
                    <p class="signature-name">_______________________</p>
                    <p class="signature-nip">NIDN. _______________</p>
                </div>
                <div class="signature-box">
                    <p>{{ $tempat }}, {{ $tanggal }}</p>
                    <p>Dosen Pengampu,</p>
                    <div class="signature-space"></div>
                    <p class="signature-name">{{ $course->dosen?->nama ?? '_______________________' }}</p>
                    <p class="signature-nip">NIDN. {{ $course->dosen?->nidn ?? '_______________' }}</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Presensi Berbasis AI - UNPAM</p>
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->translatedFormat('l, d F Y H:i:s') }} WIB</p>
        </div>
    </div>
</body>
</html>
