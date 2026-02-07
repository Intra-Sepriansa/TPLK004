<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="TPLK004 - Sistem Absensi & Manajemen Akademik API",
 *     description="API Documentation untuk Sistem Absensi QR Code dengan Gamifikasi, Manajemen Tugas, dan Analytics",
 *     @OA\Contact(
 *         email="admin@unpam.ac.id",
 *         name="TPLK004 Support Team"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter token in format: Bearer {token}"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints untuk autentikasi (Login, Logout, Register)"
 * )
 * 
 * @OA\Tag(
 *     name="Attendance",
 *     description="Endpoints untuk manajemen absensi (QR Code, Token, Logs)"
 * )
 * 
 * @OA\Tag(
 *     name="Courses",
 *     description="Endpoints untuk manajemen mata kuliah"
 * )
 * 
 * @OA\Tag(
 *     name="Tasks",
 *     description="Endpoints untuk manajemen tugas dan submission"
 * )
 * 
 * @OA\Tag(
 *     name="Gamification",
 *     description="Endpoints untuk sistem gamifikasi (Badges, Points, Leaderboard)"
 * )
 * 
 * @OA\Tag(
 *     name="Analytics",
 *     description="Endpoints untuk analytics dan reporting"
 * )
 * 
 * @OA\Tag(
 *     name="Notifications",
 *     description="Endpoints untuk notifikasi"
 * )
 * 
 * @OA\Tag(
 *     name="Chat",
 *     description="Endpoints untuk sistem chat dan messaging"
 * )
 * 
 * @OA\Tag(
 *     name="Users",
 *     description="Endpoints untuk manajemen user (Mahasiswa, Dosen, Admin)"
 * )
 * 
 * @OA\Tag(
 *     name="Settings",
 *     description="Endpoints untuk pengaturan sistem"
 * )
 */
class SwaggerController extends Controller
{
    //
}
