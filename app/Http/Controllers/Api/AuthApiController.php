<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthApiController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Authentication"},
     *     summary="Login user (Mahasiswa/Dosen/Admin)",
     *     description="Authenticate user dan mendapatkan access token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password","role"},
     *             @OA\Property(property="email", type="string", format="email", example="mahasiswa@unpam.ac.id"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="role", type="string", enum={"mahasiswa", "dosen", "admin"}, example="mahasiswa"),
     *             @OA\Property(property="remember", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login berhasil"),
     *             @OA\Property(property="token", type="string", example="1|abcdef123456..."),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@unpam.ac.id"),
     *                 @OA\Property(property="role", type="string", example="mahasiswa")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Email atau password salah")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function login(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Revoke access token dan logout user",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logout berhasil")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function logout(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/auth/user",
     *     tags={"Authentication"},
     *     summary="Get authenticated user",
     *     description="Mendapatkan data user yang sedang login",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User data retrieved",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@unpam.ac.id"),
     *                 @OA\Property(property="role", type="string", example="mahasiswa"),
     *                 @OA\Property(property="avatar_url", type="string", example="https://example.com/avatar.jpg"),
     *                 @OA\Property(property="points", type="integer", example=1250),
     *                 @OA\Property(property="level", type="integer", example=5)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function user(Request $request)
    {
        // Implementation
    }
}
