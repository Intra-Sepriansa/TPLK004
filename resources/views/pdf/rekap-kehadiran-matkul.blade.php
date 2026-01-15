<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Kehadiran - {{ $course->nama }}</title>
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
        
        .info-box { background: #f8f9fa; border: 1px solid #ddd; padding: 10px; margin: 12px 0; border-radius: 4px; }
        .info-row { display: table; width: 100%; margin-bottom: 5px; }
        .info-label { display: table-cell; width: 120px; font-weight: bold; }
        .info-value { display: table-cell; }
        
        .stats-grid { display: table; width: 100%; margin: 12px 0; }
        .stat-box { display: table-cell; width: 16.66%; padding: 8px 4px; text-align: center; border: 1px solid #ddd; background: #fff; }
        .stat-value { font-size: 16px; font-weight: bold; color: #1a365d; }
        .stat-label { font-size: 8px; color: #666; margin-top: 2px; }
        
        .section-title { font-size: 11px; font-weight: bold; margin: 15px 0 8px; border-bottom: 2px solid #1a365d; padding-bottom: 3px; color: #1a365d; }
        
        .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8px; }
        .data-table th, .data-table td { border: 1px solid #333; padding: 4px 3px; }
        .data-table th { background-color: #1a365d; color: white; font-weight: bold; text-align: center; }
        .data-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        .data-table .rotate { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); height: 60px; }
        
        .status-h { background-color: #d1fae5; color: #065f46; font-weight: bold; text-align: center; }
        .status-t { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
        .status-a { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; }
        .status-i { background-color: #dbeafe; color: #1e40af; font-weight: bold; text-align: center; }
        
        .summary-row { background-color: #e5e7eb !important; font-weight: bold; }
        
        .legend { margin: 10px 0; font-size: 8px; }
        .legend-item { display: inline-block; margin-right: 15px; }
        .legend-box { display: inline-block; width: 12px; height: 12px; vertical-align: middle; margin-right: 3px; border: 1px solid #333; }
        
        .signature-section { margin-top: 30px; }
        .signature-row { display: table; width: 100%; }
        .signature-box { display: table-cell; width: 50%; text-align: center; padding: 10px; }
        .signature-space { height: 50px; }
        .signature-name { font-weight: bold; text-decoration: underline; }
        
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; text-align: center; font-size: 7px; color: #666; }
        
        .page-break { page-break-after: always; }
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
            <h1>Daftar Hadir Perkuliahan</h1>
            <div class="subtitle">
                Periode: {{ \Carbon\Carbon::parse($dateFrom)->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($dateTo)->translatedFormat('d F Y') }}
            </div>
        </div>

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
                <div class="info-label">Semester</div>
                <div class="info-value">: {{ $semester ?? 'Ganjil 2024/2025' }}</div>
            </div>
        </div>

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
                <div class="stat-value" style="color: #059669;">{{ $stats['present'] }}</div>
                <div class="stat-label">Total Hadir</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #d97706;">{{ $stats['late'] }}</div>
                <div class="stat-label">Total Terlambat</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #dc2626;">{{ $stats['absent'] }}</div>
                <div class="stat-label">Total Tidak Hadir</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: #0891b2;">{{ $stats['attendance_rate'] }}%</div>
                <div class="stat-label">Tingkat Kehadiran</div>
            </div>
        </div>

        <div class="section-title">Rekap Kehadiran Per Pertemuan</div>
        
        <div class="legend">
            <span class="legend-item"><span class="legend-box" style="background: #d1fae5;"></span> H = Hadir</span>
            <span class="legend-item"><span class="legend-box" style="background: #fef3c7;"></span> T = Terlambat</span>
            <span class="legend-item"><span class="legend-box" style="background: #fee2e2;"></span> A = Tidak Hadir</span>
            <span class="legend-item"><span class="legend-box" style="background: #dbeafe;"></span> I = Izin/Sakit</span>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th style="width: 70px;">NIM</th>
                    <th style="min-width: 120px;">Nama Mahasiswa</th>
                    @foreach($sessions as $session)
                    <th style="width: 25px; font-size: 7px;">
                        P{{ $session->meeting_number }}<br>
                        <span style="font-weight: normal; font-size: 6px;">{{ $session->start_at?->format('d/m') }}</span>
                    </th>
                    @endforeach
                    <th style="width: 25px;">H</th>
                    <th style="width: 25px;">T</th>
                    <th style="width: 25px;">A</th>
                    <th style="width: 35px;">%</th>
                </tr>
            </thead>
            <tbody>
                @forelse($students as $index => $student)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $student['nim'] }}</td>
                    <td>{{ $student['nama'] }}</td>
                    @foreach($sessions as $session)
                        @php
                            $attendance = $student['attendances'][$session->id] ?? null;
                            $statusClass = '';
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
                                } else {
                                    $statusClass = 'status-a';
                                    $statusText = 'A';
                                }
                            } else {
                                $statusClass = 'status-a';
                            }
                        @endphp
                        <td class="{{ $statusClass }}">{{ $statusText }}</td>
                    @endforeach
                    <td style="text-align: center; font-weight: bold; color: #059669;">{{ $student['present_count'] }}</td>
                    <td style="text-align: center; font-weight: bold; color: #d97706;">{{ $student['late_count'] }}</td>
                    <td style="text-align: center; font-weight: bold; color: #dc2626;">{{ $student['absent_count'] }}</td>
                    <td style="text-align: center; font-weight: bold; 
                        @if($student['rate'] >= 80) color: #059669; 
                        @elseif($student['rate'] >= 60) color: #d97706; 
                        @else color: #dc2626; 
                        @endif">
                        {{ $student['rate'] }}%
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="{{ 7 + count($sessions) }}" style="text-align: center; padding: 20px;">
                        Tidak ada data mahasiswa
                    </td>
                </tr>
                @endforelse
                
                @if(count($students) > 0)
                <tr class="summary-row">
                    <td colspan="3" style="text-align: center;">TOTAL</td>
                    @foreach($sessions as $session)
                        @php
                            $sessionPresent = collect($students)->sum(function($s) use ($session) {
                                $att = $s['attendances'][$session->id] ?? null;
                                return $att && in_array($att->status, ['present', 'late']) ? 1 : 0;
                            });
                        @endphp
                        <td style="text-align: center;">{{ $sessionPresent }}</td>
                    @endforeach
                    <td style="text-align: center;">{{ collect($students)->sum('present_count') }}</td>
                    <td style="text-align: center;">{{ collect($students)->sum('late_count') }}</td>
                    <td style="text-align: center;">{{ collect($students)->sum('absent_count') }}</td>
                    <td style="text-align: center;">{{ $stats['attendance_rate'] }}%</td>
                </tr>
                @endif
            </tbody>
        </table>

        <div class="section-title">Detail Pertemuan</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;">Pert.</th>
                    <th style="width: 80px;">Tanggal</th>
                    <th style="width: 60px;">Waktu</th>
                    <th>Materi/Topik</th>
                    <th style="width: 40px;">Hadir</th>
                    <th style="width: 50px;">Terlambat</th>
                    <th style="width: 50px;">Tidak Hadir</th>
                </tr>
            </thead>
            <tbody>
                @forelse($sessions as $session)
                @php
                    $sessionStats = $sessionSummary[$session->id] ?? ['present' => 0, 'late' => 0, 'absent' => 0];
                @endphp
                <tr>
                    <td style="text-align: center;">{{ $session->meeting_number }}</td>
                    <td>{{ $session->start_at?->translatedFormat('d M Y') }}</td>
                    <td>{{ $session->start_at?->format('H:i') }} - {{ $session->end_at?->format('H:i') ?? '-' }}</td>
                    <td>{{ $session->topic ?? 'Pertemuan ' . $session->meeting_number }}</td>
                    <td style="text-align: center;" class="status-h">{{ $sessionStats['present'] }}</td>
                    <td style="text-align: center;" class="status-t">{{ $sessionStats['late'] }}</td>
                    <td style="text-align: center;" class="status-a">{{ $sessionStats['absent'] }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 15px;">Tidak ada data pertemuan</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-row">
                <div class="signature-box">
                    <p>Mengetahui,</p>
                    <p>Ketua Program Studi</p>
                    <div class="signature-space"></div>
                    <p class="signature-name">_______________________</p>
                    <p>NIDN: _______________</p>
                </div>
                <div class="signature-box">
                    <p>{{ $tempat }}, {{ $tanggal }}</p>
                    <p>Dosen Pengampu,</p>
                    <div class="signature-space"></div>
                    <p class="signature-name">{{ $course->dosen?->nama ?? '_______________________' }}</p>
                    <p>NIDN: {{ $course->dosen?->nidn ?? '_______________' }}</p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Presensi UNPAM - TPLK004</p>
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</p>
        </div>
    </div>
</body>
</html>
