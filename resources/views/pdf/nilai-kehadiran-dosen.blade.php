<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nilai Kehadiran - {{ $course->nama }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            font-size: 16px;
            margin-bottom: 5px;
            color: #1a1a1a;
        }
        .header h2 {
            font-size: 14px;
            margin-bottom: 3px;
            color: #333;
        }
        .header p {
            font-size: 9px;
            color: #666;
        }
        .info-section {
            margin-bottom: 15px;
            display: table;
            width: 100%;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            width: 120px;
            font-weight: bold;
            padding: 2px 0;
        }
        .info-value {
            display: table-cell;
            padding: 2px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #2c3e50;
            color: white;
            padding: 8px 5px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
            border: 1px solid #1a252f;
        }
        td {
            padding: 6px 5px;
            border: 1px solid #ddd;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f0f0f0;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .grade-a { color: #10b981; font-weight: bold; }
        .grade-b { color: #3b82f6; font-weight: bold; }
        .grade-c { color: #f59e0b; font-weight: bold; }
        .grade-d { color: #ef4444; font-weight: bold; }
        .grade-e { color: #991b1b; font-weight: bold; }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 8px;
            color: #666;
        }
        .signature {
            margin-top: 40px;
            text-align: right;
        }
        .signature-box {
            display: inline-block;
            text-align: center;
            min-width: 200px;
        }
        .signature-line {
            margin-top: 60px;
            border-top: 1px solid #333;
            padding-top: 5px;
        }
        .summary {
            margin-top: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
        }
        .summary-grid {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            padding: 5px 10px;
            text-align: center;
            border-right: 1px solid #dee2e6;
        }
        .summary-item:last-child {
            border-right: none;
        }
        .summary-label {
            font-size: 8px;
            color: #666;
            margin-bottom: 3px;
        }
        .summary-value {
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN NILAI KEHADIRAN</h1>
        <h2>{{ $course->nama }}</h2>
        <p>Kode: {{ $course->kode ?? '-' }} | SKS: {{ $course->sks }}</p>
    </div>

    <div class="info-section">
        <div class="info-row">
            <div class="info-label">Dosen Pengampu</div>
            <div class="info-value">: {{ $dosen->nama }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">NIDN</div>
            <div class="info-value">: {{ $dosen->nidn }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Tanggal Cetak</div>
            <div class="info-value">: {{ $generated_at }}</div>
        </div>
    </div>

    @if($grades && isset($grades['grades']) && count($grades['grades']) > 0)
        <div class="summary">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Total Mahasiswa</div>
                    <div class="summary-value">{{ $grades['summary']['total_students'] }}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Total Pertemuan</div>
                    <div class="summary-value">{{ $grades['summary']['total_sessions'] }}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Rata-rata Kehadiran</div>
                    <div class="summary-value">{{ number_format($grades['summary']['average_attendance_rate'], 1) }}%</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Tidak Bisa UAS</div>
                    <div class="summary-value">{{ $grades['summary']['students_at_risk'] }}</div>
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="text-center" style="width: 30px;">No</th>
                    <th style="width: 100px;">NIM</th>
                    <th>Nama Mahasiswa</th>
                    <th class="text-center" style="width: 60px;">Hadir</th>
                    <th class="text-center" style="width: 60px;">Total Sesi</th>
                    <th class="text-center" style="width: 70px;">Kehadiran</th>
                    <th class="text-center" style="width: 50px;">Poin</th>
                    <th class="text-center" style="width: 50px;">Nilai</th>
                    <th class="text-center" style="width: 40px;">Huruf</th>
                    <th class="text-center" style="width: 50px;">UAS</th>
                </tr>
            </thead>
            <tbody>
                @foreach($grades['grades'] as $index => $grade)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $grade['nim'] }}</td>
                    <td>{{ $grade['nama'] }}</td>
                    <td class="text-center">{{ $grade['attended_sessions'] }}</td>
                    <td class="text-center">{{ $grade['total_sessions'] }}</td>
                    <td class="text-center"><strong>{{ number_format($grade['attendance_rate'], 1) }}%</strong></td>
                    <td class="text-center">{{ number_format($grade['average_points'], 1) }}</td>
                    <td class="text-center"><strong>{{ number_format($grade['attendance_grade'], 1) }}</strong></td>
                    <td class="text-center">
                        <span class="grade-{{ strtolower($grade['grade_letter']) }}">
                            {{ $grade['grade_letter'] }}
                        </span>
                    </td>
                    <td class="text-center">{{ $grade['can_take_uas'] ? 'Ya' : 'Tidak' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="signature">
            <div class="signature-box">
                <p>Mengetahui,</p>
                <p><strong>Dosen Pengampu</strong></p>
                <div class="signature-line">
                    <strong>{{ $dosen->nama }}</strong><br>
                    NIDN: {{ $dosen->nidn }}
                </div>
            </div>
        </div>
    @else
        <p style="text-align: center; padding: 40px; color: #999;">
            Tidak ada data nilai kehadiran untuk mata kuliah ini.
        </p>
    @endif

    <div class="footer">
        <p>Dokumen ini dicetak secara otomatis oleh sistem pada {{ $generated_at }}</p>
        <p>Universitas Pamulang - Sistem Informasi Kehadiran</p>
    </div>
</body>
</html>
