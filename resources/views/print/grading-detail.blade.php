<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Print Laporan Detail - {{ $student['nama'] ?? '-' }}</title>
    <style>
        :root {
            color-scheme: light;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: #f3f4f6;
            color: #111827;
            font-family: "Segoe UI", Arial, sans-serif;
            line-height: 1.45;
        }
        .page {
            max-width: 980px;
            margin: 18px auto;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            box-shadow: 0 20px 40px rgba(15, 23, 42, .08);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #ec4899 100%);
            color: #fff;
            padding: 18px 22px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: .2px;
        }
        .header p {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: .95;
        }
        .content {
            padding: 18px 22px 24px;
        }
        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 12px 0 18px;
        }
        .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 10px;
            border-radius: 999px;
            border: 1px solid #d1d5db;
            background: #f8fafc;
            font-size: 12px;
            font-weight: 600;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 14px;
        }
        .stat {
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            padding: 10px;
        }
        .stat .k {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 4px;
        }
        .stat .v {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
        }
        .section-title {
            margin: 14px 0 8px;
            font-size: 13px;
            font-weight: 700;
            color: #1e1b4b;
            padding: 7px 10px;
            border-radius: 8px;
            background: #e0e7ff;
            border: 1px solid #c7d2fe;
        }
        .meta {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .meta td {
            border: 1px solid #e2e8f0;
            padding: 7px 8px;
            font-size: 12px;
        }
        .meta .label {
            width: 130px;
            font-weight: 700;
            color: #334155;
            background: #f8fafc;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th {
            background: #111827;
            color: #fff;
            border: 1px solid #0b1220;
            text-align: left;
            padding: 7px 8px;
            font-size: 11px;
        }
        .table td {
            border: 1px solid #dbe2f0;
            padding: 7px 8px;
            font-size: 11px;
            vertical-align: top;
        }
        .table tr:nth-child(even) td {
            background: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .actions {
            position: sticky;
            bottom: 0;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 12px 22px;
            border-top: 1px solid #e5e7eb;
            background: rgba(255,255,255,.95);
            backdrop-filter: blur(6px);
        }
        .btn {
            border: 1px solid #d1d5db;
            background: #fff;
            color: #111827;
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }
        .btn.primary {
            border-color: #4338ca;
            background: #4f46e5;
            color: #fff;
        }

        @media print {
            body {
                background: #fff;
            }
            .page {
                margin: 0;
                border: 0;
                border-radius: 0;
                box-shadow: none;
                max-width: 100%;
            }
            .actions {
                display: none;
            }
            @page {
                size: A4;
                margin: 14mm;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <h1>Laporan Detail Penilaian Kehadiran</h1>
            <p>{{ $course['nama'] ?? '-' }} • {{ $student['nama'] ?? '-' }} ({{ $student['nim'] ?? '-' }})</p>
            <p>Dicetak: {{ $generatedAt }}</p>
        </div>

        <div class="content">
            <div class="chips">
                <span class="chip">Scope: {{ $scope === 'summary' ? 'Summary' : 'Full' }}</span>
                <span class="chip">Rate: {{ $gradeData['attendance_rate'] ?? 0 }}%</span>
                <span class="chip">Grade: {{ $gradeData['grade_letter'] ?? '-' }}</span>
                <span class="chip">UAS: {{ !empty($gradeData['can_take_uas']) ? 'Eligible' : 'Belum Eligible' }}</span>
            </div>

            <table class="meta">
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
                    <td class="label">Kelas Avg</td>
                    <td>{{ $classAverage['average_attendance_rate'] ?? 0 }}%</td>
                </tr>
            </table>

            <div class="stats">
                <div class="stat"><div class="k">Kehadiran</div><div class="v">{{ $gradeData['attended_sessions'] ?? 0 }}/{{ $gradeData['total_sessions'] ?? 0 }}</div></div>
                <div class="stat"><div class="k">Persentase</div><div class="v">{{ $gradeData['attendance_rate'] ?? 0 }}%</div></div>
                <div class="stat"><div class="k">Rata-rata Poin</div><div class="v">{{ $gradeData['average_points'] ?? 0 }}</div></div>
                <div class="stat"><div class="k">Peringkat</div><div class="v">#{{ $gradeData['rank_in_class'] ?? 0 }}</div></div>
            </div>

            @if(($scope !== 'summary') && !empty($attendanceRecords))
                <div class="section-title">Riwayat Kehadiran</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 34px;">No</th>
                            <th class="text-center" style="width: 56px;">Sesi</th>
                            <th>Judul</th>
                            <th style="width: 86px;">Tanggal</th>
                            <th style="width: 66px;">Jam</th>
                            <th style="width: 72px;">Status</th>
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
                <table class="table">
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
        </div>

        <div class="actions">
            <button class="btn" onclick="window.close()">Tutup</button>
            <button class="btn primary" onclick="window.print()">Print</button>
        </div>
    </div>

    <script>
        if (new URLSearchParams(window.location.search).get('auto') !== '0') {
            window.addEventListener('load', function () {
                setTimeout(function () {
                    window.print();
                }, 250);
            });
        }
    </script>
</body>
</html>
