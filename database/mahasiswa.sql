-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 25 Des 2025 pada 06.26
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mahasiswa`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `angka_1_21`
--

CREATE TABLE `angka_1_21` (
  `n` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `angka_1_21`
--

INSERT INTO `angka_1_21` (`n`) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9),
(10),
(11),
(12),
(13),
(14),
(15),
(16),
(17),
(18),
(19),
(20),
(21);

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_session_id` bigint(20) UNSIGNED NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `attendance_token_id` bigint(20) UNSIGNED DEFAULT NULL,
  `scanned_at` datetime NOT NULL,
  `status` varchar(255) NOT NULL,
  `distance_m` decimal(8,2) DEFAULT NULL,
  `selfie_path` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `device_os` varchar(255) DEFAULT NULL,
  `device_model` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance_sessions`
--

CREATE TABLE `attendance_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `meeting_number` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance_tokens`
--

CREATE TABLE `attendance_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_session_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `mahasiswa_id` int(11) DEFAULT NULL,
  `attendance_session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-a6f155de15268698bea3ed1df3f9aab3', 'i:1;', 1766638288),
('laravel-cache-a6f155de15268698bea3ed1df3f9aab3:timer', 'i:1766638288;', 1766638288);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `dosen`
--

CREATE TABLE `dosen` (
  `id` int(11) NOT NULL,
  `nama` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `dosen`
--

INSERT INTO `dosen` (`id`, `nama`) VALUES
(4, 'ANDIN EKA SAFITRI S.KOM., M.KOM.'),
(5, 'GALUH SAPUTRI S.KOM., M.KOM.'),
(6, 'HADI ZAKARIA S.KOM., M.KOM., M.M.'),
(2, 'INES HEIDIANI IKASARI S.SI., M.KOM.'),
(8, 'IR. TRI PRASETYO S.KOM., S.T., M.KOM.'),
(3, 'OKTA IRAWATI S.KOM., M.KOM.'),
(1, 'SANTI RAHAYU S.KOM., M.KOM.'),
(7, 'YULIANA S.KOM., M.KOM.');

-- --------------------------------------------------------

--
-- Struktur dari tabel `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `mahasiswa`
--

CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `mahasiswa`
--

INSERT INTO `mahasiswa` (`id`, `nama`, `nim`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'ABDUL FATTAH KHOLD', '221011401476', '$2y$12$M3tOzTZKLwoY.k2Aelu8P.y9Hg/K8CObgaiG/EluqAFEC4sSfieje', NULL, '2025-12-25 03:24:16', NULL),
(2, 'ABDUR ROSYID AMRULLAH', '231011401412', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', NULL, '2025-12-25 03:24:16', NULL),
(3, 'ABU BAKAR RIZIQ', '231011402235', '$2y$12$hKW1LJ65mZgt3PeDVpMU4eyr8VWbY4e/qBL/Yzs3.0LalpyNXmeFS', NULL, '2025-12-25 03:24:16', NULL),
(4, 'ACHMAD ILLYYIN ABDULLAH', '231011402363', '$2y$12$PlVGTVZldAHU1pZjF4DFeOqyMYmwnqNk4nPaA7vF2keDROEAweU7a', NULL, '2025-12-25 03:24:16', NULL),
(5, 'ADRIAN POSMAN IMANUEL', '231011402036', '$2y$12$Mfn6N8RIWnR.u6C6PPekT.mU1xp549jruM8KIr.XAPWV8PjpWprN.', NULL, '2025-12-25 03:24:16', NULL),
(6, 'AHMAD DANI FADHLIANSYAH', '231011401524', '$2y$12$70Y3umoAR503ThLNi5n4qukDTjcfTS4gjlaRMnMMD.hQgqcpjB3A.', NULL, '2025-12-25 03:24:16', NULL),
(7, 'AHMAD FADILLAH', '231011400490', '$2y$12$z3uwIywLMQHV2TZoZ.1Xs.zry/ZYJ9GW4OQFbcNoAtTEf4Xc31VaC', NULL, '2025-12-25 03:24:16', NULL),
(8, 'ALIF AZHAR', '231011402879', '$2y$12$0yH1gatSAXff0LQD3/6MvuXtUjp/fxTkjldvbDP7KFKQPWUWgx34.', NULL, '2025-12-25 03:24:16', NULL),
(9, 'ANDRIANTO', '231011401396', '$2y$12$UlN8KVONXFhKgUE/9TkzFOK9PsyuRnmhSUQmwxjgZk.eydaxJNSmK', NULL, '2025-12-25 03:24:16', NULL),
(10, 'DANANG ARDIANSYAH', '231011401410', '$2y$12$UO0MndwwgvxxqQ.rbQ66yeT2sWnFy/i4Er4uRzpq.z6YUshzvCPkW', NULL, '2025-12-25 03:24:16', NULL),
(11, 'DEFRY SULAEMAN', '231011400477', '$2y$12$c1lYfjsFohP6fmc5tmxxkOBDcu2mK3GKcwPl23pW8izGC2iAT7a6y', NULL, '2025-12-25 03:24:16', NULL),
(12, 'EDELTRUDIS KUE', '231011401624', '$2y$12$X0k8RneA3DjAItR833ks8O5RnuyQWNug3h46rqe1.sVpGIwAT7DSG', NULL, '2025-12-25 03:24:16', NULL),
(13, 'FAHMMI FRMANSYAH', '231011401250', '$2y$12$uZccfXKA9Td9XfSCOdBMKOAZTL9JNnKziQh4bT7276nCXSciXkSrS', NULL, '2025-12-25 03:24:16', NULL),
(14, 'GUMILANG ALI PRAYOGI', '231011401944', '$2y$12$7P7AcUU31yEQPplbDDNWD./XSamJzjM4UwvNAt1JH1ZeSTB6XYjmK', NULL, '2025-12-25 03:24:16', NULL),
(15, 'HARIS USMAN', '231011401637', '$2y$12$dtKXYpjxAApyG5ynIteXzelkUtwCTYuaWlUViBo7i/vZeFEibnzVO', NULL, '2025-12-25 03:24:16', NULL),
(16, 'MANZIS ILHAM MAULANA', '231011400553', '$2y$12$C9JcKx.p7xYNofwSoDiYKuOPXJG13xol5YNV5ePFA55Q/HS8FGZFC', NULL, '2025-12-25 03:24:16', NULL),
(17, 'MUHAMAD HARRI FADILAH', '231011401636', '$2y$12$ohwPoAWFfFCZcFNPQ5Q62e0JZxMNEQ1YF77MTw7y7m0NK3TwIb6rG', NULL, '2025-12-25 03:24:16', NULL),
(18, 'MUHAMMAD ADAM FADILAH', '231011401768', '$2y$12$5UuO32mh4q1H6uwKzUw8wuixcTIUp5mikmkjgRzGXIyDsB17qJ5v.', NULL, '2025-12-25 03:24:16', NULL),
(19, 'MUHAMMAD REZA PRASETYA', '231011400533', '$2y$12$JIVRaTiYKBlsvmhbK0rXd.zCMef2r8054X.UQUS5la6nnEThVQbj2', NULL, '2025-12-25 03:24:16', NULL),
(20, 'NABILA PUTRI CANDRA', '231011400526', '$2y$12$NVN1gSmJZsg0wlTFMWpb7edJ5sEaj6eIjGLng1/jIV98HgVbtNudK', NULL, '2025-12-25 03:24:16', NULL),
(21, 'NADIRA MATONDANG', '231011400809', '$2y$12$TQOmrXcUAhu54Ajc0PeoveqDZHm3eRGN66JPefcZqAITIUXHhZSiG', NULL, '2025-12-25 03:24:16', NULL),
(22, 'RANGGA PRIMADILLAH', '231011401595', '$2y$12$snfGg7qwhnDDJNwuVoPZOuyJzR557jazwaUmJZWL3rb4KHrAyeA1.', NULL, '2025-12-25 03:24:16', NULL),
(23, 'RIVALDI PRATAMA KURNIA', '231011401394', '$2y$12$sUllLwCLZF13etvKq8vnP.dbiYzccJ8lHlAkfsrRl8q0l2wqsRhdS', NULL, '2025-12-25 03:24:16', NULL),
(24, 'SALM MAULA AMRULLAH', '231011401365', '$2y$12$4dx8an57QnQO94KMD2PiGedFZ6XSt3MWtp9hagl4.m2Z78sOKa/ti', NULL, '2025-12-25 03:24:16', NULL),
(25, 'SELVIANTI', '231011401422', '$2y$12$IRuv/Xard2UuPp8t03g6MOMtvrSX.a9zlXcxVJWKrOLanNo4Xk8ji', NULL, '2025-12-25 03:24:16', NULL),
(26, 'SERINA ADIMI YULIANA', '231011400434', '$2y$12$eKAMMBvSMHC7MTzQx9s8LOQJGm4Xp25s1AoJWrdpbd0Qe13DuzHTm', NULL, '2025-12-25 03:24:16', NULL),
(27, 'WILDAN HAMDI ALI', '231011400729', '$2y$12$x4DcDqLP9QG0z735Os6dmO4WjD9xGU9jn1EJygi.Shmyj4yfXD6cW', NULL, '2025-12-25 03:24:16', NULL),
(28, 'WILLY ALUA RAHMAN', '231011400484', '$2y$12$qFy.EXOoMGpqC8FMUOn4CujEnmhEcsoSoPuCfUCF2xO0IIOAfc93C', NULL, '2025-12-25 03:24:16', NULL),
(29, 'YAN INDAH SURYA LAOWO', '231011402976', '$2y$12$3uXzxZ19r.1qOtSLZJAlMu5pRGEaQZ.U0q3eFQ69lPbXM3whdeD8e', NULL, '2025-12-25 03:24:16', NULL),
(30, 'ZAHRA CHOIRUNNISA', '231011400067', '$2y$12$DZSHmp7MEIsTYmvOLUjA0.EVPqpRIc2CPhE52.konpjaxgwi2oahy', NULL, '2025-12-25 03:24:16', NULL),
(31, 'INTRA SEPRIANSA', '231011400463', '$2y$12$XVbHJssmb6ktXrCYuM528uqC738nXRmHkJJAJJx.D6rfnn96TaOJS', NULL, '2025-12-25 03:25:58', NULL),
(32, 'SALSA NABILA', '231011400432', '$2y$12$Vk0uHOj/lL5L9wgvW4YZjOhtzruFSTf84X.0l5ESZ3wrxzsS8pntK', NULL, '2025-12-25 03:25:58', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `mata_kuliah`
--

CREATE TABLE `mata_kuliah` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nama` varchar(150) NOT NULL,
  `sks` tinyint(4) NOT NULL CHECK (`sks` in (2,3)),
  `dosen_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id`, `nama`, `sks`, `dosen_id`) VALUES
(1, 'KECERDASAN BUATAN', 3, 1),
(2, 'SISTEM INFORMASI MANAJEMEN', 2, 2),
(3, 'PENGOLAHAN CITRA DIGITAL', 2, 3),
(4, 'TEKNIK RISET OPERASIONAL', 2, 4),
(5, 'PEMROGRAMAN WEB I', 3, 5),
(6, 'METODE PENELITIAN', 3, 6),
(7, 'DIGITAL ENTREPRENEURSHIP', 2, 7),
(8, 'MACHINE LEARNING', 3, 8);

-- --------------------------------------------------------

--
-- Struktur dari tabel `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_26_100418_add_two_factor_columns_to_users_table', 1),
(5, '2025_12_23_000100_create_courses_table', 1),
(6, '2025_12_23_000101_create_attendance_sessions_table', 1),
(7, '2025_12_23_000102_create_attendance_tokens_table', 1),
(8, '2025_12_23_000103_create_attendance_logs_table', 1),
(9, '2025_12_23_000104_create_selfie_verifications_table', 1),
(10, '2025_12_23_000105_create_audit_logs_table', 1),
(11, '2025_12_23_000106_create_settings_table', 1),
(12, '2025_12_23_000107_add_auth_columns_to_mahasiswa_table', 1),
(13, '2025_12_23_000108_create_sessions_table', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pertemuan`
--

CREATE TABLE `pertemuan` (
  `id` bigint(20) NOT NULL,
  `mata_kuliah_id` bigint(20) UNSIGNED NOT NULL,
  `pertemuan_ke` tinyint(4) NOT NULL,
  `tanggal` date DEFAULT NULL,
  `topik` varchar(255) DEFAULT NULL,
  `status` enum('BELUM','HADIR','LIBUR') DEFAULT 'BELUM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pertemuan`
--

INSERT INTO `pertemuan` (`id`, `mata_kuliah_id`, `pertemuan_ke`, `tanggal`, `topik`, `status`) VALUES
(1, 1, 1, NULL, NULL, 'BELUM'),
(2, 1, 2, NULL, NULL, 'BELUM'),
(3, 1, 3, NULL, NULL, 'BELUM'),
(4, 1, 4, NULL, NULL, 'BELUM'),
(5, 1, 5, NULL, NULL, 'BELUM'),
(6, 1, 6, NULL, NULL, 'BELUM'),
(7, 1, 7, NULL, NULL, 'BELUM'),
(8, 1, 8, NULL, NULL, 'BELUM'),
(9, 1, 9, NULL, NULL, 'BELUM'),
(10, 1, 10, NULL, NULL, 'BELUM'),
(11, 1, 11, NULL, NULL, 'BELUM'),
(12, 1, 12, NULL, NULL, 'BELUM'),
(13, 1, 13, NULL, NULL, 'BELUM'),
(14, 1, 14, NULL, NULL, 'BELUM'),
(15, 1, 15, NULL, NULL, 'BELUM'),
(16, 1, 16, NULL, NULL, 'BELUM'),
(17, 1, 17, NULL, NULL, 'BELUM'),
(18, 1, 18, NULL, NULL, 'BELUM'),
(19, 1, 19, NULL, NULL, 'BELUM'),
(20, 1, 20, NULL, NULL, 'BELUM'),
(21, 1, 21, NULL, NULL, 'BELUM'),
(22, 2, 1, NULL, NULL, 'BELUM'),
(23, 2, 2, NULL, NULL, 'BELUM'),
(24, 2, 3, NULL, NULL, 'BELUM'),
(25, 2, 4, NULL, NULL, 'BELUM'),
(26, 2, 5, NULL, NULL, 'BELUM'),
(27, 2, 6, NULL, NULL, 'BELUM'),
(28, 2, 7, NULL, NULL, 'BELUM'),
(29, 2, 8, NULL, NULL, 'BELUM'),
(30, 2, 9, NULL, NULL, 'BELUM'),
(31, 2, 10, NULL, NULL, 'BELUM'),
(32, 2, 11, NULL, NULL, 'BELUM'),
(33, 2, 12, NULL, NULL, 'BELUM'),
(34, 2, 13, NULL, NULL, 'BELUM'),
(35, 2, 14, NULL, NULL, 'BELUM'),
(36, 3, 1, NULL, NULL, 'BELUM'),
(37, 3, 2, NULL, NULL, 'BELUM'),
(38, 3, 3, NULL, NULL, 'BELUM'),
(39, 3, 4, NULL, NULL, 'BELUM'),
(40, 3, 5, NULL, NULL, 'BELUM'),
(41, 3, 6, NULL, NULL, 'BELUM'),
(42, 3, 7, NULL, NULL, 'BELUM'),
(43, 3, 8, NULL, NULL, 'BELUM'),
(44, 3, 9, NULL, NULL, 'BELUM'),
(45, 3, 10, NULL, NULL, 'BELUM'),
(46, 3, 11, NULL, NULL, 'BELUM'),
(47, 3, 12, NULL, NULL, 'BELUM'),
(48, 3, 13, NULL, NULL, 'BELUM'),
(49, 3, 14, NULL, NULL, 'BELUM'),
(50, 4, 1, NULL, NULL, 'BELUM'),
(51, 4, 2, NULL, NULL, 'BELUM'),
(52, 4, 3, NULL, NULL, 'BELUM'),
(53, 4, 4, NULL, NULL, 'BELUM'),
(54, 4, 5, NULL, NULL, 'BELUM'),
(55, 4, 6, NULL, NULL, 'BELUM'),
(56, 4, 7, NULL, NULL, 'BELUM'),
(57, 4, 8, NULL, NULL, 'BELUM'),
(58, 4, 9, NULL, NULL, 'BELUM'),
(59, 4, 10, NULL, NULL, 'BELUM'),
(60, 4, 11, NULL, NULL, 'BELUM'),
(61, 4, 12, NULL, NULL, 'BELUM'),
(62, 4, 13, NULL, NULL, 'BELUM'),
(63, 4, 14, NULL, NULL, 'BELUM'),
(64, 5, 1, NULL, NULL, 'BELUM'),
(65, 5, 2, NULL, NULL, 'BELUM'),
(66, 5, 3, NULL, NULL, 'BELUM'),
(67, 5, 4, NULL, NULL, 'BELUM'),
(68, 5, 5, NULL, NULL, 'BELUM'),
(69, 5, 6, NULL, NULL, 'BELUM'),
(70, 5, 7, NULL, NULL, 'BELUM'),
(71, 5, 8, NULL, NULL, 'BELUM'),
(72, 5, 9, NULL, NULL, 'BELUM'),
(73, 5, 10, NULL, NULL, 'BELUM'),
(74, 5, 11, NULL, NULL, 'BELUM'),
(75, 5, 12, NULL, NULL, 'BELUM'),
(76, 5, 13, NULL, NULL, 'BELUM'),
(77, 5, 14, NULL, NULL, 'BELUM'),
(78, 5, 15, NULL, NULL, 'BELUM'),
(79, 5, 16, NULL, NULL, 'BELUM'),
(80, 5, 17, NULL, NULL, 'BELUM'),
(81, 5, 18, NULL, NULL, 'BELUM'),
(82, 5, 19, NULL, NULL, 'BELUM'),
(83, 5, 20, NULL, NULL, 'BELUM'),
(84, 5, 21, NULL, NULL, 'BELUM'),
(85, 6, 1, NULL, NULL, 'BELUM'),
(86, 6, 2, NULL, NULL, 'BELUM'),
(87, 6, 3, NULL, NULL, 'BELUM'),
(88, 6, 4, NULL, NULL, 'BELUM'),
(89, 6, 5, NULL, NULL, 'BELUM'),
(90, 6, 6, NULL, NULL, 'BELUM'),
(91, 6, 7, NULL, NULL, 'BELUM'),
(92, 6, 8, NULL, NULL, 'BELUM'),
(93, 6, 9, NULL, NULL, 'BELUM'),
(94, 6, 10, NULL, NULL, 'BELUM'),
(95, 6, 11, NULL, NULL, 'BELUM'),
(96, 6, 12, NULL, NULL, 'BELUM'),
(97, 6, 13, NULL, NULL, 'BELUM'),
(98, 6, 14, NULL, NULL, 'BELUM'),
(99, 6, 15, NULL, NULL, 'BELUM'),
(100, 6, 16, NULL, NULL, 'BELUM'),
(101, 6, 17, NULL, NULL, 'BELUM'),
(102, 6, 18, NULL, NULL, 'BELUM'),
(103, 6, 19, NULL, NULL, 'BELUM'),
(104, 6, 20, NULL, NULL, 'BELUM'),
(105, 6, 21, NULL, NULL, 'BELUM'),
(106, 7, 1, NULL, NULL, 'BELUM'),
(107, 7, 2, NULL, NULL, 'BELUM'),
(108, 7, 3, NULL, NULL, 'BELUM'),
(109, 7, 4, NULL, NULL, 'BELUM'),
(110, 7, 5, NULL, NULL, 'BELUM'),
(111, 7, 6, NULL, NULL, 'BELUM'),
(112, 7, 7, NULL, NULL, 'BELUM'),
(113, 7, 8, NULL, NULL, 'BELUM'),
(114, 7, 9, NULL, NULL, 'BELUM'),
(115, 7, 10, NULL, NULL, 'BELUM'),
(116, 7, 11, NULL, NULL, 'BELUM'),
(117, 7, 12, NULL, NULL, 'BELUM'),
(118, 7, 13, NULL, NULL, 'BELUM'),
(119, 7, 14, NULL, NULL, 'BELUM'),
(120, 8, 1, NULL, NULL, 'BELUM'),
(121, 8, 2, NULL, NULL, 'BELUM'),
(122, 8, 3, NULL, NULL, 'BELUM'),
(123, 8, 4, NULL, NULL, 'BELUM'),
(124, 8, 5, NULL, NULL, 'BELUM'),
(125, 8, 6, NULL, NULL, 'BELUM'),
(126, 8, 7, NULL, NULL, 'BELUM'),
(127, 8, 8, NULL, NULL, 'BELUM'),
(128, 8, 9, NULL, NULL, 'BELUM'),
(129, 8, 10, NULL, NULL, 'BELUM'),
(130, 8, 11, NULL, NULL, 'BELUM'),
(131, 8, 12, NULL, NULL, 'BELUM'),
(132, 8, 13, NULL, NULL, 'BELUM'),
(133, 8, 14, NULL, NULL, 'BELUM'),
(134, 8, 15, NULL, NULL, 'BELUM'),
(135, 8, 16, NULL, NULL, 'BELUM'),
(136, 8, 17, NULL, NULL, 'BELUM'),
(137, 8, 18, NULL, NULL, 'BELUM'),
(138, 8, 19, NULL, NULL, 'BELUM'),
(139, 8, 20, NULL, NULL, 'BELUM'),
(140, 8, 21, NULL, NULL, 'BELUM');

-- --------------------------------------------------------

--
-- Struktur dari tabel `selfie_verifications`
--

CREATE TABLE `selfie_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_log_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('7awPlTyQ8kUAMl2cvcHj8REwh4RkZYfKHWhY2GmB', 1, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVmlPdldsanF5cWF2OHgxck1OTGdkMDVMNTRxVHdDNjV2MWRLcTBHWiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMy9kYXNoYm9hcmQiO3M6NToicm91dGUiO3M6OToiZGFzaGJvYXJkIjt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1766637891),
('CqtIzj873jaH2H2gq8OBxfOB5ZF4KprBbdy9JlrS', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWXNqVnZYa3NZN0RRMUZQdzJITkc1cm1DQjNQazVvYXpsZW5wOE1LUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHA6Ly90cGxrMDA0LnRlc3QvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjM6InVybCI7YToxOntzOjg6ImludGVuZGVkIjtzOjI5OiJodHRwOi8vdHBsazAwNC50ZXN0L2Rhc2hib2FyZCI7fX0=', 1766636868),
('kdRfWta6dSGwoFhmxFOa5X5t6xQo1RFQF8xZz6VV', 1, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo2OntzOjY6Il90b2tlbiI7czo0MDoiSjJMOUtwUU1mQkJOdzBlTURQZGp5ZE44SmZzMHpPcW92U29mQ2dJbSI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjQ4OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvZGFzaGJvYXJkP3NlY3Rpb249c2Vzc2lvbnMiO3M6NToicm91dGUiO3M6OToiZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1NjoibG9naW5fbWFoYXNpc3dhXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MzE7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1766639153);

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES
('geofence_lat', '-6.3460957', '2025-12-24 21:17:29', '2025-12-24 21:17:29'),
('geofence_lng', '106.6915144', '2025-12-24 21:17:29', '2025-12-24 21:17:29'),
('geofence_radius_m', '100', '2025-12-24 21:17:29', '2025-12-24 21:17:29'),
('late_minutes', '10', '2025-12-24 21:17:29', '2025-12-24 21:17:29'),
('selfie_required', '1', '2025-12-24 21:17:29', '2025-12-24 21:17:29'),
('token_ttl_seconds', '180', '2025-12-24 21:17:29', '2025-12-24 21:17:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Test User', 'test@example.com', '2025-12-24 21:34:49', '$2y$12$kuZenmrhFRUigvv/wVPy6ubaJoXaNTC485R4D0DGjz7igCOLwbYOy', NULL, NULL, NULL, NULL, '2025-12-24 21:34:49', '2025-12-24 21:34:49');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `angka_1_21`
--
ALTER TABLE `angka_1_21`
  ADD PRIMARY KEY (`n`);

--
-- Indeks untuk tabel `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendance_logs_attendance_token_id_foreign` (`attendance_token_id`),
  ADD KEY `attendance_logs_attendance_session_id_mahasiswa_id_index` (`attendance_session_id`,`mahasiswa_id`),
  ADD KEY `attendance_logs_scanned_at_status_index` (`scanned_at`,`status`),
  ADD KEY `attendance_logs_mahasiswa_id_foreign` (`mahasiswa_id`);

--
-- Indeks untuk tabel `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendance_sessions_course_id_meeting_number_unique` (`course_id`,`meeting_number`),
  ADD KEY `attendance_sessions_created_by_foreign` (`created_by`);

--
-- Indeks untuk tabel `attendance_tokens`
--
ALTER TABLE `attendance_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendance_tokens_attendance_session_id_expires_at_index` (`attendance_session_id`,`expires_at`);

--
-- Indeks untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_attendance_session_id_foreign` (`attendance_session_id`),
  ADD KEY `audit_logs_event_type_created_at_index` (`event_type`,`created_at`),
  ADD KEY `audit_logs_mahasiswa_id_foreign` (`mahasiswa_id`);

--
-- Indeks untuk tabel `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `courses_code_unique` (`code`);

--
-- Indeks untuk tabel `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indeks untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indeks untuk tabel `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indeks untuk tabel `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `mahasiswa`
--
ALTER TABLE `mahasiswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nim` (`nim`);

--
-- Indeks untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`),
  ADD KEY `fk_mk_dosen` (`dosen_id`);

--
-- Indeks untuk tabel `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indeks untuk tabel `pertemuan`
--
ALTER TABLE `pertemuan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mata_kuliah_id` (`mata_kuliah_id`,`pertemuan_ke`);

--
-- Indeks untuk tabel `selfie_verifications`
--
ALTER TABLE `selfie_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `selfie_verifications_attendance_log_id_foreign` (`attendance_log_id`),
  ADD KEY `selfie_verifications_verified_by_foreign` (`verified_by`),
  ADD KEY `selfie_verifications_status_created_at_index` (`status`,`created_at`);

--
-- Indeks untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `attendance_tokens`
--
ALTER TABLE `attendance_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `mahasiswa`
--
ALTER TABLE `mahasiswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `pertemuan`
--
ALTER TABLE `pertemuan`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=256;

--
-- AUTO_INCREMENT untuk tabel `selfie_verifications`
--
ALTER TABLE `selfie_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `attendance_logs_attendance_session_id_foreign` FOREIGN KEY (`attendance_session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_logs_attendance_token_id_foreign` FOREIGN KEY (`attendance_token_id`) REFERENCES `attendance_tokens` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `attendance_logs_mahasiswa_id_foreign` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD CONSTRAINT `attendance_sessions_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_sessions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `attendance_tokens`
--
ALTER TABLE `attendance_tokens`
  ADD CONSTRAINT `attendance_tokens_attendance_session_id_foreign` FOREIGN KEY (`attendance_session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_attendance_session_id_foreign` FOREIGN KEY (`attendance_session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `audit_logs_mahasiswa_id_foreign` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `fk_mk_dosen` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`);

--
-- Ketidakleluasaan untuk tabel `pertemuan`
--
ALTER TABLE `pertemuan`
  ADD CONSTRAINT `fk_pt_mk` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`);

--
-- Ketidakleluasaan untuk tabel `selfie_verifications`
--
ALTER TABLE `selfie_verifications`
  ADD CONSTRAINT `selfie_verifications_attendance_log_id_foreign` FOREIGN KEY (`attendance_log_id`) REFERENCES `attendance_logs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `selfie_verifications_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
