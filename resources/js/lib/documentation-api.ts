/**
 * Documentation API Client Functions
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import { apiGet, apiPost, apiPut } from './api';
import type {
    MenuGuide,
    GuideSummary,
    ReadProgress,
    SearchResult,
    DocumentationRole,
    GuideCategory,
} from '@/types/documentation';

const BASE_URL = '/api/docs';

// Response Types
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

interface GuidesResponse {
    guides: GuideSummary[];
    total: number;
}

/**
 * Get all guides for a role
 */
export async function getGuides(
    role: DocumentationRole,
    category?: GuideCategory
): Promise<GuideSummary[]> {
    const params = new URLSearchParams({ role });
    if (category) params.append('category', category);
    
    const response = await apiGet(`${BASE_URL}/guides?${params}`);
    const data: ApiResponse<GuidesResponse> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch guides');
    }
    
    return data.data!.guides;
}

/**
 * Get a specific guide by ID
 */
export async function getGuide(guideId: string): Promise<MenuGuide> {
    const response = await apiGet(`${BASE_URL}/guides/${guideId}`);
    const data: ApiResponse<MenuGuide> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch guide');
    }
    
    return data.data!;
}

/**
 * Search guides
 */
export async function searchGuides(
    query: string,
    role?: DocumentationRole
): Promise<SearchResult[]> {
    const params = new URLSearchParams({ q: query });
    if (role) params.append('role', role);
    
    const response = await apiGet(`${BASE_URL}/search?${params}`);
    const data: ApiResponse<SearchResult[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to search guides');
    }
    
    return data.data!;
}

/**
 * Get reading progress for all guides
 */
export async function getAllProgress(): Promise<ReadProgress[]> {
    const response = await apiGet(`${BASE_URL}/progress`);
    const data: ApiResponse<ReadProgress[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch progress');
    }
    
    return data.data!;
}

/**
 * Get reading progress for a specific guide
 */
export async function getGuideProgress(guideId: string): Promise<ReadProgress> {
    const response = await apiGet(`${BASE_URL}/progress/${guideId}`);
    const data: ApiResponse<ReadProgress> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch guide progress');
    }
    
    return data.data!;
}

/**
 * Update reading progress for a guide
 */
export async function updateProgress(
    guideId: string,
    sectionId: string,
    completed: boolean
): Promise<ReadProgress> {
    const response = await apiPut(`${BASE_URL}/progress/${guideId}`, {
        sectionId,
        completed,
    });
    const data: ApiResponse<ReadProgress> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update progress');
    }
    
    return data.data!;
}

/**
 * Mark guide as completed
 */
export async function markGuideCompleted(guideId: string): Promise<ReadProgress> {
    const response = await apiPost(`${BASE_URL}/progress/${guideId}/complete`);
    const data: ApiResponse<ReadProgress> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to mark guide as completed');
    }
    
    return data.data!;
}

/**
 * Reset progress for a guide
 */
export async function resetGuideProgress(guideId: string): Promise<void> {
    const response = await apiPost(`${BASE_URL}/progress/${guideId}/reset`);
    const data: ApiResponse<void> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset progress');
    }
}

/**
 * Get overall documentation progress stats
 */
export async function getProgressStats(role: DocumentationRole): Promise<{
    totalGuides: number;
    completedGuides: number;
    inProgressGuides: number;
    overallProgress: number;
}> {
    const response = await apiGet(`${BASE_URL}/stats?role=${role}`);
    const data: ApiResponse<{
        totalGuides: number;
        completedGuides: number;
        inProgressGuides: number;
        overallProgress: number;
    }> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch stats');
    }
    
    return data.data!;
}
