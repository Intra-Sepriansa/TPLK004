/**
 * Student Enhanced Help Center Page
 * Consistent UI with other student pages - Fixed version
 */

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, AlertCircle, Mail, Phone,
  Clock, ChevronDown, ChevronUp, Sparkles, MessageSquare, Send, CheckCircle
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

    const categories = ['All', ...Array.from(new Set(mockFAQs.map(faq => faq.category)))];

    const filteredFAQs = mockFAQs.filter(faq => {
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
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
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFeedbackForm({ subject: '', category: 'general', message: '' });

        setTimeout(() => setSubmitSuccess(false), 3000);
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Attendance': 'from-blue-500 to-blue-600',
            'Tasks': 'from-purple-500 to-purple-600',
            'Academic': 'from-green-500 to-green-600',
            'Communication': 'from-pink-500 to-pink-600',
            'Analytics': 'from-orange-500 to-orange-600',
            'Gamification': 'from-yellow-500 to-yellow-600',
            'Account': 'from-indigo-500 to-indigo-600',
            'Technical': 'from-red-500 to-red-600',
        };
        return colors[category] || 'from-slate-500 to-slate-600';
    };

    return (
        <StudentLayout>
            <Head title="Help Center" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Help Center
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Find answers and get support
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search for help..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-12 text-lg"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Help Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Browse FAQs',
                                description: 'Find quick answers to common questions',
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
                            }
                        ].map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                                                <card.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg mb-1">
                                                    {card.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {card.description}
                                                </p>
                                                <Badge variant="outline" className="mt-2">
                                                    {card.count}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* FAQ Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Frequently Asked Questions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Category Filter */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {categories.map((category) => (
                                                <Button
                                                    key={category}
                                                    variant={activeCategory === category ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setActiveCategory(category)}
                                                    className={activeCategory === category ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                                                >
                                                    {category}
                                                </Button>
                                            ))}
                                        </div>

                                        {/* FAQ List */}
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {filteredFAQs.map((faq, index) => (
                                                    <motion.div
                                                        key={faq.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 text-left">
                                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getCategoryColor(faq.category)}`} />
                                                                    <span className="font-medium">{faq.question}</span>
                                                                </div>
                                                                {expandedFAQ === faq.id ? (
                                                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                                                )}
                                                            </button>
                                                            <AnimatePresence>
                                                                {expandedFAQ === faq.id && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                                                            <p className="text-slate-600 dark:text-slate-400">
                                                                                {faq.answer}
                                                                            </p>
                                                                            <Badge variant="outline" className="mt-2">
                                                                                {faq.category}
                                                                            </Badge>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {filteredFAQs.length === 0 && (
                                                <div className="text-center py-12">
                                                    <AlertCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        No FAQs found matching your search
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
                                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Contact Support</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Email</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    support@unpam.ac.id
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Phone</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    (021) 7412566
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Hours</p>
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
                                        <CardTitle className="text-lg">Send Us a Message</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Subject
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={feedbackForm.subject}
                                                    onChange={e =>
                                                        setFeedbackForm(prev => ({
                                                            ...prev,
                                                            subject: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="What's your question about?"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Category
                                                </label>
                                                <select
                                                    value={feedbackForm.category}
                                                    onChange={e =>
                                                        setFeedbackForm(prev => ({
                                                            ...prev,
                                                            category: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-background"
                                                >
                                                    <option value="general">General</option>
                                                    <option value="technical">Technical Issue</option>
                                                    <option value="feature">Feature Request</option>
                                                    <option value="bug">Bug Report</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Message
                                                </label>
                                                <Textarea
                                                    value={feedbackForm.message}
                                                    onChange={e =>
                                                        setFeedbackForm(prev => ({
                                                            ...prev,
                                                            message: e.target.value,
                                                        }))
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
                                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                                            animate={{ rotate: 360 }}
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
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Send Message
                                                    </>
                                                )}
                                            </Button>

                                            <AnimatePresence>
                                                {submitSuccess && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="text-sm">Message sent successfully!</span>
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
