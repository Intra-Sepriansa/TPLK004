# RPS Quick Fill

Folder ini dipakai untuk menyimpan detail RPS per mata kuliah aktif yang
sekarang dipakai aplikasi. Daftar folder sudah disesuaikan dengan data matkul
baru dari `database/seeders/DosenSeeder.php`, bukan data lama dari
`DatabaseSeeder`.

## Aturan Isi

- Gunakan `mode` dengan salah satu nilai: `offline`, `online`, atau `hybrid`.
- Untuk quick mode absensi, yang diprioritaskan adalah pertemuan dengan
  `mode: "offline"`.
- `topik` dipakai untuk auto-fill nama sesi.
- `deskripsi` dipakai untuk auto-fill deskripsi sesi.
- Gunakan `kode_mata_kuliah` sebagai identitas utama agar tidak tergantung ID
  database yang bisa berubah.

## Struktur File

Setiap folder mata kuliah punya file `rps.json` dengan format:

```json
{
  "kode_mata_kuliah": "22TIF0323",
  "nama_mata_kuliah": "REKAYASA PERANGKAT LUNAK",
  "kelas": "06TPLK004",
  "sks": 3,
  "catatan": "",
  "pertemuan": [
    {
      "pertemuan_ke": 1,
      "mode": "offline",
      "topik": "Pengenalan mata kuliah",
      "deskripsi": "Kontrak kuliah, ruang lingkup materi, dan penjelasan penilaian."
    }
  ]
}
```

## Daftar Folder Aktif

- `22TIF0323-rekayasa-perangkat-lunak`
- `22TIF0353-pemrograman-ii`
- `22TIF2012-sistem-pendukung-keputusan`
- `22TIF3012-teknik-kompilasi`
- `22TIF0443-mobile-programming`
- `22TIF0363-basis-data-ii`
- `22TIF0342-teknologi-internet-of-things`
- `22TIF0332-kerja-praktek`
