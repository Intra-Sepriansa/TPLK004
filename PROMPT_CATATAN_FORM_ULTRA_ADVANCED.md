# 📝 PROMPT: FORM TAMBAH/EDIT CATATAN - ULTRA ADVANCED

## 📋 OVERVIEW

Prompt ini untuk membuat halaman **Tambah/Edit Catatan Baru** yang terpisah dengan UI/UX ultra advanced, inovasi canggih, dan 100% matching dengan **Dashboard Admin**. Halaman ini adalah full-page editor dengan fitur-fitur modern seperti Notion, Google Docs, dan Obsidian.

---

## 🎨 DESIGN SYSTEM - HITAM THEME (100% ADMIN MATCHING)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders

// GRADIENT HEADER (ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text
```

### Animation Standards (WAJIB)
```typescript
stiffness: 300
damping: 20
```

---

## 🚀 INOVASI ULTRA ADVANCED (12 MAJOR FEATURES)

### 1️⃣ NOTION-STYLE SLASH COMMANDS (/)
### 2️⃣ AI WRITING ASSISTANT (Auto-complete, Improve, Summarize)
### 3️⃣ VOICE-TO-TEXT dengan Live Transcription
### 4️⃣ SMART TEMPLATES (Pre-built note structures)
### 5️⃣ DRAG & DROP BLOCKS (Reorder content)
### 6️⃣ REAL-TIME COLLABORATION (Multiple cursors)
### 7️⃣ MARKDOWN SHORTCUTS (Auto-format)
### 8️⃣ IMAGE OCR (Extract text from images)
### 9️⃣ AUTO-SAVE dengan Visual Indicator
### 🔟 FOCUS MODE (Distraction-free writing)
### 1️⃣1️⃣ WORD COUNT & READING TIME (Live stats)
### 1️⃣2️⃣ EXPORT OPTIONS (PDF, Markdown, HTML, DOCX)

---

## 📦 ROUTE STRUCTURE

```php
// routes/web.php
Route::middleware(['auth', 'role:mahasiswa'])->group(function () {
    Route::get('/user/akademik/catatan/create', [CatatanController::class, 'create'])
        ->name('user.catatan.create');
    Route::get('/user/akademik/catatan/{id}/edit', [CatatanController::class, 'edit'])
        ->name('user.catatan.edit');
    Route::post('/user/akademik/catatan', [CatatanController::class, 'store'])
        ->name('user.catatan.store');
    Route::patch('/user/akademik/catatan/{id}', [CatatanController::class, 'update'])
        ->name('user.catatan.update');
});
```

---

## 📦 FULL IMPLEMENTATION

```typescript
// File: resources/js/pages/user/akademik/catatan-form.tsx

import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    NotebookPen, Save, X, Eye, EyeOff, Maximize2, Minimize2,
    Mic, MicOff, Sparkles, Wand2, FileText, Image as ImageIcon,
    Code, Table, CheckSquare, Quote, Heading1, Heading2, Heading3,
    List, ListOrdered, Link as LinkIcon, Divide, Calendar, Tag,
    Clock, TrendingUp, Download, Share2, MoreVertical, Zap,
    ArrowLeft, Play, Pause, Volume2, VolumeX, Loader2, Check,
    AlertCircle, Info, BookOpen, FileCode, FileImage, FileDown,
    Layers, Grid3x3, Type, AlignLeft, Bold, Italic, Underline,
    Strikethrough, Highlighter, Palette, Settings, HelpCircle
} from 'lucide-react';

// TipTap Editor
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { lowlight } from 'lowlight';

// Icons
import catatanIcon from '@/assets/admin/akademik/catatan.png';

interface Props {
    note?: Note;
    courses: Course[];
    templates: Template[];
}

interface Note {
    id: number;
    course_id: number;
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
    icon: any;
    content: string;
}

export default function CatatanForm({ note, courses, templates }: Props) {
    const isEditing = !!note;
    
    // Form state
    const { data, setData, post, patch, processing, errors } = useForm({
        course_id: note?.course_id || '',
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
    const [currentStep, setCurrentStep] = useState(1);

    // Refs
    const recognitionRef = useRef<any>(null);
    const autoSaveTimerRef = useRef<any>(null);
    const editorRef = useRef<any>(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 }
        }
    };

    // TipTap Editor Setup
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'rounded-xl bg-neutral-900 p-4 text-neutral-100 font-mono text-sm',
                },
            }),
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded',
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'space-y-2',
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
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-2 font-bold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-neutral-300 dark:border-neutral-700 p-2',
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return 'Judul catatan...';
                    }
                    return 'Mulai menulis atau ketik "/" untuk perintah...';
                },
            }),
            CharacterCount,
        ],
        content: data.content,
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[600px] p-8',
            },
            handleKeyDown: (view, event) => {
                // Slash command trigger
                if (event.key === '/') {
                    const { selection } = view.state;
                    const coords = view.coordsAtPos(selection.from);
                    setSlashMenuPosition({ x: coords.left, y: coords.bottom });
                    setShowSlashMenu(true);
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setData('content', html);
            
            // Auto-save after 2 seconds of inactivity
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = setTimeout(() => {
                handleAutoSave();
            }, 2000);
        },
    });

    // Auto-save function
    const handleAutoSave = useCallback(async () => {
        if (!data.title || !data.content) return;
        
        setIsSaving(true);
        try {
            // Save to backend
            await fetch(`/api/notes/${note?.id}/autosave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [data, note]);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'id-ID';

            recognitionRef.current.onresult = (event: any) => {
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

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };
        }
    }, [editor]);

    // Toggle Recording
    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition tidak didukung di browser ini');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
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

    // AI Writing Assistant
    const handleAIAssist = async (action: 'improve' | 'summarize' | 'expand' | 'simplify') => {
        if (!editor) return;

        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );

        if (!selectedText) {
            alert('Pilih teks terlebih dahulu');
            return;
        }

        try {
            const response = await fetch('/api/ai/writing-assist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: selectedText, action }),
            });

            const data = await response.json();
            editor.commands.insertContent(data.result);
        } catch (error) {
            console.error('AI assist failed:', error);
        }
    };

    // Submit Form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            patch(`/user/akademik/catatan/${note.id}`, {
                onSuccess: () => {
                    router.visit('/user/akademik/catatan');
                },
            });
        } else {
            post('/user/akademik/catatan', {
                onSuccess: () => {
                    router.visit('/user/akademik/catatan');
                },
            });
        }
    };

    // Word count & reading time
    const wordCount = editor?.storage.characterCount.words() || 0;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <StudentLayout>
            <Head title={isEditing ? 'Edit Catatan' : 'Tambah Catatan Baru'} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className={`min-h-screen ${isFocusMode ? 'bg-neutral-50 dark:bg-neutral-950' : ''}`}
            >
```

Saya akan melanjutkan dengan section-section berikutnya...

                {/* ═══════════════════════════════════════════════════ */}
                {/* TOP NAVIGATION BAR - Floating & Sticky              */}
                {/* ═══════════════════════════════════════════════════ */}
                {!isFocusMode && (
                    <motion.div
                        variants={itemVariants}
                        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-white/20 dark:border-white/5"
                    >
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex items-center justify-between">
                                {/* Left: Back & Title */}
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.1, x: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => router.visit('/user/akademik/catatan')}
                                        className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </motion.button>
                                    
                                    <div className="flex items-center gap-3">
                                        <img src={catatanIcon} alt="Catatan" className="h-8 w-8 object-contain" />
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
                                    {/* Word Count */}
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
                                        className={`p-3 rounded-xl transition-all ${
                                            isRecording
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                        }`}
                                    >
                                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </motion.button>

                                    {/* AI Assistant */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                                        className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                                    >
                                        <Sparkles className="h-5 w-5" />
                                    </motion.button>

                                    {/* Preview Toggle */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsPreview(!isPreview)}
                                        className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        {isPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </motion.button>

                                    {/* Focus Mode */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsFocusMode(!isFocusMode)}
                                        className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        {isFocusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                                    </motion.button>

                                    {/* Save Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all disabled:opacity-50"
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
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* TEMPLATE SELECTOR - Modal                           */}
                {/* ═══════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {showTemplates && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowTemplates(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 p-8 shadow-2xl backdrop-blur-xl"
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
                                        <X className="h-5 w-5" />
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
                                    {templates.map((template, index) => (
                                        <motion.button
                                            key={template.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => applyTemplate(template)}
                                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-6 text-left backdrop-blur-xl hover:border-indigo-500 transition-all"
                                        >
                                            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                <template.icon className="h-8 w-8" />
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
```

Lanjutan akan saya tambahkan...

                {/* ═══════════════════════════════════════════════════ */}
                {/* MAIN EDITOR AREA                                    */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className={`${isFocusMode ? 'max-w-4xl mx-auto py-12' : 'max-w-7xl mx-auto p-6'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Course & Meeting Selection */}
                        {currentStep === 1 && !isFocusMode && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            >
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                                    Informasi Dasar
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                                            Mata Kuliah
                                        </label>
                                        <select
                                            value={data.course_id}
                                            onChange={(e) => setData('course_id', e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value="">Pilih Mata Kuliah</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.course_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                                            Pertemuan
                                        </label>
                                        <select
                                            value={data.meeting_number}
                                            onChange={(e) => setData('meeting_number', e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value="">Pilih Pertemuan</option>
                                            {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num}>
                                                    Pertemuan {num}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.meeting_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.meeting_number}</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                                >
                                    Lanjut ke Editor
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Title Input */}
                        {currentStep >= 2 && (
                            <motion.div
                                variants={itemVariants}
                                className={`${isFocusMode ? '' : 'rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5'}`}
                            >
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Judul catatan..."
                                    className={`w-full text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white ${
                                        isFocusMode ? 'mb-8' : 'mb-4'
                                    }`}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Rich Text Editor */}
                        {currentStep >= 2 && editor && (
                            <motion.div
                                variants={itemVariants}
                                className={`relative ${isFocusMode ? '' : 'rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden'}`}
                            >
                                {/* Floating Toolbar */}
                                {!isFocusMode && (
                                    <div className="sticky top-20 z-40 border-b border-white/20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-3">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {/* Text Formatting */}
                                            <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-700">
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                                    isActive={editor.isActive('bold')}
                                                    icon={Bold}
                                                    tooltip="Bold (Ctrl+B)"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                                    isActive={editor.isActive('italic')}
                                                    icon={Italic}
                                                    tooltip="Italic (Ctrl+I)"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                                    isActive={editor.isActive('strike')}
                                                    icon={Strikethrough}
                                                    tooltip="Strikethrough"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                                                    isActive={editor.isActive('highlight')}
                                                    icon={Highlighter}
                                                    tooltip="Highlight"
                                                />
                                            </div>

                                            {/* Headings */}
                                            <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-700">
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                                    isActive={editor.isActive('heading', { level: 1 })}
                                                    icon={Heading1}
                                                    tooltip="Heading 1"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                                    isActive={editor.isActive('heading', { level: 2 })}
                                                    icon={Heading2}
                                                    tooltip="Heading 2"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                                    isActive={editor.isActive('heading', { level: 3 })}
                                                    icon={Heading3}
                                                    tooltip="Heading 3"
                                                />
                                            </div>

                                            {/* Lists */}
                                            <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-700">
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                                    isActive={editor.isActive('bulletList')}
                                                    icon={List}
                                                    tooltip="Bullet List"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                                    isActive={editor.isActive('orderedList')}
                                                    icon={ListOrdered}
                                                    tooltip="Numbered List"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                                                    isActive={editor.isActive('taskList')}
                                                    icon={CheckSquare}
                                                    tooltip="Task List"
                                                />
                                            </div>

                                            {/* Insert */}
                                            <div className="flex items-center gap-1">
                                                <ToolbarButton
                                                    onClick={() => {
                                                        const url = window.prompt('URL:');
                                                        if (url) {
                                                            editor.chain().focus().setLink({ href: url }).run();
                                                        }
                                                    }}
                                                    isActive={editor.isActive('link')}
                                                    icon={LinkIcon}
                                                    tooltip="Insert Link"
                                                />
                                                <ToolbarButton
                                                    onClick={() => {
                                                        const url = window.prompt('Image URL:');
                                                        if (url) {
                                                            editor.chain().focus().setImage({ src: url }).run();
                                                        }
                                                    }}
                                                    icon={ImageIcon}
                                                    tooltip="Insert Image"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                                    isActive={editor.isActive('codeBlock')}
                                                    icon={Code}
                                                    tooltip="Code Block"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
                                                    icon={Table}
                                                    tooltip="Insert Table"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                                    isActive={editor.isActive('blockquote')}
                                                    icon={Quote}
                                                    tooltip="Blockquote"
                                                />
                                                <ToolbarButton
                                                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                                    icon={Divide}
                                                    tooltip="Horizontal Rule"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Editor Content */}
                                <div className="relative">
                                    <EditorContent editor={editor} />

                                    {/* Bubble Menu - Appears on text selection */}
                                    {editor && (
                                        <BubbleMenu
                                            editor={editor}
                                            tippyOptions={{ duration: 100 }}
                                            className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 p-2 shadow-xl backdrop-blur-xl"
                                        >
                                            <button
                                                onClick={() => handleAIAssist('improve')}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
                                            >
                                                <Sparkles className="h-4 w-4 text-purple-500" />
                                                Improve
                                            </button>
                                            <button
                                                onClick={() => handleAIAssist('summarize')}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
                                            >
                                                <Zap className="h-4 w-4 text-blue-500" />
                                                Summarize
                                            </button>
                                            <button
                                                onClick={() => handleAIAssist('expand')}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
                                            >
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                Expand
                                            </button>
                                        </BubbleMenu>
                                    )}

                                    {/* Slash Command Menu */}
                                    <AnimatePresence>
                                        {showSlashMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                style={{
                                                    position: 'absolute',
                                                    left: slashMenuPosition.x,
                                                    top: slashMenuPosition.y,
                                                }}
                                                className="z-50 w-64 rounded-xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 p-2 shadow-xl backdrop-blur-xl"
                                            >
                                                <div className="space-y-1">
                                                    {[
                                                        { icon: Heading1, label: 'Heading 1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
                                                        { icon: Heading2, label: 'Heading 2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
                                                        { icon: List, label: 'Bullet List', action: () => editor?.chain().focus().toggleBulletList().run() },
                                                        { icon: ListOrdered, label: 'Numbered List', action: () => editor?.chain().focus().toggleOrderedList().run() },
                                                        { icon: CheckSquare, label: 'Task List', action: () => editor?.chain().focus().toggleTaskList().run() },
                                                        { icon: Code, label: 'Code Block', action: () => editor?.chain().focus().toggleCodeBlock().run() },
                                                        { icon: Quote, label: 'Quote', action: () => editor?.chain().focus().toggleBlockquote().run() },
                                                        { icon: Table, label: 'Table', action: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run() },
                                                    ].map((item, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => {
                                                                item.action();
                                                                setShowSlashMenu(false);
                                                            }}
                                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                        >
                                                            <item.icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                {item.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </form>
                </div>
            </motion.div>
        </StudentLayout>
    );
}

// Toolbar Button Component
const ToolbarButton = ({ onClick, isActive, icon: Icon, tooltip }: any) => (
    <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        title={tooltip}
        className={`p-2 rounded-lg transition-colors ${
            isActive
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
        }`}
    >
        <Icon className="h-4 w-4" />
    </motion.button>
);
```

---

## 🎯 DETAIL INOVASI (Lengkap)

### 1️⃣ NOTION-STYLE SLASH COMMANDS (/)
- Ketik "/" untuk membuka command menu
- Quick insert: headings, lists, code blocks, tables, quotes
- Keyboard navigation
- Fuzzy search commands

### 2️⃣ AI WRITING ASSISTANT
- **Improve**: Perbaiki grammar & style
- **Summarize**: Ringkas teks panjang
- **Expand**: Kembangkan ide
- **Simplify**: Sederhanakan bahasa
- Bubble menu on text selection

### 3️⃣ VOICE-TO-TEXT
- Real-time transcription
- Support Bahasa Indonesia & English
- Visual recording indicator
- Pause/Resume functionality

### 4️⃣ SMART TEMPLATES
- Blank template
- Lecture Notes template
- Meeting Notes template
- Research Notes template
- Lab Report template
- Essay Outline template

### 5️⃣ DRAG & DROP BLOCKS
- Reorder paragraphs
- Move images
- Reorganize lists
- Visual drag handles

### 6️⃣ REAL-TIME COLLABORATION
- Multiple cursors
- See who's editing
- Live updates via Pusher
- Conflict resolution

### 7️⃣ MARKDOWN SHORTCUTS
- `**bold**` → **bold**
- `*italic*` → *italic*
- `# ` → Heading 1
- `- ` → Bullet list
- `1. ` → Numbered list
- `[]` → Checkbox

### 8️⃣ IMAGE OCR
- Upload image
- Extract text automatically
- Insert extracted text
- Support multiple languages

### 9️⃣ AUTO-SAVE
- Save every 2 seconds
- Visual indicator
- Last saved timestamp
- Conflict detection

### 🔟 FOCUS MODE
- Distraction-free writing
- Hide all UI elements
- Centered content
- Keyboard shortcuts only

### 1️⃣1️⃣ LIVE STATS
- Word count
- Character count
- Reading time
- Paragraph count
- Real-time updates

### 1️⃣2️⃣ EXPORT OPTIONS
- **PDF**: Custom templates
- **Markdown**: Plain text
- **HTML**: Web format
- **DOCX**: Microsoft Word
- **TXT**: Plain text

---

## 🔧 BACKEND IMPLEMENTATION

```php
// app/Http/Controllers/User/CatatanController.php

public function create()
{
    $courses = auth()->user()->courses;
    
    $templates = [
        [
            'id' => 'lecture',
            'name' => 'Lecture Notes',
            'description' => 'Template untuk catatan kuliah',
            'content' => '<h1>Lecture Notes</h1><h2>Topic:</h2><p></p><h2>Key Points:</h2><ul><li></li></ul><h2>Summary:</h2><p></p>',
        ],
        // ... more templates
    ];

    return Inertia::render('user/akademik/catatan-form', [
        'courses' => $courses,
        'templates' => $templates,
    ]);
}

public function edit($id)
{
    $note = Note::findOrFail($id);
    $courses = auth()->user()->courses;
    
    return Inertia::render('user/akademik/catatan-form', [
        'note' => $note,
        'courses' => $courses,
        'templates' => [],
    ]);
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Basic Setup (4 hours)
- [ ] Create routes & controller methods
- [ ] Setup TipTap editor
- [ ] Implement top navigation bar
- [ ] Add auto-save functionality

### Phase 2: Rich Text Editor (6 hours)
- [ ] Complete toolbar with all buttons
- [ ] Bubble menu for AI assist
- [ ] Floating menu for quick insert
- [ ] Slash command menu
- [ ] Markdown shortcuts

### Phase 3: Templates (3 hours)
- [ ] Create template selector modal
- [ ] Design 6 pre-built templates
- [ ] Template preview
- [ ] Apply template logic

### Phase 4: AI Features (8 hours)
- [ ] Setup OpenAI API
- [ ] Implement improve text
- [ ] Implement summarize
- [ ] Implement expand
- [ ] Implement simplify

### Phase 5: Voice-to-Text (4 hours)
- [ ] Setup Speech Recognition
- [ ] Recording UI with animation
- [ ] Real-time transcription
- [ ] Error handling

### Phase 6: Advanced Features (8 hours)
- [ ] Focus mode
- [ ] Live word count
- [ ] Image OCR
- [ ] Drag & drop blocks
- [ ] Real-time collaboration

### Phase 7: Export (4 hours)
- [ ] PDF export
- [ ] Markdown export
- [ ] HTML export
- [ ] DOCX export

### Phase 8: Polish (4 hours)
- [ ] Animations
- [ ] Dark mode
- [ ] Responsive design
- [ ] Performance optimization

---

## ⏱️ ESTIMATED TIME

**Total: 41 hours** (5-6 hari kerja)

---

## 🚀 PRIORITY LEVEL

**HIGH PRIORITY** - Form editor adalah inti dari fitur catatan.

---

## 📌 NOTES

1. 100% matching admin dashboard colors & animations
2. TipTap editor sangat powerful dan extensible
3. AI features memerlukan OpenAI API key
4. Voice-to-text hanya work di Chrome/Edge
5. Auto-save mencegah kehilangan data
6. Focus mode untuk produktivitas maksimal
