/**
 * Student Enhanced Help Center Page
 * Dark theme dengan FAQ, troubleshooting, dan feedback form
 */

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Send, CheckCircle } from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import DarkContainer from '@/components/ui/dark-container';
import ColoredHeader from '@/components/ui/colored-header';
import InteractiveSearch from '@/components/ui/interactive-search';
import InteractiveFAQ, { FAQCategory, type FAQItem } from '@/components/ui/interactive-faq';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';

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
];

export default function StudentHelpCenterEnhanced() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

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

    return (
        <StudentLayout>
            <Head title="Help Center" />

            <div className="min-h-screen bg-[#000000]">
                {/* Colored Header dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ColoredHeader
                        title="Help Center"
                        subtitle="Find answers and get support"
                        gradient="multi"
                        sticky
                    />
                </motion.div>

                <div className="container mx-auto px-4 py-8">
                    {/* Search dengan animasi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <InteractiveSearch
                            placeholder="Search for help..."
                            onSearch={handleSearch}
                            className="max-w-2xl mx-auto"
                        />
                    </motion.div>

                    {/* Quick Help Cards dengan animasi stagger */}
                    <motion.div
                        variants={staggerContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        {[
                            {
                                icon: HelpCircle,
                                title: 'Browse FAQs',
                                description: 'Find quick answers to common questions',
                                gradient: 'from-purple-500 to-pink-500',
                                glow: 'hover-glow-purple'
                            },
                            {
                                icon: MessageSquare,
                                title: 'Contact Support',
                                description: 'Get help from our support team',
                                gradient: 'from-blue-500 to-cyan-500',
                                glow: 'hover-glow-blue'
                            },
                            {
                                icon: Send,
                                title: 'Send Feedback',
                                description: 'Help us improve the platform',
                                gradient: 'from-pink-500 to-purple-500',
                                glow: 'hover-glow-pink'
                            }
                        ].map((card, index) => (
                            <motion.div
                                key={card.title}
                                variants={staggerItemVariants}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <DarkContainer
                                    variant="secondary"
                                    padding="lg"
                                    rounded="xl"
                                    className={`${card.glow} cursor-pointer`}
                                >
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}
                                        >
                                            <card.icon className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 font-display">
                                                {card.title}
                                            </h3>
                                            <p className="text-white/60 text-sm">
                                                {card.description}
                                            </p>
                                        </div>
                                    </div>
                                </DarkContainer>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* FAQ Section dengan animasi */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2"
                        >
                            <DarkContainer variant="primary" padding="lg" rounded="xl">
                                <motion.h2
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-2xl font-bold text-white mb-6 font-display"
                                >
                                    Frequently Asked Questions
                                </motion.h2>

                                {/* Category Filter */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <FAQCategory
                                        categories={categories}
                                        activeCategory={activeCategory}
                                        onCategoryChange={setActiveCategory}
                                        className="mb-6"
                                    />
                                </motion.div>

                                {/* FAQ List */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <InteractiveFAQ
                                        faqs={filteredFAQs}
                                        searchable={false}
                                        groupByCategory={false}
                                    />
                                </motion.div>
                            </DarkContainer>
                        </motion.div>

                        {/* Feedback Form dengan animasi */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <DarkContainer variant="secondary" padding="lg" rounded="xl">
                                <motion.h3
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-xl font-bold text-white mb-4 font-display"
                                >
                                    Send Us a Message
                                </motion.h3>

                                    <form onSubmit={handleSubmitFeedback} className="space-y-4">
                                        {/* Subject */}
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                value={feedbackForm.subject}
                                                onChange={e =>
                                                    setFeedbackForm(prev => ({
                                                        ...prev,
                                                        subject: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3 rounded-lg glass border border-white/10 bg-transparent text-white placeholder:text-white/40 focus:border-purple-500/50 focus:glow-purple outline-none transition-all duration-300"
                                                placeholder="What's your question about?"
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-2">
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
                                                className="w-full px-4 py-3 rounded-lg glass border border-white/10 bg-transparent text-white focus:border-purple-500/50 focus:glow-purple outline-none transition-all duration-300"
                                            >
                                                <option value="general">General</option>
                                                <option value="technical">Technical Issue</option>
                                                <option value="feature">Feature Request</option>
                                                <option value="bug">Bug Report</option>
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                value={feedbackForm.message}
                                                onChange={e =>
                                                    setFeedbackForm(prev => ({
                                                        ...prev,
                                                        message: e.target.value,
                                                    }))
                                                }
                                                rows={6}
                                                className="w-full px-4 py-3 rounded-lg glass border border-white/10 bg-transparent text-white placeholder:text-white/40 focus:border-purple-500/50 focus:glow-purple outline-none transition-all duration-300 resize-none"
                                                placeholder="Describe your issue or question..."
                                                required
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <motion.div
                                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                    />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>Send Message</span>
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Success Message */}
                                        {submitSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="text-sm">Message sent successfully!</span>
                                            </motion.div>
                                        )}
                                    </form>
                                </DarkContainer>
                            </motion.div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
