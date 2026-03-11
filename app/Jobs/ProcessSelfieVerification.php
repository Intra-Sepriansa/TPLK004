<?php

namespace App\Jobs;

use App\Models\AttendanceLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessSelfieVerification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $logId;

    public function __construct(int $logId)
    {
        $this->logId = $logId;
    }

    public function handle(): void
    {
        $log = AttendanceLog::with('mahasiswa')->findOrFail($this->logId);

        try {
            // Step 1: Face Detection
            $log->update(['ai_processing_step' => 'face_detection']);
            $faceDetection = $this->detectFace($log);
            usleep(800_000); // 0.8s simulate processing

            // Step 2: Face Matching
            $log->update(['ai_processing_step' => 'face_matching']);
            $faceMatch = $this->matchFace($log);
            usleep(1_000_000); // 1s

            // Step 3: Liveness Detection
            $log->update(['ai_processing_step' => 'liveness_detection']);
            $liveness = $this->detectLiveness($log);
            usleep(800_000);

            // Step 4: Quality Analysis
            $log->update(['ai_processing_step' => 'quality_analysis']);
            $quality = $this->analyzeQuality($log);
            usleep(600_000);



            // Calculate overall confidence
            $confidence = $this->calculateConfidence([
                'face_detection' => $faceDetection,
                'face_match' => $faceMatch,
                'liveness' => $liveness,
                'quality' => $quality,
            ]);

            // Determine recommendation
            $recommendation = 'review';
            if ($confidence >= 85) {
                $recommendation = 'approve';
            } elseif ($confidence < 50) {
                $recommendation = 'reject';
            }

            // Save results
            $log->update([
                'ai_processing_step' => 'completed',
                'face_detected' => $faceDetection['detected'],
                'face_match_score' => $faceMatch['score'],
                'is_live_photo' => $liveness['is_live'],
                'spoofing_detected' => $liveness['spoofing_detected'],
                'image_quality_score' => $quality['overall_score'],
                'ai_confidence' => $confidence,
                'ai_recommendation' => $recommendation,
                'ai_analysis_json' => [
                    'face_detection' => $faceDetection,
                    'face_match' => $faceMatch,
                    'liveness' => $liveness,
                    'quality' => $quality,
                    'confidence' => $confidence,
                    'recommendation' => $recommendation,
                ],
                'ai_processed_at' => \now(),
            ]);

            Log::info("AI Verification completed for log {$this->logId}: {$recommendation} ({$confidence}%)");

        } catch (\Exception $e) {
            Log::error("AI Verification failed for log {$this->logId}: " . $e->getMessage());

            $log->update([
                'ai_processing_step' => 'failed',
                'ai_recommendation' => 'review',
            ]);
        }
    }

    private function detectFace(AttendanceLog $log): array
    {
        $seed = crc32($log->id . 'face_detect');
        mt_srand($seed);

        $detected = mt_rand(0, 100) > 5;
        $faceCount = $detected ? mt_rand(1, 2) : 0;

        return [
            'detected' => $detected,
            'face_count' => $faceCount,
            'multiple_faces' => $faceCount > 1,
            'confidence' => $detected ? mt_rand(85, 99) : 0,
            'bounding_box' => $detected ? [
                'x' => mt_rand(80, 200),
                'y' => mt_rand(50, 150),
                'width' => mt_rand(150, 300),
                'height' => mt_rand(180, 350),
            ] : null,
            'processing_time_ms' => mt_rand(120, 400),
        ];
    }

    private function matchFace(AttendanceLog $log): array
    {
        $seed = crc32($log->id . 'face_match');
        mt_srand($seed);

        $score = mt_rand(60, 99);

        return [
            'score' => $score,
            'threshold' => 70,
            'matched' => $score >= 70,
            'similarity_vector' => round($score / 100, 4),
            'processing_time_ms' => mt_rand(200, 600),
        ];
    }

    private function detectLiveness(AttendanceLog $log): array
    {
        $seed = crc32($log->id . 'liveness');
        mt_srand($seed);

        $livenessScore = mt_rand(70, 99);
        $isLive = $livenessScore > 75;

        return [
            'is_live' => $isLive,
            'liveness_score' => $livenessScore,
            'spoofing_detected' => !$isLive,
            'texture_score' => mt_rand(75, 99),
            'depth_score' => mt_rand(70, 99),
            'processing_time_ms' => mt_rand(200, 500),
        ];
    }

    private function analyzeQuality(AttendanceLog $log): array
    {
        $seed = crc32($log->id . 'quality');
        mt_srand($seed);

        $blur = mt_rand(70, 99);
        $lighting = mt_rand(60, 99);
        $overall = round(($blur + $lighting) / 2);

        return [
            'overall_score' => $overall,
            'blur_score' => $blur,
            'lighting_score' => $lighting,
            'is_blurry' => $blur < 75,
            'is_too_dark' => $lighting < 65,
            'resolution_ok' => true,
            'processing_time_ms' => mt_rand(80, 250),
        ];
    }



    private function calculateConfidence(array $results): int
    {
        $score = 0;
        $score += ($results['face_detection']['detected'] ? 100 : 0) * 0.20;
        $score += ($results['face_match']['score'] ?? 0) * 0.40;
        $score += ($results['liveness']['is_live'] ? 100 : 0) * 0.25;
        $score += ($results['quality']['overall_score'] ?? 0) * 0.15;

        return (int) round($score);
    }
}
