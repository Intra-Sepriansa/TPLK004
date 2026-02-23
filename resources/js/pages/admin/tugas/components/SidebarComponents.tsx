import React from 'react';
import { motion } from 'framer-motion';
import { Info, Clock, Award, Percent, Layers, FileText, Presentation, HelpCircle, ChevronRight, Plus, Sparkles, Lightbulb, Target } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SidebarProps {
    data: any;
    courseName?: string;
    studentCount: number;
    templates: any[];
}

export const SidebarComponents: React.FC<SidebarProps> = ({ data, courseName, studentCount, templates }) => {

    const calculateProgress = () => {
        let progress = 0;
        if (data.course_id && data.title && data.title.length >= 10) progress += 20;
        if (data.description && data.description.length >= 50) progress += 20;
        if ((data.rubrics?.length || 0) > 0 || data.grading_method === 'points') progress += 20;
        if (studentCount > 0 || data.assignment_mode === 'all') progress += 20;
        if (data.deadline) progress += 20;
        return progress;
    };

    const progress = calculateProgress();

    return (
        <div className="space-y-6">
            {/* Quick Info Card */}
            <GlassCard colorClass="hover:shadow-rose-500/10" gradientClass="from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10" glowClass="bg-rose-500">

                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" />
                    Info Cepat
                </h3>

                {/* Course Badge */}
                <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                    <div className="text-xs text-indigo-400 mb-1">Mata Kuliah</div>
                    <div className="text-white font-medium truncate" title={courseName || 'Pilih Mata Kuliah'}>
                        {courseName || 'Belum dipilih'}
                    </div>
                </div>

                {/* Deadline */}
                <div className={`mb-4 p-4 border rounded-xl 
                    ${data.deadline
                        ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                        : 'bg-slate-900/50 border-slate-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className={`w-4 h-4 ${data.deadline ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className={`text-xs font-semibold ${data.deadline ? 'text-amber-400' : 'text-slate-400'}`}>
                            DEADLINE
                        </span>
                    </div>
                    {data.deadline ? (
                        <>
                            <div className="text-sm font-medium text-white mb-1">
                                Sesuai Jadwal Diatur
                            </div>
                            <div className="text-xs text-slate-400">
                                {new Date(data.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-slate-400">Belum diatur</div>
                    )}
                </div>

                {/* Points & Weight */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-900/50 rounded-xl text-center border border-slate-700">
                        <Award className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{data.points || 0}</div>
                        <div className="text-xs text-slate-400">Poin</div>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-xl text-center border border-slate-700">
                        <Percent className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{data.weight || 0}%</div>
                        <div className="text-xs text-slate-400">Bobot</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-400">Progress Setup</span>
                        <span className="text-indigo-400 font-semibold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
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
                        <span className="text-slate-400">Mahasiswa {data.assignment_mode !== 'all' ? 'Tugas' : 'Kelas'}</span>
                        <span className="text-white font-medium">{studentCount > 0 ? `${studentCount} orang` : 'Semua'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lampiran</span>
                        <span className="text-white font-medium">{(data.attachments || []).length} file</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rubrik</span>
                        <span className="text-white font-medium">{(data.rubrics || []).length} kriteria</span>
                    </div>
                </div>
            </GlassCard>

            {/* Template Library Card */}
            <GlassCard colorClass="hover:shadow-violet-500/10" gradientClass="from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10" glowClass="bg-violet-500">

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-400" />
                        Template
                    </h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">
                        Lihat Semua
                    </button>
                </div>

                <div className="space-y-2">
                    {templates.map((template) => {
                        let Icon = FileText;
                        if (template.category === 'presentation') Icon = Presentation;
                        if (template.category === 'quiz') Icon = HelpCircle;

                        return (
                            <button
                                key={template.id}
                                className="w-full p-3 bg-slate-900/50 hover:bg-slate-800/50 
                                border border-slate-700 hover:border-indigo-500/50 
                                rounded-xl transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg 
                                    group-hover:bg-indigo-500/20 transition-colors">
                                        <Icon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-white font-medium">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Digunakan {template.usage_count || 0}x
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 
                                    group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </button>
                        );
                    })}
                    {templates.length === 0 && (
                        <div className="text-center py-4 text-xs text-slate-500 border border-slate-700 border-dashed rounded-xl">
                            Belum ada template tersimpan.
                        </div>
                    )}
                </div>

                {/* Create Template Button */}
                <button className="w-full mt-4 px-4 py-2 bg-indigo-500/10 
                    hover:bg-indigo-500/20 border border-indigo-500/30 
                    rounded-xl text-indigo-400 transition-all flex items-center 
                    justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Buat Template Baru</span>
                </button>
            </GlassCard>

            {/* Tips & Guidelines Card */}
            <GlassCard colorClass="hover:shadow-amber-500/10" gradientClass="from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" glowClass="bg-amber-500">

                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Tips & Panduan
                </h3>

                <div className="space-y-3">
                    {[
                        { icon: Lightbulb, title: 'Judul yang Jelas', desc: 'Gunakan judul yang deskriptif dan mudah dipahami mahasiswa' },
                        { icon: Target, title: 'Tujuan Spesifik', desc: 'Jelaskan tujuan pembelajaran yang ingin dicapai pada kolom deskripsi' },
                        { icon: Clock, title: 'Deadline Realistis', desc: 'Berikan durasi pengerjaan yang relevan dengan beban SKS' }
                    ].map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <div key={index} className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                                        <Icon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-medium mb-1">{tip.title}</div>
                                        <div className="text-xs text-slate-400 leading-snug">{tip.desc}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Help Link */}
                <button className="w-full mt-4 px-4 py-2 bg-slate-700/50 
                    hover:bg-slate-700 border border-slate-600 rounded-xl 
                    text-slate-300 hover:text-white transition-all flex 
                    items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Pusat Bantuan Dosen</span>
                </button>
            </GlassCard>
        </div>
    );
};
