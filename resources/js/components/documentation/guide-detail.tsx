/**
 * Guide Detail Component
 * Requirements: 2.3, 2.4
 */

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
    GuideSection,
    MenuGuide,
    ReadProgress,
} from '@/types/documentation';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    HelpCircle,
    Lightbulb,
    List,
} from 'lucide-react';
import { useState } from 'react';

interface GuideDetailProps {
    guide: MenuGuide;
    progress?: ReadProgress;
    onBack: () => void;
    onSectionComplete: (sectionId: string) => void;
    onMarkComplete: () => void;
}

export function GuideDetail({
    guide,
    progress,
    onBack,
    onSectionComplete,
    onMarkComplete,
}: GuideDetailProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const isSectionCompleted = (sectionId: string) => {
        return progress?.completedSections.includes(sectionId) ?? false;
    };

    const overallProgress = progress?.progress ?? 0;

    const renderSectionContent = (section: GuideSection) => {
        switch (section.type) {
            case 'overview':
                return (
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="leading-relaxed text-muted-foreground">
                            {section.content}
                        </p>
                    </div>
                );

            case 'features':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {section.content}
                        </p>
                        {section.items && (
                            <ul className="space-y-2">
                                {section.items.map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );

            case 'tutorial':
                return (
                    <div className="space-y-6">
                        <p className="text-muted-foreground">
                            {section.content}
                        </p>
                        {section.steps && (
                            <div className="space-y-4">
                                {section.steps.map((step) => (
                                    <Card key={step.step}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                                                    {step.step}
                                                </span>
                                                {step.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">
                                                {step.description}
                                            </p>
                                            {step.action && (
                                                <Badge
                                                    variant="outline"
                                                    className="mt-2"
                                                >
                                                    {step.action}
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'tips':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {section.content}
                        </p>
                        {section.items && (
                            <div className="space-y-3">
                                {section.items.map((tip, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
                                    >
                                        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'faq':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {section.content}
                        </p>
                        {section.faqs && (
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                {section.faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`faq-${index}`}
                                    >
                                        <AccordionTrigger className="text-left">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const getTabIcon = (type: string) => {
        switch (type) {
            case 'overview':
                return BookOpen;
            case 'features':
                return List;
            case 'tutorial':
                return CheckCircle2;
            case 'tips':
                return Lightbulb;
            case 'faq':
                return HelpCircle;
            default:
                return BookOpen;
        }
    };

    const getTabLabel = (type: string) => {
        switch (type) {
            case 'overview':
                return 'Ringkasan';
            case 'features':
                return 'Fitur';
            case 'tutorial':
                return 'Tutorial';
            case 'tips':
                return 'Tips';
            case 'faq':
                return 'FAQ';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{guide.title}</h1>
                    <p className="text-muted-foreground">{guide.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {guide.estimatedReadTime} menit
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Progress Membaca</span>
                    <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} />
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    {guide.sections.map((section) => {
                        const Icon = getTabIcon(section.type);
                        return (
                            <TabsTrigger
                                key={section.id}
                                value={section.type}
                                className="flex items-center gap-1"
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {getTabLabel(section.type)}
                                </span>
                                {isSectionCompleted(section.id) && (
                                    <CheckCircle2 className="ml-1 h-3 w-3 text-green-500" />
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {guide.sections.map((section) => (
                    <TabsContent
                        key={section.id}
                        value={section.type}
                        className="mt-6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    {section.title}
                                </h2>
                                {!isSectionCompleted(section.id) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            onSectionComplete(section.id)
                                        }
                                    >
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                        Tandai Selesai
                                    </Button>
                                )}
                            </div>
                            {renderSectionContent(section)}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Mark Complete Button */}
            {!progress?.isCompleted && overallProgress >= 80 && (
                <div className="flex justify-center pt-4">
                    <Button onClick={onMarkComplete} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Tandai Panduan Selesai
                    </Button>
                </div>
            )}
        </div>
    );
}
