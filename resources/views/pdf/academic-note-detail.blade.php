<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Catatan Akademik - {{ $note->title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11px;
            line-height: 1.55;
            color: #1f2937;
        }
        .container { padding: 18px 22px; }

        .header {
            display: table;
            width: 100%;
            border-bottom: 2px solid #111827;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .header-logo {
            display: table-cell;
            width: 60px;
            vertical-align: middle;
        }
        .header-logo img {
            width: 50px;
            height: auto;
        }
        .header-text {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 0 8px;
        }
        .university-name {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        .faculty-name {
            font-size: 10.5px;
            margin-top: 1px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .address {
            margin-top: 4px;
            font-size: 8px;
            color: #4b5563;
        }

        .title-box {
            border: 1px solid #d1d5db;
            background: #f9fafb;
            padding: 10px 12px;
            margin-bottom: 10px;
        }
        .title-box h1 {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .subtitle {
            font-size: 10px;
            color: #4b5563;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 10px;
        }
        .meta-table td {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            vertical-align: top;
        }
        .meta-label {
            font-weight: bold;
            color: #111827;
            width: 24%;
        }

        .section-title {
            margin-top: 10px;
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 4px;
        }

        .content-wrap {
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 12px;
            background: #ffffff;
        }
        .content-wrap h1,
        .content-wrap h2,
        .content-wrap h3,
        .content-wrap h4,
        .content-wrap h5,
        .content-wrap h6 {
            margin: 8px 0 6px;
            color: #111827;
        }
        .content-wrap p { margin-bottom: 8px; }
        .content-wrap ul,
        .content-wrap ol {
            margin: 8px 0 8px 20px;
        }
        .content-wrap li { margin-bottom: 4px; }
        .content-wrap blockquote {
            border-left: 3px solid #9ca3af;
            padding-left: 10px;
            color: #4b5563;
            margin: 8px 0;
        }
        .content-wrap code {
            background: #f3f4f6;
            padding: 1px 4px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 10px;
        }
        .content-wrap pre {
            background: #111827;
            color: #f9fafb;
            padding: 8px;
            border-radius: 4px;
            white-space: pre-wrap;
            font-size: 10px;
            margin: 8px 0;
        }
        .content-wrap a {
            color: #2563eb;
            text-decoration: underline;
        }

        .chip-wrap {
            margin-top: 6px;
        }
        .chip {
            display: inline-block;
            padding: 3px 7px;
            margin: 0 5px 5px 0;
            border: 1px solid #d1d5db;
            border-radius: 999px;
            font-size: 9px;
            background: #f9fafb;
            color: #374151;
        }

        .footer {
            margin-top: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            text-align: right;
            font-size: 8px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
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
                <div class="faculty-name">Fakultas Ilmu Komputer - Catatan Akademik Mahasiswa</div>
                <div class="address">
                    Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan, Banten 15417
                </div>
            </div>
            <div class="header-logo">
                @php
                    $logoSasmita = public_path('images/logo-sasmita.png');
                @endphp
                @if(file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <div class="title-box">
            <h1>{{ $note->title }}</h1>
            <div class="subtitle">
                Dokumen catatan pembelajaran mahasiswa - dihasilkan otomatis dari sistem akademik
            </div>
        </div>

        <table class="meta-table">
            <tr>
                <td class="meta-label">Nama Mahasiswa</td>
                <td>{{ $mahasiswa->nama }}</td>
                <td class="meta-label">NIM</td>
                <td>{{ $mahasiswa->nim }}</td>
            </tr>
            <tr>
                <td class="meta-label">Mata Kuliah</td>
                <td>{{ $note->course?->name ?? '-' }}</td>
                <td class="meta-label">Mode Kelas</td>
                <td>{{ ucfirst($note->course?->mode ?? '-') }}</td>
            </tr>
            <tr>
                <td class="meta-label">Pertemuan</td>
                <td>{{ $note->meeting_number }}</td>
                <td class="meta-label">SKS</td>
                <td>{{ $note->course?->sks ?? '-' }}</td>
            </tr>
            <tr>
                <td class="meta-label">Jumlah Kata</td>
                <td>{{ $wordCount }} kata</td>
                <td class="meta-label">Estimasi Baca</td>
                <td>{{ $readingTime }} menit</td>
            </tr>
            <tr>
                <td class="meta-label">Dibuat</td>
                <td>{{ optional($note->created_at)->format('d M Y H:i') }}</td>
                <td class="meta-label">Terakhir Update</td>
                <td>{{ optional($note->updated_at)->format('d M Y H:i') }}</td>
            </tr>
        </table>

        @if(!empty($note->tags))
            <div class="section-title">Tag Topik</div>
            <div class="chip-wrap">
                @foreach(($note->tags ?? []) as $tag)
                    <span class="chip">#{{ $tag }}</span>
                @endforeach
            </div>
        @endif

        @if(!empty($note->ai_summary))
            <div class="section-title">Ringkasan AI</div>
            <div class="content-wrap">
                {{ $note->ai_summary }}
            </div>
        @endif

        <div class="section-title">Isi Catatan</div>
        <div class="content-wrap">
            {!! $note->content !!}
        </div>

        @if(!empty($note->links))
            <div class="section-title">Referensi Link</div>
            <div class="content-wrap">
                <ul>
                    @foreach(($note->links ?? []) as $link)
                        <li><a href="{{ $link }}">{{ $link }}</a></li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="footer">
            Dokumen diunduh pada: {{ $generatedAt }} | Sistem Akademik Universitas Pamulang
        </div>
    </div>
</body>
</html>
