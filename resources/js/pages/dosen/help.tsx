import HelpIcon from '@/assets/admin/help-center/help.png';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    ArrowRight,
    Book,
    BookOpen,
    Clock,
    Code,
    Download,
    Eye,
    FileText,
    Headphones,
    Image as ImageIcon,
    Info,
    Lightbulb,
    Mail,
    MessageCircle,
    MessageSquare,
    Paperclip,
    Phone,
    PlayCircle,
    Search,
    Send,
    Settings,
    Share2,
    Shield,
    Star,
    ThumbsDown,
    ThumbsUp,
    TrendingUp,
    Users,
    Video,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

// --- TYPES ---
type Category = {
    id: string;
    name: string;
    icon: any;
    description: string;
    articleCount: number;
    rating: number;
    badge?: string;
    color: string;
};
type Article = {
    id: string;
    title: string;
    category: string;
    views: string;
    rating: number;
    readTime: string;
    description: string;
    difficulty: string;
    icon: any;
};
type VideoItem = {
    id: string;
    title: string;
    duration: string;
    views: string;
    category: string;
    thumbnail: string;
    desc: string;
};
type FAQ = {
    id: string;
    question: string;
    answer: string;
    category: string;
    helpful: number;
    notHelpful: number;
};
type Ticket = {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    date: string;
};
type Message = {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    time: string;
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
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
        scale: 1.03,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
};

export default function DosenHelp({ auth }: any) {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(
        null,
    );
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showChatWidget, setShowChatWidget] = useState(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'agent',
            text: 'Halo! Ada yang bisa saya bantu hari ini?',
            time: '09:00',
        },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // --- MOCK DATA ---
    const stats = [
        {
            id: '1',
            title: 'Total Artikel',
            value: '256',
            sub: 'artikel tersedia',
            icon: BookOpen,
            glow: 'bg-blue-500',
            grad: 'from-blue-500 to-cyan-500',
        },
        {
            id: '2',
            title: 'Video Tutorial',
            value: '45',
            sub: 'video panduan',
            icon: Video,
            glow: 'bg-purple-500',
            grad: 'from-purple-500 to-pink-500',
        },
        {
            id: '3',
            title: 'FAQ',
            value: '128',
            sub: 'pertanyaan umum',
            icon: MessageCircle,
            glow: 'bg-orange-500',
            grad: 'from-orange-500 to-amber-500',
        },
        {
            id: '4',
            title: 'Ticket Support',
            value: '3',
            sub: 'tiket dukungan aktif',
            icon: Headphones,
            glow: 'bg-emerald-500',
            grad: 'from-emerald-500 to-teal-500',
        },
    ];

    const categories: Category[] = [
        {
            id: 'c1',
            name: 'Panduan Lengkap',
            icon: Book,
            badge: 'Populer',
            description:
                'Dokumentasi lengkap sistem presensi, manajemen kelas, dan fitur-fitur advanced',
            articleCount: 25,
            rating: 4.8,
            color: 'from-blue-500 to-indigo-500',
        },
        {
            id: 'c2',
            name: 'Tips & Trik',
            icon: Lightbulb,
            badge: 'Trending',
            description:
                'Maksimalkan produktivitas dengan tips praktis dan shortcut yang efisien',
            articleCount: 32,
            rating: 4.9,
            color: 'from-yellow-500 to-orange-500',
        },
        {
            id: 'c3',
            name: 'Keamanan',
            icon: Shield,
            badge: 'Penting',
            description:
                'Panduan lengkap keamanan akun, privasi data, dan best practices',
            articleCount: 15,
            rating: 4.8,
            color: 'from-green-500 to-emerald-500',
        },
        {
            id: 'c4',
            name: 'Video Tutorial',
            icon: PlayCircle,
            badge: 'Baru',
            description: 'Tutorial video step-by-step untuk semua fitur sistem',
            articleCount: 18,
            rating: 4.7,
            color: 'from-purple-500 to-pink-500',
        },
        {
            id: 'c5',
            name: 'Troubleshooting',
            icon: Wrench,
            badge: 'Pemula',
            description:
                'Solusi cepat untuk masalah umum dan error yang sering terjadi',
            articleCount: 28,
            rating: 4.6,
            color: 'from-red-500 to-orange-500',
        },
        {
            id: 'c6',
            name: 'API & Integrasi',
            icon: Code,
            badge: 'Pro',
            description:
                'Dokumentasi API, webhook, dan integrasi dengan sistem eksternal',
            articleCount: 12,
            rating: 4.9,
            color: 'from-cyan-500 to-blue-500',
        },
    ];

    const popularArticles: Article[] = [
        {
            id: 'a1',
            icon: Users,
            title: 'Cara Mengelola Kelas dan Mahasiswa',
            description:
                'Panduan lengkap mengelola kelas, menambah mahasiswa, dan mengatur jadwal perkuliahan',
            views: '2.8k',
            rating: 4.9,
            difficulty: 'Pemula',
            category: 'Panduan Lengkap',
            readTime: '5 min',
        },
        {
            id: 'a2',
            icon: FileText,
            title: 'Membuat dan Mengelola Sesi Absensi',
            description:
                'Tutorial step-by-step membuat sesi absensi dengan QR code, geolocation, dan face recognition',
            views: '2.1k',
            rating: 4.8,
            difficulty: 'Pemula',
            category: 'Panduan Lengkap',
            readTime: '7 min',
        },
        {
            id: 'a3',
            icon: Zap,
            title: 'Fitur Otomatis Approval dan Notifikasi',
            description:
                'Mengatur approval otomatis untuk izin, notifikasi real-time, dan reminder mahasiswa',
            views: '1.7k',
            rating: 4.7,
            difficulty: 'Menengah',
            category: 'Tips & Trik',
            readTime: '4 min',
        },
        {
            id: 'a4',
            icon: MessageSquare,
            title: 'Sistem Notifikasi dan Pengingat Cerdas',
            description:
                'Konfigurasi notifikasi push, email, dan SMS untuk berbagai event penting',
            views: '1.5k',
            rating: 4.6,
            difficulty: 'Menengah',
            category: 'Keamanan',
            readTime: '6 min',
        },
        {
            id: 'a5',
            icon: Shield,
            title: 'Keamanan Akun dan Verifikasi 2FA',
            description:
                'Mengaktifkan two-factor authentication dan mengamankan akun dari akses tidak sah',
            views: '1.3k',
            rating: 4.9,
            difficulty: 'Pro',
            category: 'Keamanan',
            readTime: '3 min',
        },
    ];

    const videos: VideoItem[] = [
        {
            id: 'v1',
            title: 'Onboarding Sistem Presensi v2.0',
            duration: '12:45',
            views: '4.5k',
            category: 'Tutorial',
            desc: 'Pengenalan antarmuka baru dan fitur-fitur unggulan sistem absensi.',
            thumbnail:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600&h=350',
        },
        {
            id: 'v2',
            title: 'Manajemen Penilaian Hybrid',
            duration: '08:20',
            views: '3.2k',
            category: 'Tips & Trik',
            desc: 'Cara efektif melakukan penilaian tugas secara online dan offline.',
            thumbnail:
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600&h=350',
        },
        {
            id: 'v3',
            title: 'Monitoring Kehadiran Realtime',
            duration: '05:30',
            views: '2.1k',
            category: 'Panduan',
            desc: 'Memantau presensi mahasiswa kelas besar menggunakan dashboard live.',
            thumbnail:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=350',
        },
    ];

    const faqs: FAQ[] = [
        {
            id: 'q1',
            category: 'Umum',
            question: 'Bagaimana cara reset password akun saya?',
            answer: 'Anda dapat mereset password melalui halaman profil, pilih menu keamanan, lalu klik "Ubah Password". Sistem akan mengirimkan OTP ke email terdaftar Anda.',
            helpful: 145,
            notHelpful: 2,
        },
        {
            id: 'q2',
            category: 'Absensi',
            question: 'Mengapa QR Code absensi tidak bisa di-scan mahasiswa?',
            answer: 'Pastikan fitur "Dynamic QR" tidak berkedip terlalu cepat (cek Pengaturan Sesi), dan pastikan mahasiswa menggunakan aplikasi versi terbaru. Anda juga bisa memperbesar QR code dengan klik ikon full-screen.',
            helpful: 89,
            notHelpful: 5,
        },
        {
            id: 'q3',
            category: 'Tugas',
            question: 'Apakah saya bisa menerima tugas lebih dari deadline?',
            answer: 'Ya, pada menu pengaturan tugas terkait, aktifkan toogle "Beri toleransi keterlambatan" dan tentukan batas waktu tambahan (misal: 24 jam).',
            helpful: 210,
            notHelpful: 1,
        },
    ];

    // --- HANDLERS ---
    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        setChatMessages([
            ...chatMessages,
            {
                id: Date.now().toString(),
                sender: 'user',
                text: chatInput,
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            },
        ]);
        setChatInput('');
        setTimeout(() => {
            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    sender: 'agent',
                    text: 'Terima kasih atas pesan Anda. Agen kami akan segera merespons.',
                    time: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ]);
        }, 1000);
    };

    return (
        <DosenLayout>
            <Head title="Pusat Bantuan" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="mx-auto max-w-7xl space-y-8 p-4 pb-32 md:space-y-12 md:p-8"
            >
                {/* 1. HEADER SECTION (EXACT Admin Kas gradient req) */}
                <motion.div
                    variants={itemVariants}
                    className="relative mx-auto w-full overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 p-8 text-white shadow-2xl md:p-14"
                >
                    {/* Animated Grain Noise Background */}
                    <div
                        className="absolute inset-0 opacity-20 mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                        }}
                    />

                    {/* Pulsating Rings & Floating Orbs */}
                    <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-white/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 15,
                            }}
                            className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                        >
                            <img
                                src={HelpIcon}
                                alt="Header Icon"
                                className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                            />
                        </motion.div>
                        <div>
                            <p className="mb-1 text-xs font-semibold tracking-wider text-fuchsia-100 uppercase drop-shadow-sm md:text-sm">
                                Panduan Sistem
                            </p>
                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl">
                                Pusat Bantuan Dosen
                            </h1>
                            <p className="mx-auto max-w-2xl font-medium text-fuchsia-50 drop-shadow-md md:text-lg">
                                Temukan jawaban cepat, panduan lengkap, dan
                                dukungan untuk semua kebutuhan Anda
                            </p>
                        </div>
                        {/* Smart Search */}
                        <motion.div
                            className="relative mx-auto mt-4 w-full max-w-2xl rounded-2xl shadow-2xl"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                <Search className="h-6 w-6 text-fuchsia-600/50" />
                            </div>
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari bantuan, panduan, atau ketik pertanyaan Anda (Cmd+K)..."
                                className="rounded-2xl border-none bg-white/95 py-8 pr-32 pl-14 text-lg text-gray-900 ring-white/40 placeholder:text-gray-400 focus-visible:ring-4"
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                <Button className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-5 shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-fuchsia-600">
                                    Cari
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* 2. QUICK STATS (4 Cards) */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                >
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.id}
                            variants={cardVariants}
                            whileHover="hover"
                            onHoverStart={() => setHoveredCard(stat.id)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <motion.div
                                animate={{
                                    scale: hoveredCard === stat.id ? 1.5 : 1,
                                    opacity:
                                        hoveredCard === stat.id ? 0.3 : 0.1,
                                }}
                                className={cn(
                                    'absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl transition-all duration-500',
                                    stat.glow,
                                )}
                            />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        {stat.title}
                                    </p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                        {stat.value}
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {stat.sub}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
                                        stat.grad,
                                    )}
                                >
                                    <stat.icon className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* 3. KATEGORI BANTUAN (6 Categories) */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-100 p-2.5 dark:bg-cyan-900/30">
                            <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Jelajahi Kategori
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                variants={cardVariants}
                                whileHover="hover"
                                onHoverStart={() => setHoveredCard(cat.id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-cyan-500/30 xl:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <motion.div
                                    animate={{
                                        scale: hoveredCard === cat.id ? 1.5 : 1,
                                        opacity:
                                            hoveredCard === cat.id
                                                ? 0.15
                                                : 0.05,
                                    }}
                                    className={`absolute inset-0 bg-gradient-to-br ${cat.color} transition-all duration-500`}
                                />
                                <div className="relative z-10">
                                    <div className="mb-5 flex items-start justify-between">
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} shadow-lg ring-4 ring-white/50 transition-transform group-hover:scale-110 dark:ring-black/20`}
                                        >
                                            <cat.icon className="h-8 w-8 text-white" />
                                        </div>
                                        {cat.badge && (
                                            <Badge
                                                className={cn(
                                                    'px-3 py-1 font-bold shadow-sm',
                                                    cat.badge === 'Populer'
                                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                        : cat.badge ===
                                                            'Trending'
                                                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                          : 'bg-green-100 text-green-700 hover:bg-green-200',
                                                )}
                                            >
                                                {cat.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
                                        {cat.name}
                                    </h3>
                                    <p className="mb-6 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                        {cat.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-gray-200/50 pt-4 dark:border-gray-800/50">
                                        <span className="text-sm font-semibold text-gray-500">
                                            {cat.articleCount} Artikel
                                        </span>
                                        <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-500 dark:bg-amber-900/20">
                                            <Star className="h-4 w-4 fill-amber-500" />{' '}
                                            {cat.rating}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 4. POPULAR ARTICLES & 6. VIDEO TUTORIALS */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-yellow-100 p-2.5 dark:bg-yellow-900/30">
                                    <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Artikel Terpopuler
                                </h2>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-emerald-600 hover:text-emerald-700"
                            >
                                Lihat Semua{' '}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {popularArticles.map((article, i) => (
                                <motion.div
                                    key={article.id}
                                    whileHover={{ x: 8, scale: 1.01 }}
                                    onClick={() => {
                                        setSelectedArticle(article);
                                        setShowArticleModal(true);
                                    }}
                                    className="group flex cursor-pointer gap-5 rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 dark:border-white/5 dark:bg-neutral-900/40"
                                >
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 text-emerald-600 shadow-inner transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white dark:text-emerald-400">
                                        <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xl text-xs font-bold text-white shadow-md dark:bg-white dark:text-gray-900">
                                            #{i + 1}
                                        </span>
                                        <article.icon className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-start justify-between">
                                            <h4 className="truncate pr-4 text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-600 dark:text-white">
                                                {article.title}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className="bg-emerald-50/50 text-[10px] whitespace-nowrap"
                                            >
                                                {article.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="mb-2 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                            {article.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />{' '}
                                                {article.views}
                                            </span>
                                            <span className="flex items-center gap-1 text-amber-500">
                                                <Star className="h-3 w-3 fill-amber-500" />{' '}
                                                {article.rating}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />{' '}
                                                {article.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-purple-100 p-2.5 dark:bg-purple-900/30">
                                    <PlayCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Video Tutorial
                                </h2>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-purple-600 hover:text-purple-700"
                            >
                                Explore <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            {videos.map((vid) => (
                                <motion.div
                                    key={vid.id}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    onClick={() => {
                                        setSelectedVideo(vid);
                                        setShowVideoModal(true);
                                    }}
                                    className="group flex cursor-pointer gap-4 rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all hover:shadow-purple-500/20 dark:bg-neutral-900/40"
                                >
                                    <div className="relative h-28 w-40 flex-shrink-0 overflow-hidden rounded-2xl shadow-md">
                                        <img
                                            src={vid.thumbnail}
                                            alt={vid.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 shadow-lg backdrop-blur-md transition-colors group-hover:bg-purple-500">
                                                <PlayCircle className="h-5 w-5 fill-white/80 text-white" />
                                            </div>
                                        </div>
                                        <Badge className="absolute right-2 bottom-2 border-none bg-black/70 px-1.5 py-0.5 text-[10px]">
                                            {vid.duration}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 py-1">
                                        <Badge
                                            variant="secondary"
                                            className="mb-2 bg-purple-100 text-[10px] text-purple-700 dark:bg-purple-900/30"
                                        >
                                            {vid.category}
                                        </Badge>
                                        <h4 className="mb-1 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white">
                                            {vid.title}
                                        </h4>
                                        <span className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Eye className="h-3 w-3" />{' '}
                                            {vid.views} x ditonton
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* 5. INTERACTIVE FAQ SECTION */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                >
                    <div className="mb-8 flex flex-col justify-between gap-6 text-center md:flex-row md:items-center md:text-left">
                        <div className="flex items-center justify-center gap-4 md:justify-start">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner dark:bg-orange-900/40">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Pertanyaan Umum (FAQ)
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Jawaban cepat untuk masalah yang sering
                                    ditemui
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-2">
                            {['Umum', 'Absensi', 'Tugas', 'Teknis'].map(
                                (cat) => (
                                    <Badge
                                        key={cat}
                                        variant={
                                            cat === 'Umum'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="cursor-pointer px-3 py-1 text-sm hover:bg-emerald-500 hover:text-white"
                                    >
                                        {cat}
                                    </Badge>
                                ),
                            )}
                        </div>
                    </div>

                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-4"
                    >
                        {faqs.map((faq) => (
                            <AccordionItem
                                key={faq.id}
                                value={faq.id}
                                className="overflow-hidden rounded-2xl border-none bg-white/50 shadow-sm transition-shadow hover:shadow-md dark:bg-black/20"
                            >
                                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline data-[state=open]:bg-emerald-50/50 data-[state=open]:text-emerald-600 dark:hover:bg-white/5 dark:data-[state=open]:bg-emerald-900/20">
                                    <div className="flex items-center gap-4 text-left text-base font-bold">
                                        <span className="font-black text-emerald-500">
                                            Q.
                                        </span>
                                        {faq.question}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pt-2 pb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    <div className="mb-4 border-l-2 border-emerald-500/30 pl-8">
                                        <span className="mb-2 block font-bold text-emerald-500">
                                            A.
                                        </span>
                                        {faq.answer}
                                    </div>
                                    <div className="mt-6 flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 px-8 dark:border-gray-800 dark:bg-gray-900/50">
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                            Apakah jawaban ini membantu?
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-lg border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-gray-700"
                                            >
                                                <ThumbsUp className="mr-2 h-4 w-4" />{' '}
                                                Ya ({faq.helpful})
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-lg border-gray-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-gray-700"
                                            >
                                                <ThumbsDown className="mr-2 h-4 w-4" />{' '}
                                                Tidak ({faq.notHelpful})
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-800">
                        <p className="mb-4 font-medium text-gray-500">
                            Masih belum menemukan jawaban yang dicari?
                        </p>
                        <Button
                            onClick={() => setShowTicketModal(true)}
                            className="rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-6 text-white shadow-xl hover:from-black hover:to-gray-800"
                        >
                            <Headphones className="mr-2 h-5 w-5" />
                            Buat Tiket Dukungan
                        </Button>
                    </div>
                </motion.div>

                {/* 7. CONTACT SUPPORT */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 md:grid-cols-3"
                >
                    <div className="col-span-1 mb-2 flex items-center gap-3 md:col-span-3">
                        <div className="rounded-xl bg-rose-100 p-2.5 dark:bg-rose-900/30">
                            <Headphones className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Hubungi Kami
                        </h2>
                    </div>

                    <div className="flex flex-col items-center rounded-3xl border border-white/20 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-2 dark:bg-neutral-900/40">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
                            <Mail className="h-8 w-8" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold">
                            Email Support
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Tanya detail teknis via email
                        </p>
                        <a
                            href="mailto:support@tplk004.id"
                            className="text-lg font-bold text-blue-600"
                        >
                            support@tplk004.id
                        </a>
                    </div>

                    <div className="flex flex-col items-center rounded-3xl border border-white/20 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-2 dark:bg-neutral-900/40">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
                            <MessageCircle className="h-8 w-8" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold">WhatsApp CS</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Respon cepat (Jam 08:00 - 16:00)
                        </p>
                        <Button
                            variant="outline"
                            className="rounded-xl border-green-500 font-bold text-green-600 hover:bg-green-50"
                        >
                            Chat Sekarang
                        </Button>
                    </div>

                    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-2 dark:bg-neutral-900/40">
                        <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500 px-3 py-1 text-[10px] font-bold text-white">
                            HOTLINE
                        </div>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-inner">
                            <Phone className="h-8 w-8" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold">
                            Telepon Darurat
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            24/7 Untuk masalah kritikal
                        </p>
                        <a
                            href="tel:1500444"
                            className="text-xl font-bold tracking-wider text-rose-600"
                        >
                            1500-444
                        </a>
                    </div>
                </motion.div>
            </motion.div>

            {/* 6. LIVE CHAT WIDGET (Floating) */}
            <motion.div
                className="fixed right-6 bottom-6 z-50 flex flex-col items-end"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, type: 'spring' }}
            >
                <AnimatePresence>
                    {showChatWidget && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                y: 20,
                                transformOrigin: 'bottom right',
                            }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                                            <Zap className="h-5 w-5 fill-yellow-400 text-yellow-500" />
                                        </div>
                                        <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-emerald-600 bg-green-400"></div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">
                                            Tim Support (Live)
                                        </h4>
                                        <p className="text-[10px] text-emerald-100">
                                            Membalas dalam waktu &lt; 3 mnt
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                                    onClick={() => setShowChatWidget(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 dark:bg-neutral-950">
                                <div className="mx-auto my-2 w-max rounded-full bg-gray-100 px-3 py-1 text-center text-[10px] font-medium text-gray-400 dark:bg-gray-800">
                                    HARI INI
                                </div>
                                {chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'rounded-tr-sm bg-emerald-500 text-white' : 'rounded-tl-sm border border-gray-100 bg-white text-gray-800 dark:border-none dark:bg-gray-800 dark:text-gray-200'}`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="mx-1 mt-1 text-[10px] text-gray-400">
                                            {msg.time}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-neutral-900">
                                <div className="relative flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-1 text-gray-400 hover:text-emerald-500"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        value={chatInput}
                                        onChange={(e) =>
                                            setChatInput(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            handleSendChat()
                                        }
                                        placeholder="Ketik pesan..."
                                        className="rounded-full border-none bg-gray-50 py-5 pr-12 pl-10 focus-visible:ring-emerald-500/30 dark:bg-neutral-800"
                                    />
                                    <Button
                                        onClick={handleSendChat}
                                        size="icon"
                                        className="absolute right-1 h-8 w-8 rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    onClick={() => setShowChatWidget(!showChatWidget)}
                    className="relative h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-0 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] transition-transform hover:scale-110"
                >
                    <MessageCircle className="h-7 w-7 text-white" />
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                            1
                        </span>
                    </span>
                </Button>
            </motion.div>

            {/* --- MODALS --- */}

            {/* Support Ticket Modal */}
            <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
                <DialogContent className="overflow-hidden rounded-[2rem] border-none bg-white p-0 shadow-2xl sm:max-w-2xl dark:bg-neutral-900">
                    <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
                        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                        <h2 className="flex items-center gap-3 text-2xl font-bold">
                            <Headphones className="h-6 w-6 text-emerald-400" />{' '}
                            Buat Tiket Dukungan
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Tim teknis kami akan segera menangani laporan Anda
                            maksimal 1x24 jam.
                        </p>
                    </div>
                    <div className="space-y-6 p-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Kategori Masalah
                            </label>
                            <Select defaultValue="bug">
                                <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 focus:ring-emerald-500 dark:border-gray-800">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bug">
                                        Bug / Error Aplikasi
                                    </SelectItem>
                                    <SelectItem value="feature">
                                        Permintaan Fitur Baru
                                    </SelectItem>
                                    <SelectItem value="account">
                                        Akses Akun / Login
                                    </SelectItem>
                                    <SelectItem value="data">
                                        Perbaikan Data / Nilai
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Subjek
                            </label>
                            <Input
                                placeholder="Contoh: QR Code absensi tidak merespon saat di scan mahasiswa"
                                className="h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 dark:border-gray-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Deskripsi Detail
                            </label>
                            <Textarea
                                placeholder="Jelaskan secara rinci kronologi masalah yang Anda alami..."
                                className="min-h-[120px] resize-none rounded-xl border-gray-200 p-4 focus-visible:ring-emerald-500 dark:border-gray-800"
                            />
                        </div>
                        <div className="group flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-emerald-50 dark:border-gray-700 dark:bg-neutral-900 dark:hover:bg-emerald-900/10">
                            <div className="flex flex-col items-center">
                                <ImageIcon className="mb-2 h-8 w-8 text-gray-400 transition-colors group-hover:text-emerald-500" />
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Klik atau Drag & Drop gambar screenshot
                                    masalah disini (Opsional)
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setShowTicketModal(false)}
                                className="rounded-xl px-6"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => setShowTicketModal(false)}
                                className="rounded-xl bg-emerald-600 px-8 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                            >
                                <Send className="mr-2 h-4 w-4" /> Kirim Tiket
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Article Detail Modal (RICH UI) */}
            <Dialog open={showArticleModal} onOpenChange={setShowArticleModal}>
                <DialogContent className="scrollbar-hide max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none bg-white p-0 shadow-2xl sm:max-w-4xl dark:bg-neutral-950">
                    {selectedArticle && (
                        <>
                            <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 text-white md:p-14">
                                <div className="absolute top-6 right-6 flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full border border-white/10 bg-black/20 text-white hover:bg-black/40"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full border border-white/10 bg-black/20 text-white hover:bg-black/40"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="mb-6 border-none bg-white/20 text-white backdrop-blur-md"
                                >
                                    {selectedArticle.category}
                                </Badge>
                                <h1 className="mb-6 text-3xl leading-tight font-extrabold drop-shadow-lg md:text-5xl">
                                    {selectedArticle.title}
                                </h1>
                                <div className="flex items-center gap-6 font-medium text-emerald-50">
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />{' '}
                                        {selectedArticle.readTime} Read
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />{' '}
                                        {selectedArticle.views} Views
                                    </span>
                                    <span className="flex items-center gap-2 text-yellow-300">
                                        <Star className="h-4 w-4 fill-yellow-300" />{' '}
                                        {selectedArticle.rating} / 5.0
                                    </span>
                                </div>
                            </div>
                            <div className="gap-12 p-10 md:flex md:p-14">
                                <div className="flex-1 space-y-8 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                    <p className="border-l-4 border-emerald-500 py-1 pl-4 text-xl font-medium text-gray-900 dark:text-white">
                                        {selectedArticle.description}
                                    </p>
                                    <p>
                                        Mengelola kelas dan absensi menggunakan
                                        sistem digital membutuhkan pemahaman
                                        dasar mengenai alur kerja aplikasi. Pada
                                        artikel ini, kita akan membahas secara
                                        tuntas langkah apa saja yang harus
                                        dipersiapkan sebelum memulai sesi
                                        perkuliahan.
                                    </p>

                                    <h3 className="mt-10 text-2xl font-bold text-gray-900 dark:text-white">
                                        Langkah 1: Persiapan Kelas
                                    </h3>
                                    <p>
                                        Pastikan data mahasiswa di menu{' '}
                                        <code>Mahasiswa & Kelas</code> sudah
                                        sinkron dengan data PDDikti atau SIAKAD
                                        Universitas. Jika ada ketidaksesuaian,
                                        gunakan fitur{' '}
                                        <strong>"Sinkronisasi Data"</strong> di
                                        panel pengaturan kelas.
                                    </p>

                                    <div className="my-8 flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                                        <Info className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                                        <div className="text-sm">
                                            <span className="mb-1 block font-bold text-emerald-800 dark:text-emerald-400">
                                                Catatan Penting
                                            </span>
                                            Hanya admin prodi yang dapat
                                            menambahkan atau menghapus mahasiswa
                                            dari kelas reguler. Dosen ditugaskan
                                            sebagai validator.
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Tips Keamanan
                                    </h3>
                                    <ul className="list-disc space-y-3 pl-6 marker:text-emerald-500">
                                        <li>
                                            Jangan bagikan QR code absensi di
                                            grup chat (WA/Telegram) untuk
                                            mencegah kecurangan absen jarak
                                            jauh.
                                        </li>
                                        <li>
                                            Gunakan fitur "Dynamic QR" dengan
                                            refresh rate 5 detik.
                                        </li>
                                        <li>
                                            Aktifkan validasi lokasi geografis
                                            dengan radius 50 meter dari ruangan.
                                        </li>
                                    </ul>
                                </div>
                                <div className="mt-10 w-full flex-shrink-0 space-y-8 md:mt-0 md:w-72">
                                    <div className="sticky top-6 rounded-3xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-neutral-900">
                                        <h4 className="mb-4 font-bold text-gray-900 dark:text-white">
                                            Daftar Isi
                                        </h4>
                                        <ul className="space-y-3 text-sm font-medium text-gray-500">
                                            <li className="border-l-2 border-emerald-500 pl-3 text-emerald-600 dark:text-emerald-400">
                                                Persiapan Kelas
                                            </li>
                                            <li className="cursor-pointer border-l-2 border-transparent pl-3 hover:text-gray-900">
                                                Memulai Sesi Baru
                                            </li>
                                            <li className="cursor-pointer border-l-2 border-transparent pl-3 hover:text-gray-900">
                                                Validasi Kehadiran Manual
                                            </li>
                                            <li className="cursor-pointer border-l-2 border-transparent pl-3 hover:text-gray-900">
                                                Export Rekapan
                                            </li>
                                        </ul>

                                        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
                                            <p className="mb-4 text-center font-bold text-gray-900 dark:text-white">
                                                Apakah artikel ini membantu?
                                            </p>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                                                >
                                                    <ThumbsUp className="mr-2 h-4 w-4" />{' '}
                                                    Ya
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 rounded-xl hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <ThumbsDown className="mr-2 h-4 w-4" />{' '}
                                                    Tidak
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Video Modal (Custom Player Mockup) */}
            <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
                <DialogContent className="overflow-hidden rounded-3xl border-none bg-black p-0 shadow-[0_0_100px_rgba(168,85,247,0.2)] sm:max-w-5xl">
                    {selectedVideo && (
                        <div className="flex flex-col">
                            {/* Fake Video Player View */}
                            <div className="group relative aspect-video w-full cursor-pointer bg-gray-900">
                                <img
                                    src={selectedVideo.thumbnail}
                                    alt="Video"
                                    className="h-full w-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-20 w-20 scale-110 items-center justify-center rounded-full bg-purple-600/90 shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-transform duration-300 group-hover:scale-125">
                                        <PlayCircle className="h-10 w-10 fill-white text-white" />
                                    </div>
                                </div>
                                {/* Fake Controls */}
                                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                                    <div className="mb-4 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20">
                                        <div className="relative h-full w-1/3 bg-purple-500">
                                            <div className="absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-lg" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-white/20"
                                            >
                                                <PlayCircle className="h-6 w-6" />
                                            </Button>
                                            <span className="font-mono text-xs font-medium">
                                                03:45 / {selectedVideo.duration}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Settings className="h-5 w-5 cursor-pointer opacity-80 hover:opacity-100" />
                                            <Badge className="cursor-pointer rounded bg-purple-600 text-[10px] hover:bg-purple-700">
                                                HD 1080p
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-8 dark:bg-neutral-900">
                                <Badge
                                    variant="secondary"
                                    className="mb-4 bg-purple-100 font-bold text-purple-700 dark:bg-purple-900/30"
                                >
                                    {selectedVideo.category}
                                </Badge>
                                <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                                    {selectedVideo.title}
                                </h2>
                                <div className="mb-6 flex items-center gap-4 text-sm font-medium text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />{' '}
                                        {selectedVideo.views} Ditonton
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />{' '}
                                        Dipublikasikan 2 minggu lalu
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {selectedVideo.desc}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
