<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use Illuminate\Http\JsonResponse;

class AttendanceAIStatusController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $log = AttendanceLog::findOrFail($id);

        return response()->json([
            'id' => $log->id,
            'ai_processing_step' => $log->ai_processing_step,
            'ai_confidence' => $log->ai_confidence,
            'ai_recommendation' => $log->ai_recommendation,
            'face_detected' => $log->face_detected,
            'face_match_score' => $log->face_match_score,
            'is_live_photo' => $log->is_live_photo,
            'image_quality_score' => $log->image_quality_score,
            'is_suspicious' => $log->is_suspicious,
            'risk_score' => $log->risk_score,
            'ai_processed_at' => $log->ai_processed_at?->toIso8601String(),
        ]);
    }
}
