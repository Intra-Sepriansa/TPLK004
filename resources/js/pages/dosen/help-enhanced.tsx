/**
 * Dosen Help Center Page - Ultra Advanced Enhanced Version
 * With comprehensive UI/UX and detailed explanations
 */

import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle,
    Search,
    BookOpen,
    MessageSquare,
    Mail,
    Phone,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    Zap,
    Shield,
    Users,
    FileText,
    ChevronRight,
    ExternalLink,
    Sparkles,
    ArrowRight,
    Star,
    TrendingUp,
    Video,
    Headphones,
    Globe,
    Award,
    Target,
    Rocket,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Download,
    Share2,
    Bookmark,
    Bell,
    Settings,
    ChevronDown,
    X,
    Check,
    Info,
    AlertTriangle,
    PlayCircle,
    FileQuestion,
    MessageCircle,
    Wifi,
    WifiOff,
    RefreshCw,
    Lock,
    Unlock,
    Eye,
    EyeOff,
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';

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
