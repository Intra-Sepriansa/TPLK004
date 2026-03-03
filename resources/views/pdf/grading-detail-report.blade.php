<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Detail Penilaian - {{ $student['nama'] ?? '-' }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #0f172a;
            font-size: 11px;
            line-height: 1.45;
        }
        .wrap {
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #ec4899 100%);
            color: #fff;
            border-radius: 14px;
            padding: 16px 18px;
            margin-bottom: 16px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            letter-spacing: .2px;
        }
        .header p {
            margin: 4px 0 0;
            font-size: 11px;
            opacity: .9;
        }
        .grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        .grid td {
            border: 1px solid #dbe2f0;
            padding: 7px 8px;
            vertical-align: top;
        }
        .label {
            width: 120px;
            font-weight: 700;
            color: #334155;
            background: #f8fafc;
        }
        .section-title {
            margin: 16px 0 8px;
            font-size: 12px;
            font-weight: 700;
            color: #1e1b4b;
            padding: 7px 10px;
            border-radius: 10px;
            background: #e0e7ff;
            border: 1px solid #c7d2fe;
        }
        .stats {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px;
            margin: 0 -8px 8px;
        }
        .stat {
            border: 1px solid #dbe2f0;
            border-radius: 10px;
            background: #ffffff;
            padding: 10px;
            width: 25%;
            text-align: center;
        }
        .stat .k {
            color: #64748b;
            font-size: 10px;
            margin-bottom: 4px;
        }
        .stat .v {
            font-size: 15px;
            font-weight: 700;
            color: #111827;
        }
        table.main {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        table.main th {
            background: #111827;
            color: #fff;
            border: 1px solid #0b1220;
            font-size: 10px;
            text-align: left;
            padding: 7px 8px;
        }
        table.main td {
            border: 1px solid #dbe2f0;
            padding: 7px 8px;
            font-size: 10px;
        }
        table.main tr:nth-child(even) td {
            background: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .muted { color: #64748b; }
        .footer {
            margin-top: 16px;
            color: #64748b;
            font-size: 10px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            <h1>Laporan Detail Penilaian Kehadiran</h1>
            <p>{{ $course['nama'] ?? '-' }} • {{ $student['nama'] ?? '-' }} ({{ $student['nim'] ?? '-' }})</p>
            <p>Dibuat: {{ $generatedAt }}</p>
        </div>

        <table class="grid">
            <tr>
                <td class="label">Mahasiswa</td>
                <td>{{ $student['nama'] ?? '-' }}</td>
                <td class="label">NIM</td>
                <td>{{ $student['nim'] ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Program Studi</td>
                <td>{{ $student['prodi'] ?? '-' }}</td>
                <td class="label">Mata Kuliah</td>
                <td>{{ $course['nama'] ?? '-' }} ({{ $course['kode'] ?? '-' }})</td>
            </tr>
            <tr>
                <td class="label">Dosen</td>
                <td>{{ $dosen['nama'] ?? '-' }}</td>
                <td class="label">Scope</td>
                <td>{{ $scope === 'summary' ? 'Summary' : 'Full Report' }}</td>
            </tr>
        </table>

        <div class="section-title">Ringkasan Performa</div>
        <table class="stats">
            <tr>
                <td class="stat"><div class="k">Kehadiran</div><div class="v">{{ $gradeData['attended_sessions'] ?? 0 }}/{{ $gradeData['total_sessions'] ?? 0 }}</div></td>
                <td class="stat"><div class="k">Attendance Rate</div><div class="v">{{ $gradeData['attendance_rate'] ?? 0 }}%</div></td>
                <td class="stat"><div class="k">Rata-rata Poin</div><div class="v">{{ $gradeData['average_points'] ?? 0 }}</div></td>
                <td class="stat"><div class="k">Grade</div><div class="v">{{ $gradeData['grade_letter'] ?? '-' }}</div></td>
            </tr>
        </table>

        <table class="grid">
            <tr>
                <td class="label">Peringkat</td>
                <td>#{{ $gradeData['rank_in_class'] ?? 0 }} / {{ $gradeData['total_students'] ?? 0 }}</td>
                <td class="label">Percentile</td>
                <td>{{ $gradeData['percentile'] ?? 0 }}%</td>
            </tr>
            <tr>
                <td class="label">Eligible UAS</td>
                <td>{{ !empty($gradeData['can_take_uas']) ? 'Ya' : 'Tidak' }}</td>
                <td class="label">Rata-rata Kelas</td>
                <td>{{ $classAverage['average_attendance_rate'] ?? 0 }}%</td>
            </tr>
        </table>

        @if(($scope !== 'summary') && !empty($attendanceRecords))
            <div class="section-title">Riwayat Kehadiran</div>
            <table class="main">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 34px;">No</th>
                        <th class="text-center" style="width: 56px;">Sesi</th>
                        <th>Judul</th>
                        <th style="width: 86px;">Tanggal</th>
                        <th style="width: 64px;">Jam</th>
                        <th style="width: 74px;">Status</th>
                        <th class="text-right" style="width: 56px;">Poin</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($attendanceRecords as $index => $record)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td class="text-center">{{ $record['meeting_number'] ?? '-' }}</td>
                            <td>{{ $record['session_title'] ?? '-' }}</td>
                            <td>{{ $record['session_date'] ?? '-' }}</td>
                            <td>{{ $record['check_in_time'] ?? '-' }}</td>
                            <td>{{ strtoupper($record['status'] ?? '-') }}</td>
                            <td class="text-right">{{ $record['points'] ?? 0 }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        @if(!empty($dosenNotes))
            <div class="section-title">Catatan Dosen</div>
            <table class="main">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 34px;">No</th>
                        <th style="width: 180px;">Judul</th>
                        <th>Catatan</th>
                        <th style="width: 132px;">Dibuat</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($dosenNotes as $index => $note)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>{{ $note['title'] ?? '-' }}</td>
                            <td>{{ $note['content'] ?? '-' }}</td>
                            <td>{{ $note['created_at'] ?? '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        <div class="footer">
            Dokumen dibuat otomatis oleh sistem • Dosen: {{ $dosen['nama'] ?? '-' }}
        </div>
    </div>
</body>
</html>
