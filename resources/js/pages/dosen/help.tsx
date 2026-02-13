/**
 * Dosen Help Center Page - Enhanced Interactive Version
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
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
    Target,
    Rocket,
    Eye,
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type ToastType = { type: 'success' | 'error'; message: string } | null;

export default function DosenHelp() {
    const { auth } = usePage().props as any;
    const [faqCategories, setFaqCategories] = useState<any[]>([]);
    const [troubleshootingGuides, setTroubleshootingGuides] = useState<any[]>([]);
    const [contactInfo, setContactInfo] = useState<{
        email: string;
        phone?: string;
        hours?: string;
        responseTime?: string;
    } | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<ToastType>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [feedbackForm, setFeedbackForm] = useState({
        subject: '',
        message: '',
        category: 'general',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadHelpData();
    }, []);

    const loadHelpData = async () => {
        try {
            setIsLoading(true);
            
            console.log('Loading help data...');
            
            // Fetch real data from API
            const [faqsRes, troubleshootingRes, contactRes] = await Promise.all([
                fetch('/dosen/help/faqs'),
                fetch('/dosen/help/troubleshooting'),
                fetch('/dosen/help/contact'),
            ]);
            
            console.log('FAQ Response:', faqsRes.status, faqsRes.ok);
            console.log('Troubleshooting Response:', troubleshootingRes.status, troubleshootingRes.ok);
            console.log('Contact Response:', contactRes.status, contactRes.ok);
            
            if (!faqsRes.ok || !troubleshootingRes.ok || !contactRes.ok) {
                throw new Error('Failed to fetch help data');
            }
            
            const faqs = await faqsRes.json();
            const troubleshooting = await troubleshootingRes.json();
            const contact = await contactRes.json();
            
            console.log('FAQs loaded:', faqs.length, 'categories');
            console.log('Troubleshooting loaded:', troubleshooting.length, 'guides');
            console.log('Contact info loaded:', contact);
            
            setFaqCategories(faqs);
            setTroubleshootingGuides(troubleshooting);
            setContactInfo(contact);
        } catch (error) {
            console.error('Error loading help data:', error);
            showToast('error', 'Gagal memuat data bantuan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackForm.subject || !feedbackForm.message) {
            showToast('error', 'Mohon lengkapi semua field');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/dosen/help/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(feedbackForm),
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('success', `Pesan berhasil dikirim! Ticket ID: ${data.ticketId}`);
                setFeedbackForm({ subject: '', message: '', category: 'general' });
            } else {
                showToast('error', 'Gagal mengirim pesan');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            showToast('error', 'Gagal mengirim pesan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFaqFeedback = async (faqId: string, isHelpful: boolean) => {
        try {
            const id = faqId.replace('faq', '');
            const endpoint = isHelpful ? 'helpful' : 'not-helpful';
            
            await fetch(`/dosen/help/faq/${id}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            showToast('success', 'Terima kasih atas feedback Anda!');
            
            // Reload FAQs to get updated counts
            const response = await fetch('/dosen/help/faqs');
            const faqs = await response.json();
            setFaqCategories(faqs);
        } catch (error) {
            console.error('Error submitting FAQ feedback:', error);
        }
    };

    const quickLinks = [
        {
            icon: BookOpen,
            title: 'Panduan Lengkap',
            description: 'Dokumentasi lengkap sistem presensi, manajemen kelas, dan fitur-fitur advanced',
            color: 'from-blue-500 to-cyan-500',
            count: '25 Artikel',
            badge: 'Populer',
        },
        {
            icon: Lightbulb,
            title: 'Tips & Trik',
            description: 'Maksimalkan produktivitas dengan tips praktis dan shortcut yang efisien',
            color: 'from-amber-500 to-orange-500',
            count: '32 Tips',
            badge: 'Trending',
        },
        {
            icon: Shield,
            title: 'Keamanan',
            description: 'Panduan lengkap keamanan akun, privasi data, dan best practices',
            color: 'from-emerald-500 to-teal-500',
            count: '15 Panduan',
            badge: 'Penting',
        },
        {
            icon: Video,
            title: 'Video Tutorial',
            description: 'Tutorial video step-by-step untuk semua fitur sistem',
            color: 'from-purple-500 to-pink-500',
            count: '18 Video',
            badge: 'Baru',
        },
        {
            icon: Zap,
            title: 'Quick Start',
            description: 'Mulai cepat dengan panduan singkat untuk pemula',
            color: 'from-rose-500 to-red-500',
            count: '8 Panduan',
            badge: 'Pemula',
        },
        {
            icon: Target,
            title: 'Best Practices',
            description: 'Praktik terbaik dari dosen berpengalaman',
            color: 'from-indigo-500 to-blue-500',
            count: '12 Tips',
            badge: 'Pro',
        },
    ];

    const popularTopics = [
        { 
            icon: Users, 
            title: 'Cara Mengelola Kelas dan Mahasiswa', 
            description: 'Panduan lengkap mengelola kelas, menambah mahasiswa, dan mengatur jadwal perkuliahan',
            views: '2.8k',
            rating: 4.9,
            difficulty: 'Mudah'
        },
        { 
            icon: FileText, 
            title: 'Membuat dan Mengelola Sesi Absensi', 
            description: 'Tutorial step-by-step membuat sesi absensi dengan QR code, geolocation, dan face recognition',
            views: '2.1k',
            rating: 4.8,
            difficulty: 'Mudah'
        },
        { 
            icon: Zap, 
            title: 'Fitur Otomatis Approval dan Notifikasi', 
            description: 'Mengatur approval otomatis untuk izin, notifikasi real-time, dan reminder mahasiswa',
            views: '1.7k',
            rating: 4.7,
            difficulty: 'Menengah'
        },
        { 
            icon: MessageSquare, 
            title: 'Sistem Notifikasi dan Pengingat Cerdas', 
            description: 'Konfigurasi notifikasi push, email, dan SMS untuk berbagai event penting',
            views: '1.5k',
            rating: 4.6,
            difficulty: 'Menengah'
        },
        { 
            icon: Shield, 
            title: 'Keamanan Akun dan Verifikasi 2FA', 
            description: 'Mengaktifkan two-factor authentication dan mengamankan akun dari akses tidak sah',
            views: '1.3k',
            rating: 4.9,
            difficulty: 'Mudah'
        },
        { 
            icon: TrendingUp, 
            title: 'Analisis Data dan Laporan Kehadiran', 
            description: 'Membuat laporan kehadiran, analisis statistik, dan export data ke berbagai format',
            views: '1.2k',
            rating: 4.8,
            difficulty: 'Menengah'
        },
        { 
            icon: Target, 
            title: 'Deteksi Fraud dan Anomali Kehadiran', 
            description: 'Memahami sistem deteksi kecurangan dan menangani kasus anomali kehadiran',
            views: '980',
            rating: 4.7,
            difficulty: 'Lanjutan'
        },
        { 
            icon: Rocket, 
            title: 'Integrasi dengan Sistem Eksternal', 
            description: 'Menghubungkan sistem dengan LMS, SIAKAD, dan platform pembelajaran lainnya',
            views: '856',
            rating: 4.5,
            difficulty: 'Lanjutan'
        },
    ];

    if (isLoading) {
        return (
            <DosenLayout>
                <Head title="Bantuan" />
                <div className="flex items-center justify-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent"
                    />
                </div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout>
            <Head title="Bantuan" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-black dark:via-slate-950 dark:to-emerald-950/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
                        >
                            <HelpCircle className="h-10 w-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Pusat Bantuan Dosen
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Temukan jawaban cepat, panduan lengkap, dan dukungan untuk semua kebutuhan Anda
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="Cari bantuan, panduan, atau pertanyaan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 text-base border-2 focus:border-emerald-500 dark:bg-black/50 backdrop-blur-sm"
                            />
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                >
                                    <Sparkles className="h-4 w-4 mr-1" />
                                    Cari
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Quick Links Grid - Enhanced */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {quickLinks.map((link: any, index: number) => (
                            <motion.div
                                key={link.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="relative"
                            >
                                <Card className="relative overflow-hidden group cursor-pointer border-2 hover:border-emerald-500/50 transition-all dark:bg-black/80 backdrop-blur-xl h-full shadow-lg hover:shadow-2xl">
                                    {/* Animated Background Gradient */}
                                    <motion.div
                                        className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }}
                                    />
                                    
                                    {/* Shimmer Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        animate={{
                                            x: ['-100%', '200%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 1,
                                            ease: 'linear',
                                        }}
                                    />
                                    
                                    <CardContent className="p-6 space-y-4 relative z-10">
                                        <div className="flex items-start justify-between">
                                            <motion.div
                                                whileHover={{ scale: 1.15, rotate: 5 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} shadow-xl shadow-${link.color.split('-')[1]}-500/30`}
                                            >
                                                <link.icon className="h-7 w-7 text-white" />
                                            </motion.div>
                                            {link.badge && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                                                >
                                                    <Badge 
                                                        variant="secondary" 
                                                        className="text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                                                    >
                                                        {link.badge}
                                                    </Badge>
                                                </motion.div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {link.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                {link.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs font-semibold">
                                                    {link.count}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs text-muted-foreground">4.8</span>
                                                </div>
                                            </div>
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Popular Topics - Enhanced */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-2 dark:bg-black/80 backdrop-blur-xl shadow-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
                                        >
                                            <Zap className="h-6 w-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-2xl font-bold">Topik Populer</h2>
                                            <p className="text-sm text-muted-foreground">Artikel paling banyak dibaca minggu ini</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                        Lihat Semua
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {popularTopics.map((topic: any, index: number) => (
                                        <motion.div
                                            key={topic.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            whileHover={{ x: 6, scale: 1.02 }}
                                            className="relative group"
                                        >
                                            <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-transparent hover:border-emerald-500/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-black/50 hover:shadow-xl transition-all cursor-pointer overflow-hidden">
                                                {/* Animated Background */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    animate={{
                                                        backgroundPosition: ['0% 0%', '100% 100%'],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        repeatType: 'reverse',
                                                    }}
                                                />
                                                
                                                <motion.div
                                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                                    className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10"
                                                >
                                                    <topic.icon className="h-7 w-7 text-white" />
                                                </motion.div>
                                                
                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                            {topic.title}
                                                        </h3>
                                                        <Badge 
                                                            variant="secondary" 
                                                            className={`text-xs font-semibold flex-shrink-0 ${
                                                                topic.difficulty === 'Mudah' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                                                                topic.difficulty === 'Menengah' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {topic.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                                        {topic.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                                                            <span className="font-medium">{topic.views} views</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                            <span className="font-medium">{topic.rating}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                                                            <span className="font-medium">5-10 min</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <motion.div
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="flex-shrink-0 relative z-10"
                                                >
                                                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card className="border-2 dark:bg-black backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <HelpCircle className="h-5 w-5 text-emerald-500" />
                                    <h2 className="text-xl font-bold">Pertanyaan yang Sering Diajukan (FAQ)</h2>
                                </div>
                                <div className="space-y-3">
                                    {faqCategories.map((category: any, catIndex: number) => (
                                        <div key={category.id}>
                                            <h3 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" />
                                                {category.name}
                                            </h3>
                                            <div className="space-y-2 mb-4">
                                                {category.faqs?.map((faq: any, faqIndex: number) => (
                                                    <motion.div
                                                        key={faq.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.8 + catIndex * 0.1 + faqIndex * 0.05 }}
                                                    >
                                                        <div
                                                            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                                            className="p-4 rounded-lg border-2 border-transparent hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-sm mb-1 group-hover:text-emerald-600">
                                                                        {faq.question}
                                                                    </h4>
                                                                    <AnimatePresence>
                                                                        {expandedFAQ === faq.id && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, height: 0 }}
                                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                                exit={{ opacity: 0, height: 0 }}
                                                                                className="mt-2 text-sm text-muted-foreground"
                                                                            >
                                                                                {faq.answer}
                                                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                                                                                    <span className="text-xs text-muted-foreground">Apakah ini membantu?</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="ghost"
                                                                                            className="h-7 text-xs"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleFaqFeedback(faq.id, true);
                                                                                            }}
                                                                                        >
                                                                                            👍 Ya ({faq.helpful})
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="ghost"
                                                                                            className="h-7 text-xs"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleFaqFeedback(faq.id, false);
                                                                                            }}
                                                                                        >
                                                                                            👎 Tidak ({faq.notHelpful})
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                                <motion.div
                                                                    animate={{ rotate: expandedFAQ === faq.id ? 90 : 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Troubleshooting Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Card className="border-2 dark:bg-black backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    <h2 className="text-xl font-bold">Panduan Troubleshooting</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {troubleshootingGuides.map((guide: any, index: number) => (
                                        <motion.div
                                            key={guide.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.9 + index * 0.1 }}
                                            whileHover={{ y: -4 }}
                                        >
                                            <div className="h-full p-5 rounded-lg border-2 border-transparent hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all cursor-pointer">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                                        <AlertCircle className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                                                            {guide.title}
                                                        </h3>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {guide.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                    {guide.description}
                                                </p>
                                                <div className="text-xs text-muted-foreground">
                                                    {guide.steps?.length || 0} langkah solusi
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact & Feedback Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Contact Info */}
                        <Card className="border-2 dark:bg-black backdrop-blur-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-emerald-500" />
                                    <h2 className="text-xl font-bold">Hubungi Kami</h2>
                                </div>
                                {contactInfo && (
                                    <div className="space-y-4">
                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800"
                                        >
                                            <Mail className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-emerald-900 dark:text-emerald-100">
                                                    Email Support
                                                </div>
                                                <a
                                                    href={`mailto:${contactInfo.email}`}
                                                    className="text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                                                >
                                                    {contactInfo.email}
                                                </a>
                                            </div>
                                        </motion.div>
                                        {contactInfo.phone && (
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800"
                                            >
                                                <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-blue-900 dark:text-blue-100">
                                                        Telepon
                                                    </div>
                                                    <a
                                                        href={`tel:${contactInfo.phone}`}
                                                        className="text-blue-600 hover:text-blue-700 hover:underline"
                                                    >
                                                        {contactInfo.phone}
                                                    </a>
                                                </div>
                                            </motion.div>
                                        )}
                                        {contactInfo.hours && (
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800"
                                            >
                                                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-amber-900 dark:text-amber-100">
                                                        Jam Operasional
                                                    </div>
                                                    <div className="text-amber-700 dark:text-amber-300">
                                                        {contactInfo.hours}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        {contactInfo.responseTime && (
                                            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                                                <p className="text-sm text-purple-900 dark:text-purple-100 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4" />
                                                    Waktu respons rata-rata: <strong>{contactInfo.responseTime}</strong>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Feedback Form */}
                        <Card className="border-2 dark:bg-black backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                                    <h2 className="text-xl font-bold">Kirim Pesan</h2>
                                </div>
                                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Subjek
                                        </label>
                                        <Input
                                            placeholder="Masukkan subjek pesan..."
                                            value={feedbackForm.subject}
                                            onChange={(e) =>
                                                setFeedbackForm({ ...feedbackForm, subject: e.target.value })
                                            }
                                            className="border-2 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Pesan
                                        </label>
                                        <Textarea
                                            placeholder="Tulis pesan Anda di sini..."
                                            value={feedbackForm.message}
                                            onChange={(e) =>
                                                setFeedbackForm({ ...feedbackForm, message: e.target.value })
                                            }
                                            rows={6}
                                            className="border-2 focus:border-emerald-500 resize-none"
                                        />
                                    </div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12 text-base shadow-lg shadow-emerald-500/30"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                                    />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Kirim Pesan
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-4 right-4 z-50"
                    >
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border-2 ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500'
                                : 'bg-red-50 dark:bg-red-950/90 border-red-500'
                        }`}>
                            {toast.type === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                                toast.type === 'success' ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'
                            }`}>
                                {toast.message}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DosenLayout>
    );
}
