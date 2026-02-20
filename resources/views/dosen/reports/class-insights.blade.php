<!DOCTYPE html>
<html>
<head>
    <title>Laporan Class Insights - {{ $course->nama }}</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .summary { margin-bottom: 20px; }
        .summary p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Class Insights</h2>
        <h3>{{ $course->nama }} ({{ $course->kode ?? '-' }})</h3>
        <p>Dosen: {{ $dosen->nama }} | Tanggal: {{ $date }}</p>
    </div>

    <div class="summary">
        <h4>Ringkasan</h4>
        <p>Total Mahasiswa: {{ $insights['total_students'] }}</p>
        <p>Total Sesi: {{ $insights['total_sessions'] }} ({{ $insights['completed_sessions'] }} Selesai)</p>
        <p>Rata-rata Kehadiran: {{ $insights['average_attendance_rate'] }}%</p>
        <p>Mahasiswa At-Risk (< 75%): {{ $insights['at_risk_students'] }}</p>
    </div>

    <h4>Detail Pertemuan</h4>
    <table class="table">
        <thead>
            <tr>
                <th>Sesi</th>
                <th>Tanggal</th>
                <th>Kehadiran (%)</th>
                <th>Hadir</th>
                <th>Telat</th>
                <th>Absen</th>
            </tr>
        </thead>
        <tbody>
            @foreach($insights['attendance_by_session'] as $session)
            <tr>
                <td>{{ $session['session_number'] }}</td>
                <td>{{ $session['date'] }}</td>
                <td>{{ $session['attendance_rate'] }}%</td>
                <td>{{ $session['present'] }}</td>
                <td>{{ $session['late'] }}</td>
                <td>{{ $session['absent'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h4>Top Performers</h4>
    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIM</th>
                <th>Kehadiran (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($insights['top_performers'] as $index => $student)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $student['nama'] }}</td>
                <td>{{ $student['nim'] }}</td>
                <td>{{ $student['attendance_rate'] }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
