import { router } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Code,
    Download,
    FileText,
    GitBranch,
    Layers,
    Loader2,
    Plus,
    Presentation,
    Save,
    Sparkles,
    Star,
    Trash2,
    Upload,
    User,
    Users,
    Zap,
} from 'lucide-react';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';

type Mode = 'dosen' | 'mahasiswa';
type ScheduleType = 'immediate' | 'scheduled' | 'recurring';
type CollaborationType = 'individual' | 'group' | 'peer_review';
type Priority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Urgent';
type Category = 'Tugas' | 'Quiz' | 'Ujian' | 'Project' | 'Presentasi';

type CourseOption = {
    id: number;
    name: string;
};

type AvailableTask = {
    id: number;
    title: string;
    subtitle?: string;
    priority?: string;
};

type TemplateItem = {
    id: number;
    name: string;
    description?: string | null;
    category?: string | null;
    usage_count?: number;
    is_favorite?: boolean;
    fields?: {
        title_pattern?: string;
        description_template?: string;
        default_duration?: number;
        default_priority?: string;
        schedule_type?: ScheduleType;
    };
};

type TitleSuggestion = {
    title: string;
    confidence: number;
    category: Category;
    reasoning: string;
};

type DeadlinePrediction = {
    label: string;
    date: string;
    reasoning: string;
};

type ReminderInput = {
    type: 'before_deadline' | 'custom';
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
    enabled: boolean;
};

type AttachmentInput = {
    file_name: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
};

type QuickBulkRow = {
    judul: string;
    deadline: string;
    prioritas: Priority;
    kategori: Category;
};

interface TugasCreateFormProps {
    mode: Mode;
    pageTitle: string;
    description: string;
    backUrl: string;
    listUrl: string;
    basePath: string;
    courses: CourseOption[];
    templates: TemplateItem[];
    availableTasks: AvailableTask[];
    showCollaboration: boolean;
    showWeight: boolean;
}

const categories: Category[] = ['Tugas', 'Quiz', 'Ujian', 'Project', 'Presentasi'];
const priorities: Priority[] = ['Rendah', 'Sedang', 'Tinggi', 'Urgent'];

const quickTemplates = [
    {
        name: 'Essay Assignment',
        icon: FileText,
        color: 'from-blue-500 to-indigo-600',
        fields: {
            kategori: 'Tugas' as Category,
            estimated_hours: 8,
            prioritas: 'Sedang' as Priority,
            description: '<h3>Instruksi</h3><ol><li>Baca materi referensi</li><li>Susun outline</li><li>Tulis esai minimal 1000 kata</li><li>Lakukan final review</li></ol><h3>Format</h3><ul><li>Font: Times New Roman 12pt</li><li>Spacing: 1.5</li><li>Margin: 2.5cm</li></ul>',
        },
    },
    {
        name: 'Programming Project',
        icon: Code,
        color: 'from-emerald-500 to-teal-600',
        fields: {
            kategori: 'Project' as Category,
            estimated_hours: 20,
            prioritas: 'Tinggi' as Priority,
            description: '<h3>Deliverables</h3><ol><li>Source code</li><li>Dokumentasi README</li><li>Demo video</li><li>Slide presentasi</li></ol><h3>Requirements</h3><ul><li>Frontend</li><li>Backend</li><li>Database</li></ul>',
        },
    },
    {
        name: 'Presentation',
        icon: Presentation,
        color: 'from-purple-500 to-pink-600',
        fields: {
            kategori: 'Presentasi' as Category,
            estimated_hours: 6,
            prioritas: 'Sedang' as Priority,
            description: '<h3>Outline Presentasi</h3><ol><li>Introduction</li><li>Main Content</li><li>Conclusion</li><li>Q&A</li></ol><p>Durasi 15-20 menit.</p>',
        },
    },
];

const springBase = { type: 'spring' as const, stiffness: 300, damping: 20 };

export default function TugasCreateForm({
    mode,
    pageTitle,
    description,
    backUrl,
    listUrl,
    basePath,
    courses,
    templates: initialTemplates,
    availableTasks,
    showCollaboration,
    showWeight,
}: TugasCreateFormProps) {
    const courseFieldName = mode === 'dosen' ? 'course_id' : 'mahasiswa_course_id';

    const [currentStep, setCurrentStep] = useState(1);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showBulkPanel, setShowBulkPanel] = useState(false);
    const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
    const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([]);
    const [deadlinePredictions, setDeadlinePredictions] = useState<DeadlinePrediction[]>([]);
    const [isAnalyzingTitle, setIsAnalyzingTitle] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const [quickRows, setQuickRows] = useState<QuickBulkRow[]>([
        { judul: '', deadline: '', prioritas: 'Sedang', kategori: 'Tugas' },
    ]);
    const [csvPreview, setCsvPreview] = useState<QuickBulkRow[]>([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const [csvFileName, setCsvFileName] = useState('');

    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const [tagInput, setTagInput] = useState('');
    const [resourceLinks, setResourceLinks] = useState<string[]>(['']);

    const [form, setForm] = useState({
        course_id: '',
        judul: '',
        kategori: 'Tugas' as Category,
        prioritas: 'Sedang' as Priority,
        deskripsi: '',
        deadline: '',
        estimated_hours: 4,
        bobot_nilai: '',
        tags: [] as string[],
        attachments: [] as AttachmentInput[],
        schedule_type: 'immediate' as ScheduleType,
        publish_at: '',
        recurring_pattern: {
            frequency: 'weekly',
            interval: 1,
            daysOfWeek: [] as number[],
            endDate: '',
        },
        reminders: [
            { type: 'before_deadline', value: 24, unit: 'hours', enabled: true } as ReminderInput,
            { type: 'before_deadline', value: 1, unit: 'days', enabled: true } as ReminderInput,
        ],
        dependencies: [] as number[],
        collaboration_type: 'individual' as CollaborationType,
        collaboration_settings: {
            max_members: 4,
            allow_self_form: true,
            random_assignment: false,
            reviews_per_student: 2,
            anonymous: true,
            rubric_enabled: true,
        },
        ai_generated: false,
        template_id: null as number | null,
    });

    const stepLabels = [
        { id: 1, title: 'Informasi Dasar' },
        { id: 2, title: 'Detail & Deskripsi' },
        { id: 3, title: 'Lampiran & Resources' },
        { id: 4, title: 'Automasi & Pengaturan' },
    ];

    const selectedCourse = useMemo(
        () => courses.find((course) => String(course.id) === form.course_id),
        [courses, form.course_id],
    );

    useEffect(() => {
        if (form.judul.trim().length < 3) {
            setTitleSuggestions([]);
            return;
        }

        const timeout = window.setTimeout(async () => {
            setIsAnalyzingTitle(true);
            try {
                const response = await axios.post<{ suggestions: TitleSuggestion[] }>(`${basePath}/ai/suggest-title`, {
                    partial_title: form.judul,
                    course_id: form.course_id ? Number(form.course_id) : undefined,
                });
                setTitleSuggestions(response.data.suggestions ?? []);
            } catch {
                setTitleSuggestions([]);
            } finally {
                setIsAnalyzingTitle(false);
            }
        }, 450);

        return () => window.clearTimeout(timeout);
    }, [basePath, form.judul, form.course_id]);

    useEffect(() => {
        if (!form.judul || !form.kategori) {
            setDeadlinePredictions([]);
            return;
        }

        const timeout = window.setTimeout(async () => {
            try {
                const response = await axios.post<{ predictions: DeadlinePrediction[] }>(`${basePath}/ai/predict-deadline`, {
                    title: form.judul,
                    category: form.kategori,
                    estimated_hours: form.estimated_hours,
                });
                setDeadlinePredictions(response.data.predictions ?? []);
            } catch {
                setDeadlinePredictions([]);
            }
        }, 600);

        return () => window.clearTimeout(timeout);
    }, [basePath, form.judul, form.kategori, form.estimated_hours]);

    const canGoNext = () => {
        if (currentStep === 1) {
            return Boolean(form.course_id && form.judul.trim() && form.kategori && form.prioritas);
        }
        if (currentStep === 2) {
            return Boolean(form.deadline && form.deskripsi.trim());
        }
        return true;
    };

    const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const generateDescriptionWithAI = async () => {
        if (!form.judul.trim()) return;
        setIsGeneratingDescription(true);

        try {
            const response = await axios.post<{ description: string }>(`${basePath}/ai/generate-description`, {
                title: form.judul,
                category: form.kategori,
                course_id: form.course_id ? Number(form.course_id) : undefined,
            });

            updateForm('deskripsi', response.data.description ?? '');
            updateForm('ai_generated', true);
        } catch {
            setStatusMessage('Gagal generate deskripsi AI.');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const applyQuickTemplate = (template: (typeof quickTemplates)[number]) => {
        updateForm('kategori', template.fields.kategori);
        updateForm('estimated_hours', template.fields.estimated_hours);
        updateForm('prioritas', template.fields.prioritas);
        updateForm('deskripsi', template.fields.description);
    };

    const applySavedTemplate = async (templateId: number) => {
        try {
            const response = await axios.post<{ template: Record<string, unknown> }>(`${basePath}/templates/${templateId}/apply`);
            const tpl = response.data.template;
            updateForm('template_id', templateId);
            updateForm('judul', String(tpl.title ?? form.judul));
            updateForm('deskripsi', String(tpl.description ?? form.deskripsi));
            updateForm('kategori', (tpl.category as Category) ?? form.kategori);
            updateForm('prioritas', (tpl.priority as Priority) ?? form.prioritas);
            updateForm('estimated_hours', Number(tpl.estimated_hours ?? form.estimated_hours));
            updateForm('schedule_type', (tpl.schedule_type as ScheduleType) ?? form.schedule_type);
            setStatusMessage('Template diterapkan ke form.');
        } catch {
            setStatusMessage('Template gagal diterapkan.');
        }
    };

    const saveCurrentAsTemplate = async () => {
        const name = window.prompt('Nama template:');
        if (!name) return;

        try {
            const response = await axios.post<{ template: TemplateItem }>(`${basePath}/templates`, {
                name,
                description: `Template ${form.kategori}`,
                category: form.kategori,
                title_pattern: form.judul,
                description_template: form.deskripsi,
                default_duration: form.estimated_hours,
                default_priority: form.prioritas,
                schedule_type: form.schedule_type,
                attachments: form.attachments,
            });

            setTemplates((prev) => [response.data.template, ...prev]);
            setStatusMessage('Template baru berhasil disimpan.');
        } catch {
            setStatusMessage('Gagal menyimpan template.');
        }
    };

    const toggleTemplateFavorite = async (templateId: number) => {
        try {
            await axios.patch(`${basePath}/templates/${templateId}/favorite`);
            setTemplates((prev) =>
                prev.map((template) =>
                    template.id === templateId
                        ? { ...template, is_favorite: !template.is_favorite }
                        : template,
                ),
            );
        } catch {
            setStatusMessage('Gagal mengubah favorite template.');
        }
    };

    const addTag = () => {
        const value = tagInput.trim();
        if (!value || form.tags.includes(value)) return;
        updateForm('tags', [...form.tags, value]);
        setTagInput('');
    };

    const uploadSelectedFiles = async () => {
        if (filesToUpload.length === 0) return;

        setUploadingFiles(true);
        const uploaded: AttachmentInput[] = [];

        try {
            for (const file of filesToUpload) {
                const payload = new FormData();
                payload.append('file', file);

                const response = await axios.post<AttachmentInput>(`${basePath}/upload`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (event) => {
                        const progress = Math.round((event.loaded * 100) / (event.total || 1));
                        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
                    },
                });

                uploaded.push(response.data);
            }

            updateForm('attachments', [...form.attachments, ...uploaded]);
            setFilesToUpload([]);
            setUploadProgress({});
            setStatusMessage(`${uploaded.length} file berhasil diunggah.`);
        } catch {
            setStatusMessage('Upload file gagal.');
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleQuickBulkCreate = async () => {
        if (!form.course_id) {
            setStatusMessage('Pilih mata kuliah terlebih dahulu untuk bulk create.');
            return;
        }

        const payloadTasks = quickRows
            .filter((row) => row.judul.trim())
            .map((row) => ({
                [courseFieldName]: Number(form.course_id),
                judul: row.judul,
                kategori: row.kategori,
                prioritas: row.prioritas,
                deadline: row.deadline || new Date().toISOString(),
                deskripsi: '',
            }));

        if (payloadTasks.length === 0) {
            setStatusMessage('Belum ada row yang valid untuk diimpor.');
            return;
        }

        try {
            await axios.post(`${basePath}/bulk`, {
                tasks: payloadTasks,
            });
            setStatusMessage(`${payloadTasks.length} tugas berhasil dibuat.`);
            router.visit(listUrl);
        } catch {
            setStatusMessage('Bulk create gagal diproses.');
        }
    };

    const handleCsvPreview = async (file: File | null) => {
        if (!file) return;
        setCsvLoading(true);
        setCsvFileName(file.name);

        const payload = new FormData();
        payload.append('file', file);

        try {
            const response = await axios.post<{ tasks: QuickBulkRow[] }>(`${basePath}/bulk/preview`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCsvPreview(response.data.tasks ?? []);
        } catch {
            setStatusMessage('Preview CSV gagal diproses.');
            setCsvPreview([]);
        } finally {
            setCsvLoading(false);
        }
    };

    const importCsvPreview = async () => {
        if (csvPreview.length === 0) return;

        try {
            const tasks = csvPreview.map((task) => ({
                ...task,
                [courseFieldName]: Number(form.course_id),
            }));

            await axios.post(`${basePath}/bulk/import`, { tasks });
            setStatusMessage(`${csvPreview.length} tugas dari CSV berhasil diimpor.`);
            router.visit(listUrl);
        } catch {
            setStatusMessage('Import CSV gagal.');
        }
    };

    const handleSubmit = () => {
        if (!form.course_id) {
            setStatusMessage('Mata kuliah wajib dipilih.');
            return;
        }

        const payload = {
            [courseFieldName]: Number(form.course_id),
            judul: form.judul,
            deskripsi: form.deskripsi,
            kategori: form.kategori,
            prioritas: form.prioritas,
            deadline: form.deadline,
            estimated_hours: form.estimated_hours,
            schedule_type: form.schedule_type,
            publish_at: form.publish_at || null,
            recurring_pattern: form.schedule_type === 'recurring'
                ? {
                    frequency: form.recurring_pattern.frequency,
                    interval: form.recurring_pattern.interval,
                    daysOfWeek: form.recurring_pattern.daysOfWeek,
                    endDate: form.recurring_pattern.endDate || null,
                }
                : null,
            dependencies: form.dependencies,
            reminders: form.reminders,
            attachments: form.attachments,
            template_id: form.template_id,
            ai_generated: form.ai_generated,
            tags: form.tags,
            bobot_nilai: showWeight ? Number(form.bobot_nilai || 0) : undefined,
            collaboration_type: showCollaboration ? form.collaboration_type : undefined,
            collaboration_settings: showCollaboration
                ? {
                    max_members: form.collaboration_settings.max_members,
                    allow_self_form: form.collaboration_settings.allow_self_form,
                    random_assignment: form.collaboration_settings.random_assignment,
                    reviews_per_student: form.collaboration_settings.reviews_per_student,
                    anonymous: form.collaboration_settings.anonymous,
                    rubric_enabled: form.collaboration_settings.rubric_enabled,
                }
                : undefined,
            metadata: {
                resources: resourceLinks.filter((item) => item.trim()),
                selected_course_name: selectedCourse?.name,
            },
        };

        setIsSubmitting(true);
        router.post(basePath, payload, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
            onError: () => setStatusMessage('Validasi gagal. Periksa kembali isian form.'),
        });
    };

    return (
        <div className="space-y-6 p-4 md:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springBase}
                className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    style={{ backgroundSize: '200% 200%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.visit(backUrl)}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Tugas
                    </motion.button>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                            <motion.div
                                className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={springBase}
                            >
                                <img
                                    src={TugasIcon}
                                    alt="Tambah Tugas"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>

                            <div className="flex-1">
                                <p className="text-sm font-medium tracking-wide text-indigo-100">
                                    Create New Assignment
                                </p>
                                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{pageTitle}</h1>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowTemplates((prev) => !prev)}
                                className="gap-2 border-white/20 bg-white/20 text-white hover:bg-white/30"
                            >
                                <Layers className="h-4 w-4" />
                                {showTemplates ? 'Hide Template' : 'Use Template'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowBulkPanel((prev) => !prev)}
                                className="gap-2 border-white/20 bg-white/20 text-white hover:bg-white/30"
                            >
                                <Upload className="h-4 w-4" />
                                {showBulkPanel ? 'Hide Bulk' : 'Bulk Import'}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {statusMessage && (
                <div className="rounded-2xl border border-indigo-300 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    {statusMessage}
                </div>
            )}

            {showTemplates && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springBase}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Template Library</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {templates.length} templates tersedia
                            </p>
                        </div>
                        <Button type="button" variant="outline" onClick={saveCurrentAsTemplate} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save as Template
                        </Button>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {quickTemplates.map((template) => (
                            <motion.button
                                key={template.name}
                                type="button"
                                whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => applyQuickTemplate(template)}
                                className={`rounded-2xl bg-gradient-to-br ${template.color} p-4 text-left text-white shadow-lg`}
                            >
                                <template.icon className="mb-2 h-7 w-7" />
                                <p className="text-sm font-bold">{template.name}</p>
                            </motion.button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                            >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{template.name}</p>
                                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            {template.description || 'Template tugas'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleTemplateFavorite(template.id)}
                                        className="text-yellow-500"
                                    >
                                        <Star className={`h-4 w-4 ${template.is_favorite ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                </div>
                                <div className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                                    {template.usage_count ?? 0} kali digunakan
                                </div>
                                <Button type="button" size="sm" className="w-full" onClick={() => applySavedTemplate(template.id)}>
                                    Gunakan Template
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {showBulkPanel && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springBase}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div>
                            <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">Quick Add Multiple</h3>
                            <div className="space-y-2">
                                {quickRows.map((row, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2">
                                        <Input
                                            className="col-span-5"
                                            placeholder="Judul"
                                            value={row.judul}
                                            onChange={(event) => {
                                                const next = [...quickRows];
                                                next[index].judul = event.target.value;
                                                setQuickRows(next);
                                            }}
                                        />
                                        <Input
                                            className="col-span-3"
                                            type="date"
                                            value={row.deadline}
                                            onChange={(event) => {
                                                const next = [...quickRows];
                                                next[index].deadline = event.target.value;
                                                setQuickRows(next);
                                            }}
                                        />
                                        <Select
                                            value={row.prioritas}
                                            onValueChange={(value) => {
                                                const next = [...quickRows];
                                                next[index].prioritas = value as Priority;
                                                setQuickRows(next);
                                            }}
                                        >
                                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {priorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <button
                                            type="button"
                                            className="col-span-1 rounded-xl border border-neutral-300 text-red-500"
                                            onClick={() => setQuickRows((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))}
                                        >
                                            <Trash2 className="mx-auto h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setQuickRows((prev) => [...prev, { judul: '', deadline: '', prioritas: 'Sedang', kategori: 'Tugas' }])}>
                                    <Plus className="mr-1 h-4 w-4" /> Add Row
                                </Button>
                                <Button type="button" onClick={handleQuickBulkCreate}>
                                    <CheckCircle className="mr-1 h-4 w-4" /> Create All
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">CSV Import</h3>
                            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 text-sm dark:border-neutral-700">
                                <Upload className="mb-2 h-8 w-8 text-neutral-400" />
                                Upload CSV
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={(event) => handleCsvPreview(event.target.files?.[0] ?? null)}
                                />
                            </label>
                            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                                <span>{csvFileName || 'Belum ada file dipilih'}</span>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={() => window.open(`${basePath}/bulk/template`, '_blank')}
                                >
                                    <Download className="mr-1 h-4 w-4" /> Template
                                </Button>
                            </div>

                            {csvLoading && <p className="mt-3 text-xs text-indigo-600">Memproses preview...</p>}
                            {csvPreview.length > 0 && (
                                <div className="mt-3 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                                    <div className="max-h-40 overflow-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-neutral-100 dark:bg-neutral-800">
                                                <tr>
                                                    <th className="px-2 py-2 text-left">Judul</th>
                                                    <th className="px-2 py-2 text-left">Kategori</th>
                                                    <th className="px-2 py-2 text-left">Deadline</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvPreview.map((item, index) => (
                                                    <tr key={`${item.judul}-${index}`} className="border-t border-neutral-200 dark:border-neutral-700">
                                                        <td className="px-2 py-2">{item.judul}</td>
                                                        <td className="px-2 py-2">{item.kategori}</td>
                                                        <td className="px-2 py-2">{item.deadline}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-neutral-200 p-2 dark:border-neutral-700">
                                        <Button type="button" size="sm" onClick={importCsvPreview}>
                                            Import Semua ({csvPreview.length})
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    {stepLabels.map((step) => (
                        <motion.button
                            key={step.id}
                            type="button"
                            onClick={() => setCurrentStep(step.id)}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                            className={`rounded-2xl border p-3 text-left transition-all ${
                                currentStep === step.id
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                    : 'border-neutral-200 bg-white/80 dark:border-neutral-700 dark:bg-neutral-800/60'
                            }`}
                        >
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Step {step.id}</p>
                            <p className="font-semibold text-neutral-900 dark:text-white">{step.title}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springBase}
                className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                {currentStep === 1 && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Mata Kuliah</Label>
                                <Select value={form.course_id} onValueChange={(value) => updateForm('course_id', value)}>
                                    <SelectTrigger className="mt-2"><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={String(course.id)}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Kategori</Label>
                                <Select value={form.kategori} onValueChange={(value) => updateForm('kategori', value as Category)}>
                                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Judul Tugas</Label>
                            <div className="relative mt-2">
                                <Input
                                    value={form.judul}
                                    onChange={(event) => updateForm('judul', event.target.value)}
                                    placeholder="Masukkan judul tugas..."
                                    className="pr-10"
                                />
                                {isAnalyzingTitle && (
                                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-indigo-500" />
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Prioritas</Label>
                            <Select value={form.prioritas} onValueChange={(value) => updateForm('prioritas', value as Priority)}>
                                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {priorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {titleSuggestions.length > 0 && (
                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
                                <div className="mb-2 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">AI Suggestions</p>
                                </div>
                                <div className="space-y-2">
                                    {titleSuggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={`${suggestion.title}-${index}`}
                                            type="button"
                                            whileHover={{ scale: 1.04, x: 5, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                            onClick={() => {
                                                updateForm('judul', suggestion.title);
                                                updateForm('kategori', suggestion.category);
                                            }}
                                            className="w-full rounded-xl border border-indigo-200 bg-white p-3 text-left dark:border-indigo-800 dark:bg-neutral-800"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{suggestion.title}</p>
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{suggestion.reasoning}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                    <Zap className="h-3 w-3" />
                                                    {Math.round((suggestion.confidence || 0) * 100)}%
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <Label>Deskripsi Tugas</Label>
                            <Button type="button" variant="outline" size="sm" onClick={generateDescriptionWithAI} disabled={isGeneratingDescription}>
                                {isGeneratingDescription ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate dengan AI
                            </Button>
                        </div>

                        <TipTapEditor
                            content={form.deskripsi}
                            onChange={(value) => updateForm('deskripsi', value)}
                            placeholder="Jelaskan detail tugas, kriteria, dan instruksi pengerjaan..."
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Deadline</Label>
                                <Input
                                    className="mt-2"
                                    type="datetime-local"
                                    value={form.deadline}
                                    onChange={(event) => updateForm('deadline', event.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Estimasi Jam Pengerjaan</Label>
                                <Input
                                    className="mt-2"
                                    type="number"
                                    min={1}
                                    value={form.estimated_hours}
                                    onChange={(event) => updateForm('estimated_hours', Number(event.target.value || 1))}
                                />
                            </div>
                        </div>

                        {showWeight && (
                            <div>
                                <Label>Bobot Nilai</Label>
                                <Input
                                    className="mt-2 max-w-xs"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={form.bobot_nilai}
                                    onChange={(event) => updateForm('bobot_nilai', event.target.value)}
                                    placeholder="0-100"
                                />
                            </div>
                        )}

                        {deadlinePredictions.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                {deadlinePredictions.map((prediction) => (
                                    <motion.button
                                        key={`${prediction.label}-${prediction.date}`}
                                        type="button"
                                        whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                        onClick={() => updateForm('deadline', prediction.date.replace(' ', 'T').slice(0, 16))}
                                        className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-3 text-left dark:border-indigo-800 dark:from-indigo-950/30 dark:to-purple-950/30"
                                    >
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{prediction.label}</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{prediction.date.slice(0, 16)}</p>
                                        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">{prediction.reasoning}</p>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        <div>
                            <Label>Tags</Label>
                            <div className="mt-2 flex gap-2">
                                <Input
                                    value={tagInput}
                                    placeholder="Tambah tag..."
                                    onChange={(event) => setTagInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            addTag();
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                            </div>
                            {form.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {form.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                                            {tag}
                                            <button type="button" onClick={() => updateForm('tags', form.tags.filter((item) => item !== tag))}>x</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-5">
                        <div className="rounded-2xl border-2 border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
                            <Upload className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Drop files here or click to browse</p>
                            <p className="text-xs text-neutral-500">PDF, DOC, XLS, PPT, Images (maks 10MB/file)</p>
                            <Input
                                className="mt-3"
                                type="file"
                                multiple
                                onChange={(event) => setFilesToUpload(Array.from(event.target.files ?? []))}
                            />
                            <Button type="button" className="mt-3" onClick={uploadSelectedFiles} disabled={uploadingFiles || filesToUpload.length === 0}>
                                {uploadingFiles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload Files
                            </Button>
                        </div>

                        {filesToUpload.length > 0 && (
                            <div className="space-y-2">
                                {filesToUpload.map((file) => (
                                    <div key={file.name} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs text-neutral-500">{Math.round(file.size / 1024)} KB</p>
                                        {uploadingFiles && uploadProgress[file.name] !== undefined && (
                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${uploadProgress[file.name]}%` }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {form.attachments.length > 0 && (
                            <div className="space-y-2 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Lampiran tersimpan ({form.attachments.length})</p>
                                {form.attachments.map((attachment, index) => (
                                    <div key={`${attachment.file_name}-${index}`} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{attachment.file_name}</p>
                                            <p className="text-xs text-neutral-500">{attachment.file_type || 'file'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateForm('attachments', form.attachments.filter((_, idx) => idx !== index))}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Reference Links</Label>
                            {resourceLinks.map((link, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={link}
                                        placeholder="https://..."
                                        onChange={(event) => {
                                            const next = [...resourceLinks];
                                            next[index] = event.target.value;
                                            setResourceLinks(next);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (index === resourceLinks.length - 1) {
                                                setResourceLinks((prev) => [...prev, '']);
                                            } else {
                                                setResourceLinks((prev) => prev.filter((_, i) => i !== index));
                                            }
                                        }}
                                    >
                                        {index === resourceLinks.length - 1 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div className="mb-3 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                                <p className="font-semibold text-neutral-900 dark:text-white">Schedule & Automation</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'immediate', label: 'Publish Now', icon: Zap },
                                    { value: 'scheduled', label: 'Schedule', icon: Clock },
                                    { value: 'recurring', label: 'Recurring', icon: Calendar },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => updateForm('schedule_type', option.value as ScheduleType)}
                                        className={`rounded-xl border-2 p-3 text-center ${
                                            form.schedule_type === option.value
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                                : 'border-neutral-200 dark:border-neutral-700'
                                        }`}
                                    >
                                        <option.icon className="mx-auto mb-1 h-5 w-5" />
                                        <p className="text-xs font-semibold">{option.label}</p>
                                    </button>
                                ))}
                            </div>

                            {form.schedule_type === 'scheduled' && (
                                <div className="mt-4">
                                    <Label>Publish Date & Time</Label>
                                    <Input
                                        className="mt-2"
                                        type="datetime-local"
                                        value={form.publish_at}
                                        onChange={(event) => updateForm('publish_at', event.target.value)}
                                    />
                                </div>
                            )}

                            {form.schedule_type === 'recurring' && (
                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                        <Label>Frequency</Label>
                                        <Select
                                            value={form.recurring_pattern.frequency}
                                            onValueChange={(value) =>
                                                updateForm('recurring_pattern', {
                                                    ...form.recurring_pattern,
                                                    frequency: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Interval</Label>
                                        <Input
                                            className="mt-2"
                                            type="number"
                                            min={1}
                                            value={form.recurring_pattern.interval}
                                            onChange={(event) =>
                                                updateForm('recurring_pattern', {
                                                    ...form.recurring_pattern,
                                                    interval: Number(event.target.value || 1),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="font-semibold text-neutral-900 dark:text-white">Reminder Notifications</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateForm('reminders', [...form.reminders, { type: 'before_deadline', value: 1, unit: 'hours', enabled: true }])}
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Add Reminder
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {form.reminders.map((reminder, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                                        <Switch
                                            checked={reminder.enabled}
                                            onCheckedChange={(checked) => {
                                                const next = [...form.reminders];
                                                next[index].enabled = checked;
                                                updateForm('reminders', next);
                                            }}
                                        />
                                        <Bell className="h-4 w-4 text-indigo-600" />
                                        <Input
                                            className="w-20"
                                            type="number"
                                            min={1}
                                            value={reminder.value}
                                            onChange={(event) => {
                                                const next = [...form.reminders];
                                                next[index].value = Number(event.target.value || 1);
                                                updateForm('reminders', next);
                                            }}
                                        />
                                        <Select
                                            value={reminder.unit}
                                            onValueChange={(value) => {
                                                const next = [...form.reminders];
                                                next[index].unit = value as ReminderInput['unit'];
                                                updateForm('reminders', next);
                                            }}
                                        >
                                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="minutes">Minutes</SelectItem>
                                                <SelectItem value="hours">Hours</SelectItem>
                                                <SelectItem value="days">Days</SelectItem>
                                                <SelectItem value="weeks">Weeks</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-xs text-neutral-500">before deadline</span>
                                        <button
                                            type="button"
                                            onClick={() => updateForm('reminders', form.reminders.filter((_, idx) => idx !== index))}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div className="mb-3 flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-indigo-600" />
                                <p className="font-semibold text-neutral-900 dark:text-white">Task Dependencies</p>
                            </div>
                            <div className="max-h-56 space-y-2 overflow-y-auto">
                                {availableTasks.length === 0 && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Belum ada tugas untuk dependency.</p>
                                )}
                                {availableTasks.map((task) => (
                                    <button
                                        type="button"
                                        key={task.id}
                                        className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left dark:border-neutral-700"
                                        onClick={() => {
                                            if (form.dependencies.includes(task.id)) {
                                                updateForm('dependencies', form.dependencies.filter((id) => id !== task.id));
                                            } else {
                                                updateForm('dependencies', [...form.dependencies, task.id]);
                                            }
                                        }}
                                    >
                                        <Checkbox checked={form.dependencies.includes(task.id)} />
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{task.title}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{task.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {showCollaboration && (
                            <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                                <div className="mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                    <p className="font-semibold text-neutral-900 dark:text-white">Collaboration Settings</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'individual', label: 'Individual', icon: User },
                                        { value: 'group', label: 'Group', icon: Users },
                                        { value: 'peer_review', label: 'Peer Review', icon: AlertCircle },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateForm('collaboration_type', option.value as CollaborationType)}
                                            className={`rounded-xl border-2 p-3 text-center ${
                                                form.collaboration_type === option.value
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                                    : 'border-neutral-200 dark:border-neutral-700'
                                            }`}
                                        >
                                            <option.icon className="mx-auto mb-1 h-5 w-5" />
                                            <p className="text-xs font-semibold">{option.label}</p>
                                        </button>
                                    ))}
                                </div>

                                {form.collaboration_type === 'group' && (
                                    <div className="mt-4 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                                        <div>
                                            <Label>Max Members</Label>
                                            <Input
                                                className="mt-2"
                                                type="number"
                                                min={2}
                                                max={10}
                                                value={form.collaboration_settings.max_members}
                                                onChange={(event) =>
                                                    updateForm('collaboration_settings', {
                                                        ...form.collaboration_settings,
                                                        max_members: Number(event.target.value || 2),
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Allow Self-Form Groups</span>
                                            <Switch
                                                checked={form.collaboration_settings.allow_self_form}
                                                onCheckedChange={(checked) =>
                                                    updateForm('collaboration_settings', {
                                                        ...form.collaboration_settings,
                                                        allow_self_form: checked,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Random Assignment</span>
                                            <Switch
                                                checked={form.collaboration_settings.random_assignment}
                                                onCheckedChange={(checked) =>
                                                    updateForm('collaboration_settings', {
                                                        ...form.collaboration_settings,
                                                        random_assignment: checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {form.collaboration_type === 'peer_review' && (
                                    <div className="mt-4 space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                                        <div>
                                            <Label>Reviews per Student</Label>
                                            <Input
                                                className="mt-2"
                                                type="number"
                                                min={1}
                                                max={5}
                                                value={form.collaboration_settings.reviews_per_student}
                                                onChange={(event) =>
                                                    updateForm('collaboration_settings', {
                                                        ...form.collaboration_settings,
                                                        reviews_per_student: Number(event.target.value || 1),
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Anonymous Review</span>
                                            <Switch
                                                checked={form.collaboration_settings.anonymous}
                                                onCheckedChange={(checked) =>
                                                    updateForm('collaboration_settings', {
                                                        ...form.collaboration_settings,
                                                        anonymous: checked,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Enable Rubric</span>
                                            <Switch
                                                checked={form.collaboration_settings.rubric_enabled}
                                                onCheckedChange={(checked) =>
                                                    updateForm('collaboration_settings', {
                                                        ...form.collaboration_settings,
                                                        rubric_enabled: checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                        disabled={currentStep === 1}
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                    </Button>

                    {currentStep < 4 ? (
                        <Button type="button" onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))} disabled={!canGoNext()}>
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Create Task
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
