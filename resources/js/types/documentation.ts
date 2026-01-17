/**
 * Documentation Types for Documentation Hub
 * Requirements: 2.1
 */

// Guide Section Types
export type GuideSectionType = 'overview' | 'features' | 'tutorial' | 'tips' | 'faq';

// Guide Category
export type GuideCategory = 'core' | 'academic' | 'analytics' | 'communication' | 'finance';

// User Role for Documentation
export type DocumentationRole = 'dosen' | 'mahasiswa';

// FAQ Item
export interface FAQItem {
    question: string;
    answer: string;
}

// Tutorial Step
export interface TutorialStep {
    step: number;
    title: string;
    description: string;
    image?: string;
    action?: string;
}

// Guide Section
export interface GuideSection {
    id: string;
    title: string;
    type: GuideSectionType;
    content: string;
    steps?: TutorialStep[];
    items?: string[];
    faqs?: FAQItem[];
}

// Menu Guide
export interface MenuGuide {
    id: string;
    menuKey: string;
    title: string;
    description: string;
    icon: string;
    category: GuideCategory;
    estimatedReadTime: number; // minutes
    sections: GuideSection[];
    relatedGuides?: string[];
    tags?: string[];
}

// Guide Summary (for listing)
export interface GuideSummary {
    id: string;
    menuKey: string;
    title: string;
    description: string;
    icon: string;
    category: GuideCategory;
    estimatedReadTime: number;
    isRead: boolean;
    progress: number; // 0-100
}

// Read Progress
export interface ReadProgress {
    guideId: string;
    completedSections: string[];
    isCompleted: boolean;
    lastReadAt: string;
    progress: number; // 0-100
}

// Documentation Search Result
export interface SearchResult {
    guideId: string;
    title: string;
    description: string;
    matchedSection?: string;
    matchedContent?: string;
    relevanceScore: number;
}

// Interactive Tutorial
export interface InteractiveTutorial {
    id: string;
    title: string;
    description: string;
    targetElement: string;
    steps: InteractiveTutorialStep[];
    triggerOnFirstVisit: boolean;
}

// Interactive Tutorial Step
export interface InteractiveTutorialStep {
    id: string;
    targetSelector: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    action?: 'click' | 'input' | 'hover';
    nextOnAction?: boolean;
}

// Tutorial Status
export interface TutorialStatus {
    tutorialId: string;
    completed: boolean;
    skipped: boolean;
    currentStep?: number;
    completedAt?: string;
}

// FAQ Category
export interface FAQCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    faqs: FAQItem[];
}

// Troubleshooting Guide
export interface TroubleshootingGuide {
    id: string;
    title: string;
    problem: string;
    symptoms: string[];
    solutions: TroubleshootingSolution[];
    relatedFaqs?: string[];
}

// Troubleshooting Solution
export interface TroubleshootingSolution {
    step: number;
    title: string;
    description: string;
    action?: string;
}

// Help Feedback
export interface HelpFeedback {
    category: 'bug' | 'feature' | 'question' | 'other';
    subject: string;
    message: string;
    email?: string;
    attachments?: File[];
}

// Documentation Hub State
export interface DocumentationHubState {
    guides: GuideSummary[];
    searchQuery: string;
    selectedCategory: GuideCategory | 'all';
    isLoading: boolean;
    error: string | null;
}

// Guide Detail State
export interface GuideDetailState {
    guide: MenuGuide | null;
    progress: ReadProgress | null;
    activeSection: string;
    isLoading: boolean;
    error: string | null;
}
