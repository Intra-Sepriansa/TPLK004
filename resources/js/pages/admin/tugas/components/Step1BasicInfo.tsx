import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
    Award,
    Book,
    BookOpen,
    Briefcase,
    CheckCircle,
    Code,
    Cpu,
    Database,
    FileText,
    Globe,
    HelpCircle,
    Layers,
    Monitor,
    Percent,
    Presentation,
    Terminal,
    Type,
    User,
    Users,
} from 'lucide-react';
import React from 'react';
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

const COURSE_ICONS = [
    Code,
    Terminal,
    Monitor,
    Database,
    Globe,
    Cpu,
    Layers,
    Book,
];

export const Step1BasicInfo: React.FC<Step1Props> = ({
    data,
    setData,
    courses,
}) => {
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
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-500/10 p-3">
                        <BookOpen className="h-6 w-6 text-indigo-400" />
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {courses.map((course, index) => {
                        const CourseIcon =
                            COURSE_ICONS[index % COURSE_ICONS.length];
                        return (
                            <motion.button
                                key={course.id}
                                onClick={() => setData('course_id', course.id)}
                                className={`rounded-xl border-2 p-4 text-left transition-all ${
                                    data.course_id === course.id
                                        ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                                        : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-700'
                                } `}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                                data.course_id === course.id
                                                    ? 'bg-indigo-500'
                                                    : 'bg-neutral-200 dark:bg-neutral-700'
                                            } `}
                                        >
                                            <CourseIcon
                                                className={`h-6 w-6 ${data.course_id === course.id ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                                                {course.nama}
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                                                <span>
                                                    {course.semester ||
                                                        'Semester 1'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {course.sks || '3'} SKS
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {data.course_id === course.id && (
                                        <CheckCircle className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                    {courses.length === 0 && (
                        <div className="col-span-1 rounded-xl border border-4 border-dashed border-neutral-200 py-6 text-center text-neutral-500 md:col-span-2 dark:border-neutral-800 dark:text-neutral-400">
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
                <Label className="mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                    <Type className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    Judul Tugas
                    <span className="text-red-500 dark:text-red-400">*</span>
                </Label>

                <Input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Contoh: Analisis Sistem Informasi Perpustakaan"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-medium text-neutral-900 placeholder-neutral-400 transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white dark:placeholder-neutral-500"
                />

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Gunakan judul yang jelas dan deskriptif
                    </p>
                    <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                        {data.title?.length || 0}/200
                    </span>
                </div>
            </GlassCard>

            {/* Type & Category */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Type Selection */}
                <GlassCard
                    colorClass="hover:shadow-emerald-500/10"
                    gradientClass="from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10"
                    glowClass="bg-emerald-500"
                >
                    <Label className="mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                        <FileText className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        Jenis Tugas
                    </Label>

                    <div className="space-y-2">
                        {[
                            {
                                value: 'assignment',
                                label: 'Tugas Biasa',
                                icon: FileText,
                            },
                            { value: 'quiz', label: 'Kuis', icon: HelpCircle },
                            {
                                value: 'project',
                                label: 'Proyek',
                                icon: Briefcase,
                            },
                            {
                                value: 'presentation',
                                label: 'Presentasi',
                                icon: Presentation,
                            },
                        ].map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setData('type', type.value)}
                                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                                        data.type === type.value
                                            ? 'border-emerald-500 bg-emerald-500/20 shadow-sm'
                                            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-600'
                                    } `}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${
                                            data.type === type.value
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-neutral-500 dark:text-neutral-400'
                                        } `}
                                    />
                                    <span
                                        className={`font-medium ${
                                            data.type === type.value
                                                ? 'text-neutral-900 dark:text-white'
                                                : 'text-neutral-600 dark:text-neutral-300'
                                        } `}
                                    >
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
                    <Label className="mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                        <Users className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-400" />
                        Kategori
                    </Label>

                    <div className="space-y-2">
                        {[
                            {
                                value: 'individual',
                                label: 'Individual',
                                icon: User,
                            },
                            { value: 'group', label: 'Kelompok', icon: Users },
                        ].map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.value}
                                    onClick={() =>
                                        setData('category', category.value)
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                                        data.category === category.value
                                            ? 'border-fuchsia-500 bg-fuchsia-500/20 shadow-sm'
                                            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-600'
                                    } `}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${
                                            data.category === category.value
                                                ? 'text-fuchsia-600 dark:text-fuchsia-400'
                                                : 'text-neutral-500 dark:text-neutral-400'
                                        } `}
                                    />
                                    <span
                                        className={`font-medium ${
                                            data.category === category.value
                                                ? 'text-neutral-900 dark:text-white'
                                                : 'text-neutral-600 dark:text-neutral-300'
                                        } `}
                                    >
                                        {category.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>

            {/* Points & Weight */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Points */}
                <GlassCard
                    colorClass="hover:shadow-amber-500/10"
                    gradientClass="from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10"
                    glowClass="bg-amber-500"
                >
                    <Label className="mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                        <Award className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        Total Poin
                    </Label>

                    <div className="relative">
                        <Input
                            type="number"
                            value={data.points}
                            onChange={(e) =>
                                setData('points', parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-16 text-lg font-bold text-neutral-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white"
                        />
                        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-neutral-500 dark:text-neutral-400">
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
                    <Label className="mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                        <Percent className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                        Bobot Nilai
                    </Label>

                    <div className="relative">
                        <Input
                            type="number"
                            value={data.weight}
                            onChange={(e) =>
                                setData(
                                    'weight',
                                    parseFloat(e.target.value) || 0,
                                )
                            }
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-12 text-lg font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white"
                        />
                        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-bold text-neutral-500 dark:text-neutral-400">
                            %
                        </div>
                    </div>
                </GlassCard>
            </div>
        </motion.div>
    );
};
