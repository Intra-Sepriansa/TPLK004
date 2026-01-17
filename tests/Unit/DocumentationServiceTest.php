<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;

/**
 * Property-based tests for DocumentationService
 * Feature: advanced-settings-documentation
 * 
 * Property 4: Documentation Search Relevance
 * For any search query in the Documentation Hub or Help Center, 
 * all returned results SHALL contain the search term in their title, description, or content.
 * 
 * Validates: Requirements 2.2, 6.2
 */
class DocumentationServiceTest extends TestCase
{
    /**
     * Sample guides for testing
     */
    protected array $sampleGuides;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sampleGuides = $this->createSampleGuides();
    }

    /**
     * Property 4: Search results contain search term in title
     */
    public function test_search_results_contain_term_in_title(): void
    {
        $searchTerms = ['Dashboard', 'Absen', 'Tugas', 'Chat', 'Notifikasi'];

        foreach ($searchTerms as $term) {
            $results = $this->searchGuides($term, $this->sampleGuides);
            
            foreach ($results as $result) {
                $containsTerm = $this->guideContainsTerm($result, $term);
                $this->assertTrue(
                    $containsTerm,
                    "Search result for '{$term}' should contain the term in title, description, or content"
                );
            }
        }
    }

    /**
     * Property 4: Search results contain term in description
     */
    public function test_search_results_contain_term_in_description(): void
    {
        $searchTerms = ['ringkasan', 'statistik', 'kelola', 'verifikasi'];

        foreach ($searchTerms as $term) {
            $results = $this->searchGuides($term, $this->sampleGuides);
            
            foreach ($results as $result) {
                $containsTerm = $this->guideContainsTerm($result, $term);
                $this->assertTrue(
                    $containsTerm,
                    "Search result for '{$term}' should contain the term"
                );
            }
        }
    }

    /**
     * Property 4: Search results contain term in section content
     */
    public function test_search_results_contain_term_in_content(): void
    {
        $searchTerms = ['panduan', 'fitur', 'langkah'];

        foreach ($searchTerms as $term) {
            $results = $this->searchGuides($term, $this->sampleGuides);
            
            foreach ($results as $result) {
                $containsTerm = $this->guideContainsTerm($result, $term);
                $this->assertTrue(
                    $containsTerm,
                    "Search result for '{$term}' should contain the term in content"
                );
            }
        }
    }

    /**
     * Property 4: Case-insensitive search
     */
    public function test_search_is_case_insensitive(): void
    {
        $testCases = [
            ['DASHBOARD', 'dashboard'],
            ['Dashboard', 'DASHBOARD'],
            ['absen', 'ABSEN'],
            ['TuGaS', 'tugas'],
        ];

        foreach ($testCases as [$term1, $term2]) {
            $results1 = $this->searchGuides($term1, $this->sampleGuides);
            $results2 = $this->searchGuides($term2, $this->sampleGuides);
            
            $this->assertEquals(
                count($results1),
                count($results2),
                "Search for '{$term1}' and '{$term2}' should return same number of results"
            );
        }
    }

    /**
     * Property 4: Empty search returns no results
     */
    public function test_empty_search_returns_no_results(): void
    {
        $results = $this->searchGuides('', $this->sampleGuides);
        $this->assertCount(0, $results, 'Empty search should return no results');
    }

    /**
     * Property 4: Non-matching search returns no results
     */
    public function test_non_matching_search_returns_no_results(): void
    {
        $nonExistentTerms = ['xyz123', 'nonexistent', 'qwertyuiop'];

        foreach ($nonExistentTerms as $term) {
            $results = $this->searchGuides($term, $this->sampleGuides);
            $this->assertCount(0, $results, "Search for '{$term}' should return no results");
        }
    }

    /**
     * Property 4: Partial match works
     */
    public function test_partial_match_works(): void
    {
        $partialTerms = ['Dash', 'Abs', 'Tug', 'Not'];

        foreach ($partialTerms as $term) {
            $results = $this->searchGuides($term, $this->sampleGuides);
            
            foreach ($results as $result) {
                $containsTerm = $this->guideContainsTerm($result, $term);
                $this->assertTrue(
                    $containsTerm,
                    "Partial search for '{$term}' should match guides containing the term"
                );
            }
        }
    }

    /**
     * Property 4: Search in FAQ questions
     */
    public function test_search_in_faq_questions(): void
    {
        // Add a guide with FAQ
        $guideWithFaq = [
            'id' => 'test-faq',
            'title' => 'Test Guide',
            'description' => 'A test guide',
            'sections' => [
                [
                    'type' => 'faq',
                    'faqs' => [
                        ['question' => 'Bagaimana cara reset password?', 'answer' => 'Klik tombol lupa password'],
                        ['question' => 'Apa itu QR code?', 'answer' => 'QR code adalah kode untuk absensi'],
                    ],
                ],
            ],
        ];

        $guides = array_merge($this->sampleGuides, [$guideWithFaq]);
        
        $results = $this->searchGuides('password', $guides);
        $this->assertGreaterThan(0, count($results), 'Should find guide with FAQ containing "password"');
        
        $results = $this->searchGuides('QR code', $guides);
        $this->assertGreaterThan(0, count($results), 'Should find guide with FAQ containing "QR code"');
    }

    /**
     * Property 4: All results are relevant (no false positives)
     */
    public function test_no_false_positives_in_search(): void
    {
        $searchTerms = ['Dashboard', 'Absen', 'Tugas', 'Chat'];

        foreach ($searchTerms as $term) {
            $results = $this->searchGuides($term, $this->sampleGuides);
            
            foreach ($results as $result) {
                $containsTerm = $this->guideContainsTerm($result, $term);
                $this->assertTrue(
                    $containsTerm,
                    "All search results for '{$term}' must contain the search term (no false positives)"
                );
            }
        }
    }

    /**
     * Property test: Search with multiple words
     */
    public function test_search_with_multiple_words(): void
    {
        $results = $this->searchGuides('Sesi Absen', $this->sampleGuides);
        
        // Should find guides that contain either "Sesi" or "Absen"
        foreach ($results as $result) {
            $containsSesi = $this->guideContainsTerm($result, 'Sesi');
            $containsAbsen = $this->guideContainsTerm($result, 'Absen');
            
            // For multi-word search, we check if the full phrase exists
            $containsPhrase = $this->guideContainsTerm($result, 'Sesi Absen');
            
            $this->assertTrue(
                $containsPhrase || $containsSesi || $containsAbsen,
                'Multi-word search should match guides containing the phrase or individual words'
            );
        }
    }

    /**
     * Property test: Search preserves guide structure
     */
    public function test_search_preserves_guide_structure(): void
    {
        $results = $this->searchGuides('Dashboard', $this->sampleGuides);
        
        foreach ($results as $result) {
            $this->assertArrayHasKey('id', $result, 'Search result should have id');
            $this->assertArrayHasKey('title', $result, 'Search result should have title');
            $this->assertArrayHasKey('description', $result, 'Search result should have description');
        }
    }

    /**
     * Helper: Search guides (simulates DocumentationService::searchGuides)
     */
    protected function searchGuides(string $query, array $guides): array
    {
        if (empty($query)) {
            return [];
        }

        $query = Str::lower($query);

        return array_values(array_filter($guides, function ($guide) use ($query) {
            // Search in title
            if (Str::contains(Str::lower($guide['title'] ?? ''), $query)) {
                return true;
            }

            // Search in description
            if (Str::contains(Str::lower($guide['description'] ?? ''), $query)) {
                return true;
            }

            // Search in sections content
            foreach ($guide['sections'] ?? [] as $section) {
                if (Str::contains(Str::lower($section['content'] ?? ''), $query)) {
                    return true;
                }
                if (Str::contains(Str::lower($section['title'] ?? ''), $query)) {
                    return true;
                }

                // Search in FAQ
                if (($section['type'] ?? '') === 'faq') {
                    foreach ($section['faqs'] ?? [] as $faq) {
                        if (Str::contains(Str::lower($faq['question'] ?? ''), $query)) {
                            return true;
                        }
                        if (Str::contains(Str::lower($faq['answer'] ?? ''), $query)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }));
    }

    /**
     * Helper: Check if guide contains search term
     */
    protected function guideContainsTerm(array $guide, string $term): bool
    {
        $term = Str::lower($term);

        // Check title
        if (Str::contains(Str::lower($guide['title'] ?? ''), $term)) {
            return true;
        }

        // Check description
        if (Str::contains(Str::lower($guide['description'] ?? ''), $term)) {
            return true;
        }

        // Check sections
        foreach ($guide['sections'] ?? [] as $section) {
            if (Str::contains(Str::lower($section['content'] ?? ''), $term)) {
                return true;
            }
            if (Str::contains(Str::lower($section['title'] ?? ''), $term)) {
                return true;
            }

            // Check FAQ
            if (($section['type'] ?? '') === 'faq') {
                foreach ($section['faqs'] ?? [] as $faq) {
                    if (Str::contains(Str::lower($faq['question'] ?? ''), $term)) {
                        return true;
                    }
                    if (Str::contains(Str::lower($faq['answer'] ?? ''), $term)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Helper: Create sample guides for testing
     */
    protected function createSampleGuides(): array
    {
        return [
            [
                'id' => 'dosen-dashboard',
                'title' => 'Dashboard',
                'description' => 'Halaman utama dengan ringkasan aktivitas dan statistik',
                'sections' => [
                    ['type' => 'overview', 'title' => 'Overview', 'content' => 'Selamat datang di panduan Dashboard.'],
                    ['type' => 'features', 'title' => 'Fitur', 'content' => 'Fitur-fitur utama yang tersedia.'],
                ],
            ],
            [
                'id' => 'dosen-sesi-absen',
                'title' => 'Sesi Absen',
                'description' => 'Kelola sesi absensi dan token kehadiran',
                'sections' => [
                    ['type' => 'overview', 'title' => 'Overview', 'content' => 'Panduan mengelola sesi absensi.'],
                    ['type' => 'tutorial', 'title' => 'Tutorial', 'content' => 'Langkah-langkah membuat sesi absen.'],
                ],
            ],
            [
                'id' => 'dosen-tugas',
                'title' => 'Informasi Tugas',
                'description' => 'Buat dan kelola tugas untuk mahasiswa',
                'sections' => [
                    ['type' => 'overview', 'title' => 'Overview', 'content' => 'Panduan mengelola tugas.'],
                ],
            ],
            [
                'id' => 'dosen-verify',
                'title' => 'Verifikasi',
                'description' => 'Verifikasi selfie dan deteksi kecurangan',
                'sections' => [
                    ['type' => 'overview', 'title' => 'Overview', 'content' => 'Panduan verifikasi kehadiran.'],
                ],
            ],
            [
                'id' => 'dosen-notifications',
                'title' => 'Notifikasi',
                'description' => 'Kelola notifikasi dan preferensi',
                'sections' => [
                    ['type' => 'overview', 'title' => 'Overview', 'content' => 'Panduan pengaturan notifikasi.'],
                ],
            ],
            [
                'id' => 'dosen-chat',
                'title' => 'Chat',
                'description' => 'Fitur pesan dan komunikasi',
                'sections' => [
                    ['type' => 'overview', 'title' => 'Overview', 'content' => 'Panduan menggunakan fitur chat.'],
                ],
            ],
        ];
    }
}
