import HelpIcon from '@/assets/admin/help-center/help.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import {
    getHelpAnalyticsSummary,
    getHelpVideos,
    getContactInfo,
    getFAQCategories,
    trackHelpContentView,
    trackHelpPageView,
    trackHelpSearch,
    rateFAQ,
    getTroubleshootingGuides,
    submitFeedback,
    type HelpAnalyticsSummary,
} from '@/lib/help-api';
import { cn } from '@/lib/utils';
import type { HelpFeedback } from '@/types/documentation';
import { Head, usePage } from '@inertiajs/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    Clock3,
    Eye,
    GraduationCap,
    Headphones,
    Lightbulb,
    Mail,
    MessageCircle,
    MessageSquare,
    MousePointerClick,
    Phone,
    PlayCircle,
    RefreshCw,
    Search,
    Send,
    Shield,
    Star,
    ThumbsDown,
    ThumbsUp,
    TrendingUp,
    Wrench,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

type PageProps = {
    auth?: {
        user?: {
            email?: string;
        };
    };
};

type ToastType = {
    type: 'success' | 'error';
    message: string;
} | null;

type ContactInfo = {
    email: string;
    phone?: string;
    whatsapp?: string;
    hours?: string;
    responseTime?: string;
    activeTickets?: number;
};

type NormalizedFAQ = {
    id: string;
    question: string;
    answer: string;
    categoryId: string;
    categoryName: string;
    helpful: number;
    notHelpful: number;
    views: number;
    userVote: 'helpful' | 'notHelpful' | null;
};

type NormalizedFAQCategory = {
    id: string;
    name: string;
    description: string;
    icon: string;
    faqs: NormalizedFAQ[];
};

type NormalizedTroubleshooting = {
    id: string;
    title: string;
    problem: string;
    steps: string[];
    category: string;
    severity: 'low' | 'medium' | 'high';
    estimatedTime: string;
    views: number;
};

type HelpArticle = {
    id: string;
    source: 'faq' | 'troubleshooting';
    title: string;
    description: string;
    content: string;
    category: string;
    difficulty: 'Pemula' | 'Menengah' | 'Pro';
    views: number;
    helpful: number;
    notHelpful: number;
    readTime: string;
};

type VideoTutorial = {
    id: string;
    title: string;
    description: string;
    duration: string;
    category: string;
    views: number;
    url: string;
    thumbnail?: string;
    accent: string;
};

type TicketForm = {
    category: 'question' | 'bug' | 'suggestion' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    subject: string;
    message: string;
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 },
    },
};

const sectionCards = [
    {
        id: 'panduan',
        title: 'Panduan Lengkap',
        badge: 'Populer',
        color: 'from-blue-500 to-indigo-500',
        icon: BookOpen,
        description:
            'Blueprint operasional end-to-end untuk alur presensi, tugas, validasi, dan tata kelola penggunaan fitur inti mahasiswa secara terstruktur.',
        highlights: ['Checklist harian per fitur', 'Alur validasi dan SLA layanan'],
    },
    {
        id: 'tips',
        title: 'Tips & Trik',
        badge: 'Trending',
        color: 'from-yellow-500 to-orange-500',
        icon: Lightbulb,
        description:
            'Strategi produktivitas advanced berisi optimasi workflow, shortcut yang relevan, dan pola penggunaan cerdas agar proses akademik lebih cepat.',
        highlights: ['Pola kerja anti-ribet', 'Shortcut efisiensi tinggi'],
    },
    {
        id: 'keamanan',
        title: 'Keamanan',
        badge: 'Penting',
        color: 'from-green-500 to-emerald-500',
        icon: Shield,
        description:
            'Standar perlindungan akun dan data pribadi mencakup kebijakan akses, verifikasi identitas, mitigasi risiko, serta best practice keamanan modern.',
        highlights: ['Proteksi akun berlapis', 'Panduan respon insiden'],
    },
    {
        id: 'video',
        title: 'Video Tutorial',
        badge: 'Baru',
        color: 'from-purple-500 to-pink-500',
        icon: PlayCircle,
        description:
            'Rangkaian tutorial visual step-by-step berbasis kasus nyata agar pengguna memahami konteks penggunaan fitur, bukan sekadar menghafal langkah.',
        highlights: ['Simulasi studi kasus', 'Pembelajaran visual terarah'],
    },
    {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        badge: 'Pemula',
        color: 'from-red-500 to-orange-500',
        icon: Wrench,
        description:
            'Panduan diagnosis masalah secara sistematis dengan akar penyebab, langkah perbaikan bertahap, dan indikator keberhasilan yang bisa diverifikasi.',
        highlights: ['Root-cause based', 'Recovery plan terstruktur'],
    },
    {
        id: 'akademik',
        title: 'Panduan Akademik',
        badge: 'Mahasiswa',
        color: 'from-cyan-500 to-blue-500',
        icon: GraduationCap,
        description:
            'Dokumentasi proses akademik mencakup manajemen tugas, ujian, evaluasi capaian, serta praktik terbaik agar progres belajar tetap konsisten.',
        highlights: ['Roadmap capaian belajar', 'Kontrol kualitas pengumpulan'],
    },
] as const;

const toLower = (value: string): string => value.toLowerCase();

const wordCount = (text: string): number =>
    text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

const excerpt = (text: string, max = 180): string => {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= max) return trimmed;
    return `${trimmed.slice(0, max).trimEnd()}...`;
};

const parseDifficulty = (content: string): 'Pemula' | 'Menengah' | 'Pro' => {
    const totalWords = wordCount(content);
    if (totalWords < 70) return 'Pemula';
    if (totalWords < 160) return 'Menengah';
    return 'Pro';
};

const parseCategoryDescription = (id: string, name: string): string => {
    const key = `${id} ${name}`.toLowerCase();

    if (key.includes('absensi')) {
        return 'Panduan operasional absensi dari persiapan perangkat, scan QR, validasi lokasi, hingga penanganan gagal verifikasi.';
    }

    if (key.includes('tugas')) {
        return 'Workflow pengumpulan tugas yang rapi meliputi format file, aturan deadline, revisi, serta evaluasi progres penilaian.';
    }

    if (key.includes('akun') || key.includes('profil')) {
        return 'Standar pengelolaan akun mahasiswa meliputi keamanan password, perlindungan privasi, dan kontrol akses autentikasi.';
    }

    if (key.includes('teknis')) {
        return 'Metode troubleshooting teknis berbasis akar masalah untuk koneksi, sinkronisasi data, error aplikasi, dan pemulihan cepat.';
    }

    if (key.includes('izin')) {
        return 'Panduan formal pengajuan izin/sakit dengan validasi dokumen, SLA persetujuan, dan mekanisme pemantauan status.';
    }

    return 'Dokumentasi bantuan menyeluruh untuk memahami fitur, menyelesaikan kendala, dan meningkatkan efektivitas penggunaan sistem.';
};

const normalizeFaqCategories = (payload: unknown): NormalizedFAQCategory[] => {
    if (!Array.isArray(payload)) return [];

    return payload
        .map((rawCategory): NormalizedFAQCategory | null => {
            if (typeof rawCategory !== 'object' || rawCategory === null) return null;

            const category = rawCategory as Record<string, unknown>;
            const categoryId = String(category.id ?? '').trim();
            const categoryName = String(category.name ?? '').trim();
            const categoryIcon = String(category.icon ?? 'HelpCircle').trim();

            if (!categoryId || !categoryName) return null;

            const faqsPayload = Array.isArray(category.faqs) ? category.faqs : [];
            const faqs = faqsPayload
                .map((rawFaq): NormalizedFAQ | null => {
                    if (typeof rawFaq !== 'object' || rawFaq === null) return null;

                    const faq = rawFaq as Record<string, unknown>;
                    const faqId = String(faq.id ?? '').trim();
                    const question = String(faq.question ?? '').trim();
                    const answer = String(faq.answer ?? '').trim();

                    if (!faqId || !question || !answer) return null;

                    return {
                        id: faqId,
                        question,
                        answer,
                        categoryId,
                        categoryName,
                        helpful: Number(faq.helpful ?? 0),
                        notHelpful: Number(faq.notHelpful ?? 0),
                        views: Number(faq.views ?? 0),
                        userVote:
                            faq.userVote === 'helpful' || faq.userVote === 'notHelpful'
                                ? faq.userVote
                                : null,
                    };
                })
                .filter((faq): faq is NormalizedFAQ => faq !== null);

            return {
                id: categoryId,
                name: categoryName,
                description: parseCategoryDescription(categoryId, categoryName),
                icon: categoryIcon,
                faqs,
            };
        })
        .filter((category): category is NormalizedFAQCategory => category !== null);
};

const normalizeTroubleshooting = (payload: unknown): NormalizedTroubleshooting[] => {
    if (!Array.isArray(payload)) return [];

    return payload
        .map((rawGuide): NormalizedTroubleshooting | null => {
            if (typeof rawGuide !== 'object' || rawGuide === null) return null;

            const guide = rawGuide as Record<string, unknown>;
            const id = String(guide.id ?? '').trim();
            const title = String(guide.title ?? '').trim();
            const problem = String(guide.problem ?? '').trim();

            if (!id || !title || !problem) return null;

            let steps: string[] = [];
            if (Array.isArray(guide.solution)) {
                steps = guide.solution
                    .map((item) => String(item ?? '').trim())
                    .filter(Boolean);
            } else if (Array.isArray(guide.solutions)) {
                steps = guide.solutions
                    .map((item) => {
                        if (typeof item === 'string') return item.trim();
                        if (typeof item === 'object' && item !== null) {
                            const mapped = item as Record<string, unknown>;
                            const titlePart = String(mapped.title ?? '').trim();
                            const descriptionPart = String(mapped.description ?? '').trim();
                            return [titlePart, descriptionPart].filter(Boolean).join(' - ').trim();
                        }
                        return '';
                    })
                    .filter(Boolean);
            }

            return {
                id,
                title,
                problem,
                steps,
                category: String(guide.category ?? 'teknis'),
                severity:
                    guide.severity === 'low' ||
                    guide.severity === 'medium' ||
                    guide.severity === 'high'
                        ? guide.severity
                        : 'medium',
                estimatedTime: String(guide.estimatedTime ?? guide.estimated_time ?? '5-10 menit'),
                views: Number(guide.views ?? 0),
            };
        })
        .filter((guide): guide is NormalizedTroubleshooting => guide !== null);
};

const normalizeContact = (payload: unknown): ContactInfo | undefined => {
    if (typeof payload !== 'object' || payload === null) return undefined;

    const mapped = payload as Record<string, unknown>;
    const email = String(mapped.email ?? '').trim();

    if (!email) return undefined;

    return {
        email,
        phone: String(mapped.phone ?? '').trim() || undefined,
        whatsapp: String(mapped.whatsapp ?? mapped.phone ?? '').trim() || undefined,
        hours:
            String(mapped.hours ?? mapped.support_hours ?? '').trim() || undefined,
        responseTime:
            String(mapped.responseTime ?? mapped.response_time ?? '').trim() || undefined,
        activeTickets: Number(mapped.activeTickets ?? mapped.active_tickets ?? 0),
    };
};

const getVideoAccent = (category: string): string => {
    const key = category.toLowerCase();

    if (key.includes('onboard')) return 'from-indigo-500 to-purple-600';
    if (key.includes('absensi')) return 'from-emerald-500 to-teal-600';
    if (key.includes('tugas')) return 'from-orange-500 to-amber-600';
    if (key.includes('akademik')) return 'from-sky-500 to-indigo-600';
    if (key.includes('izin')) return 'from-rose-500 to-pink-600';
    if (key.includes('gamifikasi')) return 'from-fuchsia-500 to-purple-600';
    if (key.includes('keamanan')) return 'from-cyan-500 to-blue-600';
    return 'from-violet-500 to-indigo-600';
};

const normalizeVideos = (payload: unknown): VideoTutorial[] => {
    if (!Array.isArray(payload)) return [];

    return payload
        .map((rawVideo): VideoTutorial | null => {
            if (typeof rawVideo !== 'object' || rawVideo === null) return null;
            const video = rawVideo as Record<string, unknown>;

            const id = String(video.id ?? '').trim();
            const title = String(video.title ?? '').trim();
            const url = String(video.url ?? '').trim();
            const duration = String(video.duration ?? '0:00').trim();
            const category = String(video.category ?? 'Tutorial').trim();

            if (!id || !title || !url) return null;

            return {
                id,
                title,
                description: String(video.description ?? '').trim(),
                duration,
                category,
                views: Number(video.views ?? 0),
                url,
                thumbnail: String(video.thumbnail ?? '').trim() || undefined,
                accent: getVideoAccent(category),
            };
        })
        .filter((video): video is VideoTutorial => video !== null);
};

const parsePhoneNumber = (value: string): string => value.replace(/[^\d]/g, '');

const trackHelpEvent = (
    eventName: string,
    params: Record<string, string | number | boolean | undefined> = {},
) => {
    if (typeof window === 'undefined') return;

    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== 'function') return;

    gtag('event', eventName, params);
};

export default function StudentHelp() {
    const { auth } = usePage<PageProps>().props;
    const userEmail = auth?.user?.email;

    const searchInputRef = useRef<HTMLInputElement>(null);

    const [faqCategories, setFaqCategories] = useState<NormalizedFAQCategory[]>([]);
    const [troubleshootingGuides, setTroubleshootingGuides] = useState<NormalizedTroubleshooting[]>([]);
    const [helpVideos, setHelpVideos] = useState<VideoTutorial[]>([]);
    const [contactInfo, setContactInfo] = useState<ContactInfo>();

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastType>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [faqFilter, setFaqFilter] = useState('Semua');

    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

    const [ticketCount, setTicketCount] = useState(0);

    const [ticketForm, setTicketForm] = useState<TicketForm>({
        category: 'question',
        priority: 'medium',
        subject: '',
        message: '',
    });

    const [faqVotes, setFaqVotes] = useState<
        Record<string, { helpful: number; notHelpful: number }>
    >({});
    const [faqUserVotes, setFaqUserVotes] = useState<
        Record<string, 'helpful' | 'notHelpful' | null>
    >({});
    const [analyticsSummary, setAnalyticsSummary] = useState<HelpAnalyticsSummary | null>(null);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        window.setTimeout(() => setToast(null), 3200);
    };

    const loadAnalyticsSummary = useCallback(async (withLoading = false) => {
        if (withLoading) {
            setIsAnalyticsLoading(true);
        }

        try {
            const summary = await getHelpAnalyticsSummary();
            setAnalyticsSummary(summary);
        } catch {
            if (withLoading) {
                setAnalyticsSummary(null);
            }
        } finally {
            if (withLoading) {
                setIsAnalyticsLoading(false);
            }
        }
    }, []);

    const loadHelpData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const [faqsPayload, troubleshootingPayload, videosPayload, contactPayload] = await Promise.all([
                getFAQCategories(),
                getTroubleshootingGuides(),
                getHelpVideos(),
                getContactInfo(),
            ]);

            const normalizedCategories = normalizeFaqCategories(faqsPayload as unknown);
            const normalizedTroubleshooting = normalizeTroubleshooting(
                troubleshootingPayload as unknown,
            );
            const normalizedVideos = normalizeVideos(videosPayload as unknown);
            const normalizedContact = normalizeContact(contactPayload as unknown);

            setFaqCategories(normalizedCategories);
            setTroubleshootingGuides(normalizedTroubleshooting);
            setHelpVideos(normalizedVideos);
            setContactInfo(normalizedContact);
            setTicketCount(normalizedContact?.activeTickets ?? 0);

            setFaqVotes((prev) => {
                const next = { ...prev };
                normalizedCategories.forEach((category) => {
                    category.faqs.forEach((faq) => {
                        if (!next[faq.id]) {
                            next[faq.id] = {
                                helpful: faq.helpful,
                                notHelpful: faq.notHelpful,
                            };
                        }
                    });
                });
                return next;
            });
            setFaqUserVotes((prev) => {
                const next = { ...prev };
                normalizedCategories.forEach((category) => {
                    category.faqs.forEach((faq) => {
                        next[faq.id] = faq.userVote ?? null;
                    });
                });
                return next;
            });

            await loadAnalyticsSummary(true);
        } catch {
            setFaqCategories([]);
            setTroubleshootingGuides([]);
            setHelpVideos([]);
            setContactInfo(undefined);
            setAnalyticsSummary(null);
            setIsAnalyticsLoading(false);
            setErrorMessage('Gagal memuat data bantuan. Coba muat ulang halaman.');
        } finally {
            setIsLoading(false);
        }
    }, [loadAnalyticsSummary]);

    useEffect(() => {
        void loadHelpData();
        trackHelpEvent('help_page_view', {
            page: 'student_help',
        });
        void trackHelpPageView({ page: 'student_help' }).catch(() => undefined);
    }, [loadHelpData]);

    useEffect(() => {
        const handleKeyboardShortcuts = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
            }

            if (event.key === 'Escape') {
                setSelectedArticle(null);
                setSelectedVideo(null);
                setIsTicketModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyboardShortcuts);
        return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
    }, []);

    const allFaqs = useMemo(
        () => faqCategories.flatMap((category) => category.faqs),
        [faqCategories],
    );

    const query = searchQuery.trim().toLowerCase();

    const totalVotes = useMemo(() => {
        return Object.values(faqVotes).reduce(
            (acc, item) => {
                acc.helpful += item.helpful;
                acc.notHelpful += item.notHelpful;
                return acc;
            },
            { helpful: 0, notHelpful: 0 },
        );
    }, [faqVotes]);

    const globalRating = useMemo(() => {
        const denominator = totalVotes.helpful + totalVotes.notHelpful;
        if (denominator === 0) return null;
        return Number(((totalVotes.helpful / denominator) * 5).toFixed(1));
    }, [totalVotes]);

    const popularArticles = useMemo<HelpArticle[]>(() => {
        const faqArticles: HelpArticle[] = allFaqs.map((faq) => {
            const votes = faqVotes[faq.id] ?? {
                helpful: faq.helpful,
                notHelpful: faq.notHelpful,
            };

            return {
                id: faq.id,
                source: 'faq',
                title: faq.question,
                description: excerpt(faq.answer, 130),
                content: faq.answer,
                category: faq.categoryName,
                difficulty: parseDifficulty(faq.answer),
                views: faq.views,
                helpful: votes.helpful,
                notHelpful: votes.notHelpful,
                readTime: `${Math.max(1, Math.ceil(wordCount(faq.answer) / 180))} min`,
            };
        });

        const troubleshootingArticles: HelpArticle[] = troubleshootingGuides.map((guide) => {
            const troubleshootingContent = [guide.problem, ...guide.steps].join('\n\n');
            return {
                id: guide.id,
                source: 'troubleshooting',
                title: guide.title,
                description: excerpt(guide.problem, 130),
                content: troubleshootingContent,
                category: 'Troubleshooting',
                difficulty: guide.severity === 'high' ? 'Pro' : 'Menengah',
                views: guide.views,
                helpful: 0,
                notHelpful: 0,
                readTime: `${Math.max(1, Math.ceil(wordCount(troubleshootingContent) / 180))} min`,
            };
        });

        return [...faqArticles, ...troubleshootingArticles]
            .filter((article) => {
                if (!query) return true;
                const searchable = `${article.title} ${article.description} ${article.content} ${article.category}`.toLowerCase();
                return searchable.includes(query);
            })
            .sort((left, right) => {
                const leftScore = left.views + left.helpful * 4 - left.notHelpful;
                const rightScore = right.views + right.helpful * 4 - right.notHelpful;
                return rightScore - leftScore;
            })
            .slice(0, 5);
    }, [allFaqs, troubleshootingGuides, faqVotes, query]);

    const displayedVideos = useMemo(() => {
        return helpVideos
            .filter((video) => {
                if (!query) return true;
                const searchable = `${video.title} ${video.description} ${video.category}`.toLowerCase();
                return searchable.includes(query);
            })
            .slice(0, 3);
    }, [helpVideos, query]);

    const filterOptions = useMemo(() => {
        const dynamic = faqCategories.map((category) => category.name);
        const base = ['Semua', 'Umum', 'Absensi', 'Tugas', 'Teknis'];
        return Array.from(new Set([...base, ...dynamic]));
    }, [faqCategories]);

    const filteredFaqItems = useMemo(() => {
        return allFaqs.filter((faq) => {
            const searchable = `${faq.question} ${faq.answer} ${faq.categoryName}`.toLowerCase();
            const matchesQuery = !query || searchable.includes(query);

            const matchesFilter =
                faqFilter === 'Semua' ||
                faqFilter === 'Umum' ||
                toLower(faq.categoryName).includes(toLower(faqFilter)) ||
                toLower(faq.categoryId).includes(toLower(faqFilter));

            return matchesQuery && matchesFilter;
        });
    }, [allFaqs, faqFilter, query]);

    const totalArticles = allFaqs.length + troubleshootingGuides.length;

    const categoryCardMetrics = useMemo(() => {
        const securityFaqs = allFaqs.filter((faq) => {
            const key = `${faq.categoryId} ${faq.categoryName}`.toLowerCase();
            return key.includes('akun') || key.includes('teknis') || key.includes('keamanan');
        });

        const academicFaqs = allFaqs.filter((faq) => {
            const key = `${faq.categoryId} ${faq.categoryName}`.toLowerCase();
            return (
                key.includes('absensi') ||
                key.includes('tugas') ||
                key.includes('izin') ||
                key.includes('akademik')
            );
        });

        const tipsCount = troubleshootingGuides.filter((guide) => {
            const key = `${guide.title} ${guide.problem}`.toLowerCase();
            return key.includes('tips') || key.includes('cara') || key.includes('solusi');
        }).length;

        return {
            panduan: totalArticles,
            tips: tipsCount > 0 ? tipsCount : troubleshootingGuides.length,
            keamanan: securityFaqs.length,
            video: helpVideos.length,
            troubleshooting: troubleshootingGuides.length,
            akademik: academicFaqs.length,
        };
    }, [allFaqs, totalArticles, troubleshootingGuides, helpVideos.length]);

    const categoryCards = useMemo(() => {
        return sectionCards.map((card) => {
            const value = categoryCardMetrics[card.id] ?? 0;
            return {
                ...card,
                articleCount: value,
                rating: globalRating,
            };
        });
    }, [categoryCardMetrics, globalRating]);

    const handleSearchClick = () => {
        const normalizedQuery = searchQuery.trim();
        const section = document.getElementById('help-faq-section');
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        trackHelpEvent('help_search', {
            query: normalizedQuery,
            result_count: filteredFaqItems.length,
        });

        if (normalizedQuery.length >= 2) {
            void trackHelpSearch(normalizedQuery, filteredFaqItems.length)
                .then(() => loadAnalyticsSummary())
                .catch(() => undefined);
        }
    };

    const updateFaqViewCount = (faqId: string, viewCount: number) => {
        setFaqCategories((prev) =>
            prev.map((category) => ({
                ...category,
                faqs: category.faqs.map((faq) =>
                    faq.id === faqId ? { ...faq, views: viewCount } : faq,
                ),
            })),
        );
        setSelectedArticle((prev) =>
            prev && prev.id === faqId ? { ...prev, views: viewCount } : prev,
        );
    };

    const updateTroubleshootingViewCount = (guideId: string, viewCount: number) => {
        setTroubleshootingGuides((prev) =>
            prev.map((guide) =>
                guide.id === guideId ? { ...guide, views: viewCount } : guide,
            ),
        );
        setSelectedArticle((prev) =>
            prev && prev.id === guideId ? { ...prev, views: viewCount } : prev,
        );
    };

    const updateVideoViewCount = (videoId: string, viewCount: number) => {
        setHelpVideos((prev) =>
            prev.map((video) =>
                video.id === videoId ? { ...video, views: viewCount } : video,
            ),
        );
        setSelectedVideo((prev) =>
            prev && prev.id === videoId ? { ...prev, views: viewCount } : prev,
        );
    };

    const handleTrackArticleView = async (article: HelpArticle) => {
        const contentType = article.source === 'faq' ? 'faq' : 'troubleshooting';

        try {
            const tracked = await trackHelpContentView(contentType, article.id);

            if (tracked.contentType === 'faq') {
                updateFaqViewCount(tracked.contentId, tracked.viewCount);
            } else if (tracked.contentType === 'troubleshooting') {
                updateTroubleshootingViewCount(tracked.contentId, tracked.viewCount);
            }

            await loadAnalyticsSummary();
        } catch {
            // Keep UI responsive even if analytics persistence fails.
        }
    };

    const handleTrackVideoView = async (video: VideoTutorial) => {
        try {
            const tracked = await trackHelpContentView('video', video.id);
            updateVideoViewCount(tracked.contentId, tracked.viewCount);
            await loadAnalyticsSummary();
        } catch {
            // Keep UI responsive even if analytics persistence fails.
        }
    };

    const handleFaqAccordionChange = (faqId: string) => {
        if (!faqId) {
            return;
        }

        void trackHelpContentView('faq', faqId)
            .then((tracked) => {
                updateFaqViewCount(tracked.contentId, tracked.viewCount);
                return loadAnalyticsSummary();
            })
            .catch(() => undefined);
    };

    const handleFaqVote = async (faqId: string, helpful: boolean) => {
        const normalizedFaqId = faqId.startsWith('faq-') ? faqId : `faq-${faqId}`;
        const previousCounts = faqVotes[normalizedFaqId] ?? { helpful: 0, notHelpful: 0 };
        const previousUserVote = faqUserVotes[normalizedFaqId] ?? null;

        if (previousUserVote) {
            showToast('error', 'Anda sudah memberikan vote untuk pertanyaan ini.');
            return;
        }

        setFaqVotes((prev) => {
            const current = prev[normalizedFaqId] ?? { helpful: 0, notHelpful: 0 };
            return {
                ...prev,
                [normalizedFaqId]: {
                    helpful: helpful ? current.helpful + 1 : current.helpful,
                    notHelpful: helpful ? current.notHelpful : current.notHelpful + 1,
                },
            };
        });
        setFaqUserVotes((prev) => ({
            ...prev,
            [normalizedFaqId]: helpful ? 'helpful' : 'notHelpful',
        }));

        try {
            const voteResult = await rateFAQ(normalizedFaqId, helpful);
            setFaqVotes((prev) => ({
                ...prev,
                [voteResult.faqId]: {
                    helpful: voteResult.helpful,
                    notHelpful: voteResult.notHelpful,
                },
            }));
            setFaqUserVotes((prev) => ({
                ...prev,
                [voteResult.faqId]: voteResult.userVote ?? (helpful ? 'helpful' : 'notHelpful'),
            }));

            trackHelpEvent('help_faq_vote', {
                faq_id: normalizedFaqId,
                helpful,
            });
            await loadAnalyticsSummary();
            showToast(
                voteResult.alreadyVoted
                    ? 'error'
                    : 'success',
                voteResult.alreadyVoted
                    ? 'Anda sudah memberikan vote untuk pertanyaan ini.'
                    : helpful
                      ? 'Terima kasih, feedback diterima.'
                      : 'Masukan Anda tersimpan.',
            );
        } catch {
            setFaqVotes((prev) => ({
                ...prev,
                [normalizedFaqId]: previousCounts,
            }));
            setFaqUserVotes((prev) => ({
                ...prev,
                [normalizedFaqId]: previousUserVote,
            }));
            showToast('error', 'Gagal menyimpan feedback FAQ. Silakan coba lagi.');
        }
    };

    const handleSubmitTicket = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (ticketForm.subject.trim().length < 5) {
            showToast('error', 'Subjek minimal 5 karakter.');
            return;
        }

        if (ticketForm.message.trim().length < 20) {
            showToast('error', 'Deskripsi minimal 20 karakter agar tim support mudah membantu.');
            return;
        }

        setIsSubmittingTicket(true);

        try {
            const feedbackPayload = {
                category: ticketForm.category,
                subject: `[${ticketForm.priority.toUpperCase()}] ${ticketForm.subject.trim()}`,
                message: ticketForm.message.trim(),
                email: userEmail,
            } as HelpFeedback;

            const ticketResult = (await submitFeedback(feedbackPayload)) as {
                ticketId?: string;
                ticket_id?: string;
            };

            const nextCount = ticketCount + 1;
            setTicketCount(nextCount);

            setTicketForm({
                category: 'question',
                priority: 'medium',
                subject: '',
                message: '',
            });
            setIsTicketModalOpen(false);

            const ticketId = ticketResult.ticketId ?? ticketResult.ticket_id;
            trackHelpEvent('help_ticket_submit', {
                category: ticketForm.category,
                priority: ticketForm.priority,
                ticket_id: ticketId,
            });
            showToast(
                'success',
                ticketId
                    ? `Tiket ${ticketId} berhasil dibuat.`
                    : 'Tiket dukungan berhasil dibuat.',
            );
        } catch {
            trackHelpEvent('help_ticket_submit_failed', {
                category: ticketForm.category,
                priority: ticketForm.priority,
            });
            showToast('error', 'Gagal mengirim tiket dukungan. Silakan coba lagi.');
        } finally {
            setIsSubmittingTicket(false);
        }
    };

    const handleShareArticle = async (article: HelpArticle) => {
        try {
            await navigator.clipboard.writeText(article.title);
            trackHelpEvent('help_article_share', {
                article_id: article.id,
                article_title: article.title,
            });
            showToast('success', 'Judul artikel disalin ke clipboard.');
        } catch {
            showToast('error', 'Tidak bisa menyalin artikel saat ini.');
        }
    };

    if (isLoading) {
        return (
            <StudentLayout>
                <Head title="Bantuan Mahasiswa" />
                <div className="space-y-6 p-4 md:p-6 lg:p-8">
                    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-2xl">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0">
                                <img
                                    src={HelpIcon}
                                    alt="Bantuan"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-100">Pusat Informasi Mahasiswa</p>
                                <p className="text-2xl font-bold">Memuat Bantuan...</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={`loading-stat-${index}`}
                                className="h-28 animate-pulse rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`loading-analytics-${index}`}
                                className="h-44 animate-pulse rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={`loading-category-${index}`}
                                className="h-56 animate-pulse rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="space-y-4 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={`loading-article-${index}`}
                                    className="h-24 animate-pulse rounded-2xl bg-white/60 dark:bg-neutral-800/60"
                                />
                            ))}
                        </div>
                        <div className="space-y-4 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={`loading-video-${index}`}
                                    className="h-48 animate-pulse rounded-2xl bg-white/60 dark:bg-neutral-800/60"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-96 animate-pulse rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`loading-contact-${index}`}
                                className="h-60 animate-pulse rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            />
                        ))}
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <Head title="Bantuan Mahasiswa" />

            <motion.div
                className="mx-auto max-w-7xl space-y-6 p-4 pb-10 md:space-y-8 md:p-6 lg:p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {errorMessage ? (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => void loadHelpData()}
                                className="border-rose-300 bg-white/70 text-rose-700 hover:bg-white"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> Muat Ulang
                            </Button>
                        </div>
                    </motion.div>
                ) : null}

                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 p-6 text-white shadow-2xl sm:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <motion.div
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                        animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.4, 0.22] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                        animate={{ scale: [1.08, 1, 1.08], opacity: [0.35, 0.2, 0.35] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <div className="relative">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={HelpIcon}
                                        alt="Bantuan Mahasiswa"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>

                                <div className="flex-1">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Pusat Informasi Mahasiswa
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Bantuan Mahasiswa
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Temukan panduan, video tutorial, FAQ interaktif, dan jalur dukungan
                                        teknis dalam satu pusat bantuan yang rapi dan mudah dipakai.
                                    </motion.p>
                                </div>
                            </div>

                            <div className="w-full lg:max-w-xl">
                                <motion.div
                                    className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500/70" />
                                    <Input
                                        ref={searchInputRef}
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                handleSearchClick();
                                            }
                                        }}
                                        placeholder="Cari bantuan, panduan, atau ketik pertanyaan Anda..."
                                        className="h-14 border-0 bg-transparent pl-14 pr-28 text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-purple-300"
                                    />
                                    <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                                        {searchQuery ? (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                        <Button
                                            onClick={handleSearchClick}
                                            className="h-10 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 text-xs font-semibold text-white shadow-lg hover:from-purple-600 hover:to-fuchsia-600"
                                        >
                                            Cari
                                        </Button>
                                    </div>
                                </motion.div>
                                <p className="mt-2 text-xs text-indigo-100/90 sm:text-sm">
                                    {query
                                        ? `${filteredFaqItems.length} hasil ditemukan untuk "${searchQuery.trim()}"`
                                        : 'Shortcut: Cmd/Ctrl + K untuk fokus ke pencarian'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 sm:p-6"
                >
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white sm:text-xl">
                                Mini Analytics Bantuan
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Top query, FAQ paling membantu, dan CTR video real-time dari backend
                            </p>
                        </div>
                    </div>

                    {isAnalyticsLoading ? (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={`analytics-skeleton-${index}`}
                                    className="h-44 animate-pulse rounded-2xl border border-white/20 bg-white/50 dark:border-white/10 dark:bg-neutral-900/50"
                                />
                            ))}
                        </div>
                    ) : analyticsSummary ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-2xl border border-white/20 bg-white/55 p-3 dark:border-white/10 dark:bg-neutral-900/55">
                                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Page Views</p>
                                    <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={analyticsSummary.totals.pageViews} />
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/55 p-3 dark:border-white/10 dark:bg-neutral-900/55">
                                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Top Query Count</p>
                                    <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={analyticsSummary.topQueries[0]?.count ?? 0} />
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/55 p-3 dark:border-white/10 dark:bg-neutral-900/55">
                                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Pencarian</p>
                                    <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={analyticsSummary.totals.searches} />
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/55 p-3 dark:border-white/10 dark:bg-neutral-900/55">
                                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">CTR Video</p>
                                    <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={analyticsSummary.videoCtr.ctrPercent} decimals={2} suffix="%" />
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="rounded-2xl border border-white/20 bg-white/55 p-4 dark:border-white/10 dark:bg-neutral-900/55">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                        <Search className="h-4 w-4 text-indigo-500" />
                                        Top Query
                                    </div>
                                    <div className="space-y-2">
                                        {analyticsSummary.topQueries.length === 0 ? (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Belum ada data query.</p>
                                        ) : (
                                            analyticsSummary.topQueries.slice(0, 5).map((item, index) => (
                                                <div
                                                    key={`${item.query}-${index}`}
                                                    className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-xs dark:bg-neutral-800/70"
                                                >
                                                    <p className="line-clamp-1 max-w-[70%] font-medium text-neutral-700 dark:text-neutral-200">
                                                        {item.query}
                                                    </p>
                                                    <p className="font-semibold text-indigo-600 dark:text-indigo-300">
                                                        {item.count}x
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/55 p-4 dark:border-white/10 dark:bg-neutral-900/55">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                        <ThumbsUp className="h-4 w-4 text-emerald-500" />
                                        FAQ Paling Membantu
                                    </div>
                                    <div className="space-y-2">
                                        {analyticsSummary.topFaqs.length === 0 ? (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Belum ada metrik FAQ.</p>
                                        ) : (
                                            analyticsSummary.topFaqs.slice(0, 3).map((faq) => (
                                                <div
                                                    key={faq.id}
                                                    className="rounded-xl bg-white/70 px-3 py-2 text-xs dark:bg-neutral-800/70"
                                                >
                                                    <p className="line-clamp-2 font-medium text-neutral-700 dark:text-neutral-200">
                                                        {faq.question}
                                                    </p>
                                                    <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                                                        Helpful {faq.helpful} • Score {faq.score}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/55 p-4 dark:border-white/10 dark:bg-neutral-900/55">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                        <MousePointerClick className="h-4 w-4 text-purple-500" />
                                        CTR Video & Top Click
                                    </div>
                                    <div className="rounded-xl bg-white/70 p-3 text-xs dark:bg-neutral-800/70">
                                        <p className="text-neutral-500 dark:text-neutral-400">
                                            {analyticsSummary.videoCtr.clicks} klik dari {analyticsSummary.videoCtr.pageViews} page view.
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-purple-600 dark:text-purple-300">
                                            CTR {analyticsSummary.videoCtr.ctrPercent.toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {analyticsSummary.topVideos.slice(0, 3).map((video) => (
                                            <div
                                                key={video.id}
                                                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-xs dark:bg-neutral-800/70"
                                            >
                                                <p className="line-clamp-1 max-w-[72%] font-medium text-neutral-700 dark:text-neutral-200">
                                                    {video.title}
                                                </p>
                                                <p className="font-semibold text-purple-600 dark:text-purple-300">
                                                    {video.views}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/20 bg-white/30 px-4 py-8 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-900/20 dark:text-neutral-400">
                            Metrik analytics belum tersedia. Jalankan migrasi analytics lalu muat ulang halaman.
                        </div>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white sm:text-xl">
                                Kategori Bantuan
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Jelajahi topik bantuan sesuai kebutuhan Anda
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {categoryCards.map((card) => (
                            <motion.div
                                key={card.id}
                                variants={cardVariants}
                                whileHover="hover"
                                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-[0.06]', card.color)} />
                                <motion.div
                                    className={cn(
                                        'absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br blur-3xl',
                                        card.color,
                                    )}
                                    animate={{ opacity: [0.12, 0.3, 0.12], scale: [1, 1.25, 1] }}
                                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                />

                                <div className="relative z-10">
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div
                                            className={cn(
                                                'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                                                card.color,
                                            )}
                                        >
                                            <card.icon className="h-8 w-8" />
                                        </div>
                                        <Badge className="border-0 bg-white/70 text-[11px] font-semibold text-neutral-700 shadow-sm dark:bg-neutral-800/70 dark:text-neutral-200">
                                            {card.badge}
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-bold text-neutral-900 transition-colors dark:text-white sm:text-xl">
                                        {card.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                        {card.description}
                                    </p>
                                    <div className="mt-3 space-y-1.5">
                                        {card.highlights.map((highlight) => (
                                            <p
                                                key={highlight}
                                                className="flex items-start gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-300"
                                            >
                                                <span
                                                    className={cn(
                                                        'mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br',
                                                        card.color,
                                                    )}
                                                />
                                                <span>{highlight}</span>
                                            </p>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 dark:border-white/10">
                                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            <AnimatedCounter value={card.articleCount} /> artikel
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
                                            <Star className="h-4 w-4 fill-amber-500" />
                                            {card.rating ? card.rating.toFixed(1) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12"
                >
                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 sm:p-8">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Artikel Terpopuler
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Rekomendasi panduan paling sering diakses
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {popularArticles.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/20 bg-white/30 px-4 py-8 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-900/20 dark:text-neutral-400">
                                    Data artikel belum tersedia untuk ditampilkan.
                                </div>
                            ) : (
                                popularArticles.map((article, index) => {
                                    const ratingDenominator = article.helpful + article.notHelpful;
                                    const rating =
                                        ratingDenominator > 0
                                            ? (article.helpful / ratingDenominator) * 5
                                            : null;

                                    return (
                                        <motion.button
                                            key={article.id}
                                            whileHover={{ x: 8, scale: 1.01 }}
                                            onClick={() => {
                                                trackHelpEvent('help_article_open', {
                                                    article_id: article.id,
                                                    article_title: article.title,
                                                    article_source: article.source,
                                                });
                                                void handleTrackArticleView(article);
                                                setSelectedArticle(article);
                                            }}
                                            className="group flex w-full items-start gap-4 rounded-2xl border border-white/20 bg-white/50 p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-neutral-900/50"
                                        >
                                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                                <BookOpen className="h-6 w-6" />
                                                <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white sm:text-base">
                                                    {article.title}
                                                </h3>
                                                <p className="mt-1 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                    {article.description}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" /> {article.views}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-amber-500">
                                                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                                                        {rating ? rating.toFixed(1) : 'N/A'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock3 className="h-3.5 w-3.5" /> {article.readTime}
                                                    </span>
                                                </div>
                                            </div>

                                            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                {article.difficulty}
                                            </Badge>
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 sm:p-8">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 text-white shadow-lg shadow-purple-500/30">
                                    <PlayCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Video Tutorial
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Panduan visual langkah demi langkah
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {displayedVideos.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/20 bg-white/30 px-4 py-8 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-900/20 dark:text-neutral-400">
                                    Tidak ada video yang sesuai kata kunci pencarian.
                                </div>
                            ) : (
                                displayedVideos.map((video) => (
                                    <motion.button
                                        key={video.id}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        onClick={() => {
                                            trackHelpEvent('help_video_open', {
                                                video_id: video.id,
                                                video_title: video.title,
                                                video_category: video.category,
                                            });
                                            void handleTrackVideoView(video);
                                            setSelectedVideo(video);
                                        }}
                                        className="group w-full rounded-2xl border border-white/20 bg-white/50 p-4 text-left shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:bg-neutral-900/50"
                                    >
                                        <div className={cn('relative mb-3 h-36 overflow-hidden rounded-xl bg-gradient-to-br', video.accent)}>
                                            {video.thumbnail ? (
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : null}
                                            <div className="absolute inset-0 bg-black/30" />
                                            <div className="absolute left-3 top-3 rounded-lg bg-black/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                {video.category}
                                            </div>
                                            <div className="absolute bottom-3 right-3 rounded-lg bg-black/35 px-2 py-1 text-[10px] font-semibold text-white">
                                                {video.duration}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition group-hover:scale-110">
                                                    <PlayCircle className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white sm:text-base">
                                            {video.title}
                                        </h3>
                                        <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                                            {video.description}
                                        </p>
                                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            <Eye className="h-3.5 w-3.5" />
                                            {video.views} views
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    id="help-faq-section"
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 sm:p-8"
                >
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-500/30">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white sm:text-xl">
                                    Pertanyaan Umum (FAQ)
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Jawaban cepat untuk masalah yang sering ditemui
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {filterOptions.map((label) => (
                                <button
                                    key={label}
                                    onClick={() => setFaqFilter(label)}
                                    className={cn(
                                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                                        faqFilter === label
                                            ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                            : 'border-white/20 bg-white/50 text-neutral-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredFaqItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/20 bg-white/30 px-4 py-10 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-900/20 dark:text-neutral-400">
                            Tidak ada FAQ yang cocok dengan pencarian atau filter saat ini.
                        </div>
                    ) : (
                        <Accordion
                            type="single"
                            collapsible
                            onValueChange={handleFaqAccordionChange}
                            className="space-y-3"
                        >
                            {filteredFaqItems.map((faq) => {
                                const votes = faqVotes[faq.id] ?? {
                                    helpful: faq.helpful,
                                    notHelpful: faq.notHelpful,
                                };
                                const userVote = faqUserVotes[faq.id] ?? faq.userVote ?? null;
                                const hasVoted = Boolean(userVote);

                                return (
                                    <AccordionItem
                                        key={faq.id}
                                        value={faq.id}
                                        className="overflow-hidden rounded-2xl border border-white/20 bg-white/50 px-4 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-neutral-900/50"
                                    >
                                        <AccordionTrigger className="py-4 text-left text-sm font-semibold text-neutral-900 hover:no-underline dark:text-white sm:text-base">
                                            <span>
                                                <span className="mr-1 text-emerald-600">Q.</span>
                                                {faq.question}
                                            </span>
                                        </AccordionTrigger>

                                        <AccordionContent>
                                            <div className="space-y-3 pb-4">
                                                <div className="rounded-xl border-l-2 border-emerald-500/70 bg-emerald-50/50 p-3 text-sm leading-relaxed text-neutral-700 dark:bg-emerald-900/20 dark:text-neutral-200">
                                                    <span className="mr-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                                        A.
                                                    </span>
                                                    <span className="whitespace-pre-line">{faq.answer}</span>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                                    <span>
                                                        Kategori: <span className="font-medium">{faq.categoryName}</span>
                                                    </span>
                                                    <span>
                                                        Dilihat <span className="font-medium">{faq.views}</span> kali
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 dark:border-white/10">
                                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                        Apakah jawaban ini membantu?
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => void handleFaqVote(faq.id, true)}
                                                        disabled={hasVoted}
                                                        className={cn(
                                                            'h-8 rounded-full px-3 text-xs',
                                                            userVote === 'helpful'
                                                                ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-500'
                                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300',
                                                        )}
                                                    >
                                                        <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                                                        Ya ({votes.helpful})
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => void handleFaqVote(faq.id, false)}
                                                        disabled={hasVoted}
                                                        className={cn(
                                                            'h-8 rounded-full px-3 text-xs',
                                                            userVote === 'notHelpful'
                                                                ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-500'
                                                                : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300',
                                                        )}
                                                    >
                                                        <ThumbsDown className="mr-1 h-3.5 w-3.5" />
                                                        Tidak ({votes.notHelpful})
                                                    </Button>
                                                    {hasVoted ? (
                                                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                            Vote Anda: {userVote === 'helpful' ? 'Ya' : 'Tidak'}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}

                    <div className="mt-6 rounded-2xl border border-white/20 bg-gradient-to-r from-neutral-900 to-neutral-700 p-4 text-white shadow-lg sm:p-5">
                        <p className="text-sm font-medium sm:text-base">
                            Masih belum menemukan jawaban yang dicari?
                        </p>
                        <p className="mt-1 text-xs text-neutral-200 sm:text-sm">
                            Tim support siap membantu via tiket dukungan dengan penanganan terstruktur.
                        </p>
                        <Button
                            onClick={() => setIsTicketModalOpen(true)}
                            className="mt-4 rounded-xl bg-white text-neutral-900 hover:bg-white/90"
                        >
                            <Headphones className="mr-2 h-4 w-4" /> Buat Tiket Dukungan
                        </Button>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Headphones className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white sm:text-xl">
                                Contact Support
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Pilih kanal bantuan yang paling nyaman untuk Anda
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                <Mail className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Email Support</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Tanya detail teknis via email
                            </p>
                            <a
                                href={`mailto:${contactInfo?.email ?? ''}`}
                                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-300"
                            >
                                {contactInfo?.email ?? 'Belum tersedia'}
                            </a>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                                <MessageCircle className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">WhatsApp CS</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Respon cepat ({contactInfo?.hours ?? 'Jam layanan belum tersedia'})
                            </p>
                            <a
                                href={
                                    contactInfo?.whatsapp
                                        ? `https://wa.me/${parsePhoneNumber(contactInfo.whatsapp)}`
                                        : '#'
                                }
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                    'mt-4 inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition',
                                    contactInfo?.whatsapp
                                        ? 'border-green-500 text-green-600 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-900/20'
                                        : 'cursor-not-allowed border-neutral-300 text-neutral-400 dark:border-neutral-700',
                                )}
                            >
                                Chat Sekarang
                            </a>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            className="relative rounded-3xl border border-white/20 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <span className="absolute right-4 top-4 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold tracking-wide text-white">
                                HOTLINE
                            </span>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                                <Phone className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Telepon Darurat</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                24/7 untuk masalah kritikal
                            </p>
                            <a
                                href={`tel:${contactInfo?.phone ?? contactInfo?.whatsapp ?? ''}`}
                                className="mt-4 inline-block text-2xl font-black tracking-tight text-rose-600 hover:underline dark:text-rose-300"
                            >
                                {contactInfo?.phone ?? contactInfo?.whatsapp ?? 'Belum tersedia'}
                            </a>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            <Dialog open={Boolean(selectedArticle)} onOpenChange={(open) => !open && setSelectedArticle(null)}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-0 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95">
                    {selectedArticle ? (
                        <>
                            <DialogHeader className="border-b border-white/10 px-6 pt-6 pb-4">
                                <DialogTitle className="text-xl text-neutral-900 dark:text-white">
                                    {selectedArticle.title}
                                </DialogTitle>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span className="inline-flex items-center gap-1">
                                        <Eye className="h-3.5 w-3.5" /> {selectedArticle.views}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock3 className="h-3.5 w-3.5" /> {selectedArticle.readTime}
                                    </span>
                                    <Badge className="rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/30 dark:text-indigo-300">
                                        {selectedArticle.difficulty}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 px-6 py-5">
                                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                    {selectedArticle.description}
                                </p>
                                <div className="rounded-2xl bg-white/70 p-4 text-sm leading-relaxed text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200">
                                    <p className="whitespace-pre-line">{selectedArticle.content}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                {selectedArticle.source === 'faq' ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => void handleFaqVote(selectedArticle.id, true)}
                                            disabled={Boolean(faqUserVotes[selectedArticle.id])}
                                        >
                                            <ThumbsUp className="mr-2 h-4 w-4" /> Helpful
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => void handleFaqVote(selectedArticle.id, false)}
                                            disabled={Boolean(faqUserVotes[selectedArticle.id])}
                                        >
                                            <ThumbsDown className="mr-2 h-4 w-4" /> Not Helpful
                                        </Button>
                                        {faqUserVotes[selectedArticle.id] ? (
                                            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                Vote Anda: {faqUserVotes[selectedArticle.id] === 'helpful' ? 'Ya' : 'Tidak'}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Feedback vote tersedia untuk artikel FAQ.
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShareArticle(selectedArticle)}
                                    >
                                        <Send className="mr-2 h-4 w-4" /> Share
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(selectedVideo)} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                <DialogContent className="max-w-5xl rounded-3xl border border-white/20 bg-white/95 p-0 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95">
                    {selectedVideo ? (
                        <>
                            <DialogHeader className="border-b border-white/10 px-6 pt-6 pb-4">
                                <DialogTitle className="text-xl text-neutral-900 dark:text-white">
                                    {selectedVideo.title}
                                </DialogTitle>
                                <Badge className="mt-2 w-fit rounded-full border border-white/20 bg-white/60 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200">
                                    {selectedVideo.category}
                                </Badge>
                            </DialogHeader>

                            <div className="px-6 py-5">
                                <div className={cn('aspect-video overflow-hidden rounded-2xl bg-gradient-to-br', selectedVideo.accent)}>
                                    {selectedVideo.url ? (
                                        <iframe
                                            title={selectedVideo.title}
                                            src={selectedVideo.url}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-center text-white">
                                            <div>
                                                <PlayCircle className="mx-auto h-16 w-16" />
                                                <p className="mt-2 text-sm font-semibold">{selectedVideo.duration}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                        {selectedVideo.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                        <span className="inline-flex items-center gap-1">
                                            <Eye className="h-3.5 w-3.5" /> {selectedVideo.views} views
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="h-3.5 w-3.5" /> {selectedVideo.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
                <DialogContent className="max-w-2xl rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-neutral-900 dark:text-white">
                            Buat Tiket Dukungan
                        </DialogTitle>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Isi detail kendala Anda, tim support akan membantu secepatnya.
                        </p>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmitTicket}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                    Kategori
                                </label>
                                <Select
                                    value={ticketForm.category}
                                    onValueChange={(value: TicketForm['category']) =>
                                        setTicketForm((prev) => ({ ...prev, category: value }))
                                    }
                                >
                                    <SelectTrigger className="rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="question">Pertanyaan</SelectItem>
                                        <SelectItem value="bug">Masalah Teknis</SelectItem>
                                        <SelectItem value="suggestion">Saran Pengembangan</SelectItem>
                                        <SelectItem value="other">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                    Prioritas
                                </label>
                                <Select
                                    value={ticketForm.priority}
                                    onValueChange={(value: TicketForm['priority']) =>
                                        setTicketForm((prev) => ({ ...prev, priority: value }))
                                    }
                                >
                                    <SelectTrigger className="rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60">
                                        <SelectValue placeholder="Pilih prioritas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Rendah</SelectItem>
                                        <SelectItem value="medium">Sedang</SelectItem>
                                        <SelectItem value="high">Tinggi</SelectItem>
                                        <SelectItem value="urgent">Mendesak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                Subjek
                            </label>
                            <Input
                                value={ticketForm.subject}
                                onChange={(event) =>
                                    setTicketForm((prev) => ({ ...prev, subject: event.target.value }))
                                }
                                placeholder="Ringkas masalah utama Anda"
                                className="rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                Deskripsi Detail
                            </label>
                            <Textarea
                                value={ticketForm.message}
                                onChange={(event) =>
                                    setTicketForm((prev) => ({ ...prev, message: event.target.value }))
                                }
                                placeholder="Jelaskan kronologi masalah, langkah yang sudah dicoba, dan hasil yang diharapkan"
                                rows={6}
                                className="rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60"
                            />
                        </div>

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button
                                type="submit"
                                disabled={isSubmittingTicket}
                                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                            >
                                {isSubmittingTicket ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Kirim Tiket
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setIsTicketModalOpen(false)}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {toast ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div
                            className={cn(
                                'rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl',
                                toast.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50/95 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'border-rose-200 bg-rose-50/95 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-300',
                            )}
                        >
                            {toast.message}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </StudentLayout>
    );
}
