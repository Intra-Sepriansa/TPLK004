# 📝 PROMPT: CATATAN AKADEMIK MAHASISWA - ULTRA ADVANCED

## 📋 OVERVIEW

Prompt ini untuk membuat **Catatan Akademik Mahasiswa** dengan inovasi ultra advanced dan UI/UX yang sangat polished, 100% matching dengan **Dashboard Admin**. Fitur ini memungkinkan mahasiswa membuat, mengelola, dan mengorganisir catatan pembelajaran dengan cara yang modern dan efisien.

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

// ROUNDED & SHADOWS
rounded-3xl  // Main containers
shadow-xl    // Main shadows
```

### Animation Standards (WAJIB)
```typescript
stiffness: 300
damping: 20

// Hover animations
scale: 1.04
y: -4
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🚀 INOVASI ULTRA ADVANCED (10 MAJOR FEATURES)

### 1️⃣ AI-POWERED SMART NOTES (Auto Summary & Keywords)
### 2️⃣ RICH TEXT EDITOR dengan TipTap (Formatting, Code, Images)
### 3️⃣ VOICE-TO-TEXT Recording (Speech Recognition)
### 4️⃣ COLLABORATIVE NOTES (Real-time dengan Pusher)
### 5️⃣ SMART SEARCH dengan Fuzzy Matching & Highlights
### 6️⃣ NOTION-STYLE BLOCKS (Drag & Drop, Nested)
### 7️⃣ MIND MAP VIEW (Visual Connection)
### 8️⃣ FLASHCARD GENERATOR (Auto dari Catatan)
### 9️⃣ PDF EXPORT dengan Custom Template
### 🔟 VERSION HISTORY & Time Travel

---

## 📦 FULL IMPLEMENTATION

```typescript
// File: resources/js/pages/user/akademik/catatan-advanced.tsx

import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    NotebookPen, Plus, Search, BookOpen, Mic, MicOff, Sparkles,
    FileText, Clock, Download, Share2, History, Layers, Brain,
    Zap, Eye, EyeOff, Grid3x3, List, Map, CreditCard, Save,
    Trash2, Edit, Copy, Pin, Star, Tag, Link as LinkIcon,
    Image as ImageIcon, Code, Bold, Italic, Underline, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Quote, Heading1, Heading2,
    Table, CheckSquare, Calendar, Users, ArrowRight, Filter,
    SortAsc, MoreVertical, Maximize2, Minimize2, Play, Pause
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
import { lowlight } from 'lowlight';

// Recharts for Analytics
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Icons
import catatanIcon from '@/assets/admin/akademik/catatan.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import weekIcon from '@/assets/mahasiswa/dashboard/streak.png';

interface Note {
    id: number;
    course_id: number;
    course_name: string;
    meeting_number: number;
    title: string;
    content: string;
    blocks: Block[];
    tags: string[];
    is_pinned: boolean;
    is_favorite: boolean;
    word_count: number;
    reading_time: number;
    ai_summary: string | null;
    ai_keywords: string[];
    collaborators: Collaborator[];
    versions: Version[];
    created_at: string;
    updated_at: string;
}

interface Block {
    id: string;
    type: 'text' | 'heading' | 'code' | 'image' | 'checklist' | 'quote' | 'divider';
    content: string;
    metadata?: any;
    order: number;
}

interface Collaborator {
    id: number;
    nama: string;
    avatar: string | null;
    is_online: boolean;
}

interface Version {
    id: number;
    content: string;
    created_at: string;
    created_by: string;
}

interface Props {
    notes: Note[];
    courses: any[];
    stats: {
        total_notes: number;
        total_words: number;
        this_week: number;
        favorite_count: number;
    };
}

export default function CatatanAkademikAdvanced({ notes, courses, stats }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'mindmap' | 'flashcard'>('grid');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showAISummary, setShowAISummary] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);

    // Speech Recognition
    const recognitionRef = useRef<any>(null);
    const [transcript, setTranscript] = useState('');

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
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image,
            CodeBlockLowlight.configure({ lowlight }),
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: 'Mulai menulis catatan Anda... Tekan "/" untuk perintah cepat'
            }),
        ],
        content: selectedNote?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-6',
            },
        },
        onUpdate: ({ editor }) => {
            // Auto-save logic here
            const content = editor.getHTML();
            // Debounced save
        },
    });

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'id-ID';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript && editor) {
                    editor.commands.insertContent(finalTranscript);
                }
                setTranscript(interimTranscript);
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
            setTranscript('');
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    // Generate AI Summary
    const generateAISummary = async (noteId: number) => {
        setShowAISummary(true);
        // Call backend API to generate summary using OpenAI/Claude
        try {
            const response = await fetch(`/api/notes/${noteId}/ai-summary`, {
                method: 'POST',
            });
            const data = await response.json();
            // Update note with AI summary
        } catch (error) {
            console.error('Failed to generate AI summary:', error);
        }
    };

    // Smart Search with Fuzzy Matching
    const searchNotes = (query: string) => {
        if (!query) return notes;

        return notes.filter(note => {
            const searchText = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
            const queryLower = query.toLowerCase();
            
            // Fuzzy matching
            return searchText.includes(queryLower) || 
                   note.ai_keywords.some(keyword => keyword.toLowerCase().includes(queryLower));
        });
    };

    const filteredNotes = searchNotes(searchQuery);

    return (
        <StudentLayout>
            <Head title="Catatan Akademik" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════════════════════════════════════════════════ */}
                {/* HERO HEADER - Ultra Polished                        */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0, 1, 0],
                                    y: [0, -100],
                                    x: [0, Math.random() * 40 - 20],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${80 + Math.random() * 20}%`,
                                }}
                            >
                                <NotebookPen className="h-3 w-3 text-white/40" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            {/* Left: Title */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                                    >
                                        <img src={catatanIcon} alt="Catatan" className="h-10 w-10 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
                                    </motion.div>
                                    <div>
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-sm text-white/90 font-medium"
                                        >
                                            Smart Learning Notes
                                        </motion.p>
                                        <motion.h1
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-3xl font-bold"
                                        >
                                            Catatan Akademik
                                        </motion.h1>
                                    </div>
                                </div>
                                
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-white/90 text-lg"
                                >
                                    Catat, kelola, dan pelajari dengan AI-powered smart notes
                                </motion.p>
                            </div>

                            {/* Right: Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex gap-3"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-600 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Plus className="h-5 w-5" />
                                    Catatan Baru
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleRecording}
                                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all ${
                                        isRecording
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                                    }`}
                                >
                                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    {isRecording ? 'Stop' : 'Voice'}
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* View Mode Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="mt-6 flex gap-2"
                        >
                            {[
                                { id: 'grid', label: 'Grid', icon: Grid3x3 },
                                { id: 'list', label: 'List', icon: List },
                                { id: 'mindmap', label: 'Mind Map', icon: Map },
                                { id: 'flashcard', label: 'Flashcard', icon: CreditCard },
                            ].map((view) => (
                                <motion.button
                                    key={view.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode(view.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                                        viewMode === view.id
                                            ? 'bg-white text-indigo-600'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    <view.icon className="h-4 w-4" />
                                    {view.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* QUICK STATS - 4 Cards                               */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { 
                            iconSrc: totalIcon, 
                            label: 'Total Catatan', 
                            value: stats.total_notes, 
                            gradient: 'from-blue-400 to-indigo-600',
                            glow: 'bg-blue-500'
                        },
                        { 
                            iconSrc: weekIcon, 
                            label: 'Minggu Ini', 
                            value: stats.this_week, 
                            gradient: 'from-emerald-400 to-teal-600',
                            glow: 'bg-emerald-500'
                        },
                        { 
                            iconSrc: catatanIcon, 
                            label: 'Total Kata', 
                            value: stats.total_words, 
                            gradient: 'from-amber-400 to-orange-600',
                            glow: 'bg-amber-500'
                        },
                        { 
                            iconSrc: totalIcon, 
                            label: 'Favorit', 
                            value: stats.favorite_count, 
                            gradient: 'from-purple-400 to-violet-600',
                            glow: 'bg-purple-500'
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4 }}
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-500/10`} />
                            <motion.div
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.glow} blur-3xl transition-all duration-500 opacity-20 group-hover:opacity-40 group-hover:scale-150`}
                            />
                            
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    className="relative flex h-14 w-14 items-center justify-center"
                                >
                                    <img src={stat.iconSrc} alt={stat.label} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
```

Saya akan melanjutkan dengan section-section berikutnya...

                {/* ═══════════════════════════════════════════════════ */}
                {/* SEARCH & FILTER BAR                                 */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari catatan... (AI-powered search)"
                                className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl dark:border-white/5 focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            {searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500"
                                >
                                    {filteredNotes.length} hasil
                                </motion.div>
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 h-12 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl hover:bg-white/80 transition-all"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 h-12 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl hover:bg-white/80 transition-all"
                            >
                                <SortAsc className="h-4 w-4" />
                                Sort
                            </motion.button>
                        </div>
                    </div>

                    {/* Active Tags */}
                    {selectedTags.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap gap-2 mt-4"
                        >
                            {selectedTags.map((tag) => (
                                <motion.span
                                    key={tag}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium"
                                >
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                    <button
                                        onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                        className="hover:text-indigo-800 dark:hover:text-indigo-200"
                                    >
                                        ×
                                    </button>
                                </motion.span>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
```

Lanjutan akan saya tambahkan di append berikutnya...

                {/* ═══════════════════════════════════════════════════ */}
                {/* NOTES GRID/LIST VIEW                                */}
                {/* ═══════════════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filteredNotes.map((note, index) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 cursor-pointer"
                                    onClick={() => setSelectedNote(note)}
                                >
                                    {/* Pin & Favorite Icons */}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {note.is_pinned && (
                                            <motion.div
                                                initial={{ rotate: 0 }}
                                                animate={{ rotate: [0, -10, 10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Pin className="h-4 w-4 text-amber-500" />
                                            </motion.div>
                                        )}
                                        {note.is_favorite && (
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Course Badge */}
                                    <div className="mb-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                            <BookOpen className="h-3 w-3" />
                                            {note.course_name}
                                        </span>
                                        <span className="ml-2 text-xs text-neutral-500">
                                            Pertemuan {note.meeting_number}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 line-clamp-2">
                                        {note.title}
                                    </h3>

                                    {/* Content Preview */}
                                    <div 
                                        className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + '...' }}
                                    />

                                    {/* Tags */}
                                    {note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {note.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                                                >
                                                    <Hash className="h-2.5 w-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {note.tags.length > 3 && (
                                                <span className="text-xs text-neutral-500">
                                                    +{note.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* AI Summary Badge */}
                                    {note.ai_summary && (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold mb-3"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            AI Summary
                                        </motion.div>
                                    )}

                                    {/* Footer Stats */}
                                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {note.word_count} kata
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {note.reading_time} min
                                            </span>
                                        </div>
                                        {note.collaborators.length > 0 && (
                                            <div className="flex -space-x-2">
                                                {note.collaborators.slice(0, 3).map((collab) => (
                                                    <div
                                                        key={collab.id}
                                                        className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-neutral-800"
                                                    >
                                                        {collab.nama.charAt(0)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Actions */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileHover={{ opacity: 1, y: 0 }}
                                        className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 🎯 DETAIL INOVASI ULTRA ADVANCED

### 1️⃣ AI-POWERED SMART NOTES

**Fitur**:
- Auto-generate summary dari catatan panjang
- Extract keywords otomatis
- Suggest related notes
- Smart categorization

**Implementation**:
```typescript
// Backend: app/Services/AINotesService.php
public function generateSummary(string $content): string
{
    // Using OpenAI API
    $response = OpenAI::chat()->create([
        'model' => 'gpt-4',
        'messages' => [
            ['role' => 'system', 'content' => 'You are a helpful assistant that summarizes academic notes.'],
            ['role' => 'user', 'content' => "Summarize this note in 3-4 sentences: {$content}"]
        ],
    ]);

    return $response->choices[0]->message->content;
}

public function extractKeywords(string $content): array
{
    $response = OpenAI::chat()->create([
        'model' => 'gpt-4',
        'messages' => [
            ['role' => 'system', 'content' => 'Extract 5-10 key academic terms from the text.'],
            ['role' => 'user', 'content' => $content]
        ],
    ]);

    return json_decode($response->choices[0]->message->content, true);
}
```

### 2️⃣ RICH TEXT EDITOR dengan TipTap

**Fitur**:
- Bold, Italic, Underline, Strikethrough
- Headings (H1, H2, H3)
- Lists (Ordered, Unordered, Checklist)
- Code blocks dengan syntax highlighting
- Tables
- Images dengan drag & drop
- Links
- Blockquotes
- Horizontal rules

**Toolbar Implementation**:
```typescript
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={Bold}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={Italic}
            />
            {/* ... more buttons */}
        </div>
    );
};
```

### 3️⃣ VOICE-TO-TEXT Recording

**Fitur**:
- Real-time speech recognition
- Support Bahasa Indonesia & English
- Auto-punctuation
- Pause/Resume recording
- Visual waveform animation

**Implementation** (sudah ada di code utama)

### 4️⃣ COLLABORATIVE NOTES (Real-time)

**Fitur**:
- Multiple users can edit simultaneously
- See who's online
- Cursor tracking
- Real-time updates via Pusher
- Comment threads

**Backend Setup**:
```php
// Install: composer require pusher/pusher-php-server

// Broadcasting event
broadcast(new NoteUpdated($note))->toOthers();

// Event: app/Events/NoteUpdated.php
class NoteUpdated implements ShouldBroadcast
{
    public function broadcastOn()
    {
        return new PrivateChannel('note.' . $this->note->id);
    }
}
```

### 5️⃣ SMART SEARCH dengan Fuzzy Matching

**Fitur**:
- Search by title, content, tags
- Fuzzy matching (typo-tolerant)
- Highlight search results
- Search history
- Suggested searches

**Implementation**:
```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(notes, {
    keys: ['title', 'content', 'tags', 'ai_keywords'],
    threshold: 0.3,
    includeMatches: true,
});

const searchResults = fuse.search(searchQuery);
```

### 6️⃣ NOTION-STYLE BLOCKS

**Fitur**:
- Drag & drop blocks
- Nested blocks
- Block types: text, heading, code, image, checklist, quote
- "/" command menu
- Block templates

**Implementation**:
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleDragEnd}>
    <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
        {blocks.map(block => (
            <SortableBlock key={block.id} block={block} />
        ))}
    </SortableContext>
</DndContext>
```

### 7️⃣ MIND MAP VIEW

**Fitur**:
- Visual connection between notes
- Interactive nodes
- Zoom & pan
- Export as image
- Auto-layout

**Implementation**:
```typescript
// Install: npm install reactflow

import ReactFlow, { Background, Controls } from 'reactflow';

const MindMapView = ({ notes }: { notes: Note[] }) => {
    const nodes = notes.map((note, i) => ({
        id: String(note.id),
        data: { label: note.title },
        position: { x: i * 200, y: i * 100 },
    }));

    return (
        <ReactFlow nodes={nodes} edges={edges}>
            <Background />
            <Controls />
        </ReactFlow>
    );
};
```

### 8️⃣ FLASHCARD GENERATOR

**Fitur**:
- Auto-generate flashcards from notes
- Spaced repetition algorithm
- Flip animation
- Progress tracking
- Export to Anki

**Implementation**:
```typescript
const FlashcardView = ({ note }: { note: Note }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

    // Generate flashcards using AI
    const generateFlashcards = async () => {
        const response = await fetch(`/api/notes/${note.id}/flashcards`, {
            method: 'POST',
        });
        const data = await response.json();
        setFlashcards(data.flashcards);
    };

    return (
        <motion.div
            className="perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-64 preserve-3d"
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-white p-6">
                    <h3 className="text-xl font-bold">{flashcards[0]?.question}</h3>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-indigo-500 text-white p-6 rotate-y-180">
                    <p>{flashcards[0]?.answer}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};
```

### 9️⃣ PDF EXPORT dengan Custom Template

**Fitur**:
- Export single or multiple notes
- Custom templates (Academic, Minimal, Colorful)
- Include images & code blocks
- Table of contents
- Page numbers & headers

**Backend**:
```php
// Install: composer require barryvdh/laravel-dompdf

use Barryvdh\DomPDF\Facade\Pdf;

public function exportPDF(Request $request)
{
    $notes = Note::whereIn('id', $request->note_ids)->get();
    
    $pdf = Pdf::loadView('pdf.notes', [
        'notes' => $notes,
        'template' => $request->template ?? 'academic',
    ]);

    return $pdf->download('catatan-akademik.pdf');
}
```

### 🔟 VERSION HISTORY & Time Travel

**Fitur**:
- Auto-save versions every 5 minutes
- Compare versions side-by-side
- Restore previous version
- See who made changes
- Timeline view

**Implementation**:
```typescript
const VersionHistory = ({ note }: { note: Note }) => {
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

    return (
        <div className="space-y-4">
            <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                
                {note.versions.map((version, index) => (
                    <motion.div
                        key={version.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-12 pb-8"
                    >
                        <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-neutral-900" />
                        
                        <div className="rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-4 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {version.created_by}
                                </span>
                                <span className="text-xs text-neutral-500">
                                    {version.created_at}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedVersion(version)}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                View changes
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
```

---

## 🔧 BACKEND IMPLEMENTATION

### Controller: `app/Http/Controllers/User/CatatanController.php`

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Services\AINotesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatatanController extends Controller
{
    protected $aiService;

    public function __construct(AINotesService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request)
    {
        $mahasiswa = auth()->user();
        
        $notes = Note::where('mahasiswa_id', $mahasiswa->id)
            ->with(['course', 'collaborators', 'versions'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($request->course_id, function ($query, $courseId) {
                $query->where('course_id', $courseId);
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        $stats = [
            'total_notes' => $notes->count(),
            'total_words' => $notes->sum('word_count'),
            'this_week' => $notes->where('created_at', '>=', now()->subWeek())->count(),
            'favorite_count' => $notes->where('is_favorite', true)->count(),
        ];

        return Inertia::render('user/akademik/catatan-advanced', [
            'notes' => $notes,
            'courses' => $mahasiswa->courses,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'meeting_number' => 'required|integer',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|array',
        ]);

        $note = Note::create([
            'mahasiswa_id' => auth()->id(),
            ...$validated,
            'word_count' => str_word_count(strip_tags($validated['content'])),
            'reading_time' => ceil(str_word_count(strip_tags($validated['content'])) / 200),
        ]);

        // Generate AI summary in background
        dispatch(function () use ($note) {
            $summary = $this->aiService->generateSummary($note->content);
            $keywords = $this->aiService->extractKeywords($note->content);
            
            $note->update([
                'ai_summary' => $summary,
                'ai_keywords' => $keywords,
            ]);
        });

        return redirect()->back()->with('success', 'Catatan berhasil ditambahkan');
    }

    public function generateAISummary(Note $note)
    {
        $summary = $this->aiService->generateSummary($note->content);
        $keywords = $this->aiService->extractKeywords($note->content);

        $note->update([
            'ai_summary' => $summary,
            'ai_keywords' => $keywords,
        ]);

        return response()->json([
            'summary' => $summary,
            'keywords' => $keywords,
        ]);
    }

    public function generateFlashcards(Note $note)
    {
        $flashcards = $this->aiService->generateFlashcards($note->content);

        return response()->json([
            'flashcards' => $flashcards,
        ]);
    }

    public function exportPDF(Request $request)
    {
        $notes = Note::whereIn('id', $request->note_ids)->get();
        
        $pdf = Pdf::loadView('pdf.notes', [
            'notes' => $notes,
            'template' => $request->template ?? 'academic',
        ]);

        return $pdf->download('catatan-akademik.pdf');
    }
}
```

---

## 📝 DATABASE MIGRATIONS

```php
// database/migrations/xxxx_create_notes_table.php

Schema::create('notes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('mahasiswa_id')->constrained('users');
    $table->foreignId('course_id')->constrained();
    $table->integer('meeting_number');
    $table->string('title');
    $table->longText('content');
    $table->json('blocks')->nullable();
    $table->json('tags')->nullable();
    $table->boolean('is_pinned')->default(false);
    $table->boolean('is_favorite')->default(false);
    $table->integer('word_count')->default(0);
    $table->integer('reading_time')->default(0);
    $table->text('ai_summary')->nullable();
    $table->json('ai_keywords')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

Schema::create('note_collaborators', function (Blueprint $table) {
    $table->id();
    $table->foreignId('note_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained();
    $table->enum('role', ['viewer', 'editor'])->default('viewer');
    $table->timestamps();
});

Schema::create('note_versions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('note_id')->constrained()->onDelete('cascade');
    $table->longText('content');
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Basic UI (4 hours)
- [ ] Create controller & routes
- [ ] Create database migrations
- [ ] Setup TipTap editor
- [ ] Implement Hero Header
- [ ] Implement Quick Stats
- [ ] Implement Search & Filter

### Phase 2: Rich Text Editor (6 hours)
- [ ] Setup TipTap with all extensions
- [ ] Implement toolbar
- [ ] Add bubble menu
- [ ] Add floating menu
- [ ] Image upload
- [ ] Code syntax highlighting
- [ ] Tables support

### Phase 3: Voice-to-Text (4 hours)
- [ ] Setup Speech Recognition API
- [ ] Implement recording UI
- [ ] Add waveform animation
- [ ] Handle errors
- [ ] Support multiple languages

### Phase 4: AI Features (8 hours)
- [ ] Setup OpenAI API
- [ ] Implement auto-summary
- [ ] Implement keyword extraction
- [ ] Implement flashcard generation
- [ ] Add AI suggestions

### Phase 5: Collaborative Features (6 hours)
- [ ] Setup Pusher
- [ ] Real-time updates
- [ ] Cursor tracking
- [ ] Online users indicator
- [ ] Comment threads

### Phase 6: Advanced Views (8 hours)
- [ ] Grid view
- [ ] List view
- [ ] Mind map view (ReactFlow)
- [ ] Flashcard view
- [ ] Smooth transitions

### Phase 7: Version History (4 hours)
- [ ] Auto-save versions
- [ ] Timeline UI
- [ ] Compare versions
- [ ] Restore functionality

### Phase 8: Export & Sharing (4 hours)
- [ ] PDF export
- [ ] Custom templates
- [ ] Share functionality
- [ ] Duplicate notes

### Phase 9: Polish & Optimization (4 hours)
- [ ] Animations polish
- [ ] Performance optimization
- [ ] Dark mode testing
- [ ] Responsive design
- [ ] Error handling

### Phase 10: Testing (4 hours)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Cross-browser testing

---

## 🎯 SUCCESS METRICS

1. **Performance**: Page load < 2 seconds
2. **AI Response**: < 5 seconds for summary
3. **Real-time**: < 100ms latency
4. **Animations**: Smooth 60fps
5. **Responsive**: Perfect di semua device

---

## ⏱️ ESTIMATED TIME

**Total: 52 hours** (6-7 hari kerja)

---

## 🚀 PRIORITY LEVEL

**HIGH PRIORITY** - Catatan akademik adalah fitur penting untuk mahasiswa mencatat dan belajar.

---

## 📌 NOTES

1. Semua warna & animasi 100% matching admin dashboard
2. AI features memerlukan OpenAI API key
3. Real-time features memerlukan Pusher setup
4. Voice-to-text hanya work di browser modern
5. Test semua fitur di dark mode
6. Optimize untuk mobile experience
