<?php

namespace App\Http\Middleware;

use App\Models\Mahasiswa;
use Closure;
use Illuminate\Http\Request;

class MobileMahasiswaAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization', '');
        if (! str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $token = trim(substr($header, 7));
        if ($token === '') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $hashed = hash('sha256', $token);
        $mahasiswa = Mahasiswa::where('remember_token', $hashed)->first();

        if (! $mahasiswa) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->setUserResolver(fn () => $mahasiswa);
        $request->attributes->set('mahasiswa', $mahasiswa);

        return $next($request);
    }
}
