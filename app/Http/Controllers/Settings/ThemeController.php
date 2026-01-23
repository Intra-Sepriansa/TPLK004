<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ThemeController extends Controller
{
    /**
     * Update the user's theme preference.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'theme' => ['required', Rule::in(['light', 'dark', 'auto'])],
        ]);

        // Try to get user from any guard
        $user = Auth::user() ?? Auth::guard('mahasiswa')->user() ?? Auth::guard('dosen')->user();
        
        if ($user) {
            $user->theme_preference = $validated['theme'];
            $user->save();

            return response()->json([
                'success' => true,
                'theme' => $validated['theme'],
                'message' => 'Theme preference updated successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'User not authenticated',
        ], 401);
    }

    /**
     * Get the user's current theme preference.
     */
    public function show()
    {
        // Try to get user from any guard
        $user = Auth::user() ?? Auth::guard('mahasiswa')->user() ?? Auth::guard('dosen')->user();
        
        if ($user) {
            return response()->json([
                'success' => true,
                'theme' => $user->theme_preference ?? 'light',
            ]);
        }

        return response()->json([
            'success' => false,
            'theme' => 'light',
        ], 401);
    }
}
