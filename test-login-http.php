<?php

// Test login via HTTP simulation
echo "=== TEST LOGIN DOSEN VIA HTTP ===\n\n";

$nidn = '0401018901';
$password = 'dosen123';

echo "Testing login dengan:\n";
echo "NIDN: $nidn\n";
echo "Password: $password\n\n";

// Simulate curl request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/dosen/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'nidn' => $nidn,
    'password' => $password,
    'remember' => false
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, '/tmp/cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEFILE, '/tmp/cookies.txt');

// Get CSRF token first
echo "1. Getting CSRF token...\n";
$ch_token = curl_init();
curl_setopt($ch_token, CURLOPT_URL, 'http://localhost:8000/login');
curl_setopt($ch_token, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch_token, CURLOPT_COOKIEJAR, '/tmp/cookies.txt');
$html = curl_exec($ch_token);
curl_close($ch_token);

// Extract CSRF token
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $html, $matches);
$csrf_token = $matches[1] ?? null;

if ($csrf_token) {
    echo "   ✓ CSRF token found: " . substr($csrf_token, 0, 20) . "...\n\n";
} else {
    echo "   ❌ CSRF token not found!\n\n";
}

// Now try login with CSRF token
echo "2. Attempting login...\n";
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-CSRF-TOKEN: ' . $csrf_token,
    'X-Requested-With: XMLHttpRequest',
    'Accept: application/json',
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$redirect_url = curl_getinfo($ch, CURLINFO_REDIRECT_URL);

curl_close($ch);

echo "   HTTP Status: $http_code\n";

if ($http_code == 302 || $http_code == 301) {
    echo "   ✓ Login berhasil! (Redirect detected)\n";
    if ($redirect_url) {
        echo "   Redirect to: $redirect_url\n";
    }
} elseif ($http_code == 200) {
    echo "   Response received\n";
    // Check if there's error in response
    if (strpos($response, 'NIDN atau password salah') !== false) {
        echo "   ❌ Login gagal: NIDN atau password salah\n";
    } else {
        echo "   Response: " . substr($response, 0, 200) . "...\n";
    }
} else {
    echo "   ❌ Unexpected status code\n";
    echo "   Response: " . substr($response, 0, 500) . "\n";
}

echo "\n=== TEST SELESAI ===\n";
