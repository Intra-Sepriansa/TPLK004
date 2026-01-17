<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class HelpCenterController extends Controller
{
    protected const CACHE_TTL = 3600;

    /**
     * Get all FAQs organized by category.
     */
    public function faqs(Request $request): JsonResponse
    {
        $faqs = $this->getAllFaqs();

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Get FAQs for a specific category.
     */
    public function faqsByCategory(Request $request, string $category): JsonResponse
    {
        $faqs = $this->getAllFaqs();
        $categoryFaqs = collect($faqs)->firstWhere('id', $category);

        if (!$categoryFaqs) {
            return response()->json([
                'success' => false,
                'error' => 'Category not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $categoryFaqs,
        ]);
    }

    /**
     * Search FAQs and documentation.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'faqs' => [],
                    'guides' => [],
                ],
            ]);
        }

        $faqs = $this->searchFaqs($query);
        
        return response()->json([
            'success' => true,
            'data' => [
                'faqs' => $faqs,
                'query' => $query,
                'count' => count($faqs),
            ],
        ]);
    }

    /**
     * Get troubleshooting guides.
     */
    public function troubleshooting(Request $request): JsonResponse
    {
        $guides = $this->getTroubleshootingGuides();

        return response()->json([
            'success' => true,
            'data' => $guides,
        ]);
    }

    /**
     * Submit feedback or question.
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:question,bug,suggestion,other',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'email' => 'sometimes|email',
        ]);

        // In a real implementation, this would save to database or send email
        // For now, we just acknowledge receipt

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully. We will respond within 24 hours.',
            'data' => [
                'ticket_id' => 'HLP-' . strtoupper(Str::random(8)),
                'submitted_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get contact information.
     */
    public function contact(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'email' => 'support@absensi.unpam.ac.id',
                'whatsapp' => '+62 812-3456-7890',
                'support_hours' => 'Senin - Jumat, 08:00 - 17:00 WIB',
                'response_time' => '1-2 hari kerja',
            ],
        ]);
    }

    /**
     * Get all FAQs.
     */
    protected function getAllFaqs(): array
    {
        return Cache::remember('help_center_faqs', self::CACHE_TTL, function () {
            return $this->getDefaultFaqs();
        });
    }

    /**
     * Search FAQs by query.
     */
    protected function searchFaqs(string $query): array
    {
        $query = Str::lower($query);
        $allFaqs = $this->getAllFaqs();
        $results = [];

        foreach ($allFaqs as $category) {
            foreach ($category['faqs'] ?? [] as $faq) {
                if (Str::contains(Str::lower($faq['question']), $query) ||
                    Str::contains(Str::lower($faq['answer']), $query)) {
                    $results[] = array_merge($faq, [
                        'category' => $category['name'],
                        'category_id' => $category['id'],
                    ]);
                }
            }
        }

        return $results;
    }

    /**
     * Get troubleshooting guides.
     */
    protected function getTroubleshootingGuides(): array
    {
        return Cache::remember('help_center_troubleshooting', self::CACHE_TTL, function () {
            return $this->getDefaultTroubleshootingGuides();
        });
    }

    /**
     * Get default FAQs.
     */
    protected function getDefaultFaqs(): array
    {
        return [
            [
                'id' => 'absensi',
                'name' => 'Absensi',
                'icon' => 'QrCode',
                'faqs' => [
                    [
                        'id' => 'faq-1',
                        'question' => 'Bagaimana cara melakukan absensi?',
                        'answer' => 'Untuk melakukan absensi: 1) Buka menu Absen, 2) Scan QR code yang ditampilkan dosen, 3) Ambil foto selfie untuk verifikasi, 4) Klik Konfirmasi. Pastikan Anda berada di lokasi yang benar dan wajah terlihat jelas.',
                        'tags' => ['absen', 'qr code', 'selfie'],
                    ],
                    [
                        'id' => 'faq-2',
                        'question' => 'QR code tidak bisa di-scan, apa yang harus dilakukan?',
                        'answer' => 'Pastikan: 1) Kamera HP dalam kondisi baik, 2) Pencahayaan cukup, 3) QR code tidak blur atau terpotong, 4) Jarak scan tidak terlalu jauh/dekat. Jika masih bermasalah, minta dosen untuk refresh QR code.',
                        'tags' => ['qr code', 'scan', 'error'],
                    ],
                    [
                        'id' => 'faq-3',
                        'question' => 'Selfie saya ditolak, mengapa?',
                        'answer' => 'Selfie bisa ditolak karena: 1) Wajah tidak terlihat jelas, 2) Pencahayaan kurang, 3) Menggunakan foto orang lain, 4) Wajah tertutup masker/kacamata hitam. Pastikan wajah terlihat jelas dan pencahayaan cukup.',
                        'tags' => ['selfie', 'verifikasi', 'ditolak'],
                    ],
                ],
            ],
            [
                'id' => 'tugas',
                'name' => 'Tugas',
                'icon' => 'ClipboardList',
                'faqs' => [
                    [
                        'id' => 'faq-4',
                        'question' => 'Bagaimana cara mengumpulkan tugas?',
                        'answer' => 'Untuk mengumpulkan tugas: 1) Buka menu Informasi Tugas, 2) Pilih tugas yang ingin dikumpulkan, 3) Baca instruksi dengan teliti, 4) Upload file tugas, 5) Klik Submit. Pastikan format file sesuai ketentuan.',
                        'tags' => ['tugas', 'submit', 'upload'],
                    ],
                    [
                        'id' => 'faq-5',
                        'question' => 'Apakah bisa mengumpulkan tugas setelah deadline?',
                        'answer' => 'Tergantung kebijakan dosen. Beberapa tugas mengizinkan late submission dengan pengurangan nilai, beberapa tidak. Cek detail tugas untuk informasi lebih lanjut.',
                        'tags' => ['deadline', 'terlambat', 'late'],
                    ],
                ],
            ],
            [
                'id' => 'izin',
                'name' => 'Izin & Sakit',
                'icon' => 'FileCheck',
                'faqs' => [
                    [
                        'id' => 'faq-6',
                        'question' => 'Bagaimana cara mengajukan izin tidak hadir?',
                        'answer' => 'Untuk mengajukan izin: 1) Buka menu Izin/Sakit, 2) Klik Ajukan Izin Baru, 3) Pilih jenis izin (Sakit/Izin), 4) Isi alasan dan tanggal, 5) Upload bukti jika diperlukan, 6) Klik Kirim.',
                        'tags' => ['izin', 'sakit', 'tidak hadir'],
                    ],
                    [
                        'id' => 'faq-7',
                        'question' => 'Dokumen apa yang diperlukan untuk izin sakit?',
                        'answer' => 'Untuk izin sakit, diperlukan surat keterangan dokter atau foto resep obat. Dokumen harus jelas terbaca dan mencantumkan tanggal yang sesuai dengan izin.',
                        'tags' => ['surat dokter', 'bukti', 'sakit'],
                    ],
                ],
            ],
            [
                'id' => 'akun',
                'name' => 'Akun & Profil',
                'icon' => 'UserCircle',
                'faqs' => [
                    [
                        'id' => 'faq-8',
                        'question' => 'Bagaimana cara mengubah password?',
                        'answer' => 'Untuk mengubah password: 1) Buka menu Pengaturan, 2) Pilih Keamanan, 3) Klik Ubah Password, 4) Masukkan password lama dan password baru, 5) Klik Simpan.',
                        'tags' => ['password', 'ubah', 'keamanan'],
                    ],
                    [
                        'id' => 'faq-9',
                        'question' => 'Bagaimana cara mengubah foto profil?',
                        'answer' => 'Untuk mengubah foto profil: 1) Buka menu Profil, 2) Klik foto profil atau ikon edit, 3) Pilih foto baru dari galeri, 4) Crop jika diperlukan, 5) Klik Simpan.',
                        'tags' => ['foto', 'profil', 'avatar'],
                    ],
                ],
            ],
            [
                'id' => 'teknis',
                'name' => 'Masalah Teknis',
                'icon' => 'Settings',
                'faqs' => [
                    [
                        'id' => 'faq-10',
                        'question' => 'Aplikasi tidak bisa dibuka atau error, apa yang harus dilakukan?',
                        'answer' => 'Coba langkah berikut: 1) Refresh halaman (F5), 2) Clear cache browser, 3) Coba browser lain, 4) Periksa koneksi internet, 5) Jika masih error, hubungi support.',
                        'tags' => ['error', 'tidak bisa', 'masalah'],
                    ],
                    [
                        'id' => 'faq-11',
                        'question' => 'Data saya tidak tersimpan, bagaimana?',
                        'answer' => 'Pastikan: 1) Koneksi internet stabil, 2) Tidak ada error saat menyimpan, 3) Tunggu loading selesai sebelum menutup halaman. Jika data hilang, hubungi support dengan detail waktu dan aktivitas.',
                        'tags' => ['data', 'hilang', 'tidak tersimpan'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get default troubleshooting guides.
     */
    protected function getDefaultTroubleshootingGuides(): array
    {
        return [
            [
                'id' => 'ts-1',
                'title' => 'QR Code Tidak Bisa Di-scan',
                'problem' => 'QR code tidak terdeteksi atau scan gagal terus menerus',
                'solution' => [
                    'Pastikan kamera HP berfungsi dengan baik',
                    'Periksa pencahayaan ruangan - hindari backlight',
                    'Bersihkan lensa kamera dari debu atau kotoran',
                    'Pastikan QR code tidak blur atau terpotong',
                    'Coba atur jarak scan (tidak terlalu dekat/jauh)',
                    'Minta dosen untuk refresh QR code',
                    'Restart aplikasi dan coba lagi',
                ],
                'relatedGuides' => ['mahasiswa-absen'],
            ],
            [
                'id' => 'ts-2',
                'title' => 'Selfie Verifikasi Ditolak',
                'problem' => 'Foto selfie selalu ditolak oleh sistem',
                'solution' => [
                    'Pastikan wajah terlihat jelas dan tidak tertutup',
                    'Lepas masker, kacamata hitam, atau topi',
                    'Cari tempat dengan pencahayaan yang cukup',
                    'Hindari backlight (cahaya dari belakang)',
                    'Posisikan wajah di tengah frame',
                    'Jangan gunakan foto orang lain',
                    'Jika masih gagal, hubungi dosen untuk verifikasi manual',
                ],
                'relatedGuides' => ['mahasiswa-absen', 'dosen-verify'],
            ],
            [
                'id' => 'ts-3',
                'title' => 'Tidak Bisa Login',
                'problem' => 'Gagal login dengan NIM dan password',
                'solution' => [
                    'Periksa kembali NIM - pastikan tidak ada typo',
                    'Periksa password - perhatikan huruf besar/kecil',
                    'Pastikan Caps Lock tidak aktif',
                    'Coba reset password jika lupa',
                    'Clear cache browser dan coba lagi',
                    'Hubungi admin jika akun terkunci',
                ],
                'relatedGuides' => [],
            ],
            [
                'id' => 'ts-4',
                'title' => 'Upload File Gagal',
                'problem' => 'File tugas tidak bisa di-upload',
                'solution' => [
                    'Periksa ukuran file - maksimal 10MB',
                    'Periksa format file - sesuaikan dengan ketentuan',
                    'Pastikan koneksi internet stabil',
                    'Coba compress file jika terlalu besar',
                    'Gunakan format umum (PDF, DOC, DOCX)',
                    'Refresh halaman dan coba lagi',
                ],
                'relatedGuides' => ['mahasiswa-tugas'],
            ],
        ];
    }
}
