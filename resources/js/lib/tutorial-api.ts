/**
 * Tutorial API Client Functions
 * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6
 */

import { apiGet, apiPost } from './api';
import type { InteractiveTutorial, TutorialStatus } from '@/types/documentation';

const BASE_URL = '/api/tutorials';

// Response Types
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Get all available tutorials
 */
export async function getTutorials(): Promise<InteractiveTutorial[]> {
    const response = await apiGet(BASE_URL);
    const data: ApiResponse<InteractiveTutorial[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch tutorials');
    }
    
    return data.data!;
}

/**
 * Get a specific tutorial
 */
export async function getTutorial(tutorialId: string): Promise<InteractiveTutorial> {
    const response = await apiGet(`${BASE_URL}/${tutorialId}`);
    const data: ApiResponse<InteractiveTutorial> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch tutorial');
    }
    
    return data.data!;
}

/**
 * Get tutorial status for current user
 */
export async function getTutorialStatus(tutorialId: string): Promise<TutorialStatus> {
    const response = await apiGet(`${BASE_URL}/${tutorialId}/status`);
    const data: ApiResponse<TutorialStatus> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch tutorial status');
    }
    
    return data.data!;
}

/**
 * Get all tutorial statuses for current user
 */
export async function getAllTutorialStatuses(): Promise<TutorialStatus[]> {
    const response = await apiGet(`${BASE_URL}/status`);
    const data: ApiResponse<TutorialStatus[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch tutorial statuses');
    }
    
    return data.data!;
}

/**
 * Start a tutorial
 */
export async function startTutorial(tutorialId: string): Promise<TutorialStatus> {
    const response = await apiPost(`${BASE_URL}/${tutorialId}/start`);
    const data: ApiResponse<TutorialStatus> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to start tutorial');
    }
    
    return data.data!;
}

/**
 * Complete a tutorial
 */
export async function completeTutorial(tutorialId: string): Promise<TutorialStatus> {
    const response = await apiPost(`${BASE_URL}/${tutorialId}/complete`);
    const data: ApiResponse<TutorialStatus> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete tutorial');
    }
    
    return data.data!;
}

/**
 * Skip a tutorial
 */
export async function skipTutorial(tutorialId: string): Promise<TutorialStatus> {
    const response = await apiPost(`${BASE_URL}/${tutorialId}/skip`);
    const data: ApiResponse<TutorialStatus> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to skip tutorial');
    }
    
    return data.data!;
}

/**
 * Reset a tutorial
 */
export async function resetTutorial(tutorialId: string): Promise<TutorialStatus> {
    const response = await apiPost(`${BASE_URL}/${tutorialId}/reset`);
    const data: ApiResponse<TutorialStatus> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset tutorial');
    }
    
    return data.data!;
}

/**
 * Update tutorial progress (current step)
 */
export async function updateTutorialProgress(
    tutorialId: string,
    currentStep: number
): Promise<TutorialStatus> {
    const response = await apiPost(`${BASE_URL}/${tutorialId}/progress`, {
        currentStep,
    });
    const data: ApiResponse<TutorialStatus> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update tutorial progress');
    }
    
    return data.data!;
}

/**
 * Check if user should see first-time tutorial
 */
export async function shouldShowFirstTimeTutorial(page: string): Promise<boolean> {
    const response = await apiGet(`${BASE_URL}/first-time?page=${page}`);
    const data: ApiResponse<{ shouldShow: boolean }> = await response.json();
    
    if (!response.ok || !data.success) {
        return false; // Default to not showing on error
    }
    
    return data.data!.shouldShow;
}

/**
 * Dismiss first-time tutorial for a page
 */
export async function dismissFirstTimeTutorial(page: string): Promise<void> {
    const response = await apiPost(`${BASE_URL}/first-time/dismiss`, { page });
    const data: ApiResponse<void> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to dismiss tutorial');
    }
}
