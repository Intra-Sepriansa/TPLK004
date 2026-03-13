/**
 * Troubleshooting Guide Component
 * Requirements: 6.3
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TroubleshootingGuide as TroubleshootingGuideType } from '@/types/documentation';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TroubleshootingGuideProps {
    guide: TroubleshootingGuideType;
}

export function TroubleshootingGuide({ guide }: TroubleshootingGuideProps) {
    if (!guide) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium">
                        Panduan Tidak Ditemukan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Panduan troubleshooting yang Anda cari tidak tersedia.
                    </p>
                </CardContent>
            </Card>
        );
    }

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
                    <h4 className="mb-2 font-medium">Masalah</h4>
                    <p className="text-muted-foreground">{guide.problem}</p>
                </div>

                {/* Symptoms */}
                {guide.symptoms && guide.symptoms.length > 0 && (
                    <div>
                        <h4 className="mb-2 font-medium">Gejala</h4>
                        <ul className="space-y-2">
                            {guide.symptoms.map((symptom, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2 text-muted-foreground"
                                >
                                    <span className="mt-1 text-yellow-500">
                                        •
                                    </span>
                                    {symptom}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Solutions */}
                {guide.solutions && guide.solutions.length > 0 && (
                    <div>
                        <h4 className="mb-3 font-medium">Solusi</h4>
                        <div className="space-y-4">
                            {guide.solutions.map((solution) => (
                                <div
                                    key={solution.step}
                                    className="flex gap-4 rounded-lg bg-muted/50 p-4"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                        {solution.step}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-medium">
                                            {solution.title}
                                        </h5>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {solution.description}
                                        </p>
                                        {solution.action && (
                                            <Badge
                                                variant="outline"
                                                className="mt-2"
                                            >
                                                {solution.action}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Success indicator */}
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                        Jika masalah teratasi, Anda dapat melanjutkan aktivitas
                        normal
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

export function TroubleshootingList({
    guides,
    onSelect,
}: TroubleshootingListProps) {
    if (!guides || guides.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium">
                        Belum Ada Panduan Troubleshooting
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Panduan troubleshooting akan ditampilkan di sini ketika
                        tersedia.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
                <Card
                    key={guide.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => onSelect(guide)}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            {guide.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {guide.problem}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <Badge variant="secondary">
                                {guide.solutions?.length || 0} langkah
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
