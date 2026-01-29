<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Dosen;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

echo "=== TEST DOSEN LOGIN ===\n\n";

// Test 1: Cek apakah dosen ada
echo "1. Mencari dosen dengan NIDN 0412019801...\n";
$dosen = Dosen::where('nidn', '0412019801')->first();

if (!$dosen) {
    echo "   ❌ GAGAL: Dosen tidak ditemukan!\n";
    exit(1);
}

echo "   ✓ Dosen ditemukan: {$dosen->nama}\n";
echo "   - ID: {$dosen->id}\n";
echo "   - NIDN: {$dosen->nidn}\n";
echo "   - Email: {$dosen->email}\n\n";

// Test 2: Cek password
echo "2. Mengecek password 'dosen123'...\n";
$passwordMatch = Hash::check('dosen123', $dosen->password);

if (!$passwordMatch) {
    echo "   ❌ GAGAL: Password tidak cocok!\n";
    exit(1);
}

echo "   ✓ Password cocok!\n\n";

// Test 3: Cek guard dosen
echo "3. Mengecek guard 'dosen'...\n";
try {
    $guard = Auth::guard('dosen');
    echo "   ✓ Guard 'dosen' tersedia\n";
    echo "   - Provider: " . config('auth.guards.dosen.provider') . "\n";
    echo "   - Driver: " . config('auth.guards.dosen.driver') . "\n\n";
} catch (Exception $e) {
    echo "   ❌ GAGAL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 4: Cek provider dosen
echo "4. Mengecek provider 'dosen'...\n";
$providerConfig = config('auth.providers.dosen');
echo "   - Driver: {$providerConfig['driver']}\n";
echo "   - Model: {$providerConfig['model']}\n";

if ($providerConfig['model'] !== 'App\Models\Dosen') {
    echo "   ⚠️  WARNING: Model tidak sesuai!\n";
}

echo "\n";

// Test 5: Test login manual
echo "5. Test login manual...\n";
try {
    Auth::guard('dosen')->login($dosen);
    
    if (Auth::guard('dosen')->check()) {
        echo "   ✓ Login berhasil!\n";
        echo "   - User ID: " . Auth::guard('dosen')->id() . "\n";
        echo "   - User: " . Auth::guard('dosen')->user()->nama . "\n";
        
        Auth::guard('dosen')->logout();
        echo "   ✓ Logout berhasil\n";
    } else {
        echo "   ❌ GAGAL: Login tidak berhasil\n";
    }
} catch (Exception $e) {
    echo "   ❌ GAGAL: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n=== SEMUA TEST BERHASIL ✓ ===\n";
echo "\nKesimpulan: Konfigurasi authentication dosen sudah benar.\n";
echo "Jika masih tidak bisa login, kemungkinan masalah ada di:\n";
echo "1. Session/Cookie browser\n";
echo "2. CSRF token\n";
echo "3. Network request\n";
echo "4. JavaScript error di frontend\n";
