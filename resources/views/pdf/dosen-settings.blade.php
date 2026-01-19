<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pengaturan Dosen - {{ $dosen->nama }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10px; line-height: 1.4; color: #333; }
        .container { padding: 15px 20px; }
        .header { display: table; width: 100%; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 15px; }
        .header-logo { display: table-cell; width: 60px; vertical-align: middle; }
        .header-logo img { width: 50px; height: auto; }
        .header-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
        .header-logo-right { display: table-cell; width: 60px; vertical-align: middle; text-align: right; }
        .header-logo-right img { width: 50px; height: auto; }
        .university-name { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #1a365d; }
        .faculty-name { font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .address { font-size: 8px; margin-top: 3px; }
        .title { text-align: center; margin: 15px 0; }
        .title h1 { font-size: 13px; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
        .subtitle { font-size: 10px; margin-top: 5px; }
        .info-section { margin-bottom: 15px; }
        .info-table { width: 100%; font-size: 9px; }
        .info-table td { padding: 2px 0; vertical-align: top; }
        .info-table td:first-child { width: 120px; font-weight: bold; }
        .info-table td:nth-child(2) { width: 10px; }
        .section-title { font-size: 11px; font-weight: bold; margin: 15px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 3px; color: #1a365d; }
        .settings-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9px; }
        .settings-table th, .settings-table td { border: 1px solid #333; padding: 5px 3px; }
        .settings-table th { background-color: #1a365d; color: white; font-weight: bold; text-align: center; }
        .settings-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
        .badge { padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: bold; }
        .badge-success { background-color: #d1fae5; color: #065f46; }
        .badge-danger { background-color: #fee2e2; color: #991b1b; }
        .badge-info { background-color: #dbeafe; color: #1e40af; }
        .signature-section { margin-top: 25px; text-align: right; }
        .signature-box { display: inline-block; text-align: center; min-width: 160px; }
        .signature-space { height: 45px; }
        .signature-name { font-weight: bold; text-decoration: underline; }
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; text-align: center; font-size: 7px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-logo">
                @if(file_exists(public_path('images/logo-unpam.png')))
                    <img src="{{ public_path('images/logo-unpam.png') }}" alt="Logo UNPAM">
                @endif
            </div>
            <div class="header-text">
                <div class="university-name">Universitas Pamulang</div>
                <div class="faculty-name">Fakultas Ilmu Komputer</div>
                <div style="font-size: 10px; font-weight: bold;">Jurusan Teknik Informatika</div>
                <div class="address">
                    Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan, Banten 15417<br>
                    Telp: (021) 7412566 | Email: fikom@unpam.ac.id
                </div>
            </div>
            <div class="header-logo-right">
                @if(file_exists(public_path('images/logo-sasmita.png')))
                    <img src="{{ public_path('images/logo-sasmita.png') }}" alt="Logo Sasmita">
                @endif
            </div>
        </div>

        <div class="title">
            <h1>Laporan Pengaturan Dosen</h1>
            <div class="subtitle">Konfigurasi Sistem Presensi</div>
        </div>

        <div class="info-section">
            <table class="info-table">
                <tr>
                    <td>Nama Dosen</td>
                    <td>:</td>
                    <td>{{ $dosen->nama }}</td>
                </tr>
                <tr>
                    <td>NIDN</td>
                    <td>:</td>
                    <td>{{ $dosen->nidn }}</td>
                </tr>
                <tr>
                    <td>Email</td>
                    <td>:</td>
                    <td>{{ $dosen->email }}</td>
                </tr>
                <tr>
                    <td>Tanggal Ekspor</td>
                    <td>:</td>
                    <td>{{ $exported_at }}</td>
                </tr>
            </table>
        </div>

        <div class="section-title">I. PENGATURAN UMUM</div>
        <table class="settings-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th>Pengaturan</th>
                    <th style="width: 150px;">Nilai</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;">1</td>
                    <td>Bahasa Antarmuka</td>
                    <td style="text-align: center;">
                        <span class="badge badge-info">
                            {{ $settings['general']['language'] === 'id' ? 'Bahasa Indonesia' : 'English' }}
                        </span>
                    </td>
                    <td>Bahasa yang digunakan untuk antarmuka sistem</td>
                </tr>
                <tr>
                    <td style="text-align: center;">2</td>
                    <td>Zona Waktu</td>
                    <td style="text-align: center;">{{ $settings['general']['timezone'] }}</td>
                    <td>Zona waktu untuk tampilan waktu di sistem</td>
                </tr>
                <tr>
                    <td style="text-align: center;">3</td>
                    <td>Format Tanggal</td>
                    <td style="text-align: center;">{{ $settings['general']['dateFormat'] }}</td>
                    <td>Format tampilan tanggal di seluruh sistem</td>
                </tr>
            </tbody>
        </table>

        <div class="section-title">II. PENGATURAN PENGAJARAN</div>
        <table class="settings-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th>Pengaturan</th>
                    <th style="width: 150px;">Status</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;">1</td>
                    <td>Persetujuan Otomatis Kehadiran</td>
                    <td style="text-align: center;">
                        <span class="badge {{ $settings['teaching']['autoApproveAttendance'] ? 'badge-success' : 'badge-danger' }}">
                            {{ $settings['teaching']['autoApproveAttendance'] ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td>Otomatis menyetujui kehadiran mahasiswa tanpa verifikasi manual</td>
                </tr>
                <tr>
                    <td style="text-align: center;">2</td>
                    <td>Mode Penilaian Ketat</td>
                    <td style="text-align: center;">
                        <span class="badge {{ $settings['teaching']['strictGradingMode'] ? 'badge-success' : 'badge-danger' }}">
                            {{ $settings['teaching']['strictGradingMode'] ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td>Menggunakan sistem penilaian yang lebih ketat</td>
                </tr>
            </tbody>
        </table>

        <div class="section-title">III. MANAJEMEN KELAS</div>
        <table class="settings-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th>Pengaturan</th>
                    <th style="width: 150px;">Nilai</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;">1</td>
                    <td>Batas Keterlambatan</td>
                    <td style="text-align: center;">{{ $settings['classManagement']['lateLimit'] }} menit</td>
                    <td>Waktu maksimal keterlambatan yang masih diperbolehkan</td>
                </tr>
                <tr>
                    <td style="text-align: center;">2</td>
                    <td>Kehadiran Minimum</td>
                    <td style="text-align: center;">{{ $settings['classManagement']['minimumAttendance'] }}%</td>
                    <td>Persentase kehadiran minimum yang diperlukan mahasiswa</td>
                </tr>
            </tbody>
        </table>

        <div class="section-title">IV. PENGATURAN NOTIFIKASI</div>
        <table class="settings-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th>Pengaturan</th>
                    <th style="width: 150px;">Status</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;">1</td>
                    <td>Notifikasi Kehadiran Baru</td>
                    <td style="text-align: center;">
                        <span class="badge {{ $settings['notifications']['emailNewAttendance'] ? 'badge-success' : 'badge-danger' }}">
                            {{ $settings['notifications']['emailNewAttendance'] ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td>Menerima email saat mahasiswa melakukan absensi</td>
                </tr>
                <tr>
                    <td style="text-align: center;">2</td>
                    <td>Notifikasi Pengajuan Izin</td>
                    <td style="text-align: center;">
                        <span class="badge {{ $settings['notifications']['emailPermitRequest'] ? 'badge-success' : 'badge-danger' }}">
                            {{ $settings['notifications']['emailPermitRequest'] ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td>Menerima email saat ada pengajuan izin/sakit dari mahasiswa</td>
                </tr>
            </tbody>
        </table>

        <div class="section-title">V. PENGATURAN PRIVASI</div>
        <table class="settings-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th>Pengaturan</th>
                    <th style="width: 150px;">Status</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;">1</td>
                    <td>Profil Publik</td>
                    <td style="text-align: center;">
                        <span class="badge {{ $settings['privacy']['publicProfile'] ? 'badge-success' : 'badge-danger' }}">
                            {{ $settings['privacy']['publicProfile'] ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td>Menampilkan profil Anda kepada mahasiswa</td>
                </tr>
                <tr>
                    <td style="text-align: center;">2</td>
                    <td>Analitik Anonim</td>
                    <td style="text-align: center;">
                        <span class="badge {{ $settings['privacy']['anonymousAnalytics'] ? 'badge-success' : 'badge-danger' }}">
                            {{ $settings['privacy']['anonymousAnalytics'] ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td>Mengizinkan pengumpulan data anonim untuk peningkatan layanan</td>
                </tr>
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box">
                <p>Tangerang Selatan, {{ \Carbon\Carbon::now()->timezone('Asia/Jakarta')->format('d F Y') }}</p>
                <p style="margin-top: 5px;">Dosen Pengampu,</p>
                <div class="signature-space"></div>
                <p class="signature-name">{{ $dosen->nama }}</p>
                <p style="font-size: 8px; margin-top: 2px;">NIDN: {{ $dosen->nidn }}</p>
            </div>
        </div>

        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh Sistem Presensi UNPAM</p>
            <p>Dicetak pada: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</p>
        </div>
    </div>
</body>
</html>
