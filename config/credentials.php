<?php

return [
    'seed' => [
        'admin_email' => env('SEED_ADMIN_EMAIL', 'intrasepriansaa@gmail.com'),
        'admin_password' => env('SEED_ADMIN_PASSWORD'),
        'dosen_password' => env('SEED_DOSEN_PASSWORD'),
    ],

    'mahasiswa' => [
        // prefix_last2 | nim | fixed
        'default_password_mode' => env('MAHASISWA_DEFAULT_PASSWORD_MODE', 'prefix_last2'),
        'default_password_prefix' => env('MAHASISWA_DEFAULT_PASSWORD_PREFIX'),
        'default_password_fixed' => env('MAHASISWA_DEFAULT_PASSWORD_FIXED'),

        // Jika tidak diset, akan pakai mode yang sama dengan default_password_mode
        'import_password_mode' => env('MAHASISWA_IMPORT_PASSWORD_MODE'),
        'import_password_prefix' => env('MAHASISWA_IMPORT_PASSWORD_PREFIX'),
        'import_password_fixed' => env('MAHASISWA_IMPORT_PASSWORD_FIXED'),
    ],
];

