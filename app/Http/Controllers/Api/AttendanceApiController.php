<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/attendance/sessions",
     *     tags={"Attendance"},
     *     summary="Get all attendance sessions",
     *     description="Mendapatkan daftar sesi absensi dengan filter dan pagination",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="course_id",
     *         in="query",
     *         description="Filter by course ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"active", "closed", "scheduled"})
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Sessions retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="title", type="string", example="Pertemuan 1 - Pengenalan"),
     *                     @OA\Property(property="meeting_number", type="integer", example=1),
     *                     @OA\Property(property="course_id", type="integer", example=1),
     *                     @OA\Property(property="course_name", type="string", example="Pemrograman Web"),
     *                     @OA\Property(property="is_active", type="boolean", example=true),
     *                     @OA\Property(property="start_at", type="string", format="datetime", example="2024-01-31 08:00:00"),
     *                     @OA\Property(property="end_at", type="string", format="datetime", example="2024-01-31 10:00:00"),
     *                     @OA\Property(property="attendance_count", type="integer", example=45),
     *                     @OA\Property(property="created_at", type="string", format="datetime")
     *                 )
     *             ),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="total", type="integer", example=100),
     *                 @OA\Property(property="per_page", type="integer", example=15)
     *             )
     *         )
     *     )
     * )
     */
    public function getSessions(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Post(
     *     path="/api/attendance/scan",
     *     tags={"Attendance"},
     *     summary="Scan QR code untuk absensi",
     *     description="Submit QR code token untuk mencatat kehadiran",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token"},
     *             @OA\Property(property="token", type="string", example="ABC123XYZ"),
     *             @OA\Property(property="latitude", type="number", format="float", example=-6.2088),
     *             @OA\Property(property="longitude", type="number", format="float", example=106.8456),
     *             @OA\Property(property="device_info", type="object",
     *                 @OA\Property(property="user_agent", type="string"),
     *                 @OA\Property(property="platform", type="string"),
     *                 @OA\Property(property="browser", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Attendance recorded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Absensi berhasil dicatat"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="attendance_id", type="integer", example=123),
     *                 @OA\Property(property="session_id", type="integer", example=1),
     *                 @OA\Property(property="status", type="string", example="hadir"),
     *                 @OA\Property(property="scanned_at", type="string", format="datetime"),
     *                 @OA\Property(property="points_earned", type="integer", example=10),
     *                 @OA\Property(property="badges_unlocked", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid or expired token",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Token tidak valid atau sudah kadaluarsa")
     *         )
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Already attended",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Anda sudah melakukan absensi untuk sesi ini")
     *         )
     *     )
     * )
     */
    public function scan(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/attendance/history",
     *     tags={"Attendance"},
     *     summary="Get attendance history",
     *     description="Mendapatkan riwayat kehadiran mahasiswa",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date filter (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date filter (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="course_id",
     *         in="query",
     *         description="Filter by course",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="History retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="summary", type="object",
     *                     @OA\Property(property="total_sessions", type="integer", example=20),
     *                     @OA\Property(property="attended", type="integer", example=18),
     *                     @OA\Property(property="absent", type="integer", example=2),
     *                     @OA\Property(property="attendance_rate", type="number", format="float", example=90.0)
     *                 ),
     *                 @OA\Property(property="records", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="session_title", type="string"),
     *                         @OA\Property(property="course_name", type="string"),
     *                         @OA\Property(property="status", type="string", enum={"hadir", "izin", "sakit", "alpha"}),
     *                         @OA\Property(property="scanned_at", type="string", format="datetime"),
     *                         @OA\Property(property="points_earned", type="integer")
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getHistory(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Post(
     *     path="/api/attendance/sessions/{id}/token",
     *     tags={"Attendance"},
     *     summary="Generate QR token (Dosen only)",
     *     description="Generate token QR code untuk sesi absensi",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Session ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="force", type="boolean", example=false, description="Force generate new token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Token generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="token", type="string", example="ABC123XYZ"),
     *             @OA\Property(property="expires_at", type="string", format="datetime"),
     *             @OA\Property(property="expires_at_ts", type="integer", example=1706688000),
     *             @OA\Property(property="qr_code_url", type="string", example="data:image/png;base64,...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized - Dosen only"
     *     )
     * )
     */
    public function generateToken(Request $request, $id)
    {
        // Implementation
    }
}
