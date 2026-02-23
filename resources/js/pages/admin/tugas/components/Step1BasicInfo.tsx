import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookOpen, Type, FileText, HelpCircle, Briefcase, Presentation, User, Users, Award, Percent, CheckCircle, Code, Terminal, Monitor, Database, Globe, Cpu, Layers, Book } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Course {
    id: number;
    code: string;
    nama: string;
    semester: string;
    sks: number;
}

interface Step1Props {
    data: any;
    setData: (field: string, value: any) => void;
    courses: Course[];
}

const COURSE_ICONS = [Code, Terminal, Monitor, Database, Globe, Cpu, Layers, Book];

export const Step1BasicInfo: React.FC<Step1Props> = ({ data, setData, courses }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Course Selection */}
            <GlassCard
                colorClass="hover:shadow-indigo-500/10"
                gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10"
                glowClass="bg-indigo-500"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Mata Kuliah
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pilih mata kuliah untuk tugas ini
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course, index) => {
                        const CourseIcon = COURSE_ICONS[index % COURSE_ICONS.length];
                        return (
                            <motion.button
                                key={course.id}
                                onClick={() => setData('course_id', course.id)}
                                className={`
                                    p-4 rounded-xl border-2 transition-all text-left
                                    ${data.course_id === course.id
                                        ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                    }
                                `}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center
                                            ${data.course_id === course.id
                                                ? 'bg-indigo-500'
                                                : 'bg-neutral-200 dark:bg-neutral-700'
                                            }
                                        `}>
                                            <CourseIcon className={`w-6 h-6 ${data.course_id === course.id ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                                        </div>
                                        <div>
                                            <div className="text-neutral-900 dark:text-white font-semibold flex items-center gap-2">
                                                {course.nama}
                                            </div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                                <span>{course.semester || 'Semester 1'}</span>
                                                <span>•</span>
                                                <span>{course.sks || '3'} SKS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {data.course_id === course.id && (
                                        <CheckCircle className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                    {courses.length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center py-6 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 border-dashed rounded-xl border-4">
                            Belum ada mata kuliah yang tersedia.
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Title Input */}
            <GlassCard
                colorClass="hover:shadow-violet-500/10"
                gradientClass="from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10"
                glowClass="bg-violet-500"
            >
                <Label className="flex items-center gap-2 text-neutral-900 dark:text-white mb-3">
                    <Type className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    Judul Tugas
                    <span className="text-red-500 dark:text-red-400">*</span>
                </Label>

                <Input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Contoh: Analisis Sistem Informasi Perpustakaan"
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 
                        rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 
                        focus:border-indigo-500/50 transition-all font-medium"
                />

                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        Gunakan judul yang jelas dan deskriptif
                    </p>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
                        {data.title?.length || 0}/200
                    </span>
                </div>
            </GlassCard>

            {/* Type & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type Selection */}
                <GlassCard
                    colorClass="hover:shadow-emerald-500/10"
                    gradientClass="from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10"
                    glowClass="bg-emerald-500"
                >
                    <Label className="flex items-center gap-2 text-neutral-900 dark:text-white mb-3">
                        <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        Jenis Tugas
                    </Label>

                    <div className="space-y-2">
                        {[
                            { value: 'assignment', label: 'Tugas Biasa', icon: FileText },
                            { value: 'quiz', label: 'Kuis', icon: HelpCircle },
                            { value: 'project', label: 'Proyek', icon: Briefcase },
                            { value: 'presentation', label: 'Presentasi', icon: Presentation },
                        ].map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setData('type', type.value)}
                                    className={`
                                        w-full flex items-center gap-3 p-3 rounded-xl 
                                        border-2 transition-all
                                        ${data.type === type.value
                                            ? 'bg-emerald-500/20 border-emerald-500 shadow-sm'
                                            : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                                        }
                                    `}
                                >
                                    <Icon className={`
                                        w-5 h-5
                                        ${data.type === type.value
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-neutral-500 dark:text-neutral-400'
                                        }
                                    `} />
                                    <span className={`
                                        font-medium
                                        ${data.type === type.value
                                            ? 'text-neutral-900 dark:text-white'
                                            : 'text-neutral-600 dark:text-neutral-300'
                                        }
                                    `}>
                                        {type.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </GlassCard>

                {/* Category Selection */}
                <GlassCard
                    colorClass="hover:shadow-fuchsia-500/10"
                    gradientClass="from-fuchsia-500/5 to-pink-500/5 dark:from-fuchsia-500/10 dark:to-pink-500/10"
                    glowClass="bg-fuchsia-500"
                >
                    <Label className="flex items-center gap-2 text-neutral-900 dark:text-white mb-3">
                        <Users className="w-5 h-5 text-fuchsia-500 dark:text-fuchsia-400" />
                        Kategori
                    </Label>

                    <div className="space-y-2">
                        {[
                            { value: 'individual', label: 'Individual', icon: User },
                            { value: 'group', label: 'Kelompok', icon: Users },
                        ].map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.value}
                                    onClick={() => setData('category', category.value)}
                                    className={`
                                        w-full flex items-center gap-3 p-3 rounded-xl 
                                        border-2 transition-all
                                        ${data.category === category.value
                                            ? 'bg-fuchsia-500/20 border-fuchsia-500 shadow-sm'
                                            : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                                        }
                                    `}
                                >
                                    <Icon className={`
                                        w-5 h-5
                                        ${data.category === category.value
                                            ? 'text-fuchsia-600 dark:text-fuchsia-400'
                                            : 'text-neutral-500 dark:text-neutral-400'
                                        }
                                    `} />
                                    <span className={`
                                        font-medium
                                        ${data.category === category.value
                                            ? 'text-neutral-900 dark:text-white'
                                            : 'text-neutral-600 dark:text-neutral-300'
                                        }
                                    `}>
                                        {category.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>

            {/* Points & Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Points */}
                <GlassCard
                    colorClass="hover:shadow-amber-500/10"
                    gradientClass="from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10"
                    glowClass="bg-amber-500"
                >
                    <Label className="flex items-center gap-2 text-neutral-900 dark:text-white mb-3">
                        <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        Total Poin
                    </Label>

                    <div className="relative">
                        <Input
                            type="number"
                            value={data.points}
                            onChange={(e) => setData('points', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 
                                rounded-xl text-neutral-900 dark:text-white pr-16 font-bold text-lg
                                focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 
                            text-neutral-500 dark:text-neutral-400 pointer-events-none font-medium">
                            poin
                        </div>
                    </div>
                </GlassCard>

                {/* Weight */}
                <GlassCard
                    colorClass="hover:shadow-cyan-500/10"
                    gradientClass="from-cyan-500/5 to-sky-500/5 dark:from-cyan-500/10 dark:to-sky-500/10"
                    glowClass="bg-cyan-500"
                >
                    <Label className="flex items-center gap-2 text-neutral-900 dark:text-white mb-3">
                        <Percent className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                        Bobot Nilai
                    </Label>

                    <div className="relative">
                        <Input
                            type="number"
                            value={data.weight}
                            onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 
                                rounded-xl text-neutral-900 dark:text-white pr-12 font-bold text-lg
                                focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 
                            text-neutral-500 dark:text-neutral-400 pointer-events-none font-bold text-lg">
                            %
                        </div>
                    </div>
                </GlassCard>
            </div>
        </motion.div>
    );
};
