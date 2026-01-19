/**
 * Bahasa Indonesia - Formal
 * Menggunakan bahasa yang umum digunakan di website formal Indonesia
 */

export const id = {
    // Common
    common: {
        save: 'Simpan',
        cancel: 'Batal',
        delete: 'Hapus',
        edit: 'Ubah',
        close: 'Tutup',
        back: 'Kembali',
        next: 'Selanjutnya',
        previous: 'Sebelumnya',
        search: 'Cari',
        loading: 'Memuat...',
        saving: 'Menyimpan...',
        success: 'Berhasil',
        error: 'Gagal',
        confirm: 'Konfirmasi',
        yes: 'Ya',
        no: 'Tidak',
    },

    // Settings Page
    settings: {
        title: 'Pengaturan',
        subtitle: 'Kelola Preferensi Dosen',
        description: 'Sesuaikan pengalaman mengajar Anda',
        reset: 'Atur Ulang',
        saveChanges: 'Simpan Perubahan',
        resetSuccess: 'Pengaturan berhasil diatur ulang',
        saveSuccess: 'Pengaturan berhasil disimpan',
        loadError: 'Gagal memuat pengaturan',
        saveError: 'Gagal menyimpan pengaturan',
        
        // Categories
        categories: {
            general: {
                title: 'Pengaturan Umum',
                description: 'Kelola preferensi dasar dan pengaturan regional',
            },
            teaching: {
                title: 'Pengajaran',
                description: 'Pengaturan terkait metode pengajaran dan evaluasi',
            },
            classManagement: {
                title: 'Manajemen Kelas',
                description: 'Kelola preferensi untuk pengelolaan kelas dan mahasiswa',
            },
            notifications: {
                title: 'Notifikasi',
                description: 'Kontrol bagaimana dan kapan Anda menerima notifikasi',
            },
            appearance: {
                title: 'Tampilan',
                description: 'Sesuaikan tampilan dan nuansa antarmuka Anda',
            },
            privacy: {
                title: 'Privasi',
                description: 'Kelola privasi dan preferensi berbagi data',
            },
            security: {
                title: 'Keamanan',
                description: 'Lindungi akun Anda dengan fitur keamanan',
            },
            dataManagement: {
                title: 'Manajemen Data',
                description: 'Kelola data, penyimpanan, dan cadangan Anda',
            },
        },

        // General Settings
        general: {
            language: 'Bahasa',
            languageDesc: 'Pilih bahasa antarmuka',
            timezone: 'Zona Waktu',
            timezoneDesc: 'Atur zona waktu untuk tampilan waktu',
            dateFormat: 'Format Tanggal',
            dateFormatDesc: 'Pilih format tampilan tanggal',
        },

        // Teaching Settings
        teaching: {
            title: 'Metode Pengajaran',
            autoApprove: 'Persetujuan Otomatis Kehadiran',
            autoApproveDesc: 'Otomatis menyetujui kehadiran mahasiswa',
            strictGrading: 'Mode Penilaian Ketat',
            strictGradingDesc: 'Gunakan sistem penilaian yang lebih ketat',
        },

        // Class Management
        classManagement: {
            title: 'Preferensi Kelas',
            lateLimit: 'Batas Keterlambatan (menit)',
            lateLimitDesc: 'Waktu maksimal keterlambatan yang diperbolehkan',
            minAttendance: 'Kehadiran Minimum (%)',
            minAttendanceDesc: 'Persentase kehadiran minimum yang diperlukan',
        },

        // Notifications
        notifications: {
            title: 'Notifikasi Email',
            newAttendance: 'Kehadiran Baru',
            newAttendanceDesc: 'Notifikasi saat mahasiswa melakukan absensi',
            permitRequest: 'Pengajuan Izin',
            permitRequestDesc: 'Notifikasi saat ada pengajuan izin/sakit',
        },

        // Appearance
        appearance: {
            title: 'Tema',
            themeDesc: 'Pilih tema tampilan aplikasi',
            light: 'Terang',
            dark: 'Gelap',
            auto: 'Otomatis',
        },

        // Privacy
        privacy: {
            title: 'Privasi Data',
            publicProfile: 'Profil Publik',
            publicProfileDesc: 'Tampilkan profil Anda kepada mahasiswa',
            analytics: 'Analitik Anonim',
            analyticsDesc: 'Izinkan pengumpulan data anonim untuk peningkatan layanan',
        },

        // Security
        security: {
            title: 'Keamanan Akun',
            changePassword: 'Ubah Kata Sandi',
            changePasswordDesc: 'Perbarui kata sandi akun Anda',
            twoFactor: 'Autentikasi Dua Faktor',
            twoFactorDesc: 'Aktifkan autentikasi dua faktor untuk keamanan tambahan',
        },

        // Data Management
        dataManagement: {
            title: 'Manajemen Data',
            exportData: 'Ekspor Data',
            exportDataDesc: 'Unduh semua data Anda dalam format JSON',
            deleteAccount: 'Hapus Akun',
            deleteAccountDesc: 'Hapus akun dan semua data secara permanen',
            exportSuccess: 'Data berhasil diekspor',
            exportError: 'Gagal mengekspor data',
        },
    },
};

export type TranslationKeys = typeof id;
