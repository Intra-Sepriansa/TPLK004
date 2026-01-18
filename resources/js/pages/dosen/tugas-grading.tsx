import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    ArrowLeft,
    Award,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    GraduationCap,
    MessageSquare,
    Save,
    Sparkles,
    User,
    AlertTriangle,
    TrendingUp,
} from 'lucide-react';

type Submission = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string };
    content: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    grade: number | null;
    grade_letter: string | null;
    feedback: string | null;
    submitted_at: string;
    graded_at: string | null;
    is_late: boolean;
};

type Props = {
    tugas: { id: number; judul: string; deadline: string; max_grade: number };
    submissions: Submission[];
    stats: { total: number; graded: number; pending: number; avg_grade: number };
};

export default function DosenTugasGrading({ tugas, submissions, stats }: Props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showGradeDialog, setShowGradeDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

    useEffect(() => { setIsLoaded(true); }, []);

    const openGradeDialog = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGradeForm({
            grade: submission.grade?.toString() || '',
            feedback: submission.feedback || '',
        });
        setShowGradeDialog(true);
    };

    const openDetailDialog = (submission: Submission) => {
        setSelectedSubmission(submission);
        setShowDetailDialog(true);
    };

    const handleGrade = () => {
        if (!selectedSubmission) return;
        router.patch(`/dosen/tugas/submission/${selectedSubmission.id}/grade`, {
            grade: parseFloat(gradeForm.grade),
            feedback: gradeForm.feedback,
        }, {
            onSuccess: () => {
                setShowGradeDialog(false);
                setSelectedSubmission(null);
            },
        });
    };

    const getStatusBadge = (status: string, isLate: boolean) => {
        if (status === 'graded') {
            return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">✓ Dinilai</Badge>;
        }
        if (isLate) {
            return <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white">⚠️ Terlambat</Badge>;
        }
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">⏳ Menunggu</Badge>;
    };

    const getGradeBadge = (grade: number | null, letter: string | null) => {
        if (grade === null) return null;
        const colors: Record<string, string> = {
            'A': 'from-emerald-500 to-green-500',
            'B': 'from-blue-500 to-indigo-500',
            'C': 'from-amber-500 to-yellow-500',
            'D': 'from-orange-500 to-red-400',
            'E': 'from-red-500 to-rose-600',
        };
        const color = colors[letter || 'E'] || colors['E'];
        return (
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${color} text-white shadow-lg`}>
                    {grade.toFixed(1)}
                </span>
                {letter && (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-gradient-to-r ${color} text-white shadow-lg`}>
                        {letter}
                    </span>
                )}
            </div>
        );
    };

    return (
        <DosenLayout>
            <Head title={`Penilaian - ${tugas.judul}`} />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}
                        className="mb-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Detail Tugas
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                <Sparkles className="h-8 w-8 animate-pulse" /> Penilaian Tugas
                            </h1>
                            <p className="text-muted-foreground mt-1">{tugas.judul}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: FileText, label: 'Total Submission', value: stats.total, color: 'from-blue-500 to-indigo-500', delay: '0ms' },
                        { icon: CheckCircle, label: 'Sudah Dinilai', value: stats.graded, color: 'from-emerald-500 to-teal-500', delay: '100ms' },
                        { icon: Clock, label: 'Menunggu Nilai', value: stats.pending, color: 'from-amber-500 to-orange-500', delay: '200ms' },
                        { icon: TrendingUp, label: 'Rata-rata Nilai', value: stats.avg_grade.toFixed(1), color: 'from-purple-500 to-pink-500', delay: '300ms' },
                    ].map((stat, i) => (
                        <div key={i} className={`rounded-2xl border bg-card p-5 transition-all duration-500 hover:scale-105 hover:shadow-xl group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: stat.delay }}>
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submissions List */}
                <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Submission</h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-gray-900/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Waktu Submit</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Nilai</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">Belum ada submission</p>
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((submission, index) => (
                                        <tr
                                            key={submission.id}
                                            className={`hover:bg-slate-50 dark:hover:bg-gray-900/30 transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                            style={{ transitionDelay: `${500 + index * 50}ms` }}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                                        {submission.mahasiswa.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{submission.mahasiswa.nama}</p>
                                                        <p className="text-sm text-slate-500">{submission.mahasiswa.nim}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Clock className="h-4 w-4" />
                                                    {submission.submitted_at}
                                                </div>
                                                {submission.is_late && (
                                                    <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Terlambat
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(submission.status, submission.is_late)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getGradeBadge(submission.grade, submission.grade_letter) || (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openDetailDialog(submission)}
                                                        className="hover:bg-blue-50 hover:border-blue-300"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" /> Lihat
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openGradeDialog(submission)}
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                                    >
                                                        <Award className="h-4 w-4 mr-1" /> Nilai
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Grade Dialog */}
                <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-indigo-700 flex items-center gap-2">
                                <Award className="h-5 w-5" /> Beri Nilai
                            </DialogTitle>
                        </DialogHeader>
                        {selectedSubmission && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-lg">
                                            {selectedSubmission.mahasiswa.nama.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{selectedSubmission.mahasiswa.nama}</p>
                                            <p className="text-sm text-muted-foreground">{selectedSubmission.mahasiswa.nim}</p>
                                        </div>
                                    </div>
                                    {selectedSubmission.is_late && (
                                        <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Submission terlambat - akan ada pengurangan nilai
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Nilai (0-100)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={gradeForm.grade}
                                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                        className="text-2xl font-bold text-center"
                                    />
                                </div>
                                <div>
                                    <Label>Feedback (Opsional)</Label>
                                    <Textarea
                                        value={gradeForm.feedback}
                                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                        placeholder="Berikan feedback untuk mahasiswa..."
                                        rows={4}
                                    />
                                </div>
                                <Button
                                    onClick={handleGrade}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                    disabled={!gradeForm.grade}
                                >
                                    <Save className="h-4 w-4 mr-2" /> Simpan Nilai
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-indigo-700 flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Detail Submission
                            </DialogTitle>
                        </DialogHeader>
                        {selectedSubmission && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-lg">
                                                {selectedSubmission.mahasiswa.nama.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{selectedSubmission.mahasiswa.nama}</p>
                                                <p className="text-sm text-muted-foreground">{selectedSubmission.mahasiswa.nim}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(selectedSubmission.status, selectedSubmission.is_late)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <p className="text-blue-600 dark:text-blue-400 font-medium">Waktu Submit</p>
                                        <p className="text-slate-700 dark:text-slate-300">{selectedSubmission.submitted_at}</p>
                                    </div>
                                    {selectedSubmission.graded_at && (
                                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                            <p className="text-emerald-600 dark:text-emerald-400 font-medium">Waktu Dinilai</p>
                                            <p className="text-slate-700 dark:text-slate-300">{selectedSubmission.graded_at}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedSubmission.content && (
                                    <div>
                                        <Label className="text-slate-600">Jawaban:</Label>
                                        <div className="mt-2 p-4 rounded-xl bg-white dark:bg-gray-900 border whitespace-pre-wrap">
                                            {selectedSubmission.content}
                                        </div>
                                    </div>
                                )}

                                {selectedSubmission.file_path && (
                                    <div>
                                        <Label className="text-slate-600">File Lampiran:</Label>
                                        <a
                                            href={selectedSubmission.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                                        >
                                            <Download className="h-5 w-5" />
                                            <span>{selectedSubmission.file_name || 'Download File'}</span>
                                        </a>
                                    </div>
                                )}

                                {selectedSubmission.grade !== null && (
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">Nilai:</span>
                                            {getGradeBadge(selectedSubmission.grade, selectedSubmission.grade_letter)}
                                        </div>
                                        {selectedSubmission.feedback && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" /> Feedback:
                                                </p>
                                                <p className="mt-1 text-slate-700 dark:text-slate-300">{selectedSubmission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={() => {
                                        setShowDetailDialog(false);
                                        openGradeDialog(selectedSubmission);
                                    }}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    <Award className="h-4 w-4 mr-2" /> {selectedSubmission.grade !== null ? 'Edit Nilai' : 'Beri Nilai'}
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DosenLayout>
    );
}
