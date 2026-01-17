/**
 * Troubleshooting Guide Component
 * Requirements: 6.3
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { TroubleshootingGuide as TroubleshootingGuideType } from '@/types/documentation';

interface TroubleshootingGuideProps {
    guide: TroubleshootingGuideType;
}

export function TroubleshootingGuide({ guide }: TroubleshootingGuideProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    {guide.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Problem Description */}
                <div>
                    <h4 className="font-medium mb-2">Masalah</h4>
                    <p className="text-muted-foreground">{guide.problem}</p>
                </div>

                {/* Symptoms */}
                <div>
                    <h4 className="font-medium mb-2">Gejala</h4>
                    <ul className="space-y-2">
                        {guide.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                <span className="text-yellow-500 mt-1">•</span>
                                {symptom}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Solutions */}
                <div>
                    <h4 className="font-medium mb-3">Solusi</h4>
                    <div className="space-y-4">
                        {guide.solutions.map((solution) => (
                            <div
                                key={solution.step}
                                className="flex gap-4 p-4 rounded-lg bg-muted/50"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                                    {solution.step}
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-medium">{solution.title}</h5>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {solution.description}
                                    </p>
                                    {solution.action && (
                                        <Badge variant="outline" className="mt-2">
                                            {solution.action}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success indicator */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                        Jika masalah teratasi, Anda dapat melanjutkan aktivitas normal
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

interface TroubleshootingListProps {
    guides: TroubleshootingGuideType[];
    onSelect: (guide: TroubleshootingGuideType) => void;
}

export function TroubleshootingList({ guides, onSelect }: TroubleshootingListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
                <Card
                    key={guide.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelect(guide)}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            {guide.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {guide.problem}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary">
                                {guide.solutions.length} langkah
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
