import { motion } from 'framer-motion';
import {
    Award,
    ChevronRight,
    Clock,
    FileText,
    HelpCircle,
    Info,
    Layers,
    Lightbulb,
    Percent,
    Plus,
    Presentation,
    Sparkles,
    Target,
} from 'lucide-react';
import React from 'react';
import { GlassCard } from './GlassCard';

interface SidebarProps {
    data: any;
    courseName?: string;
    studentCount: number;
    templates: any[];
}

export const SidebarComponents: React.FC<SidebarProps> = ({
    data,
    courseName,
    studentCount,
    templates,
}) => {
    const calculateProgress = () => {
        let progress = 0;
        if (data.course_id && data.title && data.title.length >= 10)
            progress += 20;
        if (data.description && data.description.length >= 50) progress += 20;
        if ((data.rubrics?.length || 0) > 0 || data.grading_method === 'points')
            progress += 20;
        if (studentCount > 0 || data.assignment_mode === 'all') progress += 20;
        if (data.deadline) progress += 20;
        return progress;
    };

    const progress = calculateProgress();

    return (
        <div className="space-y-6">
            {/* Quick Info Card */}
            <GlassCard
                colorClass="hover:shadow-rose-500/10"
                gradientClass="from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10"
                glowClass="bg-rose-500"
            >
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <Info className="h-5 w-5 text-indigo-400" />
                    Info Cepat
                </h3>

                {/* Course Badge */}
                <div className="mb-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
                    <div className="mb-1 text-xs text-indigo-400">
                        Mata Kuliah
                    </div>
                    <div
                        className="truncate font-medium text-white"
                        title={courseName || 'Pilih Mata Kuliah'}
                    >
                        {courseName || 'Belum dipilih'}
                    </div>
                </div>

                {/* Deadline */}
                <div
                    className={`mb-4 rounded-xl border p-4 ${
                        data.deadline
                            ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10'
                            : 'border-slate-700 bg-slate-900/50'
                    }`}
                >
                    <div className="mb-2 flex items-center gap-2">
                        <Clock
                            className={`h-4 w-4 ${data.deadline ? 'text-amber-400' : 'text-slate-400'}`}
                        />
                        <span
                            className={`text-xs font-semibold ${data.deadline ? 'text-amber-400' : 'text-slate-400'}`}
                        >
                            DEADLINE
                        </span>
                    </div>
                    {data.deadline ? (
                        <>
                            <div className="mb-1 text-sm font-medium text-white">
                                Sesuai Jadwal Diatur
                            </div>
                            <div className="text-xs text-slate-400">
                                {new Date(data.deadline).toLocaleDateString(
                                    'id-ID',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-slate-400">
                            Belum diatur
                        </div>
                    )}
                </div>

                {/* Points & Weight */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-center">
                        <Award className="mx-auto mb-1 h-5 w-5 text-violet-400" />
                        <div className="text-lg font-bold text-white">
                            {data.points || 0}
                        </div>
                        <div className="text-xs text-slate-400">Poin</div>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-center">
                        <Percent className="mx-auto mb-1 h-5 w-5 text-blue-400" />
                        <div className="text-lg font-bold text-white">
                            {data.weight || 0}%
                        </div>
                        <div className="text-xs text-slate-400">Bobot</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Progress Setup</span>
                        <span className="font-semibold text-indigo-400">
                            {progress}%
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">
                            Mahasiswa{' '}
                            {data.assignment_mode !== 'all' ? 'Tugas' : 'Kelas'}
                        </span>
                        <span className="font-medium text-white">
                            {studentCount > 0
                                ? `${studentCount} orang`
                                : 'Semua'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lampiran</span>
                        <span className="font-medium text-white">
                            {(data.attachments || []).length} file
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rubrik</span>
                        <span className="font-medium text-white">
                            {(data.rubrics || []).length} kriteria
                        </span>
                    </div>
                </div>
            </GlassCard>

            {/* Template Library Card */}
            <GlassCard
                colorClass="hover:shadow-violet-500/10"
                gradientClass="from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10"
                glowClass="bg-violet-500"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-white">
                        <Layers className="h-5 w-5 text-indigo-400" />
                        Template
                    </h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">
                        Lihat Semua
                    </button>
                </div>

                <div className="space-y-2">
                    {templates.map((template) => {
                        let Icon = FileText;
                        if (template.category === 'presentation')
                            Icon = Presentation;
                        if (template.category === 'quiz') Icon = HelpCircle;

                        return (
                            <button
                                key={template.id}
                                className="group w-full rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-indigo-500/10 p-2 transition-colors group-hover:bg-indigo-500/20">
                                        <Icon className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Digunakan{' '}
                                            {template.usage_count || 0}x
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-indigo-400" />
                                </div>
                            </button>
                        );
                    })}
                    {templates.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-700 py-4 text-center text-xs text-slate-500">
                            Belum ada template tersimpan.
                        </div>
                    )}
                </div>

                {/* Create Template Button */}
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-indigo-400 transition-all hover:bg-indigo-500/20">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        Buat Template Baru
                    </span>
                </button>
            </GlassCard>

            {/* Tips & Guidelines Card */}
            <GlassCard
                colorClass="hover:shadow-amber-500/10"
                gradientClass="from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10"
                glowClass="bg-amber-500"
            >
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    Tips & Panduan
                </h3>

                <div className="space-y-3">
                    {[
                        {
                            icon: Lightbulb,
                            title: 'Judul yang Jelas',
                            desc: 'Gunakan judul yang deskriptif dan mudah dipahami mahasiswa',
                        },
                        {
                            icon: Target,
                            title: 'Tujuan Spesifik',
                            desc: 'Jelaskan tujuan pembelajaran yang ingin dicapai pada kolom deskripsi',
                        },
                        {
                            icon: Clock,
                            title: 'Deadline Realistis',
                            desc: 'Berikan durasi pengerjaan yang relevan dengan beban SKS',
                        },
                    ].map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <div
                                key={index}
                                className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2">
                                        <Icon className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="mb-1 text-sm font-medium text-white">
                                            {tip.title}
                                        </div>
                                        <div className="text-xs leading-snug text-slate-400">
                                            {tip.desc}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Help Link */}
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2 text-slate-300 transition-all hover:bg-slate-700 hover:text-white">
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-sm">Pusat Bantuan Dosen</span>
                </button>
            </GlassCard>
        </div>
    );
};
