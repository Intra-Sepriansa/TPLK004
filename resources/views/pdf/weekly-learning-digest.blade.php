<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $digest->mataKuliah?->nama ?? $displayTitle }}</title>
    <style>
        @page { margin: 24px 28px 50px; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #1f2937; font-size: 11px; line-height: 1.55; }
        .header { display: table; width: 100%; border-bottom: 2px solid #4338ca; padding-bottom: 12px; margin-bottom: 16px; }
        .logo, .logo-right, .title { display: table-cell; vertical-align: middle; }
        .logo, .logo-right { width: 84px; text-align: center; }
        .logo img, .logo-right img { width: 64px; }
        .title { text-align: center; }
        .title h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .title p { margin: 4px 0 0; color: #475569; font-size: 10px; }
        .hero { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; }
        .hero h2 { margin: 0 0 4px; color: #312e81; font-size: 17px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 9px; font-weight: 700; margin-right: 6px; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-muted { background: #e2e8f0; color: #334155; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111827; border-left: 4px solid #7c3aed; padding-left: 10px; margin: 18px 0 10px; }
        .table { width: 100%; border-collapse: collapse; }
        .table td, .table th { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; }
        .table th { background: #f8fafc; text-align: left; width: 28%; }
        .callout { margin-top: 16px; border: 1px solid #bae6fd; background: #ecfeff; border-radius: 10px; padding: 14px; }
        .callout strong { color: #0f172a; }
        .footer { position: fixed; bottom: -34px; left: 0; right: 0; font-size: 8px; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 6px; }
        .page-number:before { content: counter(page); }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">@if(file_exists($logoUnpam))<img src="{{ $logoUnpam }}" alt="UNPAM">@endif</div>
        <div class="title">
            <h1>Info Pekanan Mentari</h1>
            <p>{{ $constants['platform_name'] }} • Universitas Pamulang</p>
        </div>
        <div class="logo-right">@if(file_exists($logoSasmita))<img src="{{ $logoSasmita }}" alt="SASMITA">@endif</div>
    </div>

    <div class="hero">
        <h2>{{ $digest->mataKuliah?->nama ?? 'Mata Kuliah' }}</h2>
        <p>{{ $displayTitle }} • Pertemuan {{ $digest->meeting_number }} • Pekan Aktif</p>
        <div style="margin-top: 8px;">
            <span class="badge {{ $digest->is_published ? 'badge-success' : 'badge-muted' }}">{{ $digest->is_published ? 'Published' : 'Draft' }}</span>
            <span class="badge badge-muted">Kelas {{ $constants['class_label'] }}</span>
            <span class="badge badge-muted">{{ $digest->semester }}</span>
        </div>
    </div>

    <div class="section-title">Ringkasan Entry</div>
    <table class="table">
        <tr><th>Mata Kuliah</th><td>{{ $digest->mataKuliah?->nama ?? '-' }}</td></tr>
        <tr><th>Dosen</th><td>{{ $digest->mataKuliah?->dosen?->nama ?? '-' }}</td></tr>
        <tr><th>Pertemuan</th><td>{{ $digest->meeting_number }}</td></tr>
        <tr><th>Judul</th><td>{{ $displayTitle }}</td></tr>
        <tr><th>Tugas Terstruktur</th><td>{{ $digest->has_structured_task ? 'Ada' : 'Tidak Ada' }}</td></tr>
        <tr><th>Aturan Kehadiran</th><td>Submit forum diskusi {{ $digest->forum_posts_required }}x</td></tr>
        <tr><th>Platform</th><td>{{ $constants['platform_name'] }}</td></tr>
        <tr><th>Portal Mentari</th><td>{{ $digest->mentari_course_url ?: '-' }}</td></tr>
        <tr><th>Periode Pekan</th><td>{{ $digest->week_start_date?->format('d M') }} - {{ $digest->week_end_date?->format('d M Y') }}</td></tr>
    </table>

    <div class="callout">
        <strong>Ketentuan mahasiswa:</strong>
        Materi sudah masuk di {{ $constants['platform_name'] }}. Mahasiswa wajib submit forum diskusi sebanyak {{ $digest->forum_posts_required }} kali untuk mendapatkan kehadiran.
    </div>

    <div class="footer">
        Digenerate {{ $generatedAt->format('d M Y H:i') }} WIB oleh {{ $generatedBy }} • Halaman <span class="page-number"></span>
    </div>
</body>
</html>
