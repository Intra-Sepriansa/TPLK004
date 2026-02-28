<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AINotesService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://api.blackbox.ai/api/chat';

    public function __construct()
    {
        $this->apiKey = env('BLACKBOX_API_KEY', '');
    }

    /**
     * Helper to call Blackbox AI API
     */
    protected function callBlackboxAPI(string $prompt): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('BLACKBOX_API_KEY is not set.');
            return "Error: Konfigurasi AI belum diatur (API Key hilang).";
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post($this->apiUrl, [
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                // Blackbox parameters
                'model' => 'deepseek-v3', // Optional: specifying a model if Blackbox supports it, but standard works
                'max_tokens' => 1024
            ]);

            if ($response->successful()) {
                // Blackbox usually returns the raw markdown text or a structured response.
                // Depending on the exact Blackbox API shape, but standard is root text or choices[0].message.content.
                // Assuming standard OpenAI-compatible response format from Blackbox Chat API:
                 $data = $response->json();
                 
                 // Handle direct text response (if Blackbox returns string directly) OR OpenAI JSON format
                 if (is_string($response->body()) && !$response->json()) {
                     return $response->body();
                 }

                 if (isset($data['choices'][0]['message']['content'])) {
                     return $data['choices'][0]['message']['content'];
                 }
                 
                 // If it's a direct text string in JSON
                 if (isset($data['text'])) return $data['text'];
                 
                 return json_encode($data); // Fallback
            }

            Log::error('Blackbox API Failed: ' . $response->body());
            return "Error: Gagal menghubungi Blackbox AI. " . $response->status();

        } catch (\Exception $e) {
            Log::error('Blackbox API Exception: ' . $e->getMessage());
            return "Error: Terjadi kesalahan internal saat menghubungi AI.";
        }
    }

    public function processText(string $content, string $action): string
    {
        $prompt = "";
        switch ($action) {
            case 'improve':
                $prompt = "Tolong perbaiki, rapikan, dan sempurnakan ejaan serta tata bahasa (EYD) dari teks bahasa Indonesia berikut agar terlihat sangat akademis dan profesional. HANYA KEMBALIKAN TEKS HASILNYA SAJA TANPA BASA-BASI:\n\n" . $content;
                break;
            case 'summarize':
                $prompt = "Buatkan ringkasan inti (executive summary) dalam bahasa Indonesia yang ringkas dan padat dari teks berikut. HANYA KEMBALIKAN TEKS RINGKASANNYA SAJA:\n\n" . $content;
                break;
            case 'expand':
                $prompt = "Elaborasikan dan kembangkan teks pendek berikut menjadi 2-3 paragraf akademis yang utuh dan informatif dalam bahasa Indonesia. HANYA KEMBALIKAN TEKS HASILNYA SAJA:\n\n" . $content;
                break;
            case 'simplify':
                $prompt = "Sederhanakan kalimat berikut agar sangat mudah dipahami oleh orang awam atau anak SMA tanpa mengurangi makna aslinya (Gunakan bahasa Indonesia). HANYA KEMBALIKAN TEKS HASILNYA SAJA:\n\n" . $content;
                break;
            default:
                $prompt = "Tolong tulis ulang teks ini:\n\n" . $content;
        }

        return $this->callBlackboxAPI($prompt) ?? $content;
    }

    public function generateSummary(string $content): string
    {
        $prompt = "Buatkan satu pragraf ringkasan eksekutif akademis dalam Bahasa Indonesia dari materi/catatan berikut. Hanya berikan teks ringkasan tanpa tambahan obrolan:\n\n" . $content;
        return $this->callBlackboxAPI($prompt) ?? "Tidak dapat membuat ringkasan.";
    }

    public function extractKeywords(string $content): array
    {
        $prompt = "Ekstrak 5-7 kata kunci utama (keywords) yang paling relevan dari catatan berikut. KEMBALIKAN HANYA DALAM FORMAT JSON ARRAY OF STRINGS LENGKAP TANPA FORMATTING/MARKDOWN LAIN (contoh: [\"kata1\", \"kata2\"]). Teks:\n\n" . $content;
        
        $jsonStr = $this->callBlackboxAPI($prompt);
        
        // Clean markdown backticks if AI returns them
        $cleanStr = trim(preg_replace('/```(json)?|```/', '', $jsonStr));
        
        $decoded = json_decode($cleanStr, true);
        
        if (is_array($decoded)) {
            return $decoded;
        }
        
        // Fallback
        return ['catatan', 'akademik', 'AI'];
    }

    public function generateFlashcards(string $content): array
    {
        $prompt = "Berdasarkan catatan berikut, buatkan 5 soal flashcard untuk belajar persiapan ujian mahasiswa. KEMBALIKAN HANYA DALAM FORMAT JAWABAN JSON ARRAY OBJECT ([\"question\" => \"...\", \"answer\" => \"...\"]) TANPA FORMATTING MARKDOWN/TEKS BASA-BASI LAINNYA. Catatan:\n\n" . $content;
        
        $jsonStr = $this->callBlackboxAPI($prompt);
        
        // Clean markdown backticks if AI returns them
        $cleanStr = trim(preg_replace('/```(json)?|```/', '', $jsonStr));
        
        $decoded = json_decode($cleanStr, true);
        
        if (is_array($decoded)) {
            return $decoded;
        }
        
        // Fallback
        return [
            [
                'question' => 'Flashcard Error',
                'answer' => 'Gagal memparsing output dari AI, silakan coba lagi.',
            ]
        ];
    }
}
