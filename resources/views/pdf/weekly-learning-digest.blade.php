<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Info Pekanan Mentari - {{ $displayTitle }}</title>
    <style>
        /* Document Setup */
        @page {
            margin: 20px 40px 40px 40px;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            font-size: 9.5pt;
            line-height: 1.4;
            background-color: #ffffff;
        }

        /* Header Section */
        .header-table {
            width: 100%;
            table-layout: fixed;
            border-bottom: 3px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 2px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .logo-col {
            width: 80px;
            text-align: center;
        }
        .logo-col img {
            width: 70px;
            height: auto;
        }
        .header-text {
            text-align: center;
        }
        .inst-name {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
        }
        .faculty-name {
            font-size: 12pt;
            font-weight: bold;
            margin: 4px 0;
        }
        .address {
            font-size: 9pt;
            font-family: Arial, sans-serif;
            color: #4b5563;
            margin: 0;
        }
        .header-separator {
            border-top: 1px solid #111827;
            margin-bottom: 12px;
        }

        /* Document Title */
        .doc-title-container {
            text-align: center;
            margin-bottom: 12px;
        }
        .doc-title {
            font-size: 12pt;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            margin: 0;
        }
        .doc-subtitle {
            font-size: 10pt;
            font-style: italic;
            margin-top: 4px;
        }

        /* Information Section */
        .info-table {
            width: 100%;
            margin-bottom: 12px;
            font-family: Arial, sans-serif;
            font-size: 9pt;
        }
        .info-table td {
            padding: 1px 0;
            vertical-align: top;
        }
        .info-label {
            width: 180px;
            font-weight: bold;
        }
        .info-colon {
            width: 15px;
            text-align: center;
        }

        /* Data Tables */
        .section-heading {
            font-size: 10pt;
            font-weight: bold;
            margin: 12px 0 6px 0;
            text-transform: uppercase;
            border-left: 4px solid #111827;
            padding-left: 8px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 8.5pt;
            margin-bottom: 12px;
        }
        .data-table th, .data-table td {
            border: 1px solid #374151;
            padding: 4px 6px;
            vertical-align: middle;
        }
        .data-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            font-size: 9pt;
        }
        .data-table td {
            text-align: left;
        }
        .text-center { text-align: center !important; }

        /* Notes Box */
        .notes-box {
            border: 1px solid #9ca3af;
            background-color: #f9fafb;
            padding: 8px 12px;
            font-family: Arial, sans-serif;
            font-size: 8.5pt;
            text-align: justify;
            margin-top: 6px;
        }
        .notes-box strong {
            display: block;
            margin-bottom: 4px;
            font-size: 9pt;
            text-transform: uppercase;
        }

        /* Signatures */
        .signature-section {
            width: 100%;
            margin-top: 16px;
            font-family: Arial, sans-serif;
            font-size: 9pt;
        }
        .signature-table {
            width: 100%;
        }
        .signature-table td {
            width: 33%;
            text-align: center;
            vertical-align: bottom;
        }
        .sign-area {
            height: 50px;
        }
        .sign-name {
            font-weight: bold;
            text-decoration: underline;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: -40px;
            left: 0;
            right: 0;
            font-family: Arial, sans-serif;
            font-size: 8pt;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 5px;
        }
        .footer-left { float: left; }
        .footer-right { float: right; }
        .page-number:before { content: counter(page); }

        /* Dynamic Visuals */
        .watermark {
            position: absolute;
            top: 40%;
            left: 0;
            right: 0;
            width: 100%;
            text-align: center;
            font-size: 55pt;
            font-weight: bold;
            color: rgba(200, 200, 200, 0.35);
            z-index: -1000;
        }
        .qr-box {
            width: 80px;
            height: 80px;
        }

    </style>
</head>
<body>

    <!-- Watermark -->
    <div class="watermark">CONFIDENTIAL - UNPAM</div>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td class="logo-col">
                @if(file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo Inst">
                @endif
            </td>
            <td class="header-text">
                <p class="inst-name">YAYASAN SASMITA JAYA<br>UNIVERSITAS PAMULANG</p>
                <p class="faculty-name">PROGRAM STUDI TEKNIK INFORMATIKA</p>
                <p class="address">Jl. Surya Kencana No. 1 Pamulang Barat, Tangerang Selatan, Banten<br>Telp/Fax: (021) 7412566, Website: unpam.ac.id</p>
            </td>
            <td class="logo-col">
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Yayasan">
                @endif
            </td>
        </tr>
    </table>
    <div class="header-separator"></div>

    <!-- Title -->
    <div class="doc-title-container">
        <h1 class="doc-title">SUMMARY INFO PEKANAN MENTARI</h1>
        <p class="doc-subtitle">Nomor Register: WLD-{{ $digest->semester }}-{{ str_pad($digest->id, 4, '0', STR_PAD_LEFT) }}</p>
    </div>

    <!-- Info Umum -->
    <table class="info-table">
        <tr>
            <td class="info-label">Periode Pekan</td>
            <td class="info-colon">:</td>
            <td><strong>{{ $digest->week_start_date?->translatedFormat('d F Y') }}</strong> s/d <strong>{{ $digest->week_end_date?->translatedFormat('d F Y') }}</strong></td>
        </tr>
        <tr>
            <td class="info-label">Tahun Akademik/Semester</td>
            <td class="info-colon">:</td>
            <td>{{ $digest->semester }}</td>
        </tr>
        <tr>
            <td class="info-label">Kelas Spesifikasi</td>
            <td class="info-colon">:</td>
            <td>{{ $constants['class_label'] ?? 'Reguler' }}</td>
        </tr>
        <tr>
            <td class="info-label">Platform Terintegrasi</td>
            <td class="info-colon">:</td>
            <td>{{ $constants['platform_name'] }}</td>
        </tr>
        <tr>
            <td class="info-label">URL Portal</td>
            <td class="info-colon">:</td>
            <td><a href="{{ $digest->mentari_course_url ?: '#' }}" style="color: #2563eb;">{{ $digest->mentari_course_url ?: 'Belum diisi' }}</a></td>
        </tr>
        <tr>
            <td class="info-label">Status Dokumen</td>
            <td class="info-colon">:</td>
            <td><strong>{{ $digest->is_published ? 'DIPUBLIKASIKAN' : 'DRAFT (BELUM PUBLIKASI)' }}</strong></td>
        </tr>
    </table>

    <!-- Rincian Mata Kuliah -->
    <div class="section-title">A. Rincian Mata Kuliah dan Pertemuan</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 35%;">Mata Kuliah / Kode</th>
                <th style="width: 30%;">Dosen Pengampu</th>
                <th style="width: 10%;">Pert. Ke</th>
                <th style="width: 20%;">Materi Pokok</th>
            </tr>
        </thead>
        <tbody>
            @forelse($courses as $index => $course)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $course->nama }}</strong><br>
                        <span style="font-size: 8pt; color: #4b5563;">{{ $course->kode }}</span>
                    </td>
                    <td>{{ $course->dosen->nama ?? '-' }}</td>
                    <td class="text-center">{{ $course->pivot->meeting_number }}</td>
                    <td>{{ $course->pivot->title ?: 'Sesuai RPS' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center"><em>Tidak ada mata kuliah yang didaftarkan pada info pekanan ini.</em></td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Persyaratan & Ketentuan -->
    <div class="section-title">B. Ketentuan dan Pemenuhan Tugas</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Persyaratan Forum Diskusi</th>
                <th>Tugas Terstruktur</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center">Wajib memposting <strong>{{ $digest->forum_posts_required }}x</strong> pada Forum</td>
                <td class="text-center"><strong>{{ $digest->has_structured_task ? 'TERDAPAT TUGAS' : 'TIDAK ADA TUGAS' }}</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Catatan Tambahan -->
    <div class="notes-box">
        <strong>PEMBERITAHUAN MAHASISWA:</strong>
        Materi untuk seluruh mata kuliah di atas telah terunggah dan dapat diakses melalui platform Mentari E-Learning. 
        Mahasiswa diwajibkan untuk login dan membaca seluruh materi yang disediakan. Untuk mendapatkan status kehadiran yang valid pada pertemuan pekan ini, mahasiswa mutlak diwajibkan untuk menanggapi/mensubmit forum diskusi sesuai dengan ketentuan (minimal {{ $digest->forum_posts_required }} tanggapan). Batas waktu submit forum diskusi mengacu pada jadwal yang tertera di sistem e-learning.
    </div>

    <!-- Tanda Tangan & Visual Analytics -->
    <div class="signature-section">
        <table class="signature-table">
            <tr>
                <td style="text-align: left; vertical-align: top;">
                    @if(!empty($qrcode))
                        <div style="font-size: 8pt; margin-bottom: 4px;">Verifikasi Dokumen:</div>
                        <img src="{{ $qrcode }}" class="qr-box" alt="QR Code">
                    @endif
                </td>
                <td style="text-align: center; vertical-align: top;">
                    @if(!empty($chartBase64))
                        <div style="font-size: 8pt; margin-bottom: 4px;">Persentase Komponen:</div>
                        <img src="{{ $chartBase64 }}" alt="Chart" style="height: 90px; width: auto;">
                    @else
                        &nbsp;
                    @endif
                </td>
                <td style="text-align: right; vertical-align: top;">
                    Tangerang Selatan, {{ now()->translatedFormat('d F Y') }}<br>
                    <strong>Dibuat & Diverifikasi Oleh,</strong>
                    <div class="sign-area"></div>
                    <div class="sign-name">{{ $generatedBy }}</div>
                    <div>Administrator Mentari</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-left">
            Dokumen: <strong>Info Pekanan V2 (Many-to-Many)</strong> | UUID: {{ mb_strtoupper(substr(md5($digest->id . $digest->created_at), 0, 8)) }}<br>
            Dicetak pada: {{ $generatedAt->translatedFormat('d F Y H:i:s') }} WIB
        </div>
        <div class="footer-right">
            Halaman <span class="page-number"></span>
        </div>
    </div>

</body>
</html>
