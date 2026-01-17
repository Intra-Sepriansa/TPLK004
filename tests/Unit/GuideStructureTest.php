<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for Guide Structure Completeness
 * Feature: advanced-settings-documentation
 * 
 * Property 6: Guide Structure Completeness
 * For any MenuGuide in the system, it SHALL contain all required sections: 
 * Overview, Features, Tutorial, Tips & Best Practices, and FAQ.
 * 
 * Validates: Requirements 2.3
 */
class GuideStructureTest extends TestCase
{
    protected array $requiredSections = ['overview', 'features', 'tutorial', 'tips', 'faq'];
    protected array $dosenGuides;
    protected array $mahasiswaGuides;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Load guides from JSON files
        $dosenPath = __DIR__ . '/../../resources/docs/dosen-guides.json';
        $mahasiswaPath = __DIR__ . '/../../resources/docs/mahasiswa-guides.json';
        
        if (file_exists($dosenPath)) {
            $dosenData = json_decode(file_get_contents($dosenPath), true);
            $this->dosenGuides = $dosenData['guides'] ?? [];
        } else {
            $this->dosenGuides = [];
        }
        
        if (file_exists($mahasiswaPath)) {
            $mahasiswaData = json_decode(file_get_contents($mahasiswaPath), true);
            $this->mahasiswaGuides = $mahasiswaData['guides'] ?? [];
        } else {
            $this->mahasiswaGuides = [];
        }
    }

    /**
     * Property 6: All dosen guides have required sections
     */
    public function test_all_dosen_guides_have_required_sections(): void
    {
        $this->assertNotEmpty($this->dosenGuides, 'Dosen guides should not be empty');

        foreach ($this->dosenGuides as $guide) {
            $this->assertGuideHasRequiredSections($guide, 'dosen');
        }
    }

    /**
     * Property 6: All mahasiswa guides have required sections
     */
    public function test_all_mahasiswa_guides_have_required_sections(): void
    {
        $this->assertNotEmpty($this->mahasiswaGuides, 'Mahasiswa guides should not be empty');

        foreach ($this->mahasiswaGuides as $guide) {
            $this->assertGuideHasRequiredSections($guide, 'mahasiswa');
        }
    }

    /**
     * Property 6: All guides have required metadata
     */
    public function test_all_guides_have_required_metadata(): void
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        $requiredFields = ['id', 'menuKey', 'title', 'description', 'icon', 'category'];

        foreach ($allGuides as $guide) {
            foreach ($requiredFields as $field) {
                $this->assertArrayHasKey(
                    $field,
                    $guide,
                    "Guide '{$guide['id']}' should have '{$field}' field"
                );
                $this->assertNotEmpty(
                    $guide[$field],
                    "Guide '{$guide['id']}' field '{$field}' should not be empty"
                );
            }
        }
    }

    /**
     * Property 6: All sections have required structure
     */
    public function test_all_sections_have_required_structure(): void
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        $requiredSectionFields = ['id', 'title', 'type', 'content'];

        foreach ($allGuides as $guide) {
            foreach ($guide['sections'] ?? [] as $section) {
                foreach ($requiredSectionFields as $field) {
                    $this->assertArrayHasKey(
                        $field,
                        $section,
                        "Section in guide '{$guide['id']}' should have '{$field}' field"
                    );
                }
            }
        }
    }

    /**
     * Property 6: FAQ sections have faqs array
     */
    public function test_faq_sections_have_faqs_array(): void
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);

        foreach ($allGuides as $guide) {
            foreach ($guide['sections'] ?? [] as $section) {
                if ($section['type'] === 'faq') {
                    $this->assertArrayHasKey(
                        'faqs',
                        $section,
                        "FAQ section in guide '{$guide['id']}' should have 'faqs' array"
                    );
                    $this->assertIsArray(
                        $section['faqs'],
                        "FAQ section 'faqs' in guide '{$guide['id']}' should be an array"
                    );
                }
            }
        }
    }

    /**
     * Property 6: Guide IDs are unique
     */
    public function test_guide_ids_are_unique(): void
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        $ids = array_column($allGuides, 'id');
        
        $this->assertEquals(
            count($ids),
            count(array_unique($ids)),
            'All guide IDs should be unique'
        );
    }

    /**
     * Property 6: Section IDs within a guide are unique
     */
    public function test_section_ids_within_guide_are_unique(): void
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);

        foreach ($allGuides as $guide) {
            $sectionIds = array_column($guide['sections'] ?? [], 'id');
            
            $this->assertEquals(
                count($sectionIds),
                count(array_unique($sectionIds)),
                "Section IDs in guide '{$guide['id']}' should be unique"
            );
        }
    }

    /**
     * Property 6: Valid category values
     */
    public function test_guides_have_valid_categories(): void
    {
        $validCategories = ['core', 'academic', 'analytics', 'communication', 'finance'];
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);

        foreach ($allGuides as $guide) {
            $this->assertContains(
                $guide['category'],
                $validCategories,
                "Guide '{$guide['id']}' should have a valid category"
            );
        }
    }

    /**
     * Property 6: Valid section types
     */
    public function test_sections_have_valid_types(): void
    {
        $validTypes = ['overview', 'features', 'tutorial', 'tips', 'faq'];
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);

        foreach ($allGuides as $guide) {
            foreach ($guide['sections'] ?? [] as $section) {
                $this->assertContains(
                    $section['type'],
                    $validTypes,
                    "Section '{$section['id']}' in guide '{$guide['id']}' should have a valid type"
                );
            }
        }
    }

    /**
     * Property 6: Dosen guides cover all expected menus
     */
    public function test_dosen_guides_cover_expected_menus(): void
    {
        $expectedMenus = [
            'dashboard', 'sesi-absen', 'courses', 'tugas', 'permits',
            'verify', 'rekapan', 'grading', 'class-insights',
            'session-templates', 'notifications', 'chat'
        ];

        $guideMenuKeys = array_column($this->dosenGuides, 'menuKey');

        foreach ($expectedMenus as $menu) {
            $this->assertContains(
                $menu,
                $guideMenuKeys,
                "Dosen guides should include guide for menu '{$menu}'"
            );
        }
    }

    /**
     * Property 6: Mahasiswa guides cover all expected menus
     */
    public function test_mahasiswa_guides_cover_expected_menus(): void
    {
        $expectedMenus = [
            'dashboard', 'absen', 'rekapan', 'history', 'tugas',
            'permit', 'akademik', 'personal-analytics', 'achievements',
            'leaderboard', 'kas', 'kas-voting', 'chat'
        ];

        $guideMenuKeys = array_column($this->mahasiswaGuides, 'menuKey');

        foreach ($expectedMenus as $menu) {
            $this->assertContains(
                $menu,
                $guideMenuKeys,
                "Mahasiswa guides should include guide for menu '{$menu}'"
            );
        }
    }

    /**
     * Helper: Assert guide has all required sections
     */
    protected function assertGuideHasRequiredSections(array $guide, string $role): void
    {
        $this->assertArrayHasKey('sections', $guide, "Guide '{$guide['id']}' should have sections");
        
        $sectionTypes = array_column($guide['sections'], 'type');
        
        foreach ($this->requiredSections as $requiredSection) {
            $this->assertContains(
                $requiredSection,
                $sectionTypes,
                "{$role} guide '{$guide['id']}' should have '{$requiredSection}' section"
            );
        }
    }
}
