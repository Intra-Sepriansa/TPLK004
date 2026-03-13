/**
 * Dosen Help Center Page - Ultra Advanced Enhanced Version
 * With comprehensive UI/UX and detailed explanations
 */

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    helpful: number;
    notHelpful: number;
    tags: string[];
    relatedArticles?: string[];
}

interface TroubleshootingGuide {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    steps: Array<{
        title: string;
        description: string;
        tips?: string[];
    }>;
    commonMistakes?: string[];
    preventionTips?: string[];
}

interface VideoTutorial {
    id: string;
    title: string;
    description: string;
    duration: string;
    thumbnail: string;
    category: string;
    views: number;
    rating: number;
}

type ToastType = { type: 'success' | 'error' | 'info'; message: string } | null;
