<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Http\Request;

echo "=== TEST DOSEN LOGIN ENDPOINT ===\n\n";

// Simulate POST request to /dosen/login
$request = Request::create('/dosen/login', 'POST', [
    'nidn' => '0412019801',
    'password' => 'dosen123',
    'remember' => false,
]);

// Add CSRF token
$request->headers->set('X-CSRF-TOKEN', 'test-token');
$request->headers->set('Accept', 'application/json');

echo "Mengirim request ke /dosen/login...\n";
echo "Data:\n";
echo "  - NIDN: 0412019801\n";
echo "  - Password: dosen123\n\n";

try {
    $response = $kernel->handle($request);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    
    if ($response->getStatusCode() === 302) {
        echo "✓ Redirect detected (login berhasil)\n";
        echo "Redirect to: " . $response->headers->get('Location') . "\n";
    } elseif ($response->getStatusCode() === 200) {
        echo "Response: " . $response->getContent() . "\n";
    } else {
        echo "Response: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

$kernel->terminate($request, $response);
