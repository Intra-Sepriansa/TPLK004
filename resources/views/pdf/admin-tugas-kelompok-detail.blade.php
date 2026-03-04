<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Tugas Kelompok - {{ $assignment->title }}</title>
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

        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div class="container">
        {{-- ===== HEADER RESMI KAMPUS ===== --}}
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

        {{-- ===== JUDUL DOKUMEN ===== --}}
        <div class="doc-title-wrap">
            <div class="doc-title">Laporan Rekapitulasi Tugas Kelompok – Perspektif Administrator</div>
            <div class="doc-subtitle">
                Nomor Dokumen: LRTK/{{ str_pad((string) $assignment->id, 4, '0', STR_PAD_LEFT) }}/{{ now()->format('Y') }} •
                Tanggal Cetak: {{ $tanggalCetak ?? '-' }}
            </div>
        </div>

        {{-- ===== META BOX ===== --}}
        <div class="meta-box">
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Judul Tugas</td><td class="meta-sep">:</td><td>{{ $assignment->title }}</td>
                    <td class="meta-label">Mata Kuliah</td><td class="meta-sep">:</td><td>{{ $assignment->course->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Dosen Pengampu</td><td class="meta-sep">:</td><td>{{ $assignment->dosen->nama ?? '-' }}</td>
                    <td class="meta-label">Mode Formasi</td><td class="meta-sep">:</td><td>{{ strtoupper((string) $assignment->formation_mode) }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Mode Penilaian</td><td class="meta-sep">:</td><td>{{ strtoupper((string) $assignment->grading_mode) }}</td>
                    <td class="meta-label">Status Kunci</td><td class="meta-sep">:</td><td>{{ $assignment->is_locked ? 'TERKUNCI' : 'TERBUKA' }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Deadline Formasi</td><td class="meta-sep">:</td><td>{{ $formationDeadline }}</td>
                    <td class="meta-label">Deadline Pengumpulan</td><td class="meta-sep">:</td>
                    <td>
                        {{ $submissionDeadline }}
                        @if(!is_null($submissionDaysLeft))
                            @if($submissionDaysLeft < 0)
                                <span class="overdue"> (Terlambat {{ abs($submissionDaysLeft) }} hari)</span>
                            @else
                                <span class="safe"> (Sisa {{ $submissionDaysLeft }} hari)</span>
                            @endif
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        {{-- ===== I. RINGKASAN EKSEKUTIF ===== --}}
        <div class="section">
            <div class="section-title">I. Ringkasan Eksekutif</div>
            <div class="paragraph">
                Dokumen ini menyajikan rekapitulasi komprehensif mengenai tugas kelompok dari perspektif administrator, mencakup seluruh data kelompok,
                distribusi nilai, analisis risiko, kontribusi mahasiswa, serta tren aktivitas. Laporan disusun secara otomatis berdasarkan data real-time sistem akademik.
            </div>
            <table class="kpi-grid">
                <tr>
                    <td class="kpi-card">
                        <div class="kpi-label">Total Kelompok</div>
                        <div class="kpi-value">{{ $groupSummaries->count() }}</div>
                        <div class="kpi-note">{{ $totalStudents }} mahasiswa terdaftar</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Submission Rate</div>
                        <div class="kpi-value">{{ number_format($submissionRate, 1) }}%</div>
                        <div class="kpi-note">{{ $submittedCount }}/{{ $groupSummaries->count() }} kelompok submit</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Rata-rata Nilai</div>
                        <div class="kpi-value">{{ $gradedCount > 0 ? number_format($averageGrade, 1) : '-' }}</div>
                        <div class="kpi-note">{{ $gradedCount }} kelompok dinilai</div>
                    </td>
                </tr>
                <tr>
                    <td class="kpi-card">
                        <div class="kpi-label">Engagement Score</div>
                        <div class="kpi-value">{{ $engagementScore }}/100</div>
                        <div class="kpi-note">Aktivitas, file, dan task</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Terlambat</div>
                        <div class="kpi-value">{{ $lateCount }}</div>
                        <div class="kpi-note">kelompok terlambat submit</div>
                    </td>
                    <td class="kpi-card">
                        <div class="kpi-label">Kelompok Berisiko</div>
                        <div class="kpi-value">{{ $riskGroups->count() }}</div>
                        <div class="kpi-note">perlu perhatian khusus</div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- ===== II. DISTRIBUSI NILAI ===== --}}
        <div class="section">
            <div class="section-title">II. Distribusi Nilai</div>
            @if($gradedCount > 0)
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">Grade</th>
                            <th style="width: 80px;">Rentang</th>
                            <th style="width: 60px;">Jumlah</th>
                            <th>Proporsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $gradeRanges = ['A' => '85 – 100', 'B' => '75 – 84', 'C' => '60 – 74', 'D' => '45 – 59', 'E' => '0 – 44'];
                        @endphp
                        @foreach($gradeDistribution as $letter => $count)
                            <tr>
                                <td style="text-align:center; font-weight:bold;">{{ $letter }}</td>
                                <td style="text-align:center;">{{ $gradeRanges[$letter] }}</td>
                                <td style="text-align:center;">{{ $count }}</td>
                                <td>
                                    <div class="bar-track"><div class="bar-fill" style="width: {{ $gradedCount > 0 ? (int) round(($count / $gradedCount) * 100) : 0 }}%;"></div></div>
                                    <div class="small">{{ $gradedCount > 0 ? number_format(($count / $gradedCount) * 100, 1) : 0 }}%</div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="paragraph"><em>Belum ada kelompok yang dinilai.</em></div>
            @endif
        </div>

        {{-- ===== III. REKAPITULASI KELOMPOK ===== --}}
        <div class="section">
            <div class="section-title">III. Rekapitulasi Seluruh Kelompok</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 30px;">No</th>
                        <th>Kelompok</th>
                        <th style="width: 45px;">Anggota</th>
                        <th style="width: 65px;">Progress</th>
                        <th style="width: 65px;">Task</th>
                        <th style="width: 60px;">Status</th>
                        <th style="width: 45px;">Nilai</th>
                        <th style="width: 55px;">Terlambat</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($groupSummaries as $index => $group)
                        <tr>
                            <td style="text-align:center;">{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $group['name'] }}</strong>
                                <div class="small">
                                    @foreach($group['members'] as $member)
                                        {{ $member['nama'] }}{{ $member['is_leader'] ? ' (Ketua)' : '' }}@if(!$loop->last), @endif
                                    @endforeach
                                </div>
                            </td>
                            <td style="text-align:center;">{{ $group['member_count'] }}</td>
                            <td>
                                <div class="bar-track"><div class="bar-fill" style="width: {{ $group['progress'] }}%;"></div></div>
                                <div class="small" style="text-align:center;">{{ number_format($group['progress'], 1) }}%</div>
                            </td>
                            <td style="text-align:center;">{{ $group['task_completed'] }}/{{ $group['task_total'] }}</td>
                            <td style="text-align:center;">
                                @if($group['has_submission'])
                                    <span class="safe">Submitted</span>
                                @else
                                    <span class="overdue">Belum</span>
                                @endif
                            </td>
                            <td style="text-align:center; font-weight:bold;">{{ $group['grade'] ?? '-' }}</td>
                            <td style="text-align:center;">
                                @if($group['is_late'])
                                    <span class="overdue">Ya</span>
                                @else
                                    <span class="safe">Tidak</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="page-break"></div>

        {{-- ===== IV. CONTRIBUTION LEADERBOARD ===== --}}
        <div class="section">
            <div class="section-title">IV. Leaderboard Kontribusi (Top 10 – Seluruh Kelompok)</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 35px;">Rank</th>
                        <th>Nama Mahasiswa</th>
                        <th style="width: 90px;">Kelompok</th>
                        <th style="width: 50px;">Poin</th>
                        <th>Indeks Kontribusi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($contributionLeaderboard as $rank => $contributor)
                        <tr>
                            <td style="text-align:center;">{{ $rank + 1 }}</td>
                            <td>{{ $contributor['nama'] }} ({{ $contributor['nim'] }})</td>
                            <td>{{ $contributor['group_name'] }}</td>
                            <td style="text-align:center;">{{ $contributor['points'] }}</td>
                            <td>
                                @php $pctContrib = $maxContribPoints > 0 ? (int) round(($contributor['points'] / $maxContribPoints) * 100) : 0; @endphp
                                <div class="bar-track"><div class="bar-fill" style="width: {{ $pctContrib }}%;"></div></div>
                                <div class="small">{{ $pctContrib }}%</div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5" style="text-align:center;">Belum ada data kontribusi.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{-- ===== V. ANALISIS RISIKO ===== --}}
        <div class="section">
            <div class="section-title">V. Analisis Risiko</div>
            @if($riskGroups->count() > 0)
                <div class="paragraph" style="margin-bottom: 6px;">
                    Terdapat <strong>{{ $riskGroups->count() }}</strong> kelompok yang teridentifikasi memiliki risiko (progress &lt; 60%, nilai &lt; 65, atau terlambat submit).
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 30px;">No</th>
                            <th>Kelompok</th>
                            <th style="width: 65px;">Progress</th>
                            <th style="width: 60px;">Status</th>
                            <th style="width: 50px;">Nilai</th>
                            <th style="width: 80px;">Flag Risiko</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($riskGroups as $ri => $rg)
                            @php
                                $flags = [];
                                if (!$rg['has_submission'] && $rg['progress'] < 60) $flags[] = 'Progress rendah';
                                if ($rg['has_submission'] && ($rg['grade'] ?? 0) < 65) $flags[] = 'Nilai < 65';
                                if ($rg['is_late']) $flags[] = 'Terlambat';
                            @endphp
                            <tr>
                                <td style="text-align:center;">{{ $ri + 1 }}</td>
                                <td>{{ $rg['name'] }}</td>
                                <td style="text-align:center;">{{ number_format($rg['progress'], 1) }}%</td>
                                <td style="text-align:center;">{{ $rg['has_submission'] ? 'Submitted' : 'Belum' }}</td>
                                <td style="text-align:center;">{{ $rg['grade'] ?? '-' }}</td>
                                <td>
                                    @foreach($flags as $flag)
                                        <span class="badge risk-high">{{ $flag }}</span>
                                    @endforeach
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="paragraph"><span class="safe">Tidak ada kelompok berisiko tinggi.</span></div>
            @endif
        </div>

        {{-- ===== VI. LAPORAN KONFLIK ===== --}}
        <div class="section">
            <div class="section-title">VI. Laporan Konflik</div>
            <div class="paragraph" style="margin-bottom:6px;">
                Total: <strong>{{ $conflictOpen + $conflictInReview + $conflictResolved }}</strong> laporan
                (Open: {{ $conflictOpen }}, In Review: {{ $conflictInReview }}, Resolved: {{ $conflictResolved }})
            </div>
            @if($conflictList->count() > 0)
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 30px;">No</th>
                            <th>Kelompok</th>
                            <th>Pelapor</th>
                            <th>Deskripsi</th>
                            <th style="width: 70px;">Status</th>
                            <th style="width: 75px;">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($conflictList as $ci => $conflict)
                            <tr>
                                <td style="text-align:center;">{{ $ci + 1 }}</td>
                                <td>{{ $conflict->group->name ?? '-' }}</td>
                                <td>{{ $conflict->reporter->nama ?? '-' }}</td>
                                <td class="small">{{ \Illuminate\Support\Str::limit($conflict->description, 80) }}</td>
                                <td style="text-align:center;">
                                    @if($conflict->status === 'resolved')
                                        <span class="safe">{{ strtoupper($conflict->status) }}</span>
                                    @elseif($conflict->status === 'open')
                                        <span class="overdue">{{ strtoupper($conflict->status) }}</span>
                                    @else
                                        {{ strtoupper(str_replace('_', ' ', $conflict->status)) }}
                                    @endif
                                </td>
                                <td style="text-align:center;" class="small">{{ $conflict->created_at?->format('d/m/Y') ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="paragraph"><em>Tidak ada laporan konflik.</em></div>
            @endif
        </div>

        {{-- ===== VII. TREN AKTIVITAS 7 HARI ===== --}}
        <div class="section">
            <div class="section-title">VII. Tren Aktivitas 7 Hari Terakhir</div>
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

        {{-- ===== VIII. KESIMPULAN DAN REKOMENDASI ===== --}}
        <div class="section">
            <div class="section-title">VIII. Kesimpulan dan Rekomendasi</div>
            <ol class="summary-list">
                <li>Dari <strong>{{ $groupSummaries->count() }}</strong> kelompok, tingkat submission mencapai <strong>{{ number_format($submissionRate, 1) }}%</strong> dengan rata-rata nilai <strong>{{ $gradedCount > 0 ? number_format($averageGrade, 1) : '-' }}</strong>.</li>
                <li>Skor engagement keseluruhan berada di angka <strong>{{ $engagementScore }}/100</strong>, menunjukkan
                    @if($engagementScore >= 70)
                        tingkat partisipasi yang <strong>sangat baik</strong>.
                    @elseif($engagementScore >= 40)
                        tingkat partisipasi yang <strong>cukup</strong> dan perlu ditingkatkan.
                    @else
                        tingkat partisipasi yang <strong>rendah</strong> dan memerlukan intervensi.
                    @endif
                </li>
                <li>Terdapat <strong>{{ $riskGroups->count() }}</strong> kelompok yang memerlukan perhatian khusus karena progress rendah, nilai di bawah standar, atau keterlambatan submission.</li>
                @if($conflictOpen > 0)
                    <li>Terdapat <strong>{{ $conflictOpen }}</strong> laporan konflik yang masih <strong>open</strong> dan memerlukan tindak lanjut segera.</li>
                @endif
                <li>Rekomendasi: (a) evaluasi kelompok berisiko, (b) tingkatkan fasilitas kolaborasi, (c) lakukan review berkala terhadap progress dan kualitas output.</li>
            </ol>
        </div>

        {{-- ===== TANDA TANGAN ===== --}}
        <div class="signature-wrap">
            <div class="signature-box">
                <div>Tangerang Selatan, {{ $tanggalCetak ?? '-' }}</div>
                <div>Administrator Sistem Akademik,</div>
                <div class="signature-space"></div>
                <div class="sign-line">__________________________</div>
                <div class="small">NIP/NIDN: ............................</div>
            </div>
        </div>
    </div>

    <div class="footer">
        Laporan ini dihasilkan otomatis oleh Sistem Akademik UNPAM • Dicetak {{ $generatedAt }} WIB •
        Verifikasi Dokumen: <span class="mono">{{ md5($assignment->id . '|admin|' . ($generatedAt ?? '')) }}</span>
    </div>
</body>
</html>
