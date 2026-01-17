/**
 * Dosen Help Center Page
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { HelpCenter } from '@/components/help';
import type { FAQCategory, TroubleshootingGuide, HelpFeedback } from '@/types/documentation';
import {
    getFAQCategories,
    getTroubleshootingGuides,
    getContactInfo,
    submitFeedback,
} from '@/lib/help-api';

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
            <DosenLayout>
                <Head title="Bantuan" />
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout>
            <Head title="Bantuan" />

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
        </DosenLayout>
    );
}
