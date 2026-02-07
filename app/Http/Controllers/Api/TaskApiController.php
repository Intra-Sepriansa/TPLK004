<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TaskApiController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/tasks",
     *     tags={"Tasks"},
     *     summary="Get all tasks",
     *     description="Mendapatkan daftar tugas dengan filter dan pagination",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="course_id",
     *         in="query",
     *         description="Filter by course",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"published", "draft", "closed"})
     *     ),
     *     @OA\Parameter(
     *         name="jenis",
     *         in="query",
     *         description="Filter by type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"tugas", "quiz", "project", "presentasi", "lainnya"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tasks retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="judul", type="string", example="Tugas UTS - Membuat Website"),
     *                     @OA\Property(property="deskripsi", type="string", example="Buat website portfolio menggunakan HTML, CSS, JS"),
     *                     @OA\Property(property="jenis", type="string", example="project"),
     *                     @OA\Property(property="prioritas", type="string", enum={"rendah", "sedang", "tinggi"}, example="tinggi"),
     *                     @OA\Property(property="status", type="string", example="published"),
     *                     @OA\Property(property="deadline", type="string", format="datetime"),
     *                     @OA\Property(property="deadline_display", type="string", example="31 Jan 2024, 23:59"),
     *                     @OA\Property(property="is_overdue", type="boolean", example=false),
     *                     @OA\Property(property="days_until_deadline", type="integer", example=5),
     *                     @OA\Property(property="course", type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="nama", type="string")
     *                     ),
     *                     @OA\Property(property="submission_status", type="string", enum={"not_submitted", "submitted", "graded"}, example="not_submitted"),
     *                     @OA\Property(property="diskusi_count", type="integer", example=12)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/tasks/{id}",
     *     tags={"Tasks"},
     *     summary="Get task detail",
     *     description="Mendapatkan detail tugas beserta submission status",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Task ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Task detail retrieved",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="judul", type="string"),
     *                 @OA\Property(property="deskripsi", type="string"),
     *                 @OA\Property(property="instruksi", type="string"),
     *                 @OA\Property(property="jenis", type="string"),
     *                 @OA\Property(property="prioritas", type="string"),
     *                 @OA\Property(property="status", type="string"),
     *                 @OA\Property(property="deadline", type="string", format="datetime"),
     *                 @OA\Property(property="course", type="object"),
     *                 @OA\Property(property="created_by", type="object",
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="email", type="string")
     *                 ),
     *                 @OA\Property(property="my_submission", type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="status", type="string"),
     *                     @OA\Property(property="submitted_at", type="string", format="datetime"),
     *                     @OA\Property(property="grade", type="number", format="float"),
     *                     @OA\Property(property="feedback", type="string")
     *                 ),
     *                 @OA\Property(property="attachments", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="diskusi", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Task not found"
     *     )
     * )
     */
    public function show(Request $request, $id)
    {
        // Implementation
    }

    /**
     * @OA\Post(
     *     path="/api/tasks/{id}/submit",
     *     tags={"Tasks"},
     *     summary="Submit task",
     *     description="Submit tugas dengan file attachment",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Task ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"content"},
     *                 @OA\Property(property="content", type="string", description="Submission content/description"),
     *                 @OA\Property(property="files[]", type="array", @OA\Items(type="string", format="binary"), description="Attachment files"),
     *                 @OA\Property(property="link", type="string", format="url", description="External link (optional)")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Task submitted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tugas berhasil dikumpulkan"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="submission_id", type="integer"),
     *                 @OA\Property(property="submitted_at", type="string", format="datetime"),
     *                 @OA\Property(property="points_earned", type="integer", example=5)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Deadline passed or already submitted"
     *     )
     * )
     */
    public function submit(Request $request, $id)
    {
        // Implementation
    }

    /**
     * @OA\Post(
     *     path="/api/tasks",
     *     tags={"Tasks"},
     *     summary="Create new task (Dosen only)",
     *     description="Membuat tugas baru",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"course_id", "judul", "deskripsi", "jenis", "deadline"},
     *             @OA\Property(property="course_id", type="integer", example=1),
     *             @OA\Property(property="judul", type="string", example="Tugas Minggu 1"),
     *             @OA\Property(property="deskripsi", type="string", example="Deskripsi tugas"),
     *             @OA\Property(property="instruksi", type="string", example="Instruksi pengerjaan"),
     *             @OA\Property(property="jenis", type="string", enum={"tugas", "quiz", "project", "presentasi", "lainnya"}),
     *             @OA\Property(property="prioritas", type="string", enum={"rendah", "sedang", "tinggi"}, example="sedang"),
     *             @OA\Property(property="deadline", type="string", format="datetime"),
     *             @OA\Property(property="status", type="string", enum={"draft", "published"}, example="published")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Task created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tugas berhasil dibuat"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized - Dosen only"
     *     )
     * )
     */
    public function store(Request $request)
    {
        // Implementation
    }
}
