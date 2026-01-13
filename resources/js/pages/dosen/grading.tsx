import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
    GraduationCap, Download, Users, Award, AlertTriangle, 
    CheckCircle, Edit, TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface Grade {
    mahasiswa_id: number;
    nama: string;
    nim: string;
    total_sessions: number;
    attended_sessions: number;
    attendance_rate: number;
    average_points: number;
    attendance_grade: number;
    grade_letter: string;
    can_take_uas: boolean;
    details: Array<{
        meeting: number;
        title: string;
        date: string;
        status: string;
        points: number;
    }>;
}

interface Props {
    dosen: { id: number; nama: string };
    courses: Array<{ id: number; nama: string; sks: number }>;
    selectedCourseId: number | null;
    grades: {
        course: { id: number; nama: string; sks: number };
        summary: {
            total_students: number;
            total_sessions: number;
            grade_distribution: Record<string, number>;
            average_attendance_rate: number;
            students_at_risk: number;
        };
        grades: Grade[];
    } | null;
}

export default function Grading({ dosen, courses, selectedCourseId, grades }: Props) {
    const [overrideModal, setOverrideModal] = useState<{ open: boolean; logId: number | null; currentStatus: string }>({
        open: false, logId: null, currentStatus: ''
    });
    const [detailModal, setDetailModal] = useState<{ open: boolean; student: Grade | null }>({ open: false, student: null });

    const overrideForm = useForm({ log_id: 0, status: '', reason: '' });

    const handleCourseChange = (courseId: string) => {
        router.get('/dosen/grading', { course_id: courseId }, { preserveState: true });
    };

    const handleExport = () => {
        if (selectedCourseId) {
            window.location.href = `/dosen/grading/export/${selectedCourseId}`;
        }
    };

    const handleOverride = () => {
        overrideForm.post('/dosen/grading/override', {
            onSuccess: () => {
                setOverrideModal({ open: false, logId: null, currentStatus: '' });
                overrideForm.reset();
            }
        });
    };

    const getGradeColor = (letter: string) => {
        switch (letter) {
            case 'A': return 'bg-green-500';
            case 'B': return 'bg-blue-500';
            case 'C': return 'bg-yellow-500';
            case 'D': return 'bg-orange-500';
            default: return 'bg-red-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'late': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            case 'permit': case 'sick': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-red-600 bg-red-100 dark:bg-red-900/30';
        }
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Penilaian Kehadiran" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Penilaian Kehadiran
                        </h1>
                        <p className="text-muted-foreground">Kalkulasi nilai kehadiran otomatis</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={String(selectedCourseId || '')} onValueChange={handleCourseChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {grades && (
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        )}
                    </div>
                </div>

                {!selectedCourseId && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Pilih mata kuliah untuk melihat nilai kehadiran</p>
                        </CardContent>
                    </Card>
                )}

                {grades && (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-2xl font-bold">{grades.summary.total_students}</p>
                                        <p className="text-xs text-muted-foreground">Mahasiswa</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
                                        <p className="text-2xl font-bold">{grades.summary.average_attendance_rate}%</p>
                                        <p className="text-xs text-muted-foreground">Rata-rata</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Award className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                                        <p className="text-2xl font-bold">{grades.summary.total_sessions}</p>
                                        <p className="text-xs text-muted-foreground">Pertemuan</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-2" />
                                        <p className="text-2xl font-bold text-red-600">{grades.summary.students_at_risk}</p>
                                        <p className="text-xs text-muted-foreground">Tidak Bisa UAS</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-center gap-1">
                                        {Object.entries(grades.summary.grade_distribution).map(([grade, count]) => (
                                            <div key={grade} className="text-center px-2">
                                                <div className={`w-6 h-6 rounded-full ${getGradeColor(grade)} text-white text-xs flex items-center justify-center mx-auto`}>
                                                    {grade}
                                                </div>
                                                <p className="text-xs mt-1">{count}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grades Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Nilai</CardTitle>
                                <CardDescription>{grades.course.nama} ({grades.course.sks} SKS)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3">No</th>
                                                <th className="text-left p-3">NIM</th>
                                                <th className="text-left p-3">Nama</th>
                                                <th className="text-center p-3">Hadir</th>
                                                <th className="text-center p-3">Rate</th>
                                                <th className="text-center p-3">Poin</th>
                                                <th className="text-center p-3">Grade</th>
                                                <th className="text-center p-3">UAS</th>
                                                <th className="text-center p-3">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grades.grades.map((g, idx) => (
                                                <tr key={g.mahasiswa_id} className="border-b hover:bg-muted/50">
                                                    <td className="p-3">{idx + 1}</td>
                                                    <td className="p-3 font-mono text-xs">{g.nim}</td>
                                                    <td className="p-3">{g.nama}</td>
                                                    <td className="p-3 text-center">{g.attended_sessions}/{g.total_sessions}</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={g.attendance_rate} className="h-2 w-16" />
                                                            <span className="text-xs">{g.attendance_rate}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center font-medium">{g.average_points}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded text-white text-xs font-bold ${getGradeColor(g.grade_letter)}`}>
                                                            {g.grade_letter}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {g.can_take_uas ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                        ) : (
                                                            <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setDetailModal({ open: true, student: g })}
                                                        >
                                                            Detail
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal({ open, student: detailModal.student })}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Kehadiran</DialogTitle>
                    </DialogHeader>
                    {detailModal.student && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="font-medium">{detailModal.student.nama}</p>
                                    <p className="text-sm text-muted-foreground">{detailModal.student.nim}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded text-white font-bold ${getGradeColor(detailModal.student.grade_letter)}`}>
                                        {detailModal.student.grade_letter}
                                    </span>
                                    <p className="text-sm text-muted-foreground mt-1">{detailModal.student.average_points} poin</p>
                                </div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-background">
                                        <tr className="border-b">
                                            <th className="text-left p-2">Pertemuan</th>
                                            <th className="text-left p-2">Tanggal</th>
                                            <th className="text-center p-2">Status</th>
                                            <th className="text-center p-2">Poin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailModal.student.details.map(d => (
                                            <tr key={d.meeting} className="border-b">
                                                <td className="p-2">{d.title}</td>
                                                <td className="p-2 text-muted-foreground">{d.date}</td>
                                                <td className="p-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusColor(d.status)}`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-center font-medium">{d.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Override Modal */}
            <Dialog open={overrideModal.open} onOpenChange={(open) => setOverrideModal({ ...overrideModal, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Override Status Kehadiran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Status Baru</label>
                            <Select value={overrideForm.data.status} onValueChange={(v) => overrideForm.setData('status', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="present">Hadir</SelectItem>
                                    <SelectItem value="late">Terlambat</SelectItem>
                                    <SelectItem value="permit">Izin</SelectItem>
                                    <SelectItem value="sick">Sakit</SelectItem>
                                    <SelectItem value="rejected">Tidak Hadir</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Alasan</label>
                            <Textarea
                                className="mt-1"
                                value={overrideForm.data.reason}
                                onChange={(e) => overrideForm.setData('reason', e.target.value)}
                                placeholder="Alasan perubahan status..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOverrideModal({ open: false, logId: null, currentStatus: '' })}>
                            Batal
                        </Button>
                        <Button onClick={handleOverride} disabled={overrideForm.processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
