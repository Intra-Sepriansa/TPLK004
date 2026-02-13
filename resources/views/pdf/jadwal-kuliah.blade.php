<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jadwal Kuliah - {{ $mahasiswa->nama }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #1e293b;
            background: #ffffff;
        }

        .container {
            padding: 20px;
        }

        /* Header Section */
        .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -5%;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .header .subtitle {
            font-size: 14px;
            opacity: 0.95;
            margin-bottom: 15px;
        }

        .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
        }

        .header-info-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-info-item strong {
            font-weight: 600;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 25px;
        }

        .stat-card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
        }

        .stat-card .label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #0ea5e9;
        }

        .stat-card .subtext {
            font-size: 9px;
            color: #94a3b8;
            margin-top: 4px;
        }

        /* Schedule Section */
        .schedule-section {
            margin-bottom: 20px;
        }

        .day-header {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            padding: 12px 15px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .day-header .day-name {
            font-size: 15px;
        }

        .day-header .class-count {
            background: rgba(255, 255, 255, 0.25);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }

        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .schedule-table thead {
            background: #f1f5f9;
        }

        .schedule-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
        }

        .schedule-table td {
            padding: 14px 12px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }

        .schedule-table tbody tr:last-child td {
            border-bottom: none;
        }

        .schedule-table tbody tr:hover {
            background: #f8fafc;
        }

        .course-name {
            font-weight: 600;
            color: #0f172a;
            font-size: 12px;
            margin-bottom: 4px;
        }

        .course-code {
            font-size: 9px;
            color: #64748b;
            background: #f1f5f9;
            padding: 2px 8px;
            border-radius: 4px;
            display: inline-block;
            font-family: 'Courier New', monospace;
            font-weight: 600;
        }

        .time-badge {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 11px;
            display: inline-block;
            white-space: nowrap;
        }

        .duration-text {
            font-size: 9px;
            color: #64748b;
            margin-top: 4px;
        }

        .room-badge {
            background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 11px;
            display: inline-block;
        }

        .dosen-name {
            font-weight: 600;
            color: #0f172a;
            font-size: 11px;
            margin-bottom: 4px;
        }

        .info-badge {
            background: #f1f5f9;
            color: #475569;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            display: inline-block;
            margin-top: 4px;
            font-weight: 500;
        }

        .no-schedule {
            text-align: center;
            padding: 30px;
            color: #94a3b8;
            font-style: italic;
            background: #f8fafc;
            border-radius: 8px;
            border: 2px dashed #e2e8f0;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 9px;
        }

        .footer .generated-info {
            margin-bottom: 8px;
            font-weight: 600;
        }

        .footer .disclaimer {
            color: #94a3b8;
            font-style: italic;
        }

        /* Page Break */
        .page-break {
            page-break-after: always;
        }

        /* Color indicators */
        .color-indicator {
            width: 4px;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            border-radius: 4px 0 0 4px;
        }

        .schedule-table tbody tr {
            position: relative;
        }

        /* Legend */
        .legend {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .legend-title {
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 10px;
            font-size: 12px;
        }

        .legend-items {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 10px;
            color: #475569;
        }

        .legend-icon {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1>📅 JADWAL KULIAH MINGGUAN</h1>
                <div class="subtitle">Semester Aktif - Tahun Akademik {{ date('Y') }}/{{ date('Y') + 1 }}</div>
                <div class="header-info">
                    <div class="header-info-item">
                        <span>👤</span>
                        <div>
                            <strong>{{ $mahasiswa->nama }}</strong>
                            <div style="font-size: 11px; opacity: 0.9;">NIM: {{ $mahasiswa->nim }}</div>
                        </div>
                    </div>
                    <div class="header-info-item">
                        <span>📊</span>
                        <div>
                            <strong>{{ $stats['total_courses'] }} Mata Kuliah</strong>
                            <div style="font-size: 11px; opacity: 0.9;">Total {{ $stats['total_sks'] }} SKS</div>
                        </div>
                    </div>
                    <div class="header-info-item">
                        <span>📆</span>
                        <div>
                            <strong>{{ $stats['busiest_day'] }}</strong>
                            <div style="font-size: 11px; opacity: 0.9;">Hari Tersibuk</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Total Mata Kuliah</div>
                <div class="value">{{ $stats['total_courses'] }}</div>
                <div class="subtext">Semester Ini</div>
            </div>
            <div class="stat-card">
                <div class="label">Total SKS</div>
                <div class="value">{{ $stats['total_sks'] }}</div>
                <div class="subtext">Kredit Semester</div>
            </div>
            <div class="stat-card">
                <div class="label">Kelas Per Minggu</div>
                <div class="value">{{ $stats['total_classes_per_week'] }}</div>
                <div class="subtext">Pertemuan</div>
            </div>
            <div class="stat-card">
                <div class="label">Hari Tersibuk</div>
                <div class="value" style="font-size: 16px;">{{ $stats['busiest_day'] }}</div>
                <div class="subtext">Paling Banyak</div>
            </div>
        </div>

        <!-- Legend -->
        <div class="legend">
            <div class="legend-title">📖 Keterangan</div>
            <div class="legend-items">
                <div class="legend-item">
                    <div class="legend-icon" style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white;">⏰</div>
                    <span>Waktu Perkuliahan</span>
                </div>
                <div class="legend-item">
                    <div class="legend-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;">🏫</div>
                    <span>Ruangan/Mode</span>
                </div>
                <div class="legend-item">
                    <div class="legend-icon" style="background: #f1f5f9; color: #475569;">📚</div>
                    <span>Kode Mata Kuliah</span>
                </div>
                <div class="legend-item">
                    <div class="legend-icon" style="background: #f1f5f9; color: #475569;">ℹ️</div>
                    <span>Informasi Tambahan</span>
                </div>
            </div>
        </div>

        <!-- Schedule by Day -->
        @foreach($daysOrder as $day)
            @php
                $daySchedule = $schedules[$day];
            @endphp
            
            <div class="schedule-section">
                <div class="day-header">
                    <span class="day-name">{{ $day }}</span>
                    <span class="class-count">{{ $daySchedule->count() }} Kelas</span>
                </div>

                @if($daySchedule->count() > 0)
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th style="width: 25%;">Mata Kuliah</th>
                                <th style="width: 20%;">Waktu</th>
                                <th style="width: 15%;">Ruangan</th>
                                <th style="width: 20%;">Dosen</th>
                                <th style="width: 20%;">Informasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($daySchedule as $schedule)
                                <tr>
                                    <td>
                                        <div class="course-name">{{ $schedule['course_name'] }}</div>
                                        <span class="course-code">{{ $schedule['course_code'] }}</span>
                                    </td>
                                    <td>
                                        <div class="time-badge">{{ $schedule['time_range'] }}</div>
                                        <div class="duration-text">⏱️ {{ $schedule['duration'] }}</div>
                                    </td>
                                    <td>
                                        <div class="room-badge">{{ $schedule['ruangan'] }}</div>
                                    </td>
                                    <td>
                                        <div class="dosen-name">{{ $schedule['dosen_name'] }}</div>
                                    </td>
                                    <td>
                                        <div class="info-badge">📚 {{ $schedule['sks'] }} SKS</div>
                                        <div class="info-badge" style="margin-left: 4px;">{{ $schedule['mode'] }}</div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <div class="no-schedule">
                        <div style="font-size: 24px; margin-bottom: 8px;">📅</div>
                        <div>Tidak ada jadwal kuliah pada hari {{ $day }}</div>
                    </div>
                @endif
            </div>
        @endforeach

        <!-- Footer -->
        <div class="footer">
            <div class="generated-info">
                📄 Dokumen ini digenerate secara otomatis pada {{ $generated_at }}
            </div>
            <div class="disclaimer">
                Jadwal dapat berubah sewaktu-waktu. Harap selalu cek sistem untuk informasi terbaru.
            </div>
            <div style="margin-top: 10px; font-weight: 600; color: #0ea5e9;">
                Sistem Informasi Akademik - {{ config('app.name') }}
            </div>
        </div>
    </div>
</body>
</html>
