<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Verifikasi Kehadiran</title>
    <style>
        @page {
            margin: 18px 20px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9px;
            color: #111827;
            line-height: 1.38;
            background: #ffffff;
        }

        .document-shell {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            overflow: hidden;
        }

        /* ═══════ HERO HEADER ═══════ */
        .hero {
            background: #1e3a8a;
            color: #ffffff;
            padding: 12px 14px 8px;
            border-bottom: 3px solid #ec4899;
        }

        .hero-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .hero-grid td {
            vertical-align: middle;
        }

        .hero-logo {
            width: 70px;
            text-align: center;
        }

        .hero-logo img {
            width: 52px;
            height: 52px;
            object-fit: contain;
            border-radius: 8px;
            background: #ffffff;
            padding: 3px;
        }

        .hero-title {
            text-align: center;
            padding: 0 8px;
        }

        .hero-title .org-1 {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: .2px;
            text-transform: uppercase;
        }

        .hero-title .org-2 {
            font-size: 10px;
            margin-top: 1px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .hero-title .org-3 {
            font-size: 8px;
            margin-top: 1px;
            color: #dbeafe;
        }

        .hero-title .doc-name {
            margin-top: 5px;
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: .5px;
            text-transform: uppercase;
            background: #ffffff;
            color: #1e3a8a;
        }

        /* ═══════ CONTENT ═══════ */
        .content {
            padding: 8px 12px 10px;
        }

        .section-title {
            margin: 6px 0 4px;
            background: #eef2ff;
            color: #312e81;
            border: 1px solid #c7d2fe;
            border-radius: 6px;
            padding: 4px 8px;
            font-weight: 700;
            font-size: 8px;
            letter-spacing: .4px;
            text-transform: uppercase;
        }

        .section-title .section-icon {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 3px;
            background: #4f46e5;
            color: #fff;
            text-align: center;
            line-height: 12px;
            font-size: 7px;
            font-weight: 700;
            margin-right: 4px;
            vertical-align: middle;
        }

        /* ═══════ META TABLE ═══════ */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        .meta-table td {
            border: 1px solid #dbe2f0;
            padding: 4px 6px;
            vertical-align: top;
        }

        .meta-label {
            width: 95px;
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 8px;
        }

        .meta-value {
            font-size: 9px;
            font-weight: 600;
            color: #0f172a;
        }

        /* ═══════ STAT CARDS ═══════ */
        .stats-row {
            width: 100%;
            border-collapse: separate;
            border-spacing: 4px;
            margin: 2px -4px 6px;
        }

        .stat-card {
            border-radius: 8px;
            border: 1px solid #dbe2f0;
            background: #ffffff;
            padding: 5px 6px;
            text-align: center;
            vertical-align: top;
        }

        .stat-card-accent {
            border-left: 3px solid;
        }

        .stat-label {
            color: #64748b;
            font-size: 7px;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: .3px;
        }

        .stat-value {
            color: #111827;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.1;
        }

        .stat-value.sm {
            font-size: 11px;
        }

        .stat-value.xs {
            font-size: 10px;
        }

        .color-emerald { color: #059669; }
        .color-amber { color: #d97706; }
        .color-red { color: #dc2626; }
        .color-blue { color: #2563eb; }
        .color-purple { color: #7c3aed; }
        .color-pink { color: #db2777; }
        .border-emerald { border-left-color: #10b981; }
        .border-amber { border-left-color: #f59e0b; }
        .border-red { border-left-color: #ef4444; }
        .border-blue { border-left-color: #3b82f6; }
        .border-purple { border-left-color: #8b5cf6; }

        /* ═══════ MINI PROGRESS BAR ═══════ */
        .progress-bar {
            height: 4px;
            border-radius: 2px;
            background: #e5e7eb;
            overflow: hidden;
            margin-top: 2px;
        }

        .progress-fill {
            height: 100%;
            border-radius: 2px;
        }

        .bg-emerald { background: #10b981; }
        .bg-amber { background: #f59e0b; }
        .bg-red { background: #ef4444; }
        .bg-blue { background: #3b82f6; }

        /* ═══════ COURSE BREAKDOWN TABLE ═══════ */
        .course-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 8px;
        }

        .course-table th,
        .course-table td {
            border: 1px solid #dbe2f0;
            padding: 4px 6px;
            vertical-align: middle;
        }

        .course-table th {
            background: #312e81;
            color: #ffffff;
            font-weight: 700;
            font-size: 7px;
            letter-spacing: .3px;
            text-transform: uppercase;
            text-align: center;
        }

        .course-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        /* ═══════ DATA TABLE ═══════ */
        .table-wrap {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #dbe2f0;
            padding: 4px 5px;
            vertical-align: middle;
        }

        .data-table th {
            background: #111827;
            color: #ffffff;
            font-weight: 700;
            font-size: 7px;
            letter-spacing: .3px;
            text-transform: uppercase;
            text-align: center;
        }

        .data-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        /* ═══════ BADGES ═══════ */
        .badge {
            display: inline-block;
            min-width: 52px;
            padding: 1px 6px;
            border-radius: 999px;
            text-align: center;
            font-size: 7px;
            font-weight: 700;
            letter-spacing: .3px;
            border: 1px solid transparent;
        }

        .badge-pending {
            color: #92400e;
            background: #fef3c7;
            border-color: #fcd34d;
        }

        .badge-approved {
            color: #065f46;
            background: #d1fae5;
            border-color: #6ee7b7;
        }

        .badge-rejected {
            color: #991b1b;
            background: #fee2e2;
            border-color: #fca5a5;
        }

        .risk-badge {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 999px;
            font-size: 6px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .risk-low { color: #065f46; background: #d1fae5; }
        .risk-medium { color: #92400e; background: #fef3c7; }
        .risk-high { color: #c2410c; background: #ffedd5; }
        .risk-critical { color: #991b1b; background: #fee2e2; }

        .ai-bar {
            display: inline-block;
            min-width: 28px;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: 700;
            text-align: center;
        }

        .ai-high { color: #065f46; background: #d1fae5; }
        .ai-mid { color: #92400e; background: #fef3c7; }
        .ai-low { color: #991b1b; background: #fee2e2; }

        /* ═══════ RISK DISTRIBUTION ═══════ */
        .risk-dist-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 3px;
        }

        .risk-dist-cell {
            border-radius: 6px;
            padding: 4px 6px;
            text-align: center;
            width: 25%;
        }

        .risk-dist-cell .rdl {
            font-size: 7px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: .2px;
        }

        .risk-dist-cell .rdv {
            font-size: 13px;
            font-weight: 700;
            line-height: 1.1;
            margin-top: 1px;
        }

        /* ═══════ SIGNATURE & FOOTER ═══════ */
        .signature-box {
            margin-top: 14px;
            width: 220px;
            margin-left: auto;
            text-align: center;
            font-size: 9px;
        }

        .signature-space {
            height: 42px;
        }

        .signature-name {
            border-top: 1px solid #111827;
            padding-top: 3px;
            font-size: 9px;
            font-weight: 700;
        }

        .footer {
            margin-top: 10px;
            border-top: 1px dashed #94a3b8;
            padding-top: 4px;
            color: #64748b;
            font-size: 7px;
            text-align: center;
            line-height: 1.5;
        }

        .muted {
            color: #64748b;
            font-size: 8px;
        }

        .two-col {
            width: 100%;
            border-collapse: collapse;
        }

        .two-col > tbody > tr > td {
            vertical-align: top;
        }
    </style>
</head>
<body>
    @php
        $total = $stats['total'];
        $pending = $stats['pending'];
        $approved = $stats['approved'];
        $rejected = $stats['rejected'];
        $approvalRate = $total > 0 ? round(($approved / $total) * 100, 1) : 0;
        $rejectionRate = $total > 0 ? round(($rejected / $total) * 100, 1) : 0;

        $statusBadge = static function (string $status): string {
            return match ($status) {
                'approved' => 'badge-approved',
                'rejected' => 'badge-rejected',
                default => 'badge-pending',
            };
        };

        $statusLabel = static function (string $status): string {
            return match ($status) {
                'approved' => 'APPROVED',
                'rejected' => 'REJECTED',
                default => 'PENDING',
            };
        };

        $riskBadge = static function (?int $score): string {
            if ($score === null || $score <= 40) return 'risk-low';
            if ($score <= 65) return 'risk-medium';
            if ($score <= 85) return 'risk-high';
            return 'risk-critical';
        };

        $riskLabel = static function (?int $score): string {
            if ($score === null || $score <= 40) return 'LOW';
            if ($score <= 65) return 'MED';
            if ($score <= 85) return 'HIGH';
            return 'CRIT';
        };

        $aiBadge = static function (?float $val): string {
            if ($val === null) return 'ai-low';
            if ($val >= 80) return 'ai-high';
            if ($val >= 60) return 'ai-mid';
            return 'ai-low';
        };
    @endphp

    <div class="document-shell">
        {{-- ═══════ HERO HEADER ═══════ --}}
        <div class="hero">
            <table class="hero-grid">
                <tr>
                    <td class="hero-logo">
                        @if(!empty($logoUnpam) && file_exists($logoUnpam))
                            <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                        @endif
                    </td>
                    <td class="hero-title">
                        <div class="org-1">Universitas Pamulang</div>
                        <div class="org-2">Fakultas Ilmu Komputer - Teknik Informatika</div>
                        <div class="org-3">Jl. Surya Kencana No. 1 Pamulang, Tangerang Selatan | fikom@unpam.ac.id</div>
                        <div class="doc-name">📊 Laporan Verifikasi Kehadiran Selfie</div>
                    </td>
                    <td class="hero-logo">
                        @if(!empty($logoSasmita) && file_exists($logoSasmita))
                            <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <div class="content">
            {{-- ═══════ INFORMASI DOSEN ═══════ --}}
            <div class="section-title">
                <span class="section-icon">i</span> Informasi Dosen & Periode Laporan
            </div>
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Nama Dosen</td>
                    <td class="meta-value">{{ $dosen->nama ?? '-' }}</td>
                    <td class="meta-label">NIDN</td>
                    <td class="meta-value">{{ $dosen->nidn ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Email</td>
                    <td class="meta-value">{{ $dosen->email ?? '-' }}</td>
                    <td class="meta-label">Tanggal Export</td>
                    <td class="meta-value">{{ $date }} WIB</td>
                </tr>
                <tr>
                    <td class="meta-label">Total Mata Kuliah</td>
                    <td class="meta-value">{{ $courseBreakdown->count() }} Mata Kuliah</td>
                    <td class="meta-label">Total Verifikasi</td>
                    <td class="meta-value">{{ $total }} Selfie</td>
                </tr>
            </table>

            {{-- ═══════ STATISTIK UTAMA ═══════ --}}
            <div class="section-title">
                <span class="section-icon">★</span> Dashboard Statistik Verifikasi
            </div>

            <table class="two-col">
                <tr>
                    <td style="width: 55%; padding-right: 6px;">
                        {{-- Status Cards --}}
                        <table class="stats-row">
                            <tr>
                                <td class="stat-card stat-card-accent border-blue" style="width: 25%;">
                                    <div class="stat-label">Total</div>
                                    <div class="stat-value color-blue">{{ $total }}</div>
                                </td>
                                <td class="stat-card stat-card-accent border-emerald" style="width: 25%;">
                                    <div class="stat-label">Approved</div>
                                    <div class="stat-value color-emerald">{{ $approved }}</div>
                                    <div class="progress-bar"><div class="progress-fill bg-emerald" style="width: {{ $approvalRate }}%;"></div></div>
                                </td>
                                <td class="stat-card stat-card-accent border-amber" style="width: 25%;">
                                    <div class="stat-label">Pending</div>
                                    <div class="stat-value color-amber">{{ $pending }}</div>
                                </td>
                                <td class="stat-card stat-card-accent border-red" style="width: 25%;">
                                    <div class="stat-label">Rejected</div>
                                    <div class="stat-value color-red">{{ $rejected }}</div>
                                    <div class="progress-bar"><div class="progress-fill bg-red" style="width: {{ $rejectionRate }}%;"></div></div>
                                </td>
                            </tr>
                        </table>

                        {{-- AI Metrics --}}
                        <table class="stats-row">
                            <tr>
                                <td class="stat-card stat-card-accent border-purple" style="width: 33%;">
                                    <div class="stat-label">Avg AI Confidence</div>
                                    <div class="stat-value sm color-purple">{{ $stats['avgAiConfidence'] }}%</div>
                                    <div class="progress-bar"><div class="progress-fill" style="width: {{ $stats['avgAiConfidence'] }}%; background: #8b5cf6;"></div></div>
                                </td>
                                <td class="stat-card stat-card-accent border-blue" style="width: 33%;">
                                    <div class="stat-label">Avg Face Match</div>
                                    <div class="stat-value sm color-blue">{{ $stats['avgFaceMatch'] }}%</div>
                                    <div class="progress-bar"><div class="progress-fill bg-blue" style="width: {{ $stats['avgFaceMatch'] }}%;"></div></div>
                                </td>
                                <td class="stat-card stat-card-accent border-red" style="width: 33%;">
                                    <div class="stat-label">Suspicious</div>
                                    <div class="stat-value sm color-red">{{ $stats['suspicious'] }}</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td style="width: 45%;">
                        {{-- Risk Distribution --}}
                        <div style="font-size: 7px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .3px; margin-bottom: 3px;">Distribusi Risiko</div>
                        <table class="risk-dist-table">
                            <tr>
                                <td class="risk-dist-cell" style="background: #d1fae5; border: 1px solid #6ee7b7;">
                                    <div class="rdl" style="color: #065f46;">Low</div>
                                    <div class="rdv" style="color: #059669;">{{ $stats['riskLow'] }}</div>
                                </td>
                                <td class="risk-dist-cell" style="background: #fef3c7; border: 1px solid #fcd34d;">
                                    <div class="rdl" style="color: #92400e;">Medium</div>
                                    <div class="rdv" style="color: #d97706;">{{ $stats['riskMedium'] }}</div>
                                </td>
                                <td class="risk-dist-cell" style="background: #ffedd5; border: 1px solid #fdba74;">
                                    <div class="rdl" style="color: #c2410c;">High</div>
                                    <div class="rdv" style="color: #ea580c;">{{ $stats['riskHigh'] }}</div>
                                </td>
                                <td class="risk-dist-cell" style="background: #fee2e2; border: 1px solid #fca5a5;">
                                    <div class="rdl" style="color: #991b1b;">Critical</div>
                                    <div class="rdv" style="color: #dc2626;">{{ $stats['riskCritical'] }}</div>
                                </td>
                            </tr>
                        </table>

                        {{-- Approval Rate Indicator --}}
                        <div style="margin-top: 6px; border: 1px solid #dbe2f0; border-radius: 8px; padding: 6px 8px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5);">
                            <table style="width:100%; border-collapse: collapse;">
                                <tr>
                                    <td style="vertical-align: middle;">
                                        <div style="font-size: 7px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .2px;">Tingkat Persetujuan</div>
                                        <div style="margin-top: 2px;">
                                            <div class="progress-bar" style="height: 6px;">
                                                <div class="progress-fill bg-emerald" style="width: {{ $approvalRate }}%;"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="width: 60px; text-align: right; vertical-align: middle;">
                                        <span style="font-size: 16px; font-weight: 800; color: {{ $approvalRate >= 70 ? '#059669' : ($approvalRate >= 50 ? '#d97706' : '#dc2626') }};">{{ $approvalRate }}%</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- ═══════ PER-COURSE BREAKDOWN ═══════ --}}
            @if($courseBreakdown->count() > 0)
                <div class="section-title">
                    <span class="section-icon">📚</span> Breakdown Per Mata Kuliah
                </div>
                <table class="course-table">
                    <thead>
                        <tr>
                            <th style="width: 28px;">No</th>
                            <th>Mata Kuliah</th>
                            <th style="width: 36px;">SKS</th>
                            <th style="width: 48px;">Total</th>
                            <th style="width: 56px;">Approved</th>
                            <th style="width: 56px;">Rejected</th>
                            <th style="width: 50px;">Pending</th>
                            <th style="width: 55px;">Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($courseBreakdown as $i => $cb)
                            @php $cRate = $cb['total'] > 0 ? round(($cb['approved'] / $cb['total']) * 100, 1) : 0; @endphp
                            <tr>
                                <td class="text-center">{{ $i + 1 }}</td>
                                <td><strong>{{ $cb['nama'] }}</strong></td>
                                <td class="text-center">{{ $cb['sks'] }}</td>
                                <td class="text-center"><strong>{{ $cb['total'] }}</strong></td>
                                <td class="text-center"><span style="color: #059669; font-weight: 700;">{{ $cb['approved'] }}</span></td>
                                <td class="text-center"><span style="color: #dc2626; font-weight: 700;">{{ $cb['rejected'] }}</span></td>
                                <td class="text-center"><span style="color: #d97706; font-weight: 700;">{{ $cb['pending'] }}</span></td>
                                <td class="text-center">
                                    <span class="ai-bar {{ $cRate >= 70 ? 'ai-high' : ($cRate >= 50 ? 'ai-mid' : 'ai-low') }}">{{ $cRate }}%</span>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            {{-- ═══════ DATA TABLE ═══════ --}}
            <div class="section-title">
                <span class="section-icon">📋</span> Detail Verifikasi Selfie ({{ $total }} data)
            </div>
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 22px;">No</th>
                            <th style="width: 90px;">NIM</th>
                            <th>Nama Mahasiswa</th>
                            <th style="width: 100px;">Mata Kuliah</th>
                            <th style="width: 35px;">Sesi</th>
                            <th style="width: 55px;">Tanggal</th>
                            <th style="width: 30px;">Jam</th>
                            <th style="width: 52px;">Status</th>
                            <th style="width: 32px;">AI%</th>
                            <th style="width: 34px;">Face%</th>
                            <th style="width: 35px;">Risk</th>
                            <th style="width: 34px;">Jarak</th>
                            <th style="width: 60px;">Device</th>
                            <th style="width: 65px;">Verifikator</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($verifications as $index => $v)
                            @php
                                $log = $v->attendanceLog;
                                $m = $log?->mahasiswa;
                                $session = $log?->session;
                                $aiConf = $log?->ai_confidence;
                                $faceMatch = $log?->face_match_score;
                                $riskScore = $log?->risk_score;
                            @endphp
                            <tr>
                                <td class="text-center">{{ $index + 1 }}</td>
                                <td style="font-family: monospace; font-size: 7px;">{{ $m?->nim ?? '-' }}</td>
                                <td>
                                    <strong style="font-size: 8px;">{{ Str::limit($m?->nama ?? '-', 22) }}</strong>
                                </td>
                                <td style="font-size: 7px;">{{ Str::limit($session?->course?->nama ?? '-', 18) }}</td>
                                <td class="text-center">{{ $session?->meeting_number ?? '-' }}</td>
                                <td class="text-center" style="font-size: 7px;">{{ $v->created_at?->format('d/m/Y') }}</td>
                                <td class="text-center" style="font-size: 7px;">{{ $v->created_at?->format('H:i') }}</td>
                                <td class="text-center">
                                    <span class="badge {{ $statusBadge($v->status) }}">{{ $statusLabel($v->status) }}</span>
                                </td>
                                <td class="text-center">
                                    <span class="ai-bar {{ $aiBadge($aiConf) }}">{{ $aiConf !== null ? $aiConf . '%' : '-' }}</span>
                                </td>
                                <td class="text-center">
                                    <span class="ai-bar {{ $aiBadge($faceMatch) }}">{{ $faceMatch !== null ? $faceMatch . '%' : '-' }}</span>
                                </td>
                                <td class="text-center">
                                    <span class="risk-badge {{ $riskBadge($riskScore) }}">{{ $riskLabel($riskScore) }}</span>
                                </td>
                                <td class="text-center" style="font-size: 7px;">{{ $log?->distance_m !== null ? $log->distance_m . 'm' : '-' }}</td>
                                <td style="font-size: 7px;">{{ Str::limit($log?->device_model ?? $log?->device_type ?? '-', 12) }}</td>
                                <td style="font-size: 7px;">{{ Str::limit($v->verified_by_name ?? '-', 12) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="14" class="text-center" style="padding: 14px;">Tidak ada data verifikasi selfie.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            {{-- ═══════ SIGNATURE ═══════ --}}
            <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <tr>
                    <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                        <div style="border: 1px solid #dbe2f0; border-radius: 8px; padding: 8px; background: #f8fafc;">
                            <div style="font-size: 7px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .3px; margin-bottom: 4px;">Keterangan Status</div>
                            <table style="width: 100%; border-collapse: collapse; font-size: 7px;">
                                <tr>
                                    <td style="padding: 1px 4px;"><span class="badge badge-approved">APPROVED</span></td>
                                    <td style="padding: 1px 4px;">Disetujui (selfie valid)</td>
                                    <td style="padding: 1px 4px;"><span class="risk-badge risk-low">LOW</span></td>
                                    <td style="padding: 1px 4px;">Risiko Rendah (0-40)</td>
                                </tr>
                                <tr>
                                    <td style="padding: 1px 4px;"><span class="badge badge-pending">PENDING</span></td>
                                    <td style="padding: 1px 4px;">Menunggu verifikasi</td>
                                    <td style="padding: 1px 4px;"><span class="risk-badge risk-medium">MED</span></td>
                                    <td style="padding: 1px 4px;">Risiko Sedang (41-65)</td>
                                </tr>
                                <tr>
                                    <td style="padding: 1px 4px;"><span class="badge badge-rejected">REJECTED</span></td>
                                    <td style="padding: 1px 4px;">Ditolak (selfie tidak valid)</td>
                                    <td style="padding: 1px 4px;"><span class="risk-badge risk-high">HIGH</span></td>
                                    <td style="padding: 1px 4px;">Risiko Tinggi (66-85)</td>
                                </tr>
                                <tr>
                                    <td colspan="2"></td>
                                    <td style="padding: 1px 4px;"><span class="risk-badge risk-critical">CRIT</span></td>
                                    <td style="padding: 1px 4px;">Risiko Kritis (86-100)</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                    <td style="width: 50%; vertical-align: top;">
                        <div class="signature-box">
                            <p>Tangerang Selatan, {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y') }}</p>
                            <p style="margin-top: 3px;">Dosen Pengampu</p>
                            <div class="signature-space"></div>
                            <p class="signature-name">{{ $dosen->nama ?? '-' }}</p>
                            <p class="muted">NIDN: {{ $dosen->nidn ?? '-' }}</p>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- ═══════ FOOTER ═══════ --}}
            <div class="footer">
                Sistem Presensi UNPAM — Dokumen ini dihasilkan secara otomatis oleh sistem.<br>
                Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB | Ref: VRF-{{ strtoupper(substr(md5(now()->timestamp), 0, 8)) }}
            </div>
        </div>
    </div>
</body>
</html>
