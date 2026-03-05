<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Diagram UML - {{ $menuName }}</title>
    <style>
        @page {
            margin: 36px 36px 44px 36px;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #0f172a;
            line-height: 1.45;
            margin: 0;
        }
        .header {
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 18px;
            background: #f8fafc;
        }
        .title {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 4px 0;
            color: #1e293b;
        }
        .subtitle {
            margin: 0;
            font-size: 11px;
            color: #475569;
        }
        .meta {
            margin-top: 10px;
            font-size: 10px;
            color: #64748b;
        }
        .meta span {
            margin-right: 10px;
        }
        .section {
            margin-bottom: 14px;
        }
        .section-title {
            font-size: 12px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #334155;
        }
        .diagram-box {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 14px;
            background: #ffffff;
            text-align: center;
        }
        .diagram-box img {
            max-width: 100%;
            height: auto;
        }
        .code {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 10px;
            background: #f8fafc;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 9px;
            color: #1e293b;
        }
        .footer {
            margin-top: 18px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 9px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Dokumentasi UML Dosen - {{ $menuName }}</h1>
        <p class="subtitle">Laporan diagram untuk analisis arsitektur dan alur sistem.</p>
        <div class="meta">
            <span><strong>Jenis Diagram:</strong> {{ $diagramType }}</span>
            <span><strong>Dibuat:</strong> {{ $generatedAt }}</span>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Diagram Preview</h2>
        <div class="diagram-box">
            <img src="{{ $imageDataUri }}" alt="Diagram UML {{ $diagramType }}">
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Source PlantUML</h2>
        <div class="code">{{ $sourceCode }}</div>
    </div>

    <div class="footer">
        Dokumen ini dihasilkan otomatis oleh Sistem Dokumentasi UML Dosen.
    </div>
</body>
</html>
