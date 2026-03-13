/**
 * Student Enhanced Help Center Page
 * Consistent UI with other student pages - Fixed version
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Send,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const mockFAQs: FAQItem[] = [
    {
        id: '1',
        question: 'Bagaimana cara melakukan absensi?',
        answer: 'Untuk melakukan absensi, buka menu Absen, pilih mata kuliah yang sedang berlangsung, dan klik tombol Check In. Pastikan Anda berada dalam radius yang ditentukan oleh dosen.',
        category: 'Attendance',
    },
    {
        id: '2',
        question: 'Bagaimana cara mengajukan izin atau sakit?',
        answer: 'Buka menu Izin/Sakit, klik tombol "Ajukan Izin", pilih tanggal, upload surat keterangan jika diperlukan, dan submit. Dosen akan mereview pengajuan Anda.',
        category: 'Attendance',
    },
    {
        id: '3',
        question: 'Bagaimana cara mengumpulkan tugas?',
        answer: 'Buka menu Tugas, pilih tugas yang ingin dikumpulkan, upload file atau tulis jawaban, dan klik Submit. Pastikan mengumpulkan sebelum deadline.',
        category: 'Tasks',
    },
    {
        id: '4',
        question: 'Bagaimana cara melihat nilai saya?',
        answer: 'Nilai dapat dilihat di menu Akademik. Anda akan melihat breakdown nilai per mata kuliah, termasuk tugas, quiz, dan ujian.',
        category: 'Academic',
    },
    {
        id: '5',
        question: 'Bagaimana cara menggunakan fitur chat?',
        answer: 'Buka menu Chat, pilih kontak atau grup yang ingin dihubungi, dan mulai mengirim pesan. Anda juga bisa mengirim file dan gambar.',
        category: 'Communication',
    },
    {
        id: '6',
        question: 'Apa itu Personal Analytics?',
        answer: 'Personal Analytics adalah fitur yang menampilkan statistik kehadiran, nilai, dan performa akademik Anda dalam bentuk grafik dan chart yang mudah dipahami.',
        category: 'Analytics',
    },
    {
        id: '7',
        question: 'Bagaimana cara mendapatkan achievement?',
        answer: 'Achievement didapatkan secara otomatis ketika Anda mencapai milestone tertentu, seperti kehadiran 100%, mengumpulkan tugas tepat waktu, atau aktif di kelas.',
        category: 'Gamification',
    },
    {
        id: '8',
        question: 'Bagaimana cara mengubah password?',
        answer: 'Buka menu Pengaturan > Security, klik "Change Password", masukkan password lama dan password baru, lalu save.',
        category: 'Account',
    },
    {
        id: '9',
        question: 'Kenapa saya tidak bisa scan QR code?',
        answer: 'Pastikan Anda memberikan izin akses kamera ke browser. Jika masih bermasalah, coba refresh halaman atau gunakan browser lain.',
        category: 'Technical',
    },
    {
        id: '10',
        question: 'Bagaimana cara melihat leaderboard?',
        answer: 'Buka menu Leaderboard untuk melihat ranking kehadiran Anda dibandingkan dengan teman sekelas. Ranking diupdate secara real-time.',
        category: 'Gamification',
    },
];

export default function StudentHelpCenterEnhanced() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [feedbackForm, setFeedbackForm] = useState({
        subject: '',
        category: 'general',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const categories = [
        'All',
        ...Array.from(new Set(mockFAQs.map((faq) => faq.category))),
    ];

    const filteredFAQs = mockFAQs.filter((faq) => {
        const matchesCategory =
            activeCategory === 'All' || faq.category === activeCategory;
        const matchesSearch =
            !searchQuery ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFeedbackForm({ subject: '', category: 'general', message: '' });

        setTimeout(() => setSubmitSuccess(false), 3000);
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Attendance: 'from-blue-500 to-blue-600',
            Tasks: 'from-purple-500 to-purple-600',
            Academic: 'from-green-500 to-green-600',
            Communication: 'from-pink-500 to-pink-600',
            Analytics: 'from-orange-500 to-orange-600',
            Gamification: 'from-yellow-500 to-yellow-600',
            Account: 'from-indigo-500 to-indigo-600',
            Technical: 'from-red-500 to-red-600',
        };
        return colors[category] || 'from-slate-500 to-slate-600';
    };

    return (
        <StudentLayout>
            <Head title="Help Center" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                            Help Center
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Find answers and get support
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search for help..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="h-12 pl-10 text-lg"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Help Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Browse FAQs',
                                description:
                                    'Find quick answers to common questions',
                                gradient: 'from-purple-500 to-purple-600',
                                count: mockFAQs.length,
                            },
                            {
                                icon: MessageSquare,
                                title: 'Contact Support',
                                description: 'Get help from our support team',
                                gradient: 'from-blue-500 to-blue-600',
                                count: '24/7',
                            },
                            {
                                icon: Sparkles,
                                title: 'Send Feedback',
                                description: 'Help us improve the platform',
                                gradient: 'from-pink-500 to-pink-600',
                                count: 'Quick',
                            },
                        ].map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`rounded-xl bg-gradient-to-br p-3 ${card.gradient}`}
                                            >
                                                <card.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="mb-1 text-lg font-bold">
                                                    {card.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {card.description}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="mt-2"
                                                >
                                                    {card.count}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* FAQ Section */}
                        <div className="space-y-6 lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Frequently Asked Questions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Category Filter */}
                                        <div className="mb-6 flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                <Button
                                                    key={category}
                                                    variant={
                                                        activeCategory ===
                                                        category
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setActiveCategory(
                                                            category,
                                                        )
                                                    }
                                                    className={
                                                        activeCategory ===
                                                        category
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                                            : ''
                                                    }
                                                >
                                                    {category}
                                                </Button>
                                            ))}
                                        </div>

                                        {/* FAQ List */}
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {filteredFAQs.map(
                                                    (faq, index) => (
                                                        <motion.div
                                                            key={faq.id}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.05,
                                                            }}
                                                        >
                                                            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                                                                <button
                                                                    onClick={() =>
                                                                        setExpandedFAQ(
                                                                            expandedFAQ ===
                                                                                faq.id
                                                                                ? null
                                                                                : faq.id,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                >
                                                                    <div className="flex flex-1 items-center gap-3 text-left">
                                                                        <div
                                                                            className={`h-2 w-2 rounded-full bg-gradient-to-r ${getCategoryColor(faq.category)}`}
                                                                        />
                                                                        <span className="font-medium">
                                                                            {
                                                                                faq.question
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {expandedFAQ ===
                                                                    faq.id ? (
                                                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                                                    ) : (
                                                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                                                    )}
                                                                </button>
                                                                <AnimatePresence>
                                                                    {expandedFAQ ===
                                                                        faq.id && (
                                                                        <motion.div
                                                                            initial={{
                                                                                height: 0,
                                                                                opacity: 0,
                                                                            }}
                                                                            animate={{
                                                                                height: 'auto',
                                                                                opacity: 1,
                                                                            }}
                                                                            exit={{
                                                                                height: 0,
                                                                                opacity: 0,
                                                                            }}
                                                                            transition={{
                                                                                duration: 0.2,
                                                                            }}
                                                                        >
                                                                            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                                                                                <p className="text-slate-600 dark:text-slate-400">
                                                                                    {
                                                                                        faq.answer
                                                                                    }
                                                                                </p>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="mt-2"
                                                                                >
                                                                                    {
                                                                                        faq.category
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.div>
                                                    ),
                                                )}
                                            </AnimatePresence>

                                            {filteredFAQs.length === 0 && (
                                                <div className="py-12 text-center">
                                                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        No FAQs found matching
                                                        your search
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Contact Support
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Mail className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Email
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    support@unpam.ac.id
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Phone
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    (021) 7412566
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Hours
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Mon-Fri: 8AM - 5PM
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Feedback Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Send Us a Message
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            onSubmit={handleSubmitFeedback}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Subject
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={feedbackForm.subject}
                                                    onChange={(e) =>
                                                        setFeedbackForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                subject:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder="What's your question about?"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Category
                                                </label>
                                                <select
                                                    value={
                                                        feedbackForm.category
                                                    }
                                                    onChange={(e) =>
                                                        setFeedbackForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                category:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 dark:border-slate-700"
                                                >
                                                    <option value="general">
                                                        General
                                                    </option>
                                                    <option value="technical">
                                                        Technical Issue
                                                    </option>
                                                    <option value="feature">
                                                        Feature Request
                                                    </option>
                                                    <option value="bug">
                                                        Bug Report
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Message
                                                </label>
                                                <Textarea
                                                    value={feedbackForm.message}
                                                    onChange={(e) =>
                                                        setFeedbackForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                message:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    rows={6}
                                                    placeholder="Describe your issue or question..."
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <motion.div
                                                            className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                                                            animate={{
                                                                rotate: 360,
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                        />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send Message
                                                    </>
                                                )}
                                            </Button>

                                            <AnimatePresence>
                                                {submitSuccess && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-600 dark:text-green-400"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span className="text-sm">
                                                            Message sent
                                                            successfully!
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
