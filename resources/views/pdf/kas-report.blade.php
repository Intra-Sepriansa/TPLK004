<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; }
        .container { padding: 20px; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
        .header h1 { font-size: 18px; color: #1e40af; margin-bottom: 5px; }
        .header p { color: #64748b; font-size: 12px; }
        .summary-box { background: #f1f5f9; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .summary-grid { display: table; width: 100%; }
        .summary-item { display: table-cell; text-align: center; padding: 10px; }
        .summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
        .summary-value { font-size: 16px; font-weight: bold; margin-top: 5px; }
        .summary-value.income { color: #059669; }
        .summary-value.expense { color: #dc2626; }
        .summary-value.balance { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .income-text { color: #059669; }
        .expense-text { color: #dc2626; }
        .date-header { background: #e0e7ff; padding: 8px 10px; font-weight: bold; color: #3730a3; margin-top: 15px; margin-bottom: 5px; border-radius: 4px; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
        .badge-income { background: #d1fae5; color: #059669; }
        .badge-expense { background: #fee2e2; color: #dc2626; }
        .total-row { background: #1e40af !important; color: white; font-weight: bold; }
        .total-row td { border: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $title }}</h1>
            <p>{{ $subtitle }}</p>
            <p style="margin-top: 5px;">Dicetak: {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y H:i') }} WIB</p>
        </div>

        @if($type === 'pertemuan')
            {{-- Single Pertemuan Report --}}
            <div class="summary-box">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Uang Masuk</div>
                        <div class="summary-value income">Rp {{ number_format($income, 0, ',', '.') }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Uang Keluar</div>
                        <div class="summary-value expense">Rp {{ number_format($expense, 0, ',', '.') }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Saldo Pertemuan</div>
                        <div class="summary-value balance">Rp {{ number_format($balance, 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>

            <h3 style="margin-bottom: 10px; color: #1e40af;">Detail Transaksi</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 15%;">Jenis</th>
                        <th style="width: 35%;">Keterangan</th>
                        <th style="width: 20%;" class="text-right">Uang Masuk</th>
                        <th style="width: 20%;" class="text-right">Uang Keluar</th>
                    </tr>
                </thead>
                <tbody>
                    @php $no = 1; @endphp
                    @foreach($transactions as $t)
                        <tr>
                            <td class="text-center">{{ $no++ }}</td>
                            <td>
                                <span class="badge {{ $t->type === 'income' ? 'badge-income' : 'badge-expense' }}">
                                    {{ $t->type === 'income' ? 'Masuk' : 'Keluar' }}
                                </span>
                            </td>
                            <td>
                                @if($t->type === 'income' && $t->mahasiswa)
                                    {{ $t->mahasiswa->nama }} ({{ $t->mahasiswa->nim }})
                                @else
                                    {{ $t->description }}
                                @endif
                            </td>
                            <td class="text-right income-text">
                                @if($t->type === 'income' && $t->status === 'paid')
                                    Rp {{ number_format($t->amount, 0, ',', '.') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-right expense-text">
                                @if($t->type === 'expense')
                                    Rp {{ number_format($t->amount, 0, ',', '.') }}
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3" class="text-right">TOTAL</td>
                        <td class="text-right">Rp {{ number_format($income, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($expense, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>

        @else
            {{-- Keseluruhan / Monthly Report --}}
            <div class="summary-box">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Uang Masuk</div>
                        <div class="summary-value income">Rp {{ number_format($total_income, 0, ',', '.') }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Uang Keluar</div>
                        <div class="summary-value expense">Rp {{ number_format($total_expense, 0, ',', '.') }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Saldo Akhir</div>
                        <div class="summary-value balance">Rp {{ number_format($final_balance, 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>

            <h3 style="margin-bottom: 10px; color: #1e40af;">Rekap Per Pertemuan</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 30%;">Tanggal Pertemuan</th>
                        <th style="width: 20%;" class="text-right">Uang Masuk</th>
                        <th style="width: 20%;" class="text-right">Uang Keluar</th>
                        <th style="width: 25%;" class="text-right">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    @php $no = 1; @endphp
                    @foreach($ledger as $item)
                        <tr>
                            <td class="text-center">{{ $no++ }}</td>
                            <td>{{ $item['display_date'] }}</td>
                            <td class="text-right income-text">Rp {{ number_format($item['income'], 0, ',', '.') }}</td>
                            <td class="text-right expense-text">Rp {{ number_format($item['expense'], 0, ',', '.') }}</td>
                            <td class="text-right" style="font-weight: bold;">Rp {{ number_format($item['balance'], 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="2" class="text-right">TOTAL</td>
                        <td class="text-right">Rp {{ number_format($total_income, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($total_expense, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($final_balance, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>

            <h3 style="margin-bottom: 10px; margin-top: 25px; color: #1e40af;">Detail Semua Transaksi</h3>
            @foreach($ledger as $item)
                <div class="date-header">{{ $item['display_date'] }}</div>
                <table style="margin-bottom: 10px;">
                    <thead>
                        <tr>
                            <th style="width: 10%;">Jenis</th>
                            <th style="width: 50%;">Keterangan</th>
                            <th style="width: 20%;" class="text-right">Uang Masuk</th>
                            <th style="width: 20%;" class="text-right">Uang Keluar</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($item['transactions'] as $t)
                            <tr>
                                <td>
                                    <span class="badge {{ $t->type === 'income' ? 'badge-income' : 'badge-expense' }}">
                                        {{ $t->type === 'income' ? 'Masuk' : 'Keluar' }}
                                    </span>
                                </td>
                                <td>
                                    @if($t->type === 'income' && $t->mahasiswa)
                                        {{ $t->mahasiswa->nama }}
                                    @else
                                        {{ $t->description }}
                                    @endif
                                </td>
                                <td class="text-right income-text">
                                    @if($t->type === 'income' && $t->status === 'paid')
                                        Rp {{ number_format($t->amount, 0, ',', '.') }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td class="text-right expense-text">
                                    @if($t->type === 'expense')
                                        Rp {{ number_format($t->amount, 0, ',', '.') }}
                                    @else
                                        -
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endforeach
        @endif

        <div class="footer">
            <p>Laporan Keuangan Kas Kelas 06TPLK004 - Fakultas Ilmu Komputer - Teknik Informatika</p>
            <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
        </div>
    </div>
</body>
</html>
