<?php

namespace App\Support;

use RuntimeException;

class CredentialDefaults
{
    public static function adminSeedEmail(): string
    {
        return (string) config('credentials.seed.admin_email', 'admin@example.com');
    }

    public static function adminSeedPassword(): string
    {
        return self::requiredConfig('credentials.seed.admin_password');
    }

    public static function dosenSeedPassword(): string
    {
        return self::requiredConfig('credentials.seed.dosen_password');
    }

    public static function mahasiswaDefaultPassword(string $nim): string
    {
        $mode = (string) config('credentials.mahasiswa.default_password_mode', 'prefix_last2');
        $prefix = (string) config('credentials.mahasiswa.default_password_prefix', '');
        $fixed = (string) config('credentials.mahasiswa.default_password_fixed', '');

        return self::resolveByMode($mode, $nim, $prefix, $fixed, 'credentials.mahasiswa.default_password_*');
    }

    public static function mahasiswaImportPassword(string $nim): string
    {
        $mode = (string) config('credentials.mahasiswa.import_password_mode', '');
        $prefix = (string) config('credentials.mahasiswa.import_password_prefix', '');
        $fixed = (string) config('credentials.mahasiswa.import_password_fixed', '');

        if ($mode === '') {
            return self::mahasiswaDefaultPassword($nim);
        }

        return self::resolveByMode($mode, $nim, $prefix, $fixed, 'credentials.mahasiswa.import_password_*');
    }

    private static function resolveByMode(
        string $mode,
        string $nim,
        string $prefix,
        string $fixed,
        string $configHint,
    ): string {
        return match ($mode) {
            'nim' => $nim,
            'fixed' => self::requiredValue($fixed, "{$configHint} (fixed)"),
            'prefix_last2' => self::requiredValue($prefix, "{$configHint} (prefix)") . substr($nim, -2),
            default => throw new RuntimeException("Mode password tidak valid: {$mode}"),
        };
    }

    private static function requiredConfig(string $key): string
    {
        return self::requiredValue((string) config($key, ''), $key);
    }

    private static function requiredValue(string $value, string $key): string
    {
        if ($value === '') {
            throw new RuntimeException("Konfigurasi credential kosong. Set nilai {$key} di file .env");
        }

        return $value;
    }
}

