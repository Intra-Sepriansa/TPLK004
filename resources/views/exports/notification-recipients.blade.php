<!DOCTYPE html>
<html>
<head>
    <title>Penerima Notifikasi</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; }
        .info { margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f3f4f6; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Laporan Penerima Notifikasi</div>
    </div>
    
    <div class="info">
        <strong>Judul:</strong> {{ $notification->title }}<br>
        <strong>Pesan:</strong> {{ \Str::limit($notification->message, 100) }}<br>
        <strong>Tipe:</strong> {{ ucfirst($notification->type) }}<br>
        <strong>Dibuat Pada:</strong> {{ $notification->created_at->format('d/m/Y H:i') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIM/NIDN</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Waktu Baca</th>
            </tr>
        </thead>
        <tbody>
            @foreach($recipients as $index => $recipient)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $recipient['name'] }}</td>
                <td>{{ $recipient['identifier'] }}</td>
                <td>{{ $recipient['type'] }}</td>
                <td>{{ $recipient['status'] }}</td>
                <td>{{ $recipient['read_at'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
