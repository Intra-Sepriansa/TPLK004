import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    Bell,
    BookOpen,
    BookText,
    Calendar,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Code,
    Copy,
    Download,
    FileCheck,
    FileCode2,
    FileText,
    Filter,
    GitBranch,
    GraduationCap,
    History,
    Layers,
    LifeBuoy,
    Maximize2,
    MessageCircle,
    Minimize2,
    Network,
    RefreshCw,
    Settings,
    Sparkles,
    UserCircle,
    Users,
    Users2,
    Workflow,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type DiagramTypeKey =
    | 'activity_existing'
    | 'use_case'
    | 'activity'
    | 'sequence'
    | 'class';
type ExportFormat = 'png' | 'svg' | 'pdf' | 'plantuml';

type CompletenessFilter = 'all' | 'complete' | 'incomplete';

interface DiagramTypeMeta {
    id: DiagramTypeKey;
    name: string;
    description: string;
}

interface DiagramExplanation {
    title: string;
    description: string;
    highlights: string[];
    technical_notes: string[];
    backend_components: string[];
    frontend_components: string[];
    risk_improvements: string[];
}

interface UMLMenu {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    diagrams: Record<DiagramTypeKey, string>;
    preview_urls: Record<DiagramTypeKey, string>;
    explanations: Record<DiagramTypeKey, DiagramExplanation>;
    features: string[];
    actors: string[];
    architecture_notes: string[];
    risk_improvements: string[];
    completion: {
        available: number;
        total: number;
        percentage: number;
    };
    quality_badge: string;
    file_paths: Record<DiagramTypeKey, string>;
}

interface DiagramVersionItem {
    id: number;
    version: number;
    description: string | null;
    code: string;
    created_at: string;
    editor?: {
        id?: number;
        nama?: string;
    } | null;
}

interface Props {
    menus: UMLMenu[];
    diagramTypes: DiagramTypeMeta[];
    stats: {
        total_menus: number;
        diagram_types: number;
        total_diagrams: number;
        last_updated: string;
    };
}

const menuIconMap: Record<string, LucideIcon> = {
    Layers,
    ClipboardCheck,
    Calendar,
    BookOpen,
    Users,
    FileCheck,
    ClipboardList,
    Users2,
    FileText,
    GraduationCap,
    BookText,
    Bell,
    Settings,
    UserCircle,
    MessageCircle,
    LifeBuoy,
};

const diagramIconMap: Record<DiagramTypeKey, LucideIcon> = {
    activity_existing: Workflow,
    use_case: Users,
    activity: Activity,
    sequence: GitBranch,
    class: Network,
};

const qualityConfig: Record<string, string> = {
    Development:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Excellent:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Good: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Basic: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 260,
            damping: 22,
        },
    },
};

export default function DokumentasiUML({ menus, diagramTypes, stats }: Props) {
    const [selectedMenuId, setSelectedMenuId] = useState(menus[0]?.id ?? '');
    const [selectedDiagram, setSelectedDiagram] =
        useState<DiagramTypeKey>('activity_existing');
    const [searchQuery, setSearchQuery] = useState('');
    const [completenessFilter, setCompletenessFilter] =
        useState<CompletenessFilter>('all');

    const [zoomLevel, setZoomLevel] = useState(100);
    const [showCode, setShowCode] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyItems, setHistoryItems] = useState<DiagramVersionItem[]>([]);

    const [exportOpen, setExportOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<ExportFormat>('svg');
    const [exporting, setExporting] = useState(false);

    const filteredMenus = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return menus.filter((menu) => {
            const matchedQuery = !q
                ? true
                : [menu.name, menu.description, ...menu.features]
                      .join(' ')
                      .toLowerCase()
                      .includes(q);

            const matchedCompletion =
                completenessFilter === 'all'
                    ? true
                    : completenessFilter === 'complete'
                      ? menu.completion.percentage === 100
                      : menu.completion.percentage < 100;

            return matchedQuery && matchedCompletion;
        });
    }, [menus, searchQuery, completenessFilter]);

    const selectedMenu = useMemo(
        () =>
            filteredMenus.find((menu) => menu.id === selectedMenuId) ??
            menus.find((menu) => menu.id === selectedMenuId) ??
            null,
        [filteredMenus, menus, selectedMenuId],
    );

    const globalCompletion = useMemo(() => {
        if (!menus.length) return 0;
        const total = menus.reduce(
            (sum, menu) => sum + menu.completion.percentage,
            0,
        );
        return Math.round(total / menus.length);
    }, [menus]);

    const activeCode = selectedMenu
        ? selectedMenu.diagrams[selectedDiagram]
        : '';
    const activePreview = selectedMenu
        ? selectedMenu.preview_urls[selectedDiagram]
        : '';
    const activeExplanation =
        selectedMenu?.explanations[selectedDiagram] ?? null;
    const activeFilePath = selectedMenu?.file_paths[selectedDiagram] ?? '';
    const hasHostedDiagram =
        activeCode.trim() !== '' && activePreview.trim() !== '';

    const handleOpenHistory = async () => {
        if (!selectedMenu) return;
        if (!hasHostedDiagram) {
            toast.info(
                'Version history belum tersedia. UML masih tahap pengembangan.',
            );
            return;
        }
        setHistoryOpen(true);
        setHistoryLoading(true);
        try {
            const response = await axios.get('/dosen/dokumentasi-uml/history', {
                params: {
                    menu_id: selectedMenu.id,
                    diagram_type: selectedDiagram,
                },
            });
            setHistoryItems(response.data?.data ?? []);
        } catch {
            toast.error('Gagal memuat version history diagram.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedMenu) return;
        if (!hasHostedDiagram) {
            toast.info(
                'Export belum tersedia. UML akan aktif setelah layanan ter-host.',
            );
            return;
        }

        setExporting(true);
        try {
            const response = await axios.post(
                '/dosen/dokumentasi-uml/export',
                {
                    menu_id: selectedMenu.id,
                    diagram_type: selectedDiagram,
                    format: exportFormat,
                    code: activeCode,
                },
                { responseType: 'blob' },
            );

            const blob = new Blob([response.data]);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            const fallbackName = `${selectedMenu.id}-${selectedDiagram}.${exportFormat === 'plantuml' ? 'uml' : exportFormat}`;
            const header = String(
                response.headers['content-disposition'] ?? '',
            );
            const match = header.match(/filename="([^"]+)"/);

            link.href = url;
            link.download = match?.[1] ?? fallbackName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            setExportOpen(false);
            toast.success('Diagram berhasil diexport.');
        } catch {
            toast.error('Export diagram gagal.');
        } finally {
            setExporting(false);
        }
    };

    const handleCopyCode = async () => {
        if (!hasHostedDiagram) {
            toast.info(
                'Source UML belum tersedia. Masih dalam proses pengembangan.',
            );
            return;
        }
        try {
            await navigator.clipboard.writeText(activeCode);
            toast.success('Kode UML berhasil disalin.');
        } catch {
            toast.error('Gagal menyalin kode UML.');
        }
    };

    return (
        <DosenLayout>
            <Head title="Dokumentasi UML Dosen" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                                <FileCode2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold sm:text-3xl">
                                    Dokumentasi UML Dosen
                                </h1>
                                <p className="mt-1 text-sm text-purple-100 sm:text-base">
                                    Add-on dokumentasi arsitektur sistem dosen.
                                    Saat ini masih tahap pengembangan sambil
                                    menunggu layanan UML ter-host.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                                <p className="text-xs text-purple-100">
                                    Total Menu
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {stats.total_menus}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                                <p className="text-xs text-purple-100">
                                    Total Diagram
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {stats.total_diagrams}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                                <p className="text-xs text-purple-100">
                                    Jenis Diagram
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {stats.diagram_types}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                                <p className="text-xs text-purple-100">
                                    Global Progress
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {globalCompletion}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-xs text-purple-100">
                                <span>Global Completeness Tracker</span>
                                <span>{globalCompletion}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                <div
                                    className="h-full rounded-full bg-white"
                                    style={{ width: `${globalCompletion}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <motion.aside
                        variants={itemVariants}
                        className="xl:col-span-3"
                    >
                        <div className="sticky top-20 rounded-3xl border border-white/15 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                <Filter className="h-4 w-4" />
                                Filter Menu UML
                            </div>

                            <Input
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Cari menu..."
                                className="mb-3"
                            />

                            <div className="mb-3 grid grid-cols-3 gap-1 text-xs">
                                {(
                                    [
                                        { key: 'all', label: 'Semua' },
                                        { key: 'complete', label: 'Complete' },
                                        {
                                            key: 'incomplete',
                                            label: 'Need Fix',
                                        },
                                    ] as const
                                ).map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() =>
                                            setCompletenessFilter(item.key)
                                        }
                                        className={cn(
                                            'rounded-lg px-2 py-1.5 font-semibold',
                                            completenessFilter === item.key
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-200',
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="max-h-[62vh] space-y-2 overflow-auto pr-1">
                                {filteredMenus.map((menu) => {
                                    const Icon =
                                        menuIconMap[menu.icon] ?? Layers;
                                    const active = menu.id === selectedMenuId;
                                    return (
                                        <button
                                            key={menu.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedMenuId(menu.id)
                                            }
                                            className={cn(
                                                'w-full rounded-xl border p-3 text-left transition-all',
                                                active
                                                    ? `border-transparent bg-gradient-to-r ${menu.color} text-white shadow-lg`
                                                    : 'border-slate-200 bg-white/70 text-slate-700 hover:border-indigo-300 hover:bg-white dark:border-slate-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-neutral-700',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <span className="line-clamp-1 text-sm font-semibold">
                                                        {menu.name}
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                        active
                                                            ? 'bg-white/20 text-white'
                                                            : (qualityConfig[
                                                                  menu
                                                                      .quality_badge
                                                              ] ??
                                                                  qualityConfig.Basic),
                                                    )}
                                                >
                                                    {menu.quality_badge}
                                                </span>
                                            </div>

                                            <div className="mt-2">
                                                <div
                                                    className={cn(
                                                        'mb-1 flex items-center justify-between text-[10px]',
                                                        active
                                                            ? 'text-white/90'
                                                            : 'text-slate-500 dark:text-slate-300',
                                                    )}
                                                >
                                                    <span>
                                                        {
                                                            menu.completion
                                                                .available
                                                        }
                                                        /{menu.completion.total}{' '}
                                                        diagram
                                                    </span>
                                                    <span>
                                                        {
                                                            menu.completion
                                                                .percentage
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div
                                                    className={cn(
                                                        'h-1.5 rounded-full',
                                                        active
                                                            ? 'bg-white/20'
                                                            : 'bg-slate-200 dark:bg-slate-700',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            active
                                                                ? 'bg-white'
                                                                : 'bg-indigo-500',
                                                        )}
                                                        style={{
                                                            width: `${menu.completion.percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.aside>

                    <motion.section
                        variants={itemVariants}
                        className="xl:col-span-9"
                    >
                        {!selectedMenu ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/60 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-neutral-900/50 dark:text-slate-400">
                                Pilih menu dosen untuk melihat dokumentasi UML.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-white/15 bg-white/50 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55">
                                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {selectedMenu.name}
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                {selectedMenu.description}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                Aktor:{' '}
                                                {selectedMenu.actors.join(', ')}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleOpenHistory}
                                                disabled={!hasHostedDiagram}
                                            >
                                                <History className="mr-2 h-4 w-4" />{' '}
                                                History
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCopyCode}
                                                disabled={!hasHostedDiagram}
                                            >
                                                <Copy className="mr-2 h-4 w-4" />{' '}
                                                Copy UML
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setExportOpen(true)
                                                }
                                                disabled={!hasHostedDiagram}
                                            >
                                                <Download className="mr-2 h-4 w-4" />{' '}
                                                Export
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowCode((prev) => !prev)
                                                }
                                                disabled={!hasHostedDiagram}
                                            >
                                                <Code className="mr-2 h-4 w-4" />{' '}
                                                {showCode ? 'Hide' : 'Show'}{' '}
                                                Code
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setFullscreen(
                                                        (prev) => !prev,
                                                    )
                                                }
                                                disabled={!hasHostedDiagram}
                                            >
                                                {fullscreen ? (
                                                    <Minimize2 className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Maximize2 className="mr-2 h-4 w-4" />
                                                )}
                                                {fullscreen
                                                    ? 'Normal'
                                                    : 'Fullscreen'}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {diagramTypes.map((type) => {
                                            const Icon =
                                                diagramIconMap[type.id];
                                            const active =
                                                type.id === selectedDiagram;
                                            return (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedDiagram(
                                                            type.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                                                        active
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700',
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {type.name}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-neutral-800/60">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setZoomLevel((prev) =>
                                                        Math.max(50, prev - 10),
                                                    )
                                                }
                                                disabled={!hasHostedDiagram}
                                            >
                                                <ZoomOut className="h-4 w-4" />
                                            </Button>
                                            <span className="min-w-[60px] text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {zoomLevel}%
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setZoomLevel((prev) =>
                                                        Math.min(
                                                            200,
                                                            prev + 10,
                                                        ),
                                                    )
                                                }
                                                disabled={!hasHostedDiagram}
                                            >
                                                <ZoomIn className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setZoomLevel(100)
                                                }
                                                disabled={!hasHostedDiagram}
                                            >
                                                Reset
                                            </Button>
                                        </div>

                                        <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            {selectedMenu.quality_badge} Quality
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            'grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-neutral-950/40',
                                            showCode
                                                ? 'grid-cols-1 xl:grid-cols-12'
                                                : 'grid-cols-1',
                                            fullscreen &&
                                                'fixed inset-0 z-50 rounded-none border-0',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                showCode
                                                    ? 'xl:col-span-8'
                                                    : 'col-span-1',
                                            )}
                                        >
                                            <div className="flex min-h-[520px] items-start justify-center overflow-auto p-6">
                                                {hasHostedDiagram ? (
                                                    <motion.div
                                                        key={activePreview}
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.98,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        className="w-fit max-w-full origin-top"
                                                        style={{
                                                            transform: `scale(${zoomLevel / 100})`,
                                                        }}
                                                    >
                                                        <img
                                                            src={activePreview}
                                                            alt={`${selectedMenu.name} - ${selectedDiagram}`}
                                                            className="max-w-full rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-neutral-900"
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <div className="w-full max-w-3xl rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-6 text-center dark:border-sky-700 dark:bg-sky-950/20">
                                                        <p className="text-lg font-bold text-sky-800 dark:text-sky-200">
                                                            UML untuk menu ini
                                                            masih dalam
                                                            pengembangan
                                                        </p>
                                                        <p className="mt-2 text-sm text-sky-700 dark:text-sky-300">
                                                            File UML akan
                                                            tersedia setelah
                                                            layanan UML
                                                            eksternal selesai
                                                            di-host. Konten
                                                            diagram nantinya
                                                            disesuaikan dengan
                                                            alur aktual menu{' '}
                                                            <span className="font-semibold">
                                                                {
                                                                    selectedMenu.name
                                                                }
                                                            </span>
                                                            .
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showCode && (
                                                <motion.div
                                                    initial={{
                                                        x: 40,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        x: 0,
                                                        opacity: 1,
                                                    }}
                                                    exit={{ x: 40, opacity: 0 }}
                                                    className="border-t border-slate-200 bg-white p-4 xl:col-span-4 xl:border-t-0 xl:border-l dark:border-slate-700 dark:bg-neutral-900"
                                                >
                                                    <div className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                        Source Path:{' '}
                                                        <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                                                            {activeFilePath}
                                                        </code>
                                                    </div>
                                                    <pre className="max-h-[430px] overflow-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-300">
                                                        <code>
                                                            {activeCode}
                                                        </code>
                                                    </pre>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {activeExplanation && (
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="rounded-3xl border border-white/15 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                Penjelasan Diagram
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                {activeExplanation.description}
                                            </p>

                                            <div className="mt-3">
                                                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    Highlight Alur
                                                </p>
                                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                                    {activeExplanation.highlights.map(
                                                        (item, index) => (
                                                            <li
                                                                key={`${item}-${index}`}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                                                                <span>
                                                                    {item}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="mt-4">
                                                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    Komponen Backend / Frontend
                                                </p>
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-neutral-800">
                                                        <p className="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
                                                            Backend
                                                        </p>
                                                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                                                            {activeExplanation.backend_components.map(
                                                                (
                                                                    component,
                                                                    index,
                                                                ) => (
                                                                    <li
                                                                        key={`${component}-${index}`}
                                                                    >
                                                                        •{' '}
                                                                        {
                                                                            component
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-neutral-800">
                                                        <p className="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
                                                            Frontend
                                                        </p>
                                                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                                                            {activeExplanation.frontend_components.map(
                                                                (
                                                                    component,
                                                                    index,
                                                                ) => (
                                                                    <li
                                                                        key={`${component}-${index}`}
                                                                    >
                                                                        •{' '}
                                                                        {
                                                                            component
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-3xl border border-white/15 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Architecture Notes
                                                </h3>
                                                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                                    {selectedMenu.architecture_notes.map(
                                                        (note, index) => (
                                                            <li
                                                                key={`${note}-${index}`}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                                                                <span>
                                                                    {note}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="rounded-3xl border border-white/15 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Risk & Improvement
                                                </h3>
                                                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                                    {selectedMenu.risk_improvements.map(
                                                        (risk, index) => (
                                                            <li
                                                                key={`${risk}-${index}`}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                                                                <span>
                                                                    {risk}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.section>
                </div>
            </motion.div>

            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Version History Diagram</DialogTitle>
                        <DialogDescription>
                            Riwayat versi untuk {selectedMenu?.name ?? '-'} (
                            {selectedDiagram})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] space-y-2 overflow-auto pr-1">
                        {historyLoading ? (
                            <div className="flex items-center justify-center py-10 text-slate-500">
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />{' '}
                                Memuat history...
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                Belum ada versi tersimpan untuk diagram ini.
                            </div>
                        ) : (
                            historyItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-neutral-800/70"
                                >
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        v{item.version}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {item.created_at} -{' '}
                                        {item.editor?.nama ?? 'Unknown'}
                                    </p>
                                    {item.description && (
                                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Export Diagram UML</DialogTitle>
                        <DialogDescription>
                            Pilih format export untuk diagram aktif.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2">
                        {(
                            ['png', 'svg', 'pdf', 'plantuml'] as ExportFormat[]
                        ).map((format) => (
                            <button
                                key={format}
                                type="button"
                                onClick={() => setExportFormat(format)}
                                className={cn(
                                    'rounded-xl border px-3 py-2 text-sm font-semibold uppercase',
                                    exportFormat === format
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-neutral-800 dark:text-slate-200',
                                )}
                            >
                                {format}
                            </button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setExportOpen(false)}
                        >
                            <X className="mr-2 h-4 w-4" /> Tutup
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={exporting}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                        >
                            {exporting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{' '}
                                    Export...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" /> Export
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
