/**
 * Guide Card Component
 * Requirements: 2.1
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuideSummary, GuideCategory } from '@/types/documentation';
import * as Icons from 'lucide-react';

interface GuideCardProps {
    guide: GuideSummary;
    onClick: () => void;
}

const categoryColors: Record<GuideCategory, string> = {
    core: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    academic: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    analytics: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    communication: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const categoryLabels: Record<GuideCategory, string> = {
    core: 'Inti',
    academic: 'Akademik',
    analytics: 'Analitik',
    communication: 'Komunikasi',
    finance: 'Keuangan',
};

export function GuideCard({ guide, onClick }: GuideCardProps) {
    // Dynamically get icon from lucide-react
    const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
        guide.icon.charAt(0).toUpperCase() + guide.icon.slice(1)
    ] || Icons.FileText;

    return (
        <Card
            className={cn(
                'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                guide.isRead && 'border-green-200 dark:border-green-800'
            )}
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{guide.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={cn('text-xs', categoryColors[guide.category])}>
                                    {categoryLabels[guide.category]}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {guide.estimatedReadTime} menit
                                </span>
                            </div>
                        </div>
                    </div>
                    {guide.isRead && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="line-clamp-2 mb-3">
                    {guide.description}
                </CardDescription>
                {guide.progress > 0 && !guide.isRead && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{guide.progress}%</span>
                        </div>
                        <Progress value={guide.progress} className="h-1" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
