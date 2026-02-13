<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Jadwal Kuliah - {{ $mahasiswa->nama }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10px; line-height: 1.4; color: #333; }
        .container { padding: 15px 20px; }
        
        /* Header Section - Same as rekap-kehadiran-admin */
        .header { display: table; width: 100%; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 15px; }
        .header-logo { display: table-cell; width: 60px; vertical-align: middle; }
        .header-logo img { width: 50px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
        .header-logo-right { display: table-cell; width: 60px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 50px; height: auto; }
        .university-name { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #1a365d; }
        .faculty-name { font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .address { font-size: 8px; margin-top: 3px; }
        
        /* Title Section */
        .title { text-align: center; margin: 15px 0; }
        .title h1 { font-size: 13px; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
        .subtitle { font-size: 10px; margin-top: 5px; }
        
        /* Student Info Box */
        .student-info { 
            border: 1px solid #333; 
            padding: 10px; 
            margin: 12px 0; 
            background-color: #f8f9fa;
        }
        .student-info table { width: 100%; }
        .student-info td { padding: 3px 5px; font-size: 9px; }
        .student-info td:first-child { width: 120px; font-weight: bold; }
        
        /* Stats Grid - Same style as rekap */
        .stats-grid { display: table; width: 100%; margin: 12px 0; }
        .stat-box { display: table-cell; width: 25%; padding: 6px 4px; text-align: center; border: 1px solid #ddd; }
        .stat-value { font-size: 14px; font-weight: bold; color: #1a365d; }
        .stat-label { font-size: 8px; color: #666; margin-top: 2px; }
        
        /* Section Title */
        .section-title { 
            font-size: 11px; 
            font-weight: bold; 
            margin: 12px 0 8px; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 3px; 
        }
        
        /* Schedule Table */
        .schedule-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 9px; 
        }
        .schedule-table th, .schedule-table td { 
            border: 1px solid #333; 
            padding: 5px 3px; 
        }
        .schedule-table th { 
            background-color: #1a365d; 
            color: white; 
            font-weight: bold; 
            text-align: center; 
        }
        .schedule-table tbody tr:nth-child(even) { 
            background-color: #f8f9fa; 
        }
        .schedule-table td { 
            vertical-align: top; 
        }
        
        /* Day Header */
        .day-header { 
            background-color: #1a365d; 
            color: white; 
            padding: 6px 10px; 
            font-size: 10px; 
            font-weight: bold; 
            margin-top: 15px;
            margin-bottom: 8px;
        }
        
        .course-name { 
            font-weight: bold; 
            font-size: 9px; 
            margin-bottom: 2px; 
        }
        .course-code { 
            font-size: 8px; 
            color: #666; 
            font-style: italic; 
        }
        
        .time-info { 
            font-weight: bold; 
            color: #1a365d; 
        }
        .duration-info { 
            font-size: 8px; 
            color: #666; 
            margin-top: 2px; 
        }
        
        .no-schedule { 
            text-align: center; 
            padding: 15px; 
            color: #666; 
            font-style: italic; 
            background-color: #f8f9fa; 
        }
        
        /* Signature Section */
        .signature-section { 
            margin-top: 25px; 
            text-align: right; 
        }
        .signature-box { 
            display: inline-block; 
            text-align: center; 
            min-width: 160px; 
        }
        .signature-space { 
            height: 45px; 
        }
        .signature-name { 
            font-weight: bold; 
            text-decoration: underline; 
        }
        
        /* Footer */
        .footer { 
            margin-top: 20px; 
            padding-top: 8px; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            font-size: 7px; 
            color: #666; 
        }
        
        /* Page Break */
        .page-break { 
            page-break-after: always; 
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header - Same as rekap-kehadiran-admin -->
        <div class="header">
            <div class="header-logo">
                @php
                    $logoUnpam = public_path('images/logo-unpam.png');
                @endphp
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
                @php
                    $logoSasmita = public_path('images/logo-sasmita.png');
                @endphp
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <!-- Title -->
        <div class="title">
            <h1>Jadwal Kuliah Mingguan</h1>
            <div class="subtitle">
                Semester Aktif - Tahun Akademik {{ date('Y') }}/{{ date('Y') + 1 }}
            </div>
        </div>

        <!-- Student Info -->
        <div class="student-info">
            <table>
                <tr>
                    <td>Nama Mahasiswa</td>
                    <td>: {{ $mahasiswa->nama }}</td>
                    <td>Total Mata Kuliah</td>
                    <td>: {{ $stats['total_courses'] }} Mata Kuliah</td>
                </tr>
                <tr>
                    <td>NIM</td>
                    <td>: {{ $mahasiswa->nim }}</td>
                    <td>Total SKS</td>
                    <td>: {{ $stats['total_sks'] }} SKS</td>
                </tr>
                <tr>
                    <td>Program Studi</td>
                    <td>: Teknik Informatika</td>
                    <td>Hari Tersibuk</td>
                    <td>: {{ $stats['busiest_day'] }}</td>
                </tr>
            </table>
        </div>

        <!-- Statistics -->
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total_courses'] }}</div>
                <div class="stat-label">Total Mata Kuliah</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total_sks'] }}</div>
                <div class="stat-label">Total SKS</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $stats['total_classes_per_week'] }}</div>
                <div class="stat-label">Kelas Per Minggu</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="font-size: 12px;">{{ $stats['busiest_day'] }}</div>
                <div class="stat-label">Hari Tersibuk</div>
            </div>
        </div>

        <!-- Schedule by Day -->
        @foreach($daysOrder as $day)
            @php
                $daySchedule = $schedules[$day];
            @endphp
            
            <div class="day-header">
                {{ $day }} ({{ $daySchedule->count() }} Kelas)
            </div>

            @if($daySchedule->count() > 0)
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">No</th>
                            <th style="width: 25%;">Mata Kuliah</th>
                            <th style="width: 18%;">Waktu</th>
                            <th style="width: 15%;">Ruangan</th>
                            <th style="width: 20%;">Dosen</th>
                            <th style="width: 17%;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($daySchedule as $index => $schedule)
                            <tr>
                                <td style="text-align: center;">{{ $index + 1 }}</td>
                                <td>
                                    <div class="course-name">{{ $schedule['course_name'] }}</div>
                                    <div class="course-code">{{ $schedule['course_code'] }}</div>
                                </td>
                                <td>
                                    <div class="time-info">{{ $schedule['time_range'] }}</div>
                                    <div class="duration-info">{{ $schedule['duration'] }}</div>
                                </td>
                                <td style="text-align: center;">{{ $schedule['ruangan'] }}</td>
                                <td>{{ $schedule['dosen_name'] }}</td>
                                <td>
                                    <div style="font-size: 8px;">
                                        <strong>SKS:</strong> {{ $schedule['sks'] }}<br>
                                        <strong>Mode:</strong> {{ $schedule['mode'] }}
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="no-schedule">
                    Tidak ada jadwal kuliah pada hari {{ $day }}
                </div>
            @endif
        @endforeach

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <p>Tangerang Selatan, {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM YYYY') }}</p>
                <p style="margin-top: 5px;">Mahasiswa,</p>
                <div class="signature-space"></div>
                <p class="signature-name">{{ $mahasiswa->nama }}</p>
                <p style="font-size: 8px; margin-top: 2px;">NIM: {{ $mahasiswa->nim }}</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Informasi Akademik UNPAM</p>
            <p>Dicetak pada: {{ $generated_at }} WIB</p>
            <p style="margin-top: 3px; font-style: italic;">Jadwal dapat berubah sewaktu-waktu. Harap selalu cek sistem untuk informasi terbaru.</p>
        </div>
    </div>
</body>
</html>
