/**
 * Student Help Center Page
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { RefreshCw, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
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
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <RefreshCw className="h-8 w-8 animate-spin" />
                                </div>
                                <div>
                                    <p className="text-sm text-pink-100">Bantuan</p>
                                    <h1 className="text-2xl font-bold">Loading...</h1>
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
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <HelpCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-pink-100">Bantuan</p>
                                    <h1 className="text-2xl font-bold">Help Center</h1>
                                    <p className="text-sm text-pink-100">Find answers and get support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6">
                <HelpCenter
                    faqCategories={faqCategories}
                    troubleshootingGuides={troubleshootingGuides}
                    contactInfo={contactInfo}
                    userEmail={auth?.user?.email}
                    onSubmitFeedback={handleSubmitFeedback}
                />

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-background border">
                        {toast.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm">{toast.message}</span>
                    </div>
                )}
            </div>
            </div>
        </StudentLayout>
    );
}
