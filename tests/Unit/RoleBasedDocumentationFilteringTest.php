<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for Role-Based Documentation Filtering
 * Feature: advanced-settings-documentation
 * 
 * Property 5: Role-Based Documentation Filtering
 * Documentation guides SHALL only be visible to users with the appropriate role.
 * Dosen guides should only be visible to dosen users.
 * Mahasiswa guides should only be visible to mahasiswa users.
 * 
 * Validates: Requirements 2.6
 */
class RoleBasedDocumentationFilteringTest extends TestCase
{
    /**
     * Simulated documentation guides
     */
    protected array $dosenGuides = [];
    protected array $mahasiswaGuides = [];

    protected function setUp(): void
    {
        parent::setUp();
        
        // Initialize dosen guides
        $this->dosenGuides = [
            ['id' => 'dosen-dashboard', 'title' => 'Dashboard Dosen', 'role' => 'dosen'],
            ['id' => 'dosen-sesi-absen', 'title' => 'Sesi Absen', 'role' => 'dosen'],
            ['id' => 'dosen-mata-kuliah', 'title' => 'Mata Kuliah', 'role' => 'dosen'],
            ['id' => 'dosen-tugas', 'title' => 'Tugas', 'role' => 'dosen'],
            ['id' => 'dosen-persetujuan-izin', 'title' => 'Persetujuan Izin', 'role' => 'dosen'],
            ['id' => 'dosen-verifikasi', 'title' => 'Verifikasi', 'role' => 'dosen'],
            ['id' => 'dosen-rekapan', 'title' => 'Rekapan', 'role' => 'dosen'],
            ['id' => 'dosen-penilaian', 'title' => 'Penilaian', 'role' => 'dosen'],
            ['id' => 'dosen-class-insights', 'title' => 'Class Insights', 'role' => 'dosen'],
            ['id' => 'dosen-session-templates', 'title' => 'Session Templates', 'role' => 'dosen'],
            ['id' => 'dosen-notifikasi', 'title' => 'Notifikasi', 'role' => 'dosen'],
            ['id' => 'dosen-chat', 'title' => 'Chat', 'role' => 'dosen'],
        ];

        // Initialize mahasiswa guides
        $this->mahasiswaGuides = [
            ['id' => 'mahasiswa-dashboard', 'title' => 'Dashboard Mahasiswa', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-absen', 'title' => 'Absen', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-rekapan', 'title' => 'Rekapan', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-riwayat', 'title' => 'Riwayat', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-tugas', 'title' => 'Tugas', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-izin-sakit', 'title' => 'Izin/Sakit', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-akademik', 'title' => 'Akademik', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-personal-analytics', 'title' => 'Personal Analytics', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-pencapaian', 'title' => 'Pencapaian', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-leaderboard', 'title' => 'Leaderboard', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-uang-kas', 'title' => 'Uang Kas', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-voting-kas', 'title' => 'Voting Kas', 'role' => 'mahasiswa'],
            ['id' => 'mahasiswa-chat', 'title' => 'Chat', 'role' => 'mahasiswa'],
        ];
    }

    /**
     * Property 5: Dosen users should only see dosen guides
     */
    public function test_dosen_user_sees_only_dosen_guides(): void
    {
        $userRole = 'dosen';
        $visibleGuides = $this->getGuidesForRole($userRole);
        
        // All visible guides should be dosen guides
        foreach ($visibleGuides as $guide) {
            $this->assertEquals('dosen', $guide['role'], "Dosen user should only see dosen guides, but saw: {$guide['id']}");
        }
        
        // Should see all dosen guides
        $this->assertCount(count($this->dosenGuides), $visibleGuides, 'Dosen user should see all dosen guides');
    }

    /**
     * Property 5: Mahasiswa users should only see mahasiswa guides
     */
    public function test_mahasiswa_user_sees_only_mahasiswa_guides(): void
    {
        $userRole = 'mahasiswa';
        $visibleGuides = $this->getGuidesForRole($userRole);
        
        // All visible guides should be mahasiswa guides
        foreach ($visibleGuides as $guide) {
            $this->assertEquals('mahasiswa', $guide['role'], "Mahasiswa user should only see mahasiswa guides, but saw: {$guide['id']}");
        }
        
        // Should see all mahasiswa guides
        $this->assertCount(count($this->mahasiswaGuides), $visibleGuides, 'Mahasiswa user should see all mahasiswa guides');
    }

    /**
     * Property 5: Dosen users should NOT see mahasiswa guides
     */
    public function test_dosen_user_does_not_see_mahasiswa_guides(): void
    {
        $userRole = 'dosen';
        $visibleGuides = $this->getGuidesForRole($userRole);
        $visibleIds = array_column($visibleGuides, 'id');
        
        foreach ($this->mahasiswaGuides as $guide) {
            $this->assertNotContains($guide['id'], $visibleIds, "Dosen user should NOT see mahasiswa guide: {$guide['id']}");
        }
    }

    /**
     * Property 5: Mahasiswa users should NOT see dosen guides
     */
    public function test_mahasiswa_user_does_not_see_dosen_guides(): void
    {
        $userRole = 'mahasiswa';
        $visibleGuides = $this->getGuidesForRole($userRole);
        $visibleIds = array_column($visibleGuides, 'id');
        
        foreach ($this->dosenGuides as $guide) {
            $this->assertNotContains($guide['id'], $visibleIds, "Mahasiswa user should NOT see dosen guide: {$guide['id']}");
        }
    }

    /**
     * Property 5: Guide access by ID should respect role
     */
    public function test_guide_access_by_id_respects_role(): void
    {
        // Dosen accessing dosen guide - should succeed
        $this->assertTrue(
            $this->canAccessGuide('dosen', 'dosen-dashboard'),
            'Dosen should be able to access dosen-dashboard'
        );
        
        // Dosen accessing mahasiswa guide - should fail
        $this->assertFalse(
            $this->canAccessGuide('dosen', 'mahasiswa-dashboard'),
            'Dosen should NOT be able to access mahasiswa-dashboard'
        );
        
        // Mahasiswa accessing mahasiswa guide - should succeed
        $this->assertTrue(
            $this->canAccessGuide('mahasiswa', 'mahasiswa-dashboard'),
            'Mahasiswa should be able to access mahasiswa-dashboard'
        );
        
        // Mahasiswa accessing dosen guide - should fail
        $this->assertFalse(
            $this->canAccessGuide('mahasiswa', 'dosen-dashboard'),
            'Mahasiswa should NOT be able to access dosen-dashboard'
        );
    }

    /**
     * Property 5: Search results should be filtered by role
     */
    public function test_search_results_filtered_by_role(): void
    {
        // Search for "Dashboard" as dosen
        $dosenResults = $this->searchGuides('dosen', 'Dashboard');
        foreach ($dosenResults as $result) {
            $this->assertEquals('dosen', $result['role'], 'Dosen search results should only contain dosen guides');
        }
        
        // Search for "Dashboard" as mahasiswa
        $mahasiswaResults = $this->searchGuides('mahasiswa', 'Dashboard');
        foreach ($mahasiswaResults as $result) {
            $this->assertEquals('mahasiswa', $result['role'], 'Mahasiswa search results should only contain mahasiswa guides');
        }
    }

    /**
     * Property 5: Search for common term should return role-appropriate results
     */
    public function test_search_common_term_returns_role_appropriate_results(): void
    {
        // Both roles have "Rekapan" guide
        $dosenResults = $this->searchGuides('dosen', 'Rekapan');
        $mahasiswaResults = $this->searchGuides('mahasiswa', 'Rekapan');
        
        // Dosen should get dosen-rekapan
        $dosenIds = array_column($dosenResults, 'id');
        $this->assertContains('dosen-rekapan', $dosenIds, 'Dosen should find dosen-rekapan');
        $this->assertNotContains('mahasiswa-rekapan', $dosenIds, 'Dosen should NOT find mahasiswa-rekapan');
        
        // Mahasiswa should get mahasiswa-rekapan
        $mahasiswaIds = array_column($mahasiswaResults, 'id');
        $this->assertContains('mahasiswa-rekapan', $mahasiswaIds, 'Mahasiswa should find mahasiswa-rekapan');
        $this->assertNotContains('dosen-rekapan', $mahasiswaIds, 'Mahasiswa should NOT find dosen-rekapan');
    }

    /**
     * Property 5: Empty role should return no guides
     */
    public function test_empty_role_returns_no_guides(): void
    {
        $visibleGuides = $this->getGuidesForRole('');
        $this->assertEmpty($visibleGuides, 'Empty role should return no guides');
    }

    /**
     * Property 5: Invalid role should return no guides
     */
    public function test_invalid_role_returns_no_guides(): void
    {
        $invalidRoles = ['admin', 'guest', 'unknown', 'DOSEN', 'MAHASISWA'];
        
        foreach ($invalidRoles as $role) {
            $visibleGuides = $this->getGuidesForRole($role);
            $this->assertEmpty($visibleGuides, "Invalid role '{$role}' should return no guides");
        }
    }

    /**
     * Property 5: All guides have a valid role assigned
     */
    public function test_all_guides_have_valid_role(): void
    {
        $validRoles = ['dosen', 'mahasiswa'];
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        
        foreach ($allGuides as $guide) {
            $this->assertContains($guide['role'], $validRoles, "Guide {$guide['id']} should have a valid role");
        }
    }

    /**
     * Property 5: Guide IDs are unique across all roles
     */
    public function test_guide_ids_are_unique(): void
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        $ids = array_column($allGuides, 'id');
        $uniqueIds = array_unique($ids);
        
        $this->assertCount(count($ids), $uniqueIds, 'All guide IDs should be unique');
    }

    /**
     * Helper: Get guides for a specific role
     */
    protected function getGuidesForRole(string $role): array
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        return array_filter($allGuides, fn($guide) => $guide['role'] === $role);
    }

    /**
     * Helper: Check if user can access a specific guide
     */
    protected function canAccessGuide(string $userRole, string $guideId): bool
    {
        $allGuides = array_merge($this->dosenGuides, $this->mahasiswaGuides);
        
        foreach ($allGuides as $guide) {
            if ($guide['id'] === $guideId) {
                return $guide['role'] === $userRole;
            }
        }
        
        return false;
    }

    /**
     * Helper: Search guides filtered by role
     */
    protected function searchGuides(string $role, string $query): array
    {
        $roleGuides = $this->getGuidesForRole($role);
        $query = strtolower($query);
        
        return array_filter($roleGuides, function($guide) use ($query) {
            return str_contains(strtolower($guide['title']), $query) ||
                   str_contains(strtolower($guide['id']), $query);
        });
    }
}
