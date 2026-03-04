<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Analisis Tugas Kelompok - {{ $assignment->title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11px;
            line-height: 1.45;
            color: #1f2937;
            background: #fff;
        }
        .container { padding: 24px 30px 20px; }

        /* Header resmi kampus */
        .doc-header {
            display: table;
            width: 100%;
            border-bottom: 3px double #111827;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .logo-col {
            display: table-cell;
            width: 76px;
            vertical-align: middle;
            text-align: center;
        }
        .logo-col img { width: 64px; height: auto; }
        .title-col {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 0 6px;
        }
        .uni-title {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        .faculty-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 1px;
        }
        .dept-title {
            font-size: 12px;
            font-weight: bold;
            margin-top: 1px;
        }
        .addr {
            font-size: 9px;
            margin-top: 4px;
            color: #334155;
        }

        .doc-title-wrap {
            text-align: center;
            margin: 12px 0 14px;
        }
        .doc-title {
            font-size: 15px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.2px;
        }
        .doc-subtitle {
            margin-top: 4px;
            font-size: 11px;
            color: #374151;
        }

        .meta-box {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            margin-bottom: 12px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 3px 2px;
            vertical-align: top;
        }
        .meta-label {
            width: 130px;
            font-weight: bold;
            color: #1e293b;
        }
        .meta-sep { width: 10px; text-align: center; }

        .section {
            margin-top: 12px;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #1f2937;
            padding-bottom: 3px;
            margin-bottom: 8px;
        }
        .paragraph { text-align: justify; }

        .kpi-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px;
        }
        .kpi-card {
            border: 1px solid #cbd5e1;
            padding: 7px 8px;
            vertical-align: top;
            background: #f8fafc;
        }
        .kpi-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #475569;
            font-weight: bold;
        }
        .kpi-value {
            margin-top: 3px;
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
        }
        .kpi-note {
            margin-top: 2px;
            font-size: 9px;
            color: #334155;
        }

        .two-col {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px;
        }
        .panel {
            border: 1px solid #cbd5e1;
            padding: 8px;
            vertical-align: top;
            background: #ffffff;
        }
        .panel-title {
            font-weight: bold;
            margin-bottom: 4px;
            font-size: 11px;
        }

        .bar-track {
            width: 100%;
            height: 9px;
            background: #e2e8f0;
            border-radius: 99px;
            overflow: hidden;
            margin-top: 2px;
            margin-bottom: 5px;
        }
        .bar-fill {
            height: 9px;
            background: #334155;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th, .table td {
            border: 1px solid #334155;
            padding: 5px 4px;
            vertical-align: top;
        }
        .table th {
            text-align: center;
            background: #e2e8f0;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
        }
        .small { font-size: 9px; color: #334155; }
        .badge {
            display: inline-block;
            border: 1px solid #64748b;
            border-radius: 10px;
            padding: 1px 6px;
            font-size: 8px;
            font-weight: bold;
        }
        .risk-high { color: #991b1b; }
        .risk-medium { color: #92400e; }
        .risk-low { color: #166534; }
        .overdue { color: #991b1b; font-weight: bold; }
        .safe { color: #166534; font-weight: bold; }

        .summary-list { margin-left: 16px; margin-top: 4px; }
        .summary-list li { margin-bottom: 3px; }

        .signature-wrap {
            margin-top: 20px;
            width: 100%;
            text-align: right;
        }
        .signature-box {
            display: inline-block;
            min-width: 220px;
            text-align: center;
        }
        .signature-space { height: 58px; }
        .sign-line {
            font-weight: bold;
            text-decoration: underline;
        }

        .footer {
            position: fixed;
            left: 30px;
            right: 30px;
            bottom: 10px;
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            text-align: center;
            font-size: 8px;
            color: #475569;
        }
        .mono { font-family: "Courier New", Courier, monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="doc-header">
            <div class="logo-col">
                @if(!empty($logoUnpam) && file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="title-col">
                <div class="uni-title">Universitas Pamulang</div>
                <div class="faculty-title">Fakultas Ilmu Komputer</div>
                <div class="dept-title">Program Studi Teknik Informatika</div>
                <div class="addr">
                    Jl. Surya Kencana No.1, Pamulang Barat, Kota Tangerang Selatan, Banten 15417<br>
                    Telp. (021) 7412566 • Email: fikom@unpam.ac.id
                </div>
            </div>
            <div class="logo-col">
                @if(!empty($logoSasmita) && file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <div class="doc-title-wrap">
            <div class="doc-title">Laporan Analisis Kinerja Tugas Kelompok Mahasiswa</div>
            <div class="doc-subtitle">
                Nomor Dokumen: LPTK/{{ str_pad((string) $assignment->id, 4, '0', STR_PAD_LEFT) }}/{{ now()->format('Y') }} •
                Tanggal Cetak: {{ $tanggalCetak ?? '-' }}
            </div>
        </div>

        <div class="meta-box">
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Judul Tugas</td><td class="meta-sep">:</td><td>{{ $assignment->title }}</td>
                    <td class="meta-label">Mata Kuliah</td><td class="meta-sep">:</td><td>{{ $assignment->course->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Mahasiswa</td><td class="meta-sep">:</td><td>{{ $student->nama }} ({{ $student->nim }})</td>
                    <td class="meta-label">Dosen Pengampu</td><td class="meta-sep">:</td><td>{{ $assignment->dosen->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Kelompok</td><td class="meta-sep">:</td><td>{{ $myGroup->name ?? ('Kelompok #' . ($myGroup->slot_number ?? '-')) }}</td>
                    <td class="meta-label">Mode Formasi / Nilai</td><td class="meta-sep">:</td><td>{{ strtoupper((string) $assignment->formation_mode) }} / {{ strtoupper((string) $assignment->grading_mode) }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Deadline Formasi</td><td class="meta-sep">:</td><td>{{ $deadlineInsight['formation_deadline'] ?? '-' }}</td>
                    <td class="meta-label">Deadline Pengumpulan</td><td class="meta-sep">:</td>
                    <td>
                        {{ $deadlineInsight['submission_deadline'] ?? '-' }}
                        @if(!is_null($deadlineInsight['submission_days_left']))
                            @if($deadlineInsight['submission_days_left'] < 0)
                                <span class="overdue"> (Terlambat {{ abs((int) $deadlineInsight['submission_days_left']) }} hari)</span>
                            @else
                                <span class="safe"> (Sisa {{ (int) $deadlineInsight['submission_days_left'] }} hari)</span>
                            @endif
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">I. Ringkasan Eksekutif</div>
            <div class="paragraph">
                Dokumen ini menyajikan evaluasi komprehensif terhadap progres, kolaborasi, produktivitas, dan risiko penyelesaian tugas kelompok.
                Penilaian disusun menggunakan indikator kuantitatif aktivitas tim, penyelesaian task, intensitas komunikasi, dan kedisiplinan timeline.
            </div>
            <table class="kpi-grid">
                <tr>
                    <td class="kpi-card">
                        <div class="kpi-label">Completion Rate</div>
                        <div class="kpi-value">{{ number_format($stats['completion_rate'], 1) }}%</div>
                        <div class="kpi-note">{{ $stats['task_completed'] }}/{{ $stats['task_total'] }} task selesai</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Collaboration Index</div>
                        <div class="kpi-value">{{ $stats['collaboration_index'] }}/100</div>
                        <div class="kpi-note">Mutu koordinasi, komunikasi, dan eksekusi</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Velocity Score</div>
                        <div class="kpi-value">{{ $stats['velocity_score'] }}/100</div>
                        <div class="kpi-note">{{ $stats['momentum_label'] }} (72 jam terakhir)</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Risk Score</div>
                        <div class="kpi-value">{{ $stats['risk_score'] }}/100</div>
                        <div class="kpi-note">Level: <strong>{{ $stats['risk_level'] }}</strong></div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">II. Analisis Risiko dan Kendali Mutu</div>
            <table class="two-col">
                <tr>
                    <td class="panel" style="width: 50%;">
                        <div class="panel-title">
                            Klasifikasi Risiko:
                            @if($stats['risk_level'] === 'Tinggi')
                                <span class="risk-high">TINGGI</span>
                            @elseif($stats['risk_level'] === 'Sedang')
                                <span class="risk-medium">SEDANG</span>
                            @else
                                <span class="risk-low">RENDAH</span>
                            @endif
                        </div>
                        <div class="small">Flag risiko utama:</div>
                        <ul class="summary-list">
                            @foreach($riskFlags as $flag)
                                <li>{{ $flag }}</li>
                            @endforeach
                        </ul>
                    </td>
                    <td class="panel" style="width: 50%;">
                        <div class="panel-title">Komposisi Task</div>
                        <div class="small">Pending: {{ $stats['task_pending'] }}</div>
                        <div class="bar-track"><div class="bar-fill" style="width: {{ $stats['task_total'] > 0 ? (int) round(($stats['task_pending'] / $stats['task_total']) * 100) : 0 }}%;"></div></div>
                        <div class="small">In Progress: {{ $stats['task_in_progress'] }}</div>
                        <div class="bar-track"><div class="bar-fill" style="width: {{ $stats['task_total'] > 0 ? (int) round(($stats['task_in_progress'] / $stats['task_total']) * 100) : 0 }}%;"></div></div>
                        <div class="small">Completed: {{ $stats['task_completed'] }}</div>
                        <div class="bar-track"><div class="bar-fill" style="width: {{ (int) round($stats['completion_rate']) }}%;"></div></div>
                        <div class="small">Overdue: {{ $stats['task_overdue'] }} task</div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">III. Benchmark Kinerja Kelompok</div>
            <table class="meta-table" style="border-collapse: collapse; width:100%;">
                <tr>
                    <td style="border:1px solid #334155; padding:6px;"><strong>Progress Kelompok Anda</strong><br>{{ number_format((float) $stats['my_group_progress'], 1) }}%</td>
                    <td style="border:1px solid #334155; padding:6px;"><strong>Rata-rata Progress Kelas</strong><br>{{ number_format($stats['class_average_progress'], 1) }}%</td>
                    <td style="border:1px solid #334155; padding:6px;">
                        <strong>Gap Posisi</strong><br>
                        @if($stats['position_vs_average'] >= 0)
                            +{{ number_format($stats['position_vs_average'], 1) }}% <span class="badge">Di atas rata-rata</span>
                        @else
                            {{ number_format($stats['position_vs_average'], 1) }}% <span class="badge">Di bawah rata-rata</span>
                        @endif
                    </td>
                    <td style="border:1px solid #334155; padding:6px;"><strong>Aktivitas 24 Jam</strong><br>{{ $stats['activity_24h'] }} event</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">IV. Leaderboard Kontribusi Anggota</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 40px;">Rank</th>
                        <th>Nama Anggota</th>
                        <th style="width: 50px;">Chat</th>
                        <th style="width: 50px;">File</th>
                        <th style="width: 62px;">Task Selesai</th>
                        <th style="width: 50px;">Poin</th>
                        <th style="width: 150px;">Indeks Kontribusi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($memberContribution as $index => $member)
                        <tr>
                            <td style="text-align:center;">{{ $index + 1 }}</td>
                            <td>
                                {{ $member['nama'] }} ({{ $member['nim'] }})
                                @if($member['is_leader']) <span class="badge">Ketua</span> @endif
                            </td>
                            <td style="text-align:center;">{{ $member['messages'] }}</td>
                            <td style="text-align:center;">{{ $member['files'] }}</td>
                            <td style="text-align:center;">{{ $member['task_completed'] }}</td>
                            <td style="text-align:center;">{{ $member['points'] }}</td>
                            <td>
                                <div class="bar-track"><div class="bar-fill" style="width: {{ $member['score_percent'] }}%;"></div></div>
                                <div class="small">{{ $member['score_percent'] }}%</div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">V. Agenda Task Prioritas</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Task</th>
                        <th style="width: 90px;">Status</th>
                        <th style="width: 130px;">Deadline</th>
                        <th style="width: 90px;">Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($upcomingTasks as $task)
                        <tr>
                            <td>{{ $task['title'] }}</td>
                            <td style="text-align:center;">{{ strtoupper(str_replace('_', ' ', (string) $task['status'])) }}</td>
                            <td style="text-align:center;">{{ $task['deadline_display'] }}</td>
                            <td style="text-align:center;">
                                @if($task['is_overdue'])
                                    <span class="overdue">OVERDUE</span>
                                @else
                                    <span class="safe">ON SCHEDULE</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="4" style="text-align:center;">Tidak ada task aktif dengan deadline.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">VI. Tren Aktivitas 7 Hari</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 80px;">Hari</th>
                        <th style="width: 70px;">Tanggal</th>
                        <th style="width: 70px;">Jumlah</th>
                        <th>Visual Intensitas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($weeklyActivity as $day)
                        <tr>
                            <td style="text-align:center;">{{ $day['label'] }}</td>
                            <td style="text-align:center;">{{ $day['date'] }}</td>
                            <td style="text-align:center;">{{ $day['count'] }}</td>
                            <td>
                                <div class="bar-track"><div class="bar-fill" style="width: {{ $day['percent'] }}%;"></div></div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">VII. Kesimpulan dan Rekomendasi Akademik</div>
            <ol class="summary-list">
                <li>Kelompok menunjukkan tingkat penyelesaian sebesar <strong>{{ number_format($stats['completion_rate'], 1) }}%</strong> dengan skor kolaborasi <strong>{{ $stats['collaboration_index'] }}/100</strong>.</li>
                <li>Skor risiko berada pada level <strong>{{ strtoupper((string) $stats['risk_level']) }}</strong>; penguatan koordinasi diperlukan apabila terdapat task overdue.</li>
                <li>Prioritas tindak lanjut: (a) selesaikan task berisiko deadline, (b) distribusi beban kerja berdasarkan leaderboard kontribusi, (c) evaluasi mingguan progres dan dokumentasi artefak.</li>
            </ol>
        </div>

        <div class="signature-wrap">
            <div class="signature-box">
                <div>{{ $tempat ?? 'Tangerang Selatan' }}, {{ $tanggalCetak ?? '-' }}</div>
                <div>Administrator Sistem Akademik,</div>
                <div class="signature-space"></div>
                <div class="sign-line">__________________________</div>
                <div class="small">NIP/NIDN: ............................</div>
            </div>
        </div>
    </div>

    <div class="footer">
        Laporan ini dihasilkan otomatis oleh Sistem Akademik UNPAM • Dicetak {{ $generatedAt }} WIB •
        Verifikasi Dokumen: <span class="mono">{{ md5($assignment->id . '|' . $myGroup->id . '|' . $generatedAt) }}</span>
    </div>
</body>
</html>
