<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\HelpFaq;
use App\Models\HelpTroubleshooting;

class HelpDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        HelpFaq::truncate();
        HelpTroubleshooting::truncate();

        // Seed FAQs
        $faqs = [
            // Umum
            [
                'category' => 'Umum',
                'question' => 'Bagaimana cara login ke sistem?',
                'answer' => 'Gunakan NIDN Anda sebagai username dan password default "dosen123". Setelah login pertama kali, segera ubah password Anda melalui menu Pengaturan untuk keamanan akun.',
                'order' => 1,
            ],
            [
                'category' => 'Umum',
                'question' => 'Apa yang harus dilakukan jika lupa password?',
                'answer' => 'Hubungi administrator sistem melalui email support@unpam.ac.id atau telepon 021-7412566. Tim support akan membantu mereset password Anda.',
                'order' => 2,
            ],
            [
                'category' => 'Umum',
                'question' => 'Bagaimana cara mengubah foto profil?',
                'answer' => 'Buka menu Profil, klik pada foto profil Anda, lalu pilih "Ubah Foto". Upload foto baru dengan format JPG/PNG maksimal 2MB.',
                'order' => 3,
            ],

            // Sesi Absensi
            [
                'category' => 'Sesi Absensi',
                'question' => 'Bagaimana cara membuat sesi absensi baru?',
                'answer' => 'Buka menu Sesi Absen, klik tombol "Buat Sesi Baru", pilih mata kuliah, tentukan waktu mulai dan durasi, lalu klik "Buat Sesi". QR code akan otomatis dibuat.',
                'order' => 1,
            ],
            [
                'category' => 'Sesi Absensi',
                'question' => 'Berapa lama durasi maksimal sesi absensi?',
                'answer' => 'Durasi maksimal sesi absensi adalah 180 menit (3 jam). Anda dapat menutup sesi lebih awal jika diperlukan.',
                'order' => 2,
            ],
            [
                'category' => 'Sesi Absensi',
                'question' => 'Apakah QR code bisa di-regenerate?',
                'answer' => 'Ya, Anda dapat me-regenerate QR code kapan saja selama sesi masih aktif. Klik tombol "Regenerate QR" pada detail sesi.',
                'order' => 3,
            ],

            // Verifikasi
            [
                'category' => 'Verifikasi',
                'question' => 'Bagaimana cara menyetujui izin mahasiswa?',
                'answer' => 'Buka menu Verifikasi, lihat daftar pengajuan izin, klik detail untuk melihat bukti, lalu klik "Setujui" atau "Tolak" dengan memberikan catatan jika diperlukan.',
                'order' => 1,
            ],
            [
                'category' => 'Verifikasi',
                'question' => 'Apa saja jenis izin yang bisa diajukan mahasiswa?',
                'answer' => 'Mahasiswa dapat mengajukan izin sakit (dengan surat dokter) atau izin keperluan lain (dengan surat keterangan). Semua pengajuan harus disertai bukti dokumen.',
                'order' => 2,
            ],

            // Penilaian
            [
                'category' => 'Penilaian',
                'question' => 'Bagaimana sistem menghitung nilai kehadiran?',
                'answer' => 'Nilai kehadiran dihitung berdasarkan persentase kehadiran: Hadir = 100%, Izin = 75%, Sakit = 75%, Alpha = 0%. Total nilai adalah rata-rata dari semua pertemuan.',
                'order' => 1,
            ],
            [
                'category' => 'Penilaian',
                'question' => 'Apakah bisa mengubah status kehadiran mahasiswa?',
                'answer' => 'Ya, Anda dapat mengubah status kehadiran melalui menu Grading. Pilih mahasiswa, klik "Override Status", lalu pilih status baru dan berikan alasan perubahan.',
                'order' => 2,
            ],
        ];

        foreach ($faqs as $faq) {
            HelpFaq::create(array_merge($faq, [
                'is_active' => true,
                'helpful_count' => rand(5, 50),
                'not_helpful_count' => rand(0, 5),
            ]));
        }

        // Seed Troubleshooting Guides
        $guides = [
            [
                'title' => 'QR Code Tidak Muncul',
                'description' => 'Solusi jika QR code tidak ditampilkan saat membuat sesi absensi',
                'category' => 'Teknis',
                'steps' => json_encode([
                    'Refresh halaman browser dengan menekan Ctrl+F5 (Windows) atau Cmd+Shift+R (Mac)',
                    'Pastikan koneksi internet Anda stabil',
                    'Coba bersihkan cache browser: Settings > Privacy > Clear browsing data',
                    'Jika masih bermasalah, coba gunakan browser lain (Chrome/Firefox)',
                    'Hubungi support jika masalah berlanjut',
                ]),
                'order' => 1,
            ],
            [
                'title' => 'Mahasiswa Tidak Bisa Scan QR',
                'description' => 'Panduan mengatasi masalah mahasiswa yang tidak bisa melakukan scan QR code',
                'category' => 'Absensi',
                'steps' => json_encode([
                    'Pastikan sesi absensi masih dalam status "Aktif"',
                    'Cek apakah mahasiswa sudah terdaftar di mata kuliah tersebut',
                    'Verifikasi bahwa mahasiswa menggunakan akun yang benar',
                    'Pastikan QR code tidak expired (regenerate jika perlu)',
                    'Cek apakah mahasiswa berada dalam radius lokasi yang ditentukan',
                ]),
                'order' => 2,
            ],
            [
                'title' => 'Data Kehadiran Tidak Tersimpan',
                'description' => 'Langkah-langkah jika data kehadiran mahasiswa tidak tersimpan',
                'category' => 'Teknis',
                'steps' => json_encode([
                    'Cek koneksi internet Anda',
                    'Pastikan sesi belum ditutup saat mahasiswa melakukan absen',
                    'Refresh halaman dan cek kembali daftar kehadiran',
                    'Cek di menu Rekapan untuk memastikan data tersimpan',
                    'Jika data hilang, hubungi administrator untuk recovery data',
                ]),
                'order' => 3,
            ],
            [
                'title' => 'Tidak Bisa Export Rekapan',
                'description' => 'Solusi jika gagal mengexport rekapan kehadiran ke PDF',
                'category' => 'Laporan',
                'steps' => json_encode([
                    'Pastikan browser Anda mengizinkan pop-up dari situs ini',
                    'Coba disable ad-blocker atau extension yang memblokir download',
                    'Gunakan browser Chrome atau Firefox versi terbaru',
                    'Cek apakah ada data yang perlu diexport (minimal 1 sesi)',
                    'Hubungi support jika masalah berlanjut',
                ]),
                'order' => 4,
            ],
            [
                'title' => 'Notifikasi Tidak Muncul',
                'description' => 'Cara mengaktifkan notifikasi sistem',
                'category' => 'Pengaturan',
                'steps' => json_encode([
                    'Buka menu Pengaturan > Notifikasi',
                    'Pastikan semua toggle notifikasi dalam keadaan aktif',
                    'Izinkan notifikasi browser: klik ikon gembok di address bar > Notifications > Allow',
                    'Cek pengaturan notifikasi di sistem operasi Anda',
                    'Refresh halaman setelah mengubah pengaturan',
                ]),
                'order' => 5,
            ],
        ];

        foreach ($guides as $guide) {
            HelpTroubleshooting::create(array_merge($guide, [
                'is_active' => true,
            ]));
        }
    }
}
