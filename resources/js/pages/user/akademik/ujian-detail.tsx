import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Save,
    Target,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import examIcon from '@/assets/dosen/dashboard/course-icon.png';

type Exam = {
    id: number;
    course_id: number;
    course_name: string;
    type: 'UTS' | 'UAS';
    date: string;
    date_formatted: string;
    time?: string;
    location?: string;
    duration?: number;
    notes?: string;
    days_remaining: number;
    meeting_number: number;
    is_warning: boolean;
    is_critical: boolean;
};

type Course = {
    id: number;
    name: string;
    sks: number;
    uts_meeting: number;
    uas_meeting: number;
    current_meeting: number;
    total_meetings: number;
    uts_passed: boolean;
    uas_passed: boolean;
};

type Props = {
    upcomingExams: Exam[];
    courses: Course[];
    selectedCourseId?: number | null;
    selectedExamId?: number | null;
};

export default function UjianDetail({ upcomingExams, courses, selectedCourseId, selectedExamId }: Props) {
    const [courseId, setCourseId] = useState<number | null>(selectedCourseId ?? courses[0]?.id ?? null);
    const [examId, setExamId] = useState<number | null>(selectedExamId ?? upcomingExams[0]?.id ?? null);
    const [draftMap, setDraftMap] = useState<Record<number, Partial<Exam>>>({});
    const [savedAt, setSavedAt] = useState<string | null>(null);

    const selectedCourse = useMemo(() => {
        if (!courseId) return null;
        return courses.find((course) => course.id === courseId) ?? null;
    }, [courseId, courses]);

    const selectedExam = useMemo(() => {
        if (!examId) return null;
        const exam = upcomingExams.find((item) => item.id === examId) ?? null;
        if (!exam) return null;
        const draft = draftMap[exam.id] ?? {};
        return { ...exam, ...draft };
    }, [examId, upcomingExams, draftMap]);

    const relatedExams = useMemo(() => {
        if (!selectedCourse) return upcomingExams;
        return upcomingExams.filter((exam) => exam.course_name === selectedCourse.name || exam.course_id === selectedCourse.id);
    }, [selectedCourse, upcomingExams]);

    const progressPercent = useMemo(() => {
        if (!selectedCourse || selectedCourse.total_meetings <= 0) return 0;
        return Math.round((selectedCourse.current_meeting / selectedCourse.total_meetings) * 100);
    }, [selectedCourse]);

    const handleExamDraftChange = (key: keyof Exam, value: string | number) => {
        if (!selectedExam) return;
        setDraftMap((prev) => ({
            ...prev,
            [selectedExam.id]: {
                ...(prev[selectedExam.id] ?? {}),
                [key]: value,
            },
        }));
    };

    const saveDraft = () => {
        setSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };

    return (
        <StudentLayout>
            <Head title="Detail Progress & Edit Ujian" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/akademik/ujian')}
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                            <motion.div
                                className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                            >
                                <img
                                    src={examIcon}
                                    alt="Detail Ujian"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>
                            <div className="flex-1 mt-1 sm:mt-0">
                                <p className="text-sm text-indigo-100 font-medium tracking-wide">Manajemen Ujian</p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Detail Progress & Edit Ujian</h1>
                                <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
                                    Satu halaman untuk memantau progress mata kuliah dan melakukan update detail ujian.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <Card className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-neutral-500 dark:text-neutral-400">Pilih Mata Kuliah</Label>
                            <Select
                                value={courseId ? String(courseId) : ''}
                                onValueChange={(value) => setCourseId(Number(value))}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Pilih mata kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={String(course.id)}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-sm text-neutral-500 dark:text-neutral-400">Pilih Ujian untuk Diedit</Label>
                            <Select
                                value={examId ? String(examId) : ''}
                                onValueChange={(value) => setExamId(Number(value))}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Pilih ujian" />
                                </SelectTrigger>
                                <SelectContent>
                                    {upcomingExams.map((exam) => (
                                        <SelectItem key={exam.id} value={String(exam.id)}>
                                            {exam.course_name} - {exam.type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-neutral-900 dark:text-white">
                                <BookOpen className="h-5 w-5 text-emerald-500" />
                                Detail Progress Mata Kuliah
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {selectedCourse ? (
                                <>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-base font-semibold text-neutral-900 dark:text-white">{selectedCourse.name}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                {selectedCourse.sks} SKS • Pertemuan {selectedCourse.current_meeting}/{selectedCourse.total_meetings}
                                            </p>
                                        </div>
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">{progressPercent}%</Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                            <span>Progress Semester</span>
                                            <span>{progressPercent}%</span>
                                        </div>
                                        <div className="relative">
                                            <Progress value={progressPercent} className="h-3" />
                                            <div className="absolute top-0 h-3 w-1 bg-amber-500 rounded" style={{ left: `${(selectedCourse.uts_meeting / selectedCourse.total_meetings) * 100}%` }} />
                                            <div className="absolute top-0 h-3 w-1 bg-rose-500 rounded" style={{ left: `${(selectedCourse.uas_meeting / selectedCourse.total_meetings) * 100}%` }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-3">
                                            <p className="text-xs text-amber-700 dark:text-amber-300">UTS</p>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">Pertemuan {selectedCourse.uts_meeting}</p>
                                            <p className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">
                                                {selectedCourse.uts_passed ? 'Sudah dilewati' : `${Math.max(0, selectedCourse.uts_meeting - selectedCourse.current_meeting)} pertemuan lagi`}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 p-3">
                                            <p className="text-xs text-rose-700 dark:text-rose-300">UAS</p>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">Pertemuan {selectedCourse.uas_meeting}</p>
                                            <p className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">
                                                {selectedCourse.uas_passed ? 'Sudah dilewati' : `${Math.max(0, selectedCourse.uas_meeting - selectedCourse.current_meeting)} pertemuan lagi`}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Timeline Pertemuan</p>
                                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                            {Array.from({ length: selectedCourse.total_meetings }, (_, idx) => idx + 1).map((meeting) => (
                                                <div
                                                    key={meeting}
                                                    className={`flex items-center justify-between rounded-lg px-3 py-2 border ${meeting <= selectedCourse.current_meeting
                                                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/20'
                                                        : 'border-white/20 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">P{meeting}</span>
                                                        {meeting === selectedCourse.uts_meeting && <Badge variant="secondary" className="text-[10px]">UTS</Badge>}
                                                        {meeting === selectedCourse.uas_meeting && <Badge className="text-[10px] bg-purple-500">UAS</Badge>}
                                                    </div>
                                                    {meeting <= selectedCourse.current_meeting && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Belum ada data mata kuliah.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-neutral-900 dark:text-white">
                                <Edit className="h-5 w-5 text-indigo-500" />
                                Edit Detail Ujian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedExam ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label>Mata Kuliah</Label>
                                            <Input
                                                value={selectedExam.course_name}
                                                onChange={(e) => handleExamDraftChange('course_name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Jenis Ujian</Label>
                                            <Select
                                                value={selectedExam.type}
                                                onValueChange={(value: 'UTS' | 'UAS') => handleExamDraftChange('type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UTS">UTS</SelectItem>
                                                    <SelectItem value="UAS">UAS</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label>Tanggal Ujian</Label>
                                            <Input
                                                type="date"
                                                value={selectedExam.date}
                                                onChange={(e) => handleExamDraftChange('date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Jam Ujian</Label>
                                            <Input
                                                type="time"
                                                value={selectedExam.time ?? ''}
                                                onChange={(e) => handleExamDraftChange('time', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label>Durasi (menit)</Label>
                                            <Input
                                                type="number"
                                                min={30}
                                                value={selectedExam.duration ?? 120}
                                                onChange={(e) => handleExamDraftChange('duration', Number(e.target.value || 0))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Lokasi</Label>
                                            <Input
                                                value={selectedExam.location ?? ''}
                                                onChange={(e) => handleExamDraftChange('location', e.target.value)}
                                                placeholder="Contoh: Ruang A-301"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Catatan Ujian</Label>
                                        <Input
                                            value={selectedExam.notes ?? ''}
                                            onChange={(e) => handleExamDraftChange('notes', e.target.value)}
                                            placeholder="Instruksi tambahan untuk persiapan"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 p-3 text-sm">
                                        <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                                            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {selectedExam.date_formatted}</span>
                                            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {selectedExam.days_remaining} hari lagi</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <Button
                                            onClick={saveDraft}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Simpan Perubahan
                                        </Button>
                                        {savedAt && (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                Disimpan {savedAt}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Belum ada ujian untuk diedit.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-neutral-900 dark:text-white">
                            <Target className="h-5 w-5 text-amber-500" />
                            Daftar Ujian Terkait
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {relatedExams.length > 0 ? relatedExams.map((exam) => (
                            <motion.button
                                key={exam.id}
                                whileHover={{ scale: 1.01, y: -1 }}
                                onClick={() => setExamId(exam.id)}
                                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                                    examId === exam.id
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                        : 'border-white/20 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">{exam.course_name}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{exam.type} • {exam.date_formatted}</p>
                                    </div>
                                    <Badge className="w-fit bg-amber-500 hover:bg-amber-600">{exam.days_remaining} hari</Badge>
                                </div>
                            </motion.button>
                        )) : (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Tidak ada ujian terkait mata kuliah terpilih.</p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </StudentLayout>
    );
}
