/**
 * Help Center Page Component
 * Requirements: 6.1, 6.4
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
    FAQCategory,
    HelpFeedback,
    TroubleshootingGuide as TroubleshootingGuideType,
} from '@/types/documentation';
import {
    AlertTriangle,
    Clock,
    HelpCircle,
    Mail,
    MessageSquare,
    Phone,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { FAQAccordion } from './faq-accordion';
import { FeedbackForm } from './feedback-form';
import {
    TroubleshootingGuide,
    TroubleshootingList,
} from './troubleshooting-guide';

interface HelpCenterProps {
    faqCategories: FAQCategory[];
    troubleshootingGuides: TroubleshootingGuideType[];
    contactInfo?: {
        email: string;
        phone?: string;
        hours?: string;
        responseTime?: string;
    };
    userEmail?: string;
    onSubmitFeedback: (feedback: HelpFeedback) => Promise<{ ticketId: string }>;
}

export function HelpCenter({
    faqCategories,
    troubleshootingGuides,
    contactInfo,
    userEmail,
    onSubmitFeedback,
}: HelpCenterProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('faq');
    const [selectedTroubleshooting, setSelectedTroubleshooting] =
        useState<TroubleshootingGuideType | null>(null);

    const handleTroubleshootingSelect = (guide: TroubleshootingGuideType) => {
        setSelectedTroubleshooting(guide);
    };

    const handleBackToList = () => {
        setSelectedTroubleshooting(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <HelpCircle className="h-6 w-6" />
                    Pusat Bantuan
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Temukan jawaban dan solusi untuk pertanyaan Anda
                </p>
            </div>

            {/* Search */}
            <div className="mx-auto max-w-xl">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari bantuan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setActiveTab('faq')}
                >
                    <CardContent className="pt-6 text-center">
                        <HelpCircle className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                        <h3 className="font-medium">FAQ</h3>
                        <p className="text-sm text-muted-foreground">
                            Pertanyaan yang sering diajukan
                        </p>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setActiveTab('troubleshooting')}
                >
                    <CardContent className="pt-6 text-center">
                        <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                        <h3 className="font-medium">Troubleshooting</h3>
                        <p className="text-sm text-muted-foreground">
                            Panduan mengatasi masalah
                        </p>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setActiveTab('contact')}
                >
                    <CardContent className="pt-6 text-center">
                        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-green-500" />
                        <h3 className="font-medium">Hubungi Kami</h3>
                        <p className="text-sm text-muted-foreground">
                            Kirim pertanyaan atau feedback
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="faq" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        FAQ
                    </TabsTrigger>
                    <TabsTrigger value="troubleshooting" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Troubleshooting
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Hubungi Kami
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="mt-6">
                    <FAQAccordion
                        categories={faqCategories}
                        searchQuery={searchQuery}
                    />
                </TabsContent>

                <TabsContent value="troubleshooting" className="mt-6">
                    {selectedTroubleshooting ? (
                        <div className="space-y-4">
                            <Button variant="ghost" onClick={handleBackToList}>
                                ← Kembali ke daftar
                            </Button>
                            <TroubleshootingGuide
                                guide={selectedTroubleshooting}
                            />
                        </div>
                    ) : (
                        <TroubleshootingList
                            guides={troubleshootingGuides}
                            onSelect={handleTroubleshootingSelect}
                        />
                    )}
                </TabsContent>

                <TabsContent value="contact" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Contact Info */}
                        {contactInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Kontak</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                Email
                                            </div>
                                            <a
                                                href={`mailto:${contactInfo.email}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    </div>
                                    {contactInfo.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">
                                                    Telepon
                                                </div>
                                                <a
                                                    href={`tel:${contactInfo.phone}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    {contactInfo.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {contactInfo.hours && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">
                                                    Jam Operasional
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {contactInfo.hours}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {contactInfo.responseTime && (
                                        <div className="rounded-lg bg-muted p-3">
                                            <p className="text-sm text-muted-foreground">
                                                ⏱️ Waktu respons rata-rata:{' '}
                                                {contactInfo.responseTime}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Feedback Form */}
                        <FeedbackForm
                            onSubmit={onSubmitFeedback}
                            userEmail={userEmail}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
