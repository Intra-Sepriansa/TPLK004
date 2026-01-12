<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Kas Kelas</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 9px; line-height: 1.3; color: #333; }
        .container { padding: 15px 20px; }
        .header { display: table; width: 100%; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 15px; }
        .header-logo { display: table-cell; width: 60px; vertical-align: middle; }
        .header-logo img { width: 50px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
        .header-logo-right { display: table-cell; width: 60px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 50px; height: auto; }
        .university-name { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #1a365d; }
        .faculty-name { font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .major-name { font-size: 10px; font-weight: bold; }
        .address { font-size: 8px; margin-top: 3px; }
        .title { text-align: center; margin: 15px 0; }
        .title h1 { font-size: 13px; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
        .subtitle { font-size: 10px; margin-top: 5px; }
        .info-section { margin-bottom: 15px; }
        .info-table td { padding: 2px 0; vertical-align: top; font-size: 10px; }
        .info-table td:first-child { width: 100px; }
        .info-table td:nth-child(2) { width: 10px; }
        .matrix-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8px; }
        .matrix-table th, .matrix-table td { border: 1px solid #333; padding: 4px 2px; text-align: center; }
        .matrix-table th { background-color: #1e40af; color: white; font-weight: bold; }
        .matrix-table th.date-col { font-size: 7px; writing-mode: horizontal-tb; min-width: 35px; }
        .matrix-table tbody tr:nth-child(even) { background-color: #f8fafc; }
        .matrix-table .name-col { text-align: left; padding-left: 5px; white-space: nowrap; }
        .matrix-table .total-col { background-color: #dbeafe; font-weight: bold; }
        .matrix-table .tunggakan-col { background-color: #fee2e2; font-weight: bold; }
        .check-paid { 
            display: inline-block;
            width: 18px;
            height: 18px;
            line-height: 18px;
            background-color: #059669;
            color: white;
            font-weight: bold;
            font-size: 11px;
            border-radius: 3px;
            text-align: center;
        }
        .check-unpaid { 
            display: inline-block;
            width: 18px;
            height: 18px;
            line-height: 18px;
            background-color: #dc2626;
            color: white;
            font-weight: bold;
            font-size: 11px;
            border-radius: 3px;
            text-align: center;
        }
        .summary-row { background-color: #1e40af !important; color: white; font-weight: bold; }
        .summary-row td { border-color: #1e40af; }
        .summary-box { background: #f1f5f9; border-radius: 8px; padding: 12px; margin: 15px 0; }
        .summary-grid { display: table; width: 100%; }
        .summary-item { display: table-cell; text-align: center; padding: 8px; }
        .summary-label { font-size: 9px; color: #64748b; text-transform: uppercase; }
        .summary-value { font-size: 14px; font-weight: bold; margin-top: 3px; }
        .summary-value.income { color: #059669; }
        .summary-value.expense { color: #dc2626; }
        .summary-value.balance { color: #2563eb; }
        .signature-section { margin-top: 25px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 160px; }
        .signature-space { height: 45px; }
        .signature-name { font-weight: bold; text-decoration: underline; }
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; text-align: center; font-size: 7px; color: #666; }
        .legend { margin: 10px 0; font-size: 9px; }
        .legend-item { display: inline-block; margin-right: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-logo">
                @if(isset($logoUnpam) && file_exists($logoUnpam))
                    <img src="{{ $logoUnpam }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="header-text">
                <div class="university-name">Universitas Pamulang</div>
                <div class="faculty-name">Fakultas Ilmu Komputer</div>
                <div class="major-name">Jurusan Teknik Informatika</div>
                <div class="address">
                    Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan, Banten 15417<br>
                    Telp: (021) 7412566 | Email: fikom@unpam.ac.id
                </div>
            </div>
            <div class="header-logo-right">
                @if(isset($logoSasmita) && file_exists($logoSasmita))
                    <img src="{{ $logoSasmita }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <div class="title">
            <h1>Laporan Kas Kelas</h1>
            <div class="subtitle">{{ $subtitle ?? 'Periode Keseluruhan' }}</div>
        </div>

        <div class="info-section">
            <table class="info-table">
                <tr>
                    <td>Kelas</td>
                    <td>:</td>
                    <td><strong>06TPLK004</strong></td>
                </tr>
                <tr>
                    <td>Iuran Per Minggu</td>
                    <td>:</td>
                    <td><strong>Rp {{ number_format($kasAmount, 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td>Total Pertemuan</td>
                    <td>:</td>
                    <td><strong>{{ count($pertemuanDates) }} Pertemuan</strong></td>
                </tr>
            </table>
        </div>

        <div class="summary-box">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Total Terkumpul</div>
                    <div class="summary-value income">Rp {{ number_format($totalPaid, 0, ',', '.') }}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Total Tunggakan</div>
                    <div class="summary-value expense">Rp {{ number_format($totalUnpaid, 0, ',', '.') }}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Pengeluaran</div>
                    <div class="summary-value expense">Rp {{ number_format($totalExpense, 0, ',', '.') }}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Saldo Kas</div>
                    <div class="summary-value balance">Rp {{ number_format($saldoKas, 0, ',', '.') }}</div>
                </div>
            </div>
        </div>

        <div class="legend">
            <span class="legend-item"><span class="check-paid">V</span> = Lunas</span>
            <span class="legend-item"><span class="check-unpaid">X</span> = Belum Bayar</span>
        </div>

        <table class="matrix-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th style="min-width: 120px;">Nama</th>
                    @foreach($pertemuanDates as $date)
                        <th class="date-col">{{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}</th>
                    @endforeach
                    <th class="total-col" style="min-width: 60px;">Total Bayar</th>
                    <th class="tunggakan-col" style="min-width: 60px;">Tunggakan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($mahasiswaMatrix as $index => $mhs)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="name-col">{{ $mhs['nama'] }}</td>
                    @foreach($pertemuanDates as $date)
                        <td>
                            @if(isset($mhs['payments'][$date]))
                                @if($mhs['payments'][$date] === 'paid')
                                    <span class="check-paid">V</span>
                                @else
                                    <span class="check-unpaid">X</span>
                                @endif
                            @else
                                <span style="color: #9ca3af;">-</span>
                            @endif
                        </td>
                    @endforeach
                    <td class="total-col">Rp {{ number_format($mhs['total_paid'], 0, ',', '.') }}</td>
                    <td class="tunggakan-col">Rp {{ number_format($mhs['tunggakan'], 0, ',', '.') }}</td>
                </tr>
                @endforeach
                <tr class="summary-row">
                    <td colspan="2" style="text-align: right; padding-right: 10px;">TOTAL</td>
                    @foreach($pertemuanDates as $date)
                        <td>{{ $dateTotals[$date] ?? 0 }}</td>
                    @endforeach
                    <td>Rp {{ number_format($totalPaid, 0, ',', '.') }}</td>
                    <td>Rp {{ number_format($totalUnpaid, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        @if(count($expenses) > 0)
        <h3 style="margin: 15px 0 10px; font-size: 11px; border-bottom: 1px solid #ddd; padding-bottom: 3px;">Riwayat Pengeluaran</h3>
        <table class="matrix-table" style="font-size: 9px;">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th style="width: 80px;">Tanggal</th>
                    <th>Keterangan</th>
                    <th style="width: 100px;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($expenses as $index => $exp)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($exp->period_date)->format('d/m/Y') }}</td>
                    <td style="text-align: left; padding-left: 5px;">{{ $exp->description }}</td>
                    <td style="color: #dc2626;">Rp {{ number_format($exp->amount, 0, ',', '.') }}</td>
                </tr>
                @endforeach
                <tr class="summary-row">
                    <td colspan="3" style="text-align: right; padding-right: 10px;">TOTAL PENGELUARAN</td>
                    <td>Rp {{ number_format($totalExpense, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
        @endif

        <div class="signature-section">
            <div class="signature-box">
                <p>{{ $tempat }}, {{ $tanggal }}</p>
                <p style="margin-top: 5px;">Bendahara Kelas,</p>
                <div class="signature-space"></div>
                <p class="signature-name">_______________________</p>
            </div>
        </div>

        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Presensi UNPAM</p>
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</p>
        </div>
    </div>
</body>
</html>
