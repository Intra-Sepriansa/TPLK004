<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class NetworkDiagnosticController extends Controller
{
    /**
     * Minimal payload to check server ping/connectivity
     */
    public function health()
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->timestamp,
        ], 200, [
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Simulate a download by sending a payload of zero bytes
     */
    public function downloadTest(Request $request)
    {
        // Approximately 1MB of data for speed testing (or scale depending on requirement)
        $size = $request->query('size', 1024 * 1024); 
        $data = str_repeat('0', $size);

        return Response::make($data, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Length' => $size,
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Simulate upload by accepting payload and immediately discarded
     */
    public function uploadTest(Request $request)
    {
        // Just return success. Speed is measured client-side via XMLHttpRequest/Fetch progress.
        return response()->json([
            'status' => 'ok',
            'received_bytes' => $request->header('Content-Length', 0),
        ], 200);
    }
}
