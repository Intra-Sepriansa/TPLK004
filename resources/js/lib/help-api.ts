/**
 * Help Center API Client Functions
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { apiGet, apiPost } from './api';
import type {
    FAQCategory,
    FAQItem,
    TroubleshootingGuide,
    HelpFeedback,
} from '@/types/documentation';

const BASE_URL = '/api/help';

// Response Types
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Get all FAQ categories
 */
export async function getFAQCategories(): Promise<FAQCategory[]> {
    const response = await apiGet(`${BASE_URL}/faqs`);
    const data: ApiResponse<FAQCategory[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch FAQs');
    }
    
    return data.data!;
}

/**
 * Get FAQs by category
 */
export async function getFAQsByCategory(categoryId: string): Promise<FAQItem[]> {
    const response = await apiGet(`${BASE_URL}/faqs/${categoryId}`);
    const data: ApiResponse<FAQItem[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch FAQs');
    }
    
    return data.data!;
}

/**
 * Search FAQs
 */
export async function searchFAQs(query: string): Promise<FAQItem[]> {
    const response = await apiGet(`${BASE_URL}/faqs/search?q=${encodeURIComponent(query)}`);
    const data: ApiResponse<FAQItem[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to search FAQs');
    }
    
    return data.data!;
}

/**
 * Get all troubleshooting guides
 */
export async function getTroubleshootingGuides(): Promise<TroubleshootingGuide[]> {
    const response = await apiGet(`${BASE_URL}/troubleshooting`);
    const data: ApiResponse<TroubleshootingGuide[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch troubleshooting guides');
    }
    
    return data.data!;
}

/**
 * Get a specific troubleshooting guide
 */
export async function getTroubleshootingGuide(guideId: string): Promise<TroubleshootingGuide> {
    const response = await apiGet(`${BASE_URL}/troubleshooting/${guideId}`);
    const data: ApiResponse<TroubleshootingGuide> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch troubleshooting guide');
    }
    
    return data.data!;
}

/**
 * Search help content (FAQs + troubleshooting)
 */
export async function searchHelp(query: string): Promise<{
    faqs: FAQItem[];
    troubleshooting: TroubleshootingGuide[];
}> {
    const response = await apiGet(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const data: ApiResponse<{
        faqs: FAQItem[];
        troubleshooting: TroubleshootingGuide[];
    }> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to search help');
    }
    
    return data.data!;
}

/**
 * Submit feedback/question
 */
export async function submitFeedback(feedback: HelpFeedback): Promise<{ ticketId: string }> {
    const formData = new FormData();
    formData.append('category', feedback.category);
    formData.append('subject', feedback.subject);
    formData.append('message', feedback.message);
    if (feedback.email) formData.append('email', feedback.email);
    
    if (feedback.attachments) {
        feedback.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });
    }
    
    const response = await apiPost(`${BASE_URL}/feedback`, formData as unknown as Record<string, unknown>);
    const data: ApiResponse<{ ticketId: string }> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit feedback');
    }
    
    return data.data!;
}

/**
 * Get contact information
 */
export async function getContactInfo(): Promise<{
    email: string;
    phone?: string;
    hours?: string;
    responseTime?: string;
}> {
    const response = await apiGet(`${BASE_URL}/contact`);
    const data: ApiResponse<{
        email: string;
        phone?: string;
        hours?: string;
        responseTime?: string;
    }> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch contact info');
    }
    
    return data.data!;
}

/**
 * Rate a FAQ as helpful or not
 */
export async function rateFAQ(
    faqId: string,
    helpful: boolean
): Promise<void> {
    const response = await apiPost(`${BASE_URL}/faqs/${faqId}/rate`, { helpful });
    const data: ApiResponse<void> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to rate FAQ');
    }
}

/**
 * Get popular/trending FAQs
 */
export async function getPopularFAQs(limit = 5): Promise<FAQItem[]> {
    const response = await apiGet(`${BASE_URL}/faqs/popular?limit=${limit}`);
    const data: ApiResponse<FAQItem[]> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch popular FAQs');
    }
    
    return data.data!;
}
