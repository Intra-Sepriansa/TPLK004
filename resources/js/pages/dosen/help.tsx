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
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { FAQCategory, TroubleshootingGuide, HelpFeedback } from '@/types/documentation';

type ToastType = { type: 'success' | 'error'; message: string } | null;

export default function DosenHelp() {
    const { auth } = usePage().props as { auth: { user: { email: string } } };
    const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
    const [troubleshootingGuides, setTroubleshootingGuides] = useState<TroubleshootingGuide[]>([]);
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
            description: 'Dokumentasi sistem presensi',
            color: 'from-blue-500 to-cyan-500',
            count: '12 Artikel',
        },
        {
            icon: Lightbulb,
            title: 'Tips & Trik',
            description: 'Maksimalkan penggunaan',
            color: 'from-amber-500 to-orange-500',
            count: '15 Tips',
        },
        {
            icon: Shield,
            title: 'Keamanan',
            description: 'Panduan keamanan akun',
            color: 'from-emerald-500 to-teal-500',
            count: '6 Panduan',
        },
    ];

    const popularTopics = [
        { icon: Users, title: 'Cara Mengelola Kelas', views: '1.2k' },
        { icon: FileText, title: 'Membuat Sesi Absensi', views: '980' },
        { icon: Zap, title: 'Fitur Otomatis Approval', views: '856' },
        { icon: MessageSquare, title: 'Notifikasi & Pengingat', views: '742' },
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
                                className="pl-12 h-14 text-base border-2 focus:border-emerald-500 dark:bg-slate-900/50 backdrop-blur-sm"
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

                    {/* Quick Links Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        {quickLinks.map((link, index) => (
                            <motion.div
                                key={link.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                whileHover={{ y: -4 }}
                            >
                                <Card className="relative overflow-hidden group cursor-pointer border-2 hover:border-emerald-500/50 transition-all dark:bg-black backdrop-blur-sm">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                    <CardContent className="p-6 space-y-3">
                                        <motion.div
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} shadow-lg`}
                                        >
                                            <link.icon className="h-6 w-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">
                                                {link.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {link.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                {link.count}
                                            </Badge>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Popular Topics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-2 dark:bg-black backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                        <h2 className="text-xl font-bold">Topik Populer</h2>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-emerald-600">
                                        Lihat Semua
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {popularTopics.map((topic, index) => (
                                        <motion.div
                                            key={topic.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-4 p-4 rounded-lg border-2 border-transparent hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                                className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                                            >
                                                <topic.icon className="h-5 w-5 text-white" />
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium group-hover:text-emerald-600 transition-colors truncate">
                                                    {topic.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {topic.views} views
                                                </p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors flex-shrink-0" />
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
                                    {faqCategories.map((category, catIndex) => (
                                        <div key={category.id}>
                                            <h3 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" />
                                                {category.name}
                                            </h3>
                                            <div className="space-y-2 mb-4">
                                                {category.faqs?.map((faq, faqIndex) => (
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
                                    {troubleshootingGuides.map((guide, index) => (
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
                                                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800"
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
