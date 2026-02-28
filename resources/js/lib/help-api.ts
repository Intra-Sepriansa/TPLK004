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

export interface HelpVideoItem {
    id: string;
    title: string;
    description: string;
    duration: string;
    category: string;
    url: string;
    thumbnail?: string;
    views?: number;
}

export type HelpAnalyticsSummary = {
    totals: {
        pageViews: number;
        searches: number;
        articleViews: number;
        videoViews: number;
    };
    videoCtr: {
        clicks: number;
        pageViews: number;
        ctrPercent: number;
    };
    topQueries: Array<{
        query: string;
        count: number;
        avgResultCount: number;
    }>;
    topFaqs: Array<{
        id: string;
        question: string;
        helpful: number;
        notHelpful: number;
        score: number;
    }>;
    topVideos: Array<{
        id: string;
        title: string;
        views: number;
    }>;
};

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
    const response = await apiGet(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const data: ApiResponse<{ faqs: FAQItem[] }> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to search FAQs');
    }
    
    return data.data?.faqs ?? [];
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
    const backendCategory =
        feedback.category === 'feature' ? 'suggestion' : feedback.category;
    formData.append('category', backendCategory);
    formData.append('subject', feedback.subject);
    formData.append('message', feedback.message);
    if (feedback.email) formData.append('email', feedback.email);
    
    if (feedback.attachments) {
        feedback.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });
    }
    
    const response = await apiPost(
        `${BASE_URL}/feedback`,
        formData as unknown as Record<string, unknown>,
    );
    const data: ApiResponse<{ ticketId?: string; ticket_id?: string }> =
        await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit feedback');
    }
    
    const ticketId = data.data?.ticketId ?? data.data?.ticket_id;
    if (!ticketId) {
        throw new Error('Failed to resolve support ticket id');
    }

    return { ticketId };
}

/**
 * Get contact information
 */
export async function getContactInfo(): Promise<{
    email: string;
    phone?: string;
    whatsapp?: string;
    hours?: string;
    responseTime?: string;
    activeTickets?: number;
}> {
    const response = await apiGet(`${BASE_URL}/contact`);
    const data: ApiResponse<Record<string, unknown>> = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch contact info');
    }
    
    const payload = data.data ?? {};
    const email = String(payload.email ?? '').trim();
    if (!email) {
        throw new Error('Failed to fetch contact email');
    }

    const phone = String(payload.phone ?? payload.whatsapp ?? '').trim() || undefined;
    const whatsapp = String(payload.whatsapp ?? payload.phone ?? '').trim() || undefined;
    const hours = String(payload.hours ?? payload.support_hours ?? '').trim() || undefined;
    const responseTime =
        String(payload.responseTime ?? payload.response_time ?? '').trim() || undefined;

    const activeTickets = Number(payload.active_tickets ?? 0);

    return { email, phone, whatsapp, hours, responseTime, activeTickets };
}

/**
 * Rate a FAQ as helpful or not
 */
export async function rateFAQ(
    faqId: string,
    helpful: boolean
): Promise<{
    faqId: string;
    helpful: number;
    notHelpful: number;
    userVote: 'helpful' | 'notHelpful' | null;
    alreadyVoted: boolean;
}> {
    const response = await apiPost(`${BASE_URL}/faqs/${faqId}/rate`, { helpful });
    const data: ApiResponse<{
        faq_id: string;
        helpful: number;
        notHelpful: number;
        userVote?: 'helpful' | 'notHelpful' | null;
        alreadyVoted?: boolean;
    }> = await response.json();

    // Backend enforces one vote per user per FAQ.
    // 409 means the user already voted; return current counters to keep UI in sync.
    if (response.status === 409 && data.data) {
        return {
            faqId: data.data.faq_id ?? faqId,
            helpful: Number(data.data.helpful ?? 0),
            notHelpful: Number(data.data.notHelpful ?? 0),
            userVote: data.data.userVote ?? null,
            alreadyVoted: true,
        };
    }
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to rate FAQ');
    }

    return {
        faqId: data.data?.faq_id ?? faqId,
        helpful: Number(data.data?.helpful ?? 0),
        notHelpful: Number(data.data?.notHelpful ?? 0),
        userVote: data.data?.userVote ?? null,
        alreadyVoted: Boolean(data.data?.alreadyVoted),
    };
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

/**
 * Get help center tutorial videos.
 */
export async function getHelpVideos(): Promise<HelpVideoItem[]> {
    const response = await apiGet(`${BASE_URL}/videos`);
    const data: ApiResponse<HelpVideoItem[]> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch help videos');
    }

    return data.data ?? [];
}

/**
 * Track help page view in backend analytics.
 */
export async function trackHelpPageView(
    meta?: Record<string, string | number | boolean>,
): Promise<void> {
    const response = await apiPost(`${BASE_URL}/analytics/page-view`, meta ?? {});
    const data: ApiResponse<{ tracked: boolean }> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to track help page view');
    }
}

/**
 * Track help search query in backend analytics.
 */
export async function trackHelpSearch(
    query: string,
    resultCount: number,
): Promise<void> {
    const response = await apiPost(`${BASE_URL}/analytics/search`, {
        query,
        result_count: resultCount,
    });
    const data: ApiResponse<{ tracked: boolean }> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to track help search');
    }
}

/**
 * Track help content view and update persisted counters.
 */
export async function trackHelpContentView(
    contentType: 'faq' | 'troubleshooting' | 'video',
    contentId: string,
): Promise<{
    contentType: 'faq' | 'troubleshooting' | 'video';
    contentId: string;
    viewCount: number;
}> {
    const response = await apiPost(`${BASE_URL}/analytics/view`, {
        content_type: contentType,
        content_id: contentId,
    });
    const data: ApiResponse<{
        content_type: 'faq' | 'troubleshooting' | 'video';
        content_id: string;
        view_count: number;
    }> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to track help content view');
    }

    return {
        contentType: data.data?.content_type ?? contentType,
        contentId: data.data?.content_id ?? contentId,
        viewCount: Number(data.data?.view_count ?? 0),
    };
}

/**
 * Get mini analytics summary for Help dashboard.
 */
export async function getHelpAnalyticsSummary(): Promise<HelpAnalyticsSummary> {
    const response = await apiGet(`${BASE_URL}/analytics/summary`);
    const data: ApiResponse<Record<string, unknown>> = await response.json();

    if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || 'Failed to fetch help analytics summary');
    }

    const payload = data.data;
    const totals = (payload.totals ?? {}) as Record<string, unknown>;
    const videoCtr = (payload.video_ctr ?? {}) as Record<string, unknown>;
    const topQueries = Array.isArray(payload.top_queries)
        ? payload.top_queries
        : [];
    const topFaqs = Array.isArray(payload.top_faqs) ? payload.top_faqs : [];
    const topVideos = Array.isArray(payload.top_videos) ? payload.top_videos : [];

    return {
        totals: {
            pageViews: Number(totals.page_views ?? 0),
            searches: Number(totals.searches ?? 0),
            articleViews: Number(totals.article_views ?? 0),
            videoViews: Number(totals.video_views ?? 0),
        },
        videoCtr: {
            clicks: Number(videoCtr.clicks ?? 0),
            pageViews: Number(videoCtr.page_views ?? 0),
            ctrPercent: Number(videoCtr.ctr_percent ?? 0),
        },
        topQueries: topQueries.map((item) => {
            const mapped = item as Record<string, unknown>;
            return {
                query: String(mapped.query ?? ''),
                count: Number(mapped.count ?? 0),
                avgResultCount: Number(mapped.avg_result_count ?? 0),
            };
        }),
        topFaqs: topFaqs.map((item) => {
            const mapped = item as Record<string, unknown>;
            return {
                id: String(mapped.id ?? ''),
                question: String(mapped.question ?? ''),
                helpful: Number(mapped.helpful ?? 0),
                notHelpful: Number(mapped.notHelpful ?? 0),
                score: Number(mapped.score ?? 0),
            };
        }),
        topVideos: topVideos.map((item) => {
            const mapped = item as Record<string, unknown>;
            return {
                id: String(mapped.id ?? ''),
                title: String(mapped.title ?? ''),
                views: Number(mapped.views ?? 0),
            };
        }),
    };
}
