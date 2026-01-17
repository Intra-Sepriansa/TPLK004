/**
 * Documentation Hub Component
 * Requirements: 2.1
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, BookOpen, Filter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GuideCard } from './guide-card';
import type { GuideSummary, GuideCategory } from '@/types/documentation';

interface DocumentationHubProps {
    guides: GuideSummary[];
    onGuideSelect: (guideId: string) => void;
    overallProgress?: {
        totalGuides: number;
        completedGuides: number;
        inProgressGuides: number;
        overallProgress: number;
    };
}

const categories: { key: GuideCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'core', label: 'Inti' },
    { key: 'academic', label: 'Akademik' },
    { key: 'analytics', label: 'Analitik' },
    { key: 'communication', label: 'Komunikasi' },
    { key: 'finance', label: 'Keuangan' },
];

export function DocumentationHub({
    guides,
    onGuideSelect,
    overallProgress,
}: DocumentationHubProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<Set<GuideCategory | 'all'>>(
        new Set(['all'])
    );

    const filteredGuides = useMemo(() => {
        return guides.filter((guide) => {
            // Search filter
            const matchesSearch =
                searchQuery === '' ||
                guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const matchesCategory =
                selectedCategories.has('all') || selectedCategories.has(guide.category);

            return matchesSearch && matchesCategory;
        });
    }, [guides, searchQuery, selectedCategories]);

    const handleCategoryToggle = (category: GuideCategory | 'all') => {
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            if (category === 'all') {
                return new Set(['all']);
            }
            next.delete('all');
            if (next.has(category)) {
                next.delete(category);
                if (next.size === 0) {
                    return new Set(['all']);
                }
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const groupedGuides = useMemo(() => {
        const groups: Record<GuideCategory, GuideSummary[]> = {
            core: [],
            academic: [],
            analytics: [],
            communication: [],
            finance: [],
        };

        filteredGuides.forEach((guide) => {
            groups[guide.category].push(guide);
        });

        return groups;
    }, [filteredGuides]);

    return (
        <div className="space-y-6">
            {/* Header with Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6" />
                        Pusat Dokumentasi
                    </h1>
                    <p className="text-muted-foreground">
                        Pelajari cara menggunakan setiap fitur aplikasi
                    </p>
                </div>

                {overallProgress && (
                    <Card className="w-full md:w-auto md:min-w-[280px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Progress Anda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Progress value={overallProgress.overallProgress} />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>
                                        {overallProgress.completedGuides} dari {overallProgress.totalGuides} selesai
                                    </span>
                                    <span>{overallProgress.overallProgress}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari panduan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                            {!selectedCategories.has('all') && (
                                <Badge variant="secondary" className="ml-1">
                                    {selectedCategories.size}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {categories.map((category) => (
                            <DropdownMenuCheckboxItem
                                key={category.key}
                                checked={selectedCategories.has(category.key)}
                                onCheckedChange={() => handleCategoryToggle(category.key)}
                            >
                                {category.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{guides.length}</div>
                        <div className="text-xs text-muted-foreground">Total Panduan</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                            {guides.filter((g) => g.isRead).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Selesai Dibaca</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">
                            {guides.filter((g) => g.progress > 0 && !g.isRead).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Sedang Dibaca</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-400">
                            {guides.filter((g) => g.progress === 0).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Belum Dibaca</div>
                    </CardContent>
                </Card>
            </div>

            {/* Guides Grid */}
            {filteredGuides.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tidak ada panduan ditemukan</h3>
                    <p className="text-muted-foreground">
                        Coba ubah kata kunci pencarian atau filter
                    </p>
                </div>
            ) : selectedCategories.has('all') ? (
                // Show grouped by category
                <div className="space-y-8">
                    {Object.entries(groupedGuides).map(
                        ([category, categoryGuides]) =>
                            categoryGuides.length > 0 && (
                                <div key={category}>
                                    <h2 className="text-lg font-semibold mb-4 capitalize">
                                        {categories.find((c) => c.key === category)?.label || category}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categoryGuides.map((guide) => (
                                            <GuideCard
                                                key={guide.id}
                                                guide={guide}
                                                onClick={() => onGuideSelect(guide.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                    )}
                </div>
            ) : (
                // Show flat list when filtered
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGuides.map((guide) => (
                        <GuideCard
                            key={guide.id}
                            guide={guide}
                            onClick={() => onGuideSelect(guide.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
