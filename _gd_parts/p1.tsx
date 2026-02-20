import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft, Download, FileText, Printer, X, Check, TrendingUp, Award,
    CheckCircle, Clock, Calendar, Mail, Copy, ChevronDown, Filter, Search,
    BarChart3, MessageSquare, Eye, BookOpen, XCircle, RefreshCw, Plus,
    Trash2, ArrowUpDown, Target, Calculator
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

interface AttRec {
    id: number; meeting_number: number; session_title: string;
    session_date: string; session_time: string;
    status: 'present' | 'late' | 'permit' | 'sick' | 'absent' | 'rejected';
    points: number; check_in_time?: string | null;
    check_in_location?: { latitude: number; longitude: number; address?: string | null } | null;
    selfie_photo?: string | null; notes?: string | null;
    device_info?: string | null; edited_by?: string | null; edit_reason?: string | null;
}
interface DNote {
    id: number; content: string; title: string; created_by: string;
    created_at: string; is_important: boolean; is_visible_to_student: boolean;
}
interface Props {
    dosen: { id: number; nama: string; email: string };
    student: {
        id: number; nama: string; nim: string; email: string;
        foto?: string | null; prodi: string; fakultas: string;
        semester: number; kelas?: string | null; angkatan?: string | null;
    };
    course: {
        id: number; nama: string; kode: string; sks: number;
        semester: string; tahun_ajaran: string;
    };
    gradeData: {
        total_sessions: number; attended_sessions: number;
        attendance_rate: number; average_points: number;
        attendance_grade: number; grade_letter: string;
        can_take_uas: boolean; sessions_needed_for_uas: number;
        rank_in_class: number; total_students: number; percentile: number;
        status_breakdown: {
            present: number; late: number; permit: number;
            sick: number; absent: number; rejected: number;
        };
        points_breakdown: {
            present_points: number; late_points: number;
            permit_points: number; sick_points: number;
            total_points: number; max_possible_points: number;
        };
    };
    attendanceRecords: AttRec[];
    classAverage: {
        average_attendance_rate: number; average_points: number;
        mode_grade: string; total_students: number;
    };
    dosenNotes: DNote[];
}

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;
const sC = (s: string): string => (({ present: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400', late: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', permit: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', sick: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400', absent: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', rejected: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' }) as Record<string, string>)[s] || 'text-neutral-600 bg-neutral-100';
const sL = (s: string): string => (({ present: 'Hadir', late: 'Terlambat', permit: 'Izin', sick: 'Sakit', absent: 'Absen', rejected: 'Ditolak' }) as Record<string, string>)[s] || s;
const gC = (l: string): string => (({ A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500' }) as Record<string, string>)[l] || 'bg-red-500';
const CC: Record<string, string> = { present: '#10b981', late: '#f59e0b', permit: '#3b82f6', sick: '#06b6d4', absent: '#ef4444', rejected: '#f43f5e' };
const tlC = (s: string): string => (({ present: 'bg-emerald-500', late: 'bg-amber-500', permit: 'bg-blue-500', sick: 'bg-cyan-500', absent: 'bg-red-500', rejected: 'bg-rose-500' }) as Record<string, string>)[s] || 'bg-neutral-500';
const ini = (n: string) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

function ModalW({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!show) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
