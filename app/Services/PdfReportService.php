<?php

namespace App\Services;

use App\Models\WeeklyLearningDigest;
use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use Exception;

class PdfReportService
{
    /**
     * Generate a single PDF for a WeeklyLearningDigest.
     * Returns the generated PDF content.
     */
    public function generateWeeklyDigestPdf(WeeklyLearningDigest $digest, $user = null): string
    {
        // Setup QR Code
        $urlToVerify = url('/admin/weekly-digest/' . $digest->id); // Can point to a public verify route if exists
        $qrOptions = new QROptions([
            'version' => 5,
            'outputType' => QRCode::OUTPUT_MARKUP_SVG,
            'eccLevel' => QRCode::ECC_L,
        ]);
        $qrcode = (new QRCode($qrOptions))->render($urlToVerify);

        // Fetch visual analytics (chart)
        $chartBase64 = $this->getChartBase64($digest);

        // Setup base variables
        $courses = $digest->mataKuliahs;
        $titlePieces = [];
        foreach ($courses as $course) {
            $piece = $course->nama . ' (P' . $course->pivot->meeting_number . ')';
            $titlePieces[] = $piece;
        }

        $displayTitle = !empty($titlePieces) ? implode(', ', $titlePieces) : 'Laporan Pekanan';
        if (strlen($displayTitle) > 100) {
            $displayTitle = substr($displayTitle, 0, 97) . '...';
        }

        $data = [
            'digest' => $digest,
            'courses' => $courses,
            'displayTitle' => $displayTitle,
            'qrcode' => $qrcode,
            'chartBase64' => $chartBase64,
            'constants' => [
                'platform_name' => 'Mentari E-Learning',
                'class_label' => 'Reguler',
            ],
            'generatedAt' => now(),
            'generatedBy' => $user->name ?? 'System Batch',
            'logoUnpam' => public_path('assets/logos/unpam-logo.png'),
            'logoSasmita' => public_path('assets/logos/sasmita-logo.png'),
        ];

        $pdf = Pdf::loadView('pdf.weekly-learning-digest', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->output();
    }

    /**
     * Fetch a simple bar chart from QuickChart encoding forum vs structured tasks requirements.
     */
    protected function getChartBase64(WeeklyLearningDigest $digest): ?string
    {
        try {
            // Build simple data for charting visually
            $forumVal = $digest->forum_posts_required;
            $taskVal = $digest->has_structured_task ? 100 : 0;
            
            $chartConfig = [
                'type' => 'bar',
                'data' => [
                    'labels' => ['Target Forum', 'Bobot Tugas'],
                    'datasets' => [
                        [
                            'label' => 'Komponen Akademik',
                            'data' => [$forumVal * 20, $taskVal], // scale forum for visual appeal
                            'backgroundColor' => ['#4f46e5', '#10b981']
                        ]
                    ]
                ],
                'options' => [
                    'plugins' => [
                         'legend' => ['display' => false]
                    ],
                    'scales' => [
                        'y' => [
                            'beginAtZero' => true,
                            'max' => 100
                        ]
                    ]
                ]
            ];

            $response = Http::get('https://quickchart.io/chart', [
                'c' => json_encode($chartConfig),
                'w' => 400,
                'h' => 200,
                'bkg' => 'transparent',
                'f' => 'base64' // direct base64
            ]);

            if ($response->successful()) {
                return 'data:image/png;base64,' . $response->body();
            }

            return null;
        } catch (Exception $e) {
            return null; // Silent failure for external API to not break export
        }
    }

    /**
     * Generates a batch ZIP containing multiple PDFs.
     * Returns the relative storage path to the generated zip file.
     */
    public function generateBatchZip(array $digestIds, $user = null): string
    {
        $digests = WeeklyLearningDigest::whereIn('id', $digestIds)->with('mataKuliahs')->get();
        if ($digests->isEmpty()) {
            throw new Exception("No digests found for batch export.");
        }

        $zipPathRelative = 'exports/batch_weekly_digest_' . time() . '_' . uniqid() . '.zip';
        $zipPathAbsolute = storage_path('app/public/' . $zipPathRelative);
        
        if (!file_exists(storage_path('app/public/exports'))) {
            mkdir(storage_path('app/public/exports'), 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipPathAbsolute, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            foreach ($digests as $digest) {
                $filename = 'Info_Pekanan_Mentari_Minggu_' . $digest->week_number . '_ID_' . $digest->id . '.pdf';
                $pdfContent = $this->generateWeeklyDigestPdf($digest, $user);
                $zip->addFromString($filename, $pdfContent);
            }
            $zip->close();
        }

        return $zipPathRelative;
    }
}
