/**
 * Student Help Center Page - Advanced UI/UX
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    CheckCircle, 
    AlertCircle, 
    HelpCircle,
    MessageCircle,
    BookOpen,
    Lightbulb,
    Sparkles,
    Zap
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { HelpCenter } from '@/components/help';
import type { FAQCategory, TroubleshootingGuide, HelpFeedback } from '@/types/documentation';
import {
    getFAQCategories,
    getTroubleshootingGuides,
    getContactInfo,
    submitFeedback,
} from '@/lib/help-api';

type ToastType = { type: 'success' | 'error'; message: string } | null;

export default function StudentHelp() {
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
            const [faqs, troubleshooting, contact] = await Promise.all([
                getFAQCategories(),
                getTroubleshootingGuides(),
                getContactInfo().catch(() => undefined),
            ]);
            setFaqCategories(faqs);
            setTroubleshootingGuides(troubleshooting);
            setContactInfo(contact);
        } catch {
            showToast('error', 'Gagal memuat data bantuan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitFeedback = async (feedback: HelpFeedback) => {
        try {
            const result = await submitFeedback(feedback);
            showToast('success', 'Feedback berhasil dikirim');
            return result;
        } catch {
            showToast('error', 'Gagal mengirim feedback');
            throw new Error('Failed to submit feedback');
        }
    };

    if (isLoading) {
        return (
            <StudentLayout>
                <Head title="Bantuan" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl">
                        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <HelpCircle className="h-10 w-10" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-teal-100 font-medium">Bantuan</p>
                                    <h1 className="text-3xl font-bold">Memuat...</h1>
                                    <p className="text-sm text-teal-100 mt-1">Mohon tunggu sebentar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <Head title="Bantuan" />

            <div className="space-y-6 p-6">
                {/* Header Card with advanced animations */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated background orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                        />
                    </div>

                    {/* Floating icons */}
                    {[HelpCircle, MessageCircle, BookOpen, Lightbulb, Sparkles].map((Icon, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/20"
                            initial={{ y: 0 }}
                            animate={{
                                y: [0, -20, 0],
                                x: [0, Math.sin(i) * 10, 0],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2,
                            }}
                            style={{
                                left: `${15 + i * 18}%`,
                                top: `${20 + (i % 2) * 40}%`,
                            }}
                        >
                            <Icon className="w-8 h-8" />
                        </motion.div>
                    ))}

                    {/* Large floating icons in background */}
                    <motion.div
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10"
                        animate={{
                            rotateY: [0, 360],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <HelpCircle className="w-32 h-32" strokeWidth={1} />
                    </motion.div>
                    
                    <motion.div
                        className="absolute left-8 bottom-8 text-white/10"
                        animate={{
                            rotateY: [360, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <BookOpen className="w-24 h-24" strokeWidth={1} />
                    </motion.div>
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ 
                                        scale: 1.1, 
                                        rotate: 360,
                                        boxShadow: "0 0 30px rgba(255,255,255,0.5)"
                                    }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl"
                                >
                                    <HelpCircle className="h-10 w-10" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-teal-100 font-medium flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Bantuan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Help Center
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-teal-100 mt-1"
                                    >
                                        Temukan jawaban dan dapatkan dukungan yang Anda butuhkan
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className="px-4 py-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <HelpCenter
                        faqCategories={faqCategories}
                        troubleshootingGuides={troubleshootingGuides}
                        contactInfo={contactInfo}
                        userEmail={auth?.user?.email}
                        onSubmitFeedback={handleSubmitFeedback}
                    />
                </motion.div>

                {/* Toast Notification with enhanced animation */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, y: 50, scale: 0.8, rotate: 5 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                            }}
                            className="fixed bottom-8 right-8 z-50"
                        >
                            <motion.div 
                                className="relative overflow-hidden flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-black border-2 shadow-2xl min-w-[300px]"
                                style={{
                                    borderColor: toast.type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Animated background gradient */}
                                <motion.div
                                    className={`absolute inset-0 ${
                                        toast.type === 'success' 
                                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                            : 'bg-gradient-to-r from-red-500/10 to-rose-500/10'
                                    }`}
                                    animate={{
                                        x: ['-100%', '200%'],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                                
                                {/* Icon with animation */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15,
                                        delay: 0.1
                                    }}
                                >
                                    {toast.type === 'success' ? (
                                        <div className="relative">
                                            <CheckCircle className="h-6 w-6 text-green-500 relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-green-500 rounded-full blur-md"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 0.2, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <AlertCircle className="h-6 w-6 text-red-500 relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-red-500 rounded-full blur-md"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 0.2, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                                
                                <motion.span 
                                    className="text-gray-900 dark:text-white font-semibold relative z-10"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {toast.message}
                                </motion.span>

                                {/* Progress bar */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-1 ${
                                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 3, ease: "linear" }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
