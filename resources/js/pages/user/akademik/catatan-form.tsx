import StudentLayout from '@/layouts/student-layout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Bold,
    Check,
    CheckSquare,
    Clock,
    Code,
    FileText,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Maximize2,
    Mic,
    MicOff,
    Minimize2,
    Quote,
    Save,
    Sparkles,
    Strikethrough,
    Table as TableIcon,
    X,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// TipTap Editor
import { CharacterCount } from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';

import { common, createLowlight } from 'lowlight';
import { HexColorPicker } from 'react-colorful';

// Assuming catastrophic Icon missing, let's use Lucide's Note icon
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    ChevronDown,
    ChevronRight,
    Minus,
    Book as NoteIcon,
    Palette,
    Type,
    Underline as UnderlineIcon,
} from 'lucide-react';

const lowlight = createLowlight(common);

interface Note {
    id: number;
    course_id?: number;
    mahasiswa_course_id?: number;
    meeting_number: number;
    title: string;
    content: string;
    tags: string[];
}

interface Course {
    id: number;
    name: string;
    total_meetings: number;
}

interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    content: string;
}

interface Props {
    note?: Note;
    courses: Course[];
    templates: Template[];
    initialCourseId?: number | null;
}

export default function CatatanForm({
    note,
    courses = [],
    templates = [],
    initialCourseId = null,
}: Props) {
    const isEditing = !!note;
    const resolvedCourseId =
        note?.course_id ?? note?.mahasiswa_course_id ?? initialCourseId ?? '';
    const getCsrfToken = () => {
        const metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (metaToken) return metaToken;

        const cookieMatch = document.cookie.match(
            /(?:^|;\s*)XSRF-TOKEN=([^;]+)/,
        );
        return cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
    };

    // Form state
    const { data, setData, transform, post, patch, processing, errors } =
        useForm({
            _token: getCsrfToken(),
            course_id: resolvedCourseId ? String(resolvedCourseId) : '',
            mahasiswa_course_id: resolvedCourseId
                ? String(resolvedCourseId)
                : '',
            meeting_number: note?.meeting_number || '',
            title: note?.title || '',
            content: note?.content || '',
            tags: note?.tags || [],
        });

    // UI State
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [showTemplates, setShowTemplates] = useState(!isEditing);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
    const [currentStep, setCurrentStep] = useState(isEditing ? 2 : 1);
    const [recognition, setRecognition] = useState<any>(null);
    const [isAILoading, setIsAILoading] = useState(false);

    // Refs
    const autoSaveTimerRef = useRef<any>(null);

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 } as any,
        },
    };

    // Toolbar Setup State
    const [showFontFamily, setShowFontFamily] = useState(false);
    const [showFontSize, setShowFontSize] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [selectedBgColor, setSelectedBgColor] = useState('#ffff00');

    const fontFamilies = [
        { name: 'Arial', value: 'Arial' },
        { name: 'Times New Roman', value: 'Times New Roman' },
        { name: 'Courier New', value: 'Courier New' },
        { name: 'Georgia', value: 'Georgia' },
        { name: 'Verdana', value: 'Verdana' },
        { name: 'Comic Sans MS', value: '"Comic Sans MS"' },
        { name: 'Impact', value: 'Impact' },
        { name: 'Trebuchet MS', value: '"Trebuchet MS"' },
    ];

    const fontSizes = [
        '8',
        '10',
        '12',
        '14',
        '16',
        '18',
        '20',
        '24',
        '28',
        '32',
        '36',
        '48',
        '72',
    ];

    // TipTap Editor Setup
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                codeBlock: false,
            }),
            Underline,
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Color.configure({
                types: ['textStyle'],
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto my-4',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'rounded-xl bg-neutral-900 p-4 text-neutral-100 font-mono text-sm my-4 overflow-x-auto',
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'space-y-2 my-4',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse w-full my-4',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-3 font-bold text-left',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border-2 border-neutral-300 dark:border-neutral-700 p-3 min-w-[100px]',
                },
            }),
            Placeholder.configure({
                placeholder: 'Mulai menulis catatan Anda di sini...',
                emptyEditorClass: 'is-editor-empty',
            }),
            CharacterCount,
        ],
        content: data.content,
        // Make sure it updates parent state
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setData('content', html);

            // Auto-save fake trigger
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = setTimeout(() => {
                handleAutoSave();
            }, 2000);
        },
        editorProps: {
            attributes: {
                class: [
                    'prose',
                    'prose-lg',
                    'max-w-none',
                    'focus:outline-none',
                    'min-h-[600px]',
                    'p-8',
                    'bg-white',
                    'text-black',
                    'rounded-2xl',
                    'border-2',
                    'border-neutral-200',
                    'shadow-sm',
                    '[&_p]:text-black',
                    '[&_p]:my-2',
                    '[&_h1]:text-black',
                    '[&_h1]:text-4xl',
                    '[&_h1]:font-bold',
                    '[&_h1]:my-4',
                    '[&_h2]:text-black',
                    '[&_h2]:text-3xl',
                    '[&_h2]:font-bold',
                    '[&_h2]:my-3',
                    '[&_h3]:text-black',
                    '[&_h3]:text-2xl',
                    '[&_h3]:font-bold',
                    '[&_h3]:my-3',
                    '[&_ul]:list-disc',
                    '[&_ul]:ml-6',
                    '[&_ul]:my-2',
                    '[&_ul]:text-black',
                    '[&_ol]:list-decimal',
                    '[&_ol]:ml-6',
                    '[&_ol]:my-2',
                    '[&_ol]:text-black',
                    '[&_li]:text-black',
                    '[&_li]:my-1',
                    '[&_strong]:font-bold',
                    '[&_strong]:text-black',
                    '[&_em]:italic',
                    '[&_em]:text-black',
                    '[&_u]:underline',
                    '[&_code]:bg-neutral-100',
                    '[&_code]:px-2',
                    '[&_code]:py-1',
                    '[&_code]:rounded',
                    '[&_code]:text-sm',
                    '[&_code]:font-mono',
                    '[&_code]:text-black',
                    '[&_pre]:bg-neutral-100',
                    '[&_pre]:p-4',
                    '[&_pre]:rounded-xl',
                    '[&_pre]:my-4',
                    '[&_pre]:overflow-x-auto',
                    '[&_pre]:text-black',
                    '[&_blockquote]:border-l-4',
                    '[&_blockquote]:border-indigo-500',
                    '[&_blockquote]:pl-4',
                    '[&_blockquote]:italic',
                    '[&_blockquote]:my-4',
                    '[&_blockquote]:text-black',
                    '[&_a]:text-indigo-600',
                    '[&_a]:underline',
                    '[&_a]:hover:text-indigo-700',
                    '[&_table]:border-collapse',
                    '[&_table]:w-full',
                    '[&_table]:my-4',
                    '[&_table]:text-black',
                    '[&_td]:border-2',
                    '[&_td]:border-neutral-300',
                    '[&_td]:p-3',
                    '[&_th]:border-2',
                    '[&_th]:border-neutral-300',
                    '[&_th]:p-3',
                    '[&_th]:bg-neutral-100',
                    '[&_th]:font-bold',
                    '[&_.is-editor-empty:before]:content-[attr(data-placeholder)]',
                    '[&_.is-editor-empty:before]:text-neutral-400',
                    '[&_.is-editor-empty:before]:float-left',
                    '[&_.is-editor-empty:before]:h-0',
                    '[&_.is-editor-empty:before]:pointer-events-none',
                ].join(' '),
            },
            handleKeyDown: (view, event) => {
                if (event.key === '/') {
                    const { selection } = view.state;
                    const coords = view.coordsAtPos(selection.from);
                    // Simple offset for demonstration, real implementation needs more reliable positioning
                    setSlashMenuPosition({
                        x: coords.left,
                        y: coords.bottom + 10,
                    });
                    setShowSlashMenu(true);
                    return false; // Let tiptap process it initially
                }
                if (
                    showSlashMenu &&
                    (event.key === 'Escape' || event.key === 'Enter')
                ) {
                    setShowSlashMenu(false);
                }
                return false;
            },
        },
        // IMPORTANT: Prevent TipTap from completely remounting on every dependency change
        immediatelyRender: false,
    });

    // Auto-save simulation
    const handleAutoSave = useCallback(async () => {
        if (!data.title || !data.content) return;
        setIsSaving(true);
        // Simulate network delay
        setTimeout(() => {
            setLastSaved(new Date());
            setIsSaving(false);
        }, 800);
    }, [data.title, data.content]);

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;
            if (SpeechRecognition && !recognition) {
                const rec = new SpeechRecognition();
                rec.continuous = true;
                rec.interimResults = true;
                rec.lang = 'id-ID';

                rec.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        i++
                    ) {
                        if (event.results[i].isFinal) {
                            finalTranscript +=
                                event.results[i][0].transcript + ' ';
                        }
                    }
                    if (finalTranscript && editor) {
                        editor.commands.insertContent(finalTranscript);
                    }
                };
                rec.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsRecording(false);
                };
                rec.onend = () => {
                    // Try to restart if we still want to record
                    if (isRecording) {
                        try {
                            rec.start();
                        } catch (e) {}
                    }
                };
                setRecognition(rec);
            }
        }
    }, [editor]); // Remove isRecording from dependencies to prevent constant recreation

    // Toggle Recording
    const toggleRecording = () => {
        if (!recognition) {
            alert('Speech recognition tidak didukung di browser ini');
            return;
        }
        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            try {
                recognition.start();
                setIsRecording(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    // Apply Template
    const applyTemplate = (template: Template) => {
        if (editor) {
            editor.commands.setContent(template.content);
            setData('content', template.content);
        }
        setShowTemplates(false);
    };

    // AI Writing Assistant Action Trigger
    const handleAIAssist = async (
        action: 'improve' | 'summarize' | 'expand' | 'simplify',
    ) => {
        if (!editor || isAILoading) return;
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
        );
        if (!selectedText) {
            alert('Pilih teks terlebih dahulu untuk menggunakan AI.');
            return;
        }

        setIsAILoading(true);
        // Tampilkan indikator loading di dalam editor
        editor.commands.insertContent(' 🤖 [AI sedang berpikir...] ');

        try {
            const response = await axios.post(
                '/user/akademik/catatan/ai-process',
                {
                    action: action,
                    text: selectedText,
                },
            );

            if (response.data.success) {
                // Hapus tulisan loading dan ganti dengan hasil AI
                editor.commands.undo(); // Undo the "sedang berpikir..." text
                editor.commands.insertContent(
                    `\n\n**[AI ${action}]:**\n${response.data.result}\n\n`,
                );
            } else {
                editor.commands.undo();
                alert(response.data.error || 'Gagal memproses AI.');
            }
        } catch (error) {
            console.error('AI Processing Error:', error);
            editor.commands.undo();
            alert('Terjadi kesalahan koneksi ke server AI.');
        } finally {
            setIsAILoading(false);
            setShowAIAssistant(false);
        }
    };

    // Submit Form
    const isEffectivelyEmptyContent = (html: string) => {
        const cleaned = html
            .replace(/<p><\/p>/g, '')
            .replace(/<p>\s*<\/p>/g, '')
            .replace(/<br\s*\/?>/g, '')
            .replace(/&nbsp;/g, '')
            .replace(/<[^>]*>/g, '')
            .trim();

        return cleaned.length === 0;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!isEditing && currentStep < 2) {
            if (data.course_id && data.meeting_number) {
                setCurrentStep(2);
            } else {
                alert('Pilih mata kuliah dan pertemuan terlebih dahulu.');
            }
            return;
        }

        if (!String(data.title || '').trim()) {
            alert('Judul catatan wajib diisi.');
            return;
        }

        if (isEffectivelyEmptyContent(String(data.content || ''))) {
            alert(
                'Konten catatan masih kosong. Silakan isi catatan terlebih dahulu.',
            );
            return;
        }

        const submitOptions = {
            preserveScroll: true,
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            onError: () => {
                alert(
                    'Catatan gagal disimpan. Periksa kembali data wajib pada form.',
                );
            },
        };

        if (isEditing && note) {
            transform((formData) => ({
                ...formData,
                _token: getCsrfToken(),
                mahasiswa_course_id: formData.course_id,
                meeting_number: Number(formData.meeting_number),
            }));
            patch(`/user/akademik/catatan/${note.id}`, submitOptions);
        } else {
            transform((formData) => ({
                ...formData,
                _token: getCsrfToken(),
                mahasiswa_course_id: formData.course_id,
                meeting_number: Number(formData.meeting_number),
            }));
            post(`/user/akademik/catatan`, submitOptions);
        }
    };

    // Word count & reading time
    const wordCount = editor?.storage.characterCount.words() || 0;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <StudentLayout>
            <Head title={isEditing ? 'Edit Catatan' : 'Tambah Catatan Baru'} />

            <div
                className={`min-h-screen pb-24 transition-colors duration-500 ${isFocusMode ? 'bg-neutral-50 dark:bg-neutral-950' : ''}`}
            >
                {/* TOP NAVIGATION BAR */}
                {!isFocusMode && (
                    <div className="sticky top-0 z-50 animate-in border-b border-white/20 bg-white/80 backdrop-blur-xl duration-500 slide-in-from-top dark:border-white/5 dark:bg-neutral-900/80">
                        <div className="mx-auto max-w-7xl px-6 py-4">
                            <div className="flex items-center justify-between">
                                {/* Left: Back & Title */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            router.visit(
                                                '/user/akademik/catatan',
                                            )
                                        }
                                        className="rounded-xl p-2 transition-colors hover:scale-105 hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-800"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                            <NoteIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                {isEditing
                                                    ? 'Edit Catatan'
                                                    : 'Catatan Baru'}
                                            </h1>
                                            {lastSaved && (
                                                <p className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-3 w-3 text-emerald-500" />
                                                            Tersimpan{' '}
                                                            {lastSaved.toLocaleTimeString()}
                                                        </>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Stats */}
                                    <div className="hidden items-center gap-4 rounded-xl bg-neutral-100 px-4 py-2 text-sm md:flex dark:bg-neutral-800">
                                        <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                            <FileText className="h-4 w-4" />
                                            {wordCount} kata
                                        </span>
                                        <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                            <Clock className="h-4 w-4" />
                                            {readingTime} min
                                        </span>
                                    </div>

                                    {/* Voice Recording */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={toggleRecording}
                                        className={`rounded-xl p-3 transition-all ${
                                            isRecording
                                                ? 'animate-pulse bg-rose-500 text-white'
                                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                        }`}
                                    >
                                        {isRecording ? (
                                            <MicOff className="h-5 w-5" />
                                        ) : (
                                            <Mic className="h-5 w-5" />
                                        )}
                                    </motion.button>

                                    {/* AI Assistant Toggle (can trigger a side panel or modal in full implementation) */}
                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setShowAIAssistant(
                                                    !showAIAssistant,
                                                )
                                            }
                                            disabled={isAILoading}
                                            className={`rounded-xl p-3 transition-all ${
                                                showAIAssistant || isAILoading
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                            } ${isAILoading ? 'animate-pulse' : ''}`}
                                            title="AI Content Assistant"
                                        >
                                            {isAILoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-5 w-5" />
                                            )}
                                        </motion.button>

                                        {/* AI Quick Menu (Dropdown) */}
                                        <AnimatePresence>
                                            {showAIAssistant &&
                                                !isAILoading && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.95,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            scale: 0.95,
                                                            y: 10,
                                                        }}
                                                        className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                                                    >
                                                        <div className="border-b border-neutral-100 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2 dark:border-neutral-800">
                                                            <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                                AI Actions
                                                            </span>
                                                        </div>
                                                        <div className="p-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleAIAssist(
                                                                        'improve',
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                            >
                                                                <Check className="h-4 w-4 text-emerald-500" />{' '}
                                                                Sempurnakan EYD
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleAIAssist(
                                                                        'summarize',
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                            >
                                                                <AlignLeft className="h-4 w-4 text-amber-500" />{' '}
                                                                Ringkas Inti
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleAIAssist(
                                                                        'expand',
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                            >
                                                                <Maximize2 className="h-4 w-4 text-indigo-500" />{' '}
                                                                Elaborasi Konsep
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleAIAssist(
                                                                        'simplify',
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                            >
                                                                <Minimize2 className="h-4 w-4 text-rose-500" />{' '}
                                                                Sederhanakan
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Focus Mode */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            setIsFocusMode(!isFocusMode)
                                        }
                                        className="rounded-xl bg-neutral-100 p-3 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                    >
                                        {isFocusMode ? (
                                            <Minimize2 className="h-5 w-5" />
                                        ) : (
                                            <Maximize2 className="h-5 w-5" />
                                        )}
                                    </motion.button>

                                    {/* Save Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                Simpan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TEMPLATE SELECTOR MODAL */}
                <AnimatePresence>
                    {showTemplates && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowTemplates(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white p-8 shadow-2xl backdrop-blur-xl dark:bg-neutral-900"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            Pilih Template
                                        </h2>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Mulai dengan template atau buat dari
                                            awal
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowTemplates(false)}
                                        className="rounded-xl p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <X className="h-5 w-5 text-neutral-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Blank Template */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowTemplates(false)}
                                        className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 p-6 text-left transition-all hover:border-indigo-500 dark:border-neutral-700"
                                    >
                                        <div className="flex h-full flex-col items-center justify-center text-center">
                                            <div className="mb-4 rounded-2xl bg-neutral-100 p-4 transition-colors group-hover:bg-indigo-100 dark:bg-neutral-800 dark:group-hover:bg-indigo-900/30">
                                                <FileText className="h-8 w-8 text-neutral-600 group-hover:text-indigo-600 dark:text-neutral-400 dark:group-hover:text-indigo-400" />
                                            </div>
                                            <h3 className="mb-1 font-bold text-neutral-900 dark:text-white">
                                                Blank
                                            </h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Mulai dari awal
                                            </p>
                                        </div>
                                    </motion.button>

                                    {/* Pre-built Templates */}
                                    {templates?.map((template, index) => (
                                        <motion.button
                                            key={template.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                applyTemplate(template)
                                            }
                                            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 text-left transition-all hover:border-indigo-500 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-800"
                                        >
                                            <div className="mb-4 w-fit rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                                                {/* In real implementation, render proper icon based on string */}
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <h3 className="mb-1 font-bold text-neutral-900 dark:text-white">
                                                {template.name}
                                            </h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {template.description}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MAIN EDITOR AREA */}
                <div
                    className={`${isFocusMode ? 'mx-auto max-w-4xl py-12' : 'mx-auto mt-6 max-w-5xl p-6'}`}
                >
                    {!isFocusMode && !isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 rounded-3xl border border-white/40 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <div className="flex w-max min-w-full items-center gap-2 sm:justify-center">
                                    {[
                                        {
                                            id: 1,
                                            label: 'Informasi Dasar',
                                            icon: FileText,
                                        },
                                        {
                                            id: 2,
                                            label: 'Editor Catatan',
                                            icon: NoteIcon,
                                        },
                                    ].map((s, index) => {
                                        const StepIcon = s.icon;
                                        const step1Complete = Boolean(
                                            data.course_id &&
                                                data.meeting_number,
                                        );
                                        const step2Complete = Boolean(
                                            data.title.trim() &&
                                                data.content.trim(),
                                        );
                                        const completedByStep: Record<
                                            number,
                                            boolean
                                        > = {
                                            1: step1Complete,
                                            2: step2Complete,
                                        };
                                        const maxUnlockedStep = step1Complete
                                            ? 2
                                            : 1;
                                        const isActive = currentStep === s.id;
                                        const isDone =
                                            s.id < currentStep &&
                                            completedByStep[s.id];
                                        const canOpen =
                                            s.id === 1 ||
                                            s.id <= maxUnlockedStep ||
                                            s.id <= currentStep;

                                        return (
                                            <div
                                                key={s.id}
                                                className="flex shrink-0 items-center gap-2"
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        if (!canOpen) {
                                                            window.alert(
                                                                'Lengkapi langkah sebelumnya dulu.',
                                                            );
                                                            return;
                                                        }
                                                        setCurrentStep(s.id);
                                                    }}
                                                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm ${
                                                        isActive
                                                            ? 'border-indigo-400 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                                            : isDone
                                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                              : 'border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-700 dark:bg-neutral-800/40'
                                                    } ${canOpen ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'}`}
                                                >
                                                    {isDone ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <StepIcon className="h-4 w-4" />
                                                    )}
                                                    <span className="whitespace-nowrap">
                                                        {s.label}
                                                    </span>
                                                </motion.button>
                                                {index < 1 && (
                                                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Meta Data */}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 &&
                                !isFocusMode &&
                                !isEditing && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="rounded-3xl border border-white/40 bg-white/40 p-8 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                    >
                                        <h2 className="mb-6 text-xl font-bold text-neutral-900 dark:text-white">
                                            Informasi Dasar
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                                    Mata Kuliah
                                                </label>
                                                <select
                                                    value={data.course_id}
                                                    required
                                                    onChange={(e) => {
                                                        setData(
                                                            'course_id',
                                                            e.target.value,
                                                        );
                                                        setData(
                                                            'mahasiswa_course_id',
                                                            e.target.value,
                                                        );
                                                    }}
                                                    className="h-12 w-full rounded-xl border border-white/40 bg-white/60 px-4 text-neutral-900 backdrop-blur-lg transition-all outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                                                >
                                                    <option value="">
                                                        Pilih Mata Kuliah
                                                    </option>
                                                    {courses.map((course) => (
                                                        <option
                                                            key={course.id}
                                                            value={course.id}
                                                        >
                                                            {course.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {(errors.course_id ||
                                                    errors.mahasiswa_course_id) && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.course_id ||
                                                            errors.mahasiswa_course_id}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                                    Pertemuan
                                                </label>
                                                <select
                                                    value={data.meeting_number}
                                                    required
                                                    onChange={(e) =>
                                                        setData(
                                                            'meeting_number',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-12 w-full rounded-xl border border-white/40 bg-white/60 px-4 text-neutral-900 backdrop-blur-lg transition-all outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                                                >
                                                    <option value="">
                                                        Pilih Pertemuan
                                                    </option>
                                                    {Array.from(
                                                        { length: 16 },
                                                        (_, i) => i + 1,
                                                    ).map((num) => (
                                                        <option
                                                            key={num}
                                                            value={num}
                                                        >
                                                            Pertemuan {num}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.meeting_number && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.meeting_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        data.course_id &&
                                                        data.meeting_number
                                                    )
                                                        setCurrentStep(2);
                                                    else
                                                        alert(
                                                            'Mohon lengkapi form instruksi dasar',
                                                        );
                                                }}
                                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
                                            >
                                                Mulai Menulis
                                                <ArrowRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                        </AnimatePresence>

                        {/* Step 2: Editor */}
                        <AnimatePresence mode="wait">
                            {currentStep >= 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    {/* Title Input */}
                                    <div className="px-6">
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="Judul catatan yang meyakinkan..."
                                            className={`w-full border-none bg-transparent text-4xl font-extrabold text-neutral-900 placeholder:text-neutral-300 focus:ring-0 focus:outline-none dark:text-white dark:placeholder:text-neutral-700 ${
                                                isFocusMode ? 'mb-4' : 'mb-0'
                                            }`}
                                        />
                                        {errors.title && (
                                            <p className="mt-2 text-sm text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {editor && (
                                        <div
                                            className={`relative ${isFocusMode ? '' : 'overflow-hidden rounded-3xl border border-white/40 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40'}`}
                                        >
                                            {/* Editor Toolbar (Notion Style, Sticky below header) */}
                                            {!isFocusMode && (
                                                <div className="border-b border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Font Family */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowFontFamily(
                                                                        !showFontFamily,
                                                                    )
                                                                }
                                                                className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                                                            >
                                                                <Type className="h-4 w-4" />
                                                                <span>
                                                                    Font
                                                                </span>
                                                                <ChevronDown className="h-3 w-3" />
                                                            </button>
                                                            {showFontFamily && (
                                                                <div className="absolute top-full left-0 z-50 mt-1 max-h-64 w-48 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                                                                    {fontFamilies.map(
                                                                        (
                                                                            font,
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    font.value
                                                                                }
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    editor
                                                                                        .chain()
                                                                                        .focus()
                                                                                        .setFontFamily(
                                                                                            font.value,
                                                                                        )
                                                                                        .run();
                                                                                    setShowFontFamily(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                                                style={{
                                                                                    fontFamily:
                                                                                        font.value,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    font.name
                                                                                }
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Font Size */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowFontSize(
                                                                        !showFontSize,
                                                                    )
                                                                }
                                                                className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                                                            >
                                                                <span>
                                                                    Size
                                                                </span>
                                                                <ChevronDown className="h-3 w-3" />
                                                            </button>
                                                            {showFontSize && (
                                                                <div className="absolute top-full left-0 z-50 mt-1 max-h-64 w-24 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                                                                    {fontSizes.map(
                                                                        (
                                                                            size,
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    size
                                                                                }
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    editor
                                                                                        .chain()
                                                                                        .focus()
                                                                                        .setMark(
                                                                                            'textStyle',
                                                                                            {
                                                                                                fontSize: `${size}pt`,
                                                                                            },
                                                                                        )
                                                                                        .run();
                                                                                    setShowFontSize(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                                            >
                                                                                {
                                                                                    size
                                                                                }
                                                                                pt
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Text Formatting */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleBold()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'bold',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Bold (Ctrl+B)"
                                                        >
                                                            <Bold className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleItalic()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'italic',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Italic (Ctrl+I)"
                                                        >
                                                            <Italic className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleUnderline()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'underline',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Underline (Ctrl+U)"
                                                        >
                                                            <UnderlineIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleStrike()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'strike',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Strikethrough"
                                                        >
                                                            <Strikethrough className="h-4 w-4" />
                                                        </button>

                                                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Text Color */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowColorPicker(
                                                                        !showColorPicker,
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                                title="Text Color"
                                                            >
                                                                <div className="flex flex-col items-center">
                                                                    <Type className="h-4 w-4" />
                                                                    <div
                                                                        className="mt-0.5 h-1 w-4 rounded"
                                                                        style={{
                                                                            backgroundColor:
                                                                                selectedColor,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </button>
                                                            {showColorPicker && (
                                                                <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                                                                    <HexColorPicker
                                                                        color={
                                                                            selectedColor
                                                                        }
                                                                        onChange={
                                                                            setSelectedColor
                                                                        }
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .setColor(
                                                                                    selectedColor,
                                                                                )
                                                                                .run();
                                                                            setShowColorPicker(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Background Color */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowBgColorPicker(
                                                                        !showBgColorPicker,
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                                title="Highlight Color"
                                                            >
                                                                <Palette className="h-4 w-4" />
                                                            </button>
                                                            {showBgColorPicker && (
                                                                <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                                                                    <HexColorPicker
                                                                        color={
                                                                            selectedBgColor
                                                                        }
                                                                        onChange={
                                                                            setSelectedBgColor
                                                                        }
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .toggleHighlight(
                                                                                    {
                                                                                        color: selectedBgColor,
                                                                                    },
                                                                                )
                                                                                .run();
                                                                            setShowBgColorPicker(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Alignment */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .setTextAlign(
                                                                        'left',
                                                                    )
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    {
                                                                        textAlign:
                                                                            'left',
                                                                    },
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Align Left"
                                                        >
                                                            <AlignLeft className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .setTextAlign(
                                                                        'center',
                                                                    )
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    {
                                                                        textAlign:
                                                                            'center',
                                                                    },
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Align Center"
                                                        >
                                                            <AlignCenter className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .setTextAlign(
                                                                        'right',
                                                                    )
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    {
                                                                        textAlign:
                                                                            'right',
                                                                    },
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Align Right"
                                                        >
                                                            <AlignRight className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .setTextAlign(
                                                                        'justify',
                                                                    )
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    {
                                                                        textAlign:
                                                                            'justify',
                                                                    },
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Justify"
                                                        >
                                                            <AlignJustify className="h-4 w-4" />
                                                        </button>

                                                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Lists */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleBulletList()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'bulletList',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Bullet List"
                                                        >
                                                            <List className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleOrderedList()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'orderedList',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Numbered List"
                                                        >
                                                            <ListOrdered className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleTaskList()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'taskList',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Checklist"
                                                        >
                                                            <CheckSquare className="h-4 w-4" />
                                                        </button>

                                                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Insert */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const url =
                                                                    prompt(
                                                                        'Enter URL:',
                                                                    );
                                                                if (url)
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .setLink(
                                                                            {
                                                                                href: url,
                                                                            },
                                                                        )
                                                                        .run();
                                                            }}
                                                            className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Insert Link"
                                                        >
                                                            <LinkIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const url =
                                                                    prompt(
                                                                        'Enter Image URL:',
                                                                    );
                                                                if (url)
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .setImage(
                                                                            {
                                                                                src: url,
                                                                            },
                                                                        )
                                                                        .run();
                                                            }}
                                                            className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Insert Image"
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .insertTable(
                                                                        {
                                                                            rows: 3,
                                                                            cols: 3,
                                                                            withHeaderRow: true,
                                                                        },
                                                                    )
                                                                    .run()
                                                            }
                                                            className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Insert Table"
                                                        >
                                                            <TableIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleCodeBlock()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'codeBlock',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Code Block"
                                                        >
                                                            <Code className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .toggleBlockquote()
                                                                    .run()
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                                                editor.isActive(
                                                                    'blockquote',
                                                                )
                                                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                                                    : ''
                                                            }`}
                                                            title="Quote"
                                                        >
                                                            <Quote className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                editor
                                                                    .chain()
                                                                    .focus()
                                                                    .setHorizontalRule()
                                                                    .run()
                                                            }
                                                            className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Horizontal Line"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>

                                                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Smart Features */}
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                toggleRecording
                                                            }
                                                            className={`rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : ''}`}
                                                            title="Voice Typing"
                                                        >
                                                            {isRecording ? (
                                                                <MicOff className="h-4 w-4" />
                                                            ) : (
                                                                <Mic className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAIAssist(
                                                                    'improve',
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-purple-600 hover:bg-neutral-200 dark:text-purple-400 dark:hover:bg-neutral-700"
                                                            title="AI Improve"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {/* Table Controls (shown when table is active) */}
                                                    {editor.isActive(
                                                        'table',
                                                    ) && (
                                                        <div className="mt-2 flex items-center gap-2 border-t border-neutral-200 pt-2 dark:border-neutral-700">
                                                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                                Table:
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .addRowBefore()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Row Above
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .addRowAfter()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Row Below
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .deleteRow()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                            >
                                                                Delete Row
                                                            </button>
                                                            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600" />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .addColumnBefore()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Column Left
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .addColumnAfter()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Column Right
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .deleteColumn()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                            >
                                                                Delete Column
                                                            </button>
                                                            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600" />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .mergeCells()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Merge Cells
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editor
                                                                        .chain()
                                                                        .focus()
                                                                        .deleteTable()
                                                                        .run()
                                                                }
                                                                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                            >
                                                                Delete Table
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tiptap Output */}
                                            <div className="relative min-h-[500px]">
                                                <EditorContent
                                                    editor={editor}
                                                    className={
                                                        isPreview
                                                            ? 'opacity-80'
                                                            : ''
                                                    }
                                                />

                                                {/* BubbleMenu for AI Assist */}
                                                {editor && (
                                                    <BubbleMenu
                                                        editor={editor}
                                                        className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:bg-neutral-800/95"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAIAssist(
                                                                    'improve',
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-purple-600 transition-colors hover:bg-neutral-100 dark:text-purple-400 dark:hover:bg-neutral-700"
                                                        >
                                                            <Sparkles className="h-3.5 w-3.5" />{' '}
                                                            Improve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAIAssist(
                                                                    'summarize',
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-neutral-100 dark:text-blue-400 dark:hover:bg-neutral-700"
                                                        >
                                                            <Zap className="h-3.5 w-3.5" />{' '}
                                                            Summarize
                                                        </button>
                                                    </BubbleMenu>
                                                )}

                                                {/* Slash Menu Floating Context */}
                                                <AnimatePresence>
                                                    {showSlashMenu && (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.95,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                scale: 0.95,
                                                            }}
                                                            style={{
                                                                left: slashMenuPosition.x,
                                                                top: slashMenuPosition.y,
                                                            }}
                                                            className="absolute z-[100] w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800"
                                                        >
                                                            <div className="border-b border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900/50">
                                                                <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                                    Basic Blocks
                                                                </p>
                                                            </div>
                                                            <div className="max-h-64 overflow-y-auto p-1">
                                                                {[
                                                                    {
                                                                        title: 'Heading 1',
                                                                        desc: 'Big section heading',
                                                                        icon: Heading1,
                                                                        action: () =>
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .toggleHeading(
                                                                                    {
                                                                                        level: 1,
                                                                                    },
                                                                                )
                                                                                .run(),
                                                                    },
                                                                    {
                                                                        title: 'Heading 2',
                                                                        desc: 'Medium section heading',
                                                                        icon: Heading2,
                                                                        action: () =>
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .toggleHeading(
                                                                                    {
                                                                                        level: 2,
                                                                                    },
                                                                                )
                                                                                .run(),
                                                                    },
                                                                    {
                                                                        title: 'To-do list',
                                                                        desc: 'Track tasks',
                                                                        icon: CheckSquare,
                                                                        action: () =>
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .toggleTaskList()
                                                                                .run(),
                                                                    },
                                                                    {
                                                                        title: 'Bulleted list',
                                                                        desc: 'Create a simple list',
                                                                        icon: List,
                                                                        action: () =>
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .toggleBulletList()
                                                                                .run(),
                                                                    },
                                                                    {
                                                                        title: 'Code',
                                                                        desc: 'Capture a code snippet',
                                                                        icon: Code,
                                                                        action: () =>
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .toggleCodeBlock()
                                                                                .run(),
                                                                    },
                                                                    {
                                                                        title: 'Table',
                                                                        desc: 'Insert a basic grid',
                                                                        icon: TableIcon,
                                                                        action: () =>
                                                                            editor
                                                                                .chain()
                                                                                .focus()
                                                                                .insertTable(
                                                                                    {
                                                                                        rows: 3,
                                                                                        cols: 3,
                                                                                        withHeaderRow: true,
                                                                                    },
                                                                                )
                                                                                .run(),
                                                                    },
                                                                ].map(
                                                                    (
                                                                        item,
                                                                        i,
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                i
                                                                            }
                                                                            type="button"
                                                                            onClick={() => {
                                                                                item.action();
                                                                                setShowSlashMenu(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                                        >
                                                                            <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800">
                                                                                <item.icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                                    {
                                                                                        item.title
                                                                                    }
                                                                                </h4>
                                                                                <p className="text-xs text-neutral-500">
                                                                                    {
                                                                                        item.desc
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>
            </div>
        </StudentLayout>
    );
}
