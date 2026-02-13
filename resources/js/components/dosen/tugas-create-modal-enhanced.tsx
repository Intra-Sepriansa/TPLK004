import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus, X, BookOpen, FileText, MessageSquare, ClipboardList, Zap, Calendar, CheckCircle,
    Target, FileCheck, Rocket, Presentation, Lightbulb, Sparkles
} from 'lucide-react';

interface Course {
    id: number;
    nama: string;
}

interface FormData {
    course_id: string;
    judul: string;
    deskripsi: string;
    instruksi: string;
    jenis: string;
    deadline: string;
    prioritas: string;
    status: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    form: FormData;
    setForm: (form: FormData) => void;
    courses: Course[];
    onSubmit: () => void;
}

export function TugasCreateModalEnhanced({ isOpen, onClose, form, setForm, courses, onSubmit }: Props) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Enhanced Background with Blur */}
                <motion.div
                    initial={{ backdropFilter: 'blur(0px)' }}
                    animate={{ backdropFilter: 'blur(16px)' }}
                    exit={{ backdropFilter: 'blur(0px)' }}
                    className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"
                />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(25)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ 
                                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                                scale: 0
                            }}
                            animate={{ 
                                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                                x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                                scale: [0, Math.random() * 1.5 + 0.5, 0],
                                opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                                ease: "easeInOut"
                            }}
                            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 blur-sm"
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 60, rotateX: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 60, rotateX: 20 }}
                    transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20,
                        mass: 0.8
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl rounded-3xl bg-white/98 shadow-2xl dark:bg-black/98 border border-gray-200/50 dark:border-gray-800/50 overflow-hidden max-h-[90vh] flex flex-col backdrop-blur-2xl"
                    style={{ 
                        perspective: '1500px',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                            className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                        />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <Plus className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        Tambah Tugas Baru
                                        <Sparkles className="h-5 w-5" />
                                    </h2>
                                    <p className="text-sm text-white/80">Buat tugas baru untuk mahasiswa</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.15, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur hover:bg-white/30 transition-colors shadow-lg"
                            >
                                <X className="h-6 w-6" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {/* Mata Kuliah */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                                >
                                    <BookOpen className="h-3.5 w-3.5" />
                                </motion.div>
                                Mata Kuliah
                            </Label>
                            <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Pilih mata kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </motion.div>

                        {/* Judul */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                </motion.div>
                                Judul
                            </Label>
                            <Input 
                                value={form.judul} 
                                onChange={(e) => setForm({ ...form, judul: e.target.value })} 
                                className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white" 
                                placeholder="Masukkan judul tugas" 
                            />
                        </motion.div>

                        {/* Deskripsi */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md"
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                </motion.div>
                                Deskripsi
                            </Label>
                            <Textarea 
                                value={form.deskripsi} 
                                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} 
                                rows={4} 
                                className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-violet-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white resize-none" 
                                placeholder="Jelaskan tugas secara detail" 
                            />
                            <motion.p 
                                animate={{ scale: form.deskripsi.length > 0 ? [1, 1.05, 1] : 1 }}
                                className="mt-1 text-xs text-gray-500"
                            >
                                {form.deskripsi.length} karakter
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {/* Jenis */}
                            <div>
                                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md"
                                    >
                                        <ClipboardList className="h-3.5 w-3.5" />
                                    </motion.div>
                                    Jenis
                                </Label>
                                <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                    <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-amber-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tugas">
                                            <span className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" /> Tugas
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="quiz">
                                            <span className="flex items-center gap-2">
                                                <FileCheck className="h-3.5 w-3.5" /> Quiz
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="project">
                                            <span className="flex items-center gap-2">
                                                <Rocket className="h-3.5 w-3.5" /> Project
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="presentasi">
                                            <span className="flex items-center gap-2">
                                                <Presentation className="h-3.5 w-3.5" /> Presentasi
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="lainnya">
                                            <span className="flex items-center gap-2">
                                                <Lightbulb className="h-3.5 w-3.5" /> Lainnya
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Prioritas */}
                            <div>
                                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md"
                                    >
                                        <Zap className="h-3.5 w-3.5" />
                                    </motion.div>
                                    Prioritas
                                </Label>
                                <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                    <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-rose-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rendah">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Rendah
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="sedang">
                                            <span className="flex items-center gap-2">
                                                <Target className="h-3.5 w-3.5 text-amber-500" /> Sedang
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="tinggi">
                                            <span className="flex items-center gap-2">
                                                <Zap className="h-3.5 w-3.5 text-red-500" /> Tinggi
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {/* Deadline */}
                            <div>
                                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md"
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                    </motion.div>
                                    Deadline
                                </Label>
                                <Input 
                                    type="datetime-local" 
                                    value={form.deadline} 
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
                                    className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-cyan-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white" 
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                    </motion.div>
                                    Status
                                </Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                    <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-green-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            <span className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" /> Draft
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="published">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="h-3.5 w-3.5" /> Published
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </motion.div>
                    </div>

                    {/* Enhanced Footer */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-black/50 p-6 backdrop-blur">
                        <div className="flex gap-3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1"
                            >
                                <Button 
                                    variant="outline" 
                                    onClick={onClose} 
                                    className="w-full border-2"
                                >
                                    Batal
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1"
                            >
                                <Button 
                                    onClick={onSubmit} 
                                    className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-0 shadow-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Simpan
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
