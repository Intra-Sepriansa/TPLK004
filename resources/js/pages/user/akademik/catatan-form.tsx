import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState, useRef, useEffect, useCallback } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Save, X, Eye, EyeOff, Maximize2, Minimize2,
    Mic, MicOff, Sparkles, FileText, Image as ImageIcon,
    Code, Table as TableIcon, CheckSquare, Quote, Heading1, Heading2, Heading3,
    List, ListOrdered, Link as LinkIcon, Divide,
    Clock, TrendingUp, Zap, ArrowLeft, Loader2, Check, ArrowRight,
    Bold, Italic, Strikethrough, Highlighter
} from 'lucide-react';

// TipTap Editor
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';

import { common, createLowlight } from 'lowlight';
import { HexColorPicker } from "react-colorful";

// Assuming catastrophic Icon missing, let's use Lucide's Note icon
import {
    Book as NoteIcon,
    Type,
    ChevronDown,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Minus,
    Underline as UnderlineIcon
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

export default function CatatanForm({ note, courses = [], templates = [], initialCourseId = null }: Props) {
    const isEditing = !!note;
    const resolvedCourseId = note?.course_id ?? note?.mahasiswa_course_id ?? initialCourseId ?? '';
    const getCsrfToken = () => {
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) return metaToken;

        const cookieMatch = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        return cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
    };

    // Form state
    const { data, setData, transform, post, patch, processing, errors } = useForm({
        _token: getCsrfToken(),
        course_id: resolvedCourseId ? String(resolvedCourseId) : '',
        mahasiswa_course_id: resolvedCourseId ? String(resolvedCourseId) : '',
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
            transition: { staggerChildren: 0.04, delayChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 } as any
        }
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

    const fontSizes = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];

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
                    'prose', 'prose-lg', 'max-w-none', 'focus:outline-none', 'min-h-[600px]', 'p-8',
                    'bg-white', 'text-black',
                    'rounded-2xl', 'border-2', 'border-neutral-200', 'shadow-sm',
                    '[&_p]:text-black', '[&_p]:my-2',
                    '[&_h1]:text-black', '[&_h1]:text-4xl', '[&_h1]:font-bold', '[&_h1]:my-4',
                    '[&_h2]:text-black', '[&_h2]:text-3xl', '[&_h2]:font-bold', '[&_h2]:my-3',
                    '[&_h3]:text-black', '[&_h3]:text-2xl', '[&_h3]:font-bold', '[&_h3]:my-3',
                    '[&_ul]:list-disc', '[&_ul]:ml-6', '[&_ul]:my-2', '[&_ul]:text-black',
                    '[&_ol]:list-decimal', '[&_ol]:ml-6', '[&_ol]:my-2', '[&_ol]:text-black',
                    '[&_li]:text-black', '[&_li]:my-1',
                    '[&_strong]:font-bold', '[&_strong]:text-black',
                    '[&_em]:italic', '[&_em]:text-black',
                    '[&_u]:underline',
                    '[&_code]:bg-neutral-100', '[&_code]:px-2', '[&_code]:py-1', '[&_code]:rounded', '[&_code]:text-sm', '[&_code]:font-mono', '[&_code]:text-black',
                    '[&_pre]:bg-neutral-100', '[&_pre]:p-4', '[&_pre]:rounded-xl', '[&_pre]:my-4', '[&_pre]:overflow-x-auto', '[&_pre]:text-black',
                    '[&_blockquote]:border-l-4', '[&_blockquote]:border-indigo-500', '[&_blockquote]:pl-4', '[&_blockquote]:italic', '[&_blockquote]:my-4', '[&_blockquote]:text-black',
                    '[&_a]:text-indigo-600', '[&_a]:underline', '[&_a]:hover:text-indigo-700',
                    '[&_table]:border-collapse', '[&_table]:w-full', '[&_table]:my-4', '[&_table]:text-black',
                    '[&_td]:border-2', '[&_td]:border-neutral-300', '[&_td]:p-3',
                    '[&_th]:border-2', '[&_th]:border-neutral-300', '[&_th]:p-3', '[&_th]:bg-neutral-100', '[&_th]:font-bold',
                    '[&_.is-editor-empty:before]:content-[attr(data-placeholder)]', '[&_.is-editor-empty:before]:text-neutral-400', '[&_.is-editor-empty:before]:float-left', '[&_.is-editor-empty:before]:h-0', '[&_.is-editor-empty:before]:pointer-events-none'
                ].join(' '),
            },
            handleKeyDown: (view, event) => {
                if (event.key === '/') {
                    const { selection } = view.state;
                    const coords = view.coordsAtPos(selection.from);
                    // Simple offset for demonstration, real implementation needs more reliable positioning
                    setSlashMenuPosition({ x: coords.left, y: coords.bottom + 10 });
                    setShowSlashMenu(true);
                    return false; // Let tiptap process it initially
                }
                if (showSlashMenu && (event.key === 'Escape' || event.key === 'Enter')) {
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
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition && !recognition) {
                const rec = new SpeechRecognition();
                rec.continuous = true;
                rec.interimResults = true;
                rec.lang = 'id-ID';

                rec.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript + ' ';
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
                        try { rec.start(); } catch (e) { }
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
    const handleAIAssist = async (action: 'improve' | 'summarize' | 'expand' | 'simplify') => {
        if (!editor || isAILoading) return;
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );
        if (!selectedText) {
            alert('Pilih teks terlebih dahulu untuk menggunakan AI.');
            return;
        }

        setIsAILoading(true);
        // Tampilkan indikator loading di dalam editor
        editor.commands.insertContent(' 🤖 [AI sedang berpikir...] ');

        try {
            const response = await axios.post('/user/akademik/catatan/ai-process', {
                action: action,
                text: selectedText
            });

            if (response.data.success) {
                // Hapus tulisan loading dan ganti dengan hasil AI
                editor.commands.undo(); // Undo the "sedang berpikir..." text
                editor.commands.insertContent(`\n\n**[AI ${action}]:**\n${response.data.result}\n\n`);
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
            alert('Konten catatan masih kosong. Silakan isi catatan terlebih dahulu.');
            return;
        }

        const submitOptions = {
            preserveScroll: true,
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            onError: () => {
                alert('Catatan gagal disimpan. Periksa kembali data wajib pada form.');
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
                    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-white/20 dark:border-white/5 animate-in slide-in-from-top duration-500">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex items-center justify-between">
                                {/* Left: Back & Title */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => router.visit('/user/akademik/catatan')}
                                        className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hover:scale-105 active:scale-95"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                            <NoteIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                {isEditing ? 'Edit Catatan' : 'Catatan Baru'}
                                            </h1>
                                            {lastSaved && (
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-3 w-3 text-emerald-500" />
                                                            Tersimpan {lastSaved.toLocaleTimeString()}
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
                                    <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm">
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
                                        className={`p-3 rounded-xl transition-all ${isRecording
                                            ? 'bg-rose-500 text-white animate-pulse'
                                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                                            }`}
                                    >
                                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </motion.button>

                                    {/* AI Assistant Toggle (can trigger a side panel or modal in full implementation) */}
                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowAIAssistant(!showAIAssistant)}
                                            disabled={isAILoading}
                                            className={`p-3 rounded-xl transition-all ${showAIAssistant || isAILoading
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                                                } ${isAILoading ? 'animate-pulse' : ''}`}
                                            title="AI Content Assistant"
                                        >
                                            {isAILoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                        </motion.button>

                                        {/* AI Quick Menu (Dropdown) */}
                                        <AnimatePresence>
                                            {showAIAssistant && !isAILoading && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-neutral-100 dark:border-neutral-800">
                                                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">AI Actions</span>
                                                    </div>
                                                    <div className="p-1">
                                                        <button onClick={() => handleAIAssist('improve')} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
                                                            <Check className="w-4 h-4 text-emerald-500" /> Sempurnakan EYD
                                                        </button>
                                                        <button onClick={() => handleAIAssist('summarize')} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
                                                            <AlignLeft className="w-4 h-4 text-amber-500" /> Ringkas Inti
                                                        </button>
                                                        <button onClick={() => handleAIAssist('expand')} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
                                                            <Maximize2 className="w-4 h-4 text-indigo-500" /> Elaborasi Konsep
                                                        </button>
                                                        <button onClick={() => handleAIAssist('simplify')} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
                                                            <Minimize2 className="w-4 h-4 text-rose-500" /> Sederhanakan
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
                                        onClick={() => setIsFocusMode(!isFocusMode)}
                                        className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                                    >
                                        {isFocusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                                    </motion.button>

                                    {/* Save Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
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
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowTemplates(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white dark:bg-neutral-900 p-8 shadow-2xl backdrop-blur-xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            Pilih Template
                                        </h2>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Mulai dengan template atau buat dari awal
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowTemplates(false)}
                                        className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <X className="h-5 w-5 text-neutral-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Blank Template */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowTemplates(false)}
                                        className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-left hover:border-indigo-500 transition-all"
                                    >
                                        <div className="flex flex-col items-center justify-center text-center h-full">
                                            <div className="mb-4 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                <FileText className="h-8 w-8 text-neutral-600 dark:text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                            </div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
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
                                            onClick={() => applyTemplate(template)}
                                            className="group relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 p-6 text-left hover:border-indigo-500 hover:shadow-lg transition-all"
                                        >
                                            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-fit">
                                                {/* In real implementation, render proper icon based on string */}
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
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
                <div className={`${isFocusMode ? 'max-w-4xl mx-auto py-12' : 'max-w-5xl mx-auto p-6 mt-6'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Step 1: Meta Data */}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && !isFocusMode && (!isEditing) && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="rounded-3xl border border-white/40 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl"
                                >
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                                        Informasi Dasar
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                                                Mata Kuliah
                                            </label>
                                            <select
                                                value={data.course_id}
                                                required
                                                onChange={(e) => {
                                                    setData('course_id', e.target.value);
                                                    setData('mahasiswa_course_id', e.target.value);
                                                }}
                                                className="w-full h-12 px-4 rounded-xl border border-white/40 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-lg focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white transition-all outline-none"
                                            >
                                                <option value="">Pilih Mata Kuliah</option>
                                                {courses.map((course) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {(errors.course_id || errors.mahasiswa_course_id) && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.course_id || errors.mahasiswa_course_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                                                Pertemuan
                                            </label>
                                            <select
                                                value={data.meeting_number}
                                                required
                                                onChange={(e) => setData('meeting_number', e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl border border-white/40 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-lg focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white transition-all outline-none"
                                            >
                                                <option value="">Pilih Pertemuan</option>
                                                {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                                                    <option key={num} value={num}>
                                                        Pertemuan {num}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.meeting_number && (
                                                <p className="mt-1 text-sm text-red-500">{errors.meeting_number}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (data.course_id && data.meeting_number) setCurrentStep(2);
                                                else alert('Mohon lengkapi form instruksi dasar');
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg transition-all"
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
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Judul catatan yang meyakinkan..."
                                            className={`w-full text-4xl font-extrabold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 text-neutral-900 dark:text-white ${isFocusMode ? 'mb-4' : 'mb-0'
                                                }`}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500 mt-2">{errors.title}</p>
                                        )}
                                    </div>

                                    {editor && (
                                        <div className={`relative ${isFocusMode ? '' : 'rounded-3xl border border-white/40 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden'}`}>

                                            {/* Editor Toolbar (Notion Style, Sticky below header) */}
                                            {!isFocusMode && (
                                                <div className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Font Family */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowFontFamily(!showFontFamily)}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-sm"
                                                            >
                                                                <Type className="h-4 w-4" />
                                                                <span>Font</span>
                                                                <ChevronDown className="h-3 w-3" />
                                                            </button>
                                                            {showFontFamily && (
                                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50 max-h-64 overflow-y-auto">
                                                                    {fontFamilies.map((font) => (
                                                                        <button
                                                                            key={font.value}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                editor.chain().focus().setFontFamily(font.value).run();
                                                                                setShowFontFamily(false);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm"
                                                                            style={{ fontFamily: font.value }}
                                                                        >
                                                                            {font.name}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Font Size */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowFontSize(!showFontSize)}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-sm"
                                                            >
                                                                <span>Size</span>
                                                                <ChevronDown className="h-3 w-3" />
                                                            </button>
                                                            {showFontSize && (
                                                                <div className="absolute top-full left-0 mt-1 w-24 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50 max-h-64 overflow-y-auto">
                                                                    {fontSizes.map((size) => (
                                                                        <button
                                                                            key={size}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                editor.chain().focus().setMark('textStyle', { fontSize: `${size}pt` }).run();
                                                                                setShowFontSize(false);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm"
                                                                        >
                                                                            {size}pt
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Text Formatting */}
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleBold().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('bold') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Bold (Ctrl+B)"
                                                        >
                                                            <Bold className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleItalic().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('italic') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Italic (Ctrl+I)"
                                                        >
                                                            <Italic className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('underline') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Underline (Ctrl+U)"
                                                        >
                                                            <UnderlineIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleStrike().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('strike') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Strikethrough"
                                                        >
                                                            <Strikethrough className="h-4 w-4" />
                                                        </button>

                                                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Text Color */}
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                                                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                                title="Text Color"
                                                            >
                                                                <div className="flex flex-col items-center">
                                                                    <Type className="h-4 w-4" />
                                                                    <div className="w-4 h-1 mt-0.5 rounded" style={{ backgroundColor: selectedColor }} />
                                                                </div>
                                                            </button>
                                                            {showColorPicker && (
                                                                <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50">
                                                                    <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            editor.chain().focus().setColor(selectedColor).run();
                                                                            setShowColorPicker(false);
                                                                        }}
                                                                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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
                                                                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                                                                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                                title="Highlight Color"
                                                            >
                                                                <Palette className="h-4 w-4" />
                                                            </button>
                                                            {showBgColorPicker && (
                                                                <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50">
                                                                    <HexColorPicker color={selectedBgColor} onChange={setSelectedBgColor} />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            editor.chain().focus().toggleHighlight({ color: selectedBgColor }).run();
                                                                            setShowBgColorPicker(false);
                                                                        }}
                                                                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Alignment */}
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Align Left"
                                                        >
                                                            <AlignLeft className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Align Center"
                                                        >
                                                            <AlignCenter className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Align Right"
                                                        >
                                                            <AlignRight className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Justify"
                                                        >
                                                            <AlignJustify className="h-4 w-4" />
                                                        </button>

                                                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Lists */}
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('bulletList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Bullet List"
                                                        >
                                                            <List className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('orderedList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Numbered List"
                                                        >
                                                            <ListOrdered className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleTaskList().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('taskList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Checklist"
                                                        >
                                                            <CheckSquare className="h-4 w-4" />
                                                        </button>

                                                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Insert */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const url = prompt('Enter URL:');
                                                                if (url) editor.chain().focus().setLink({ href: url }).run();
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Insert Link"
                                                        >
                                                            <LinkIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const url = prompt('Enter Image URL:');
                                                                if (url) editor.chain().focus().setImage({ src: url }).run();
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Insert Image"
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                                                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Insert Table"
                                                        >
                                                            <TableIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('codeBlock') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Code Block"
                                                        >
                                                            <Code className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${editor.isActive('blockquote') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                                                                }`}
                                                            title="Quote"
                                                        >
                                                            <Quote className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            title="Horizontal Line"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>

                                                        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

                                                        {/* Smart Features */}
                                                        <button
                                                            type="button"
                                                            onClick={toggleRecording}
                                                            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 ${isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : ''}`}
                                                            title="Voice Typing"
                                                        >
                                                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAIAssist('improve')}
                                                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-purple-600 dark:text-purple-400"
                                                            title="AI Improve"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {/* Table Controls (shown when table is active) */}
                                                    {editor.isActive('table') && (
                                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Table:</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().addRowBefore().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Row Above
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Row Below
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().deleteRow().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                                            >
                                                                Delete Row
                                                            </button>
                                                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().addColumnBefore().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Column Left
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Add Column Right
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                                            >
                                                                Delete Column
                                                            </button>
                                                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().mergeCells().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            >
                                                                Merge Cells
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => editor.chain().focus().deleteTable().run()}
                                                                className="px-2 py-1 text-xs rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                                            >
                                                                Delete Table
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tiptap Output */}
                                            <div className="relative min-h-[500px]">
                                                <EditorContent editor={editor} className={isPreview ? 'opacity-80' : ''} />

                                                {/* BubbleMenu for AI Assist */}
                                                {editor && (
                                                    <BubbleMenu
                                                        editor={editor}
                                                        className="flex items-center gap-1 p-1.5 rounded-xl border border-white/20 bg-white/95 dark:bg-neutral-800/95 shadow-xl backdrop-blur-xl"
                                                    >
                                                        <button type="button" onClick={() => handleAIAssist('improve')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-purple-600 dark:text-purple-400 transition-colors">
                                                            <Sparkles className="w-3.5 h-3.5" /> Improve
                                                        </button>
                                                        <button type="button" onClick={() => handleAIAssist('summarize')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-blue-600 dark:text-blue-400 transition-colors">
                                                            <Zap className="w-3.5 h-3.5" /> Summarize
                                                        </button>
                                                    </BubbleMenu>
                                                )}

                                                {/* Slash Menu Floating Context */}
                                                <AnimatePresence>
                                                    {showSlashMenu && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            style={{ left: slashMenuPosition.x, top: slashMenuPosition.y }}
                                                            className="absolute z-[100] w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                                                        >
                                                            <div className="p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Basic Blocks</p>
                                                            </div>
                                                            <div className="p-1 max-h-64 overflow-y-auto">
                                                                {[
                                                                    { title: "Heading 1", desc: "Big section heading", icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
                                                                    { title: "Heading 2", desc: "Medium section heading", icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
                                                                    { title: "To-do list", desc: "Track tasks", icon: CheckSquare, action: () => editor.chain().focus().toggleTaskList().run() },
                                                                    { title: "Bulleted list", desc: "Create a simple list", icon: List, action: () => editor.chain().focus().toggleBulletList().run() },
                                                                    { title: "Code", desc: "Capture a code snippet", icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run() },
                                                                    { title: "Table", desc: "Insert a basic grid", icon: TableIcon, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
                                                                ].map((item, i) => (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            item.action();
                                                                            setShowSlashMenu(false);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left transition-colors"
                                                                    >
                                                                        <div className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-600 flex items-center justify-center bg-white dark:bg-neutral-800">
                                                                            <item.icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-medium text-neutral-900 dark:text-white">{item.title}</h4>
                                                                            <p className="text-xs text-neutral-500">{item.desc}</p>
                                                                        </div>
                                                                    </button>
                                                                ))}
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
