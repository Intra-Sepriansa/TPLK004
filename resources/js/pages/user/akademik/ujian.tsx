import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    GraduationCap, ArrowLeft, Calendar, Clock, AlertTriangle, 
    CheckCircle2, BookOpen, Target
} from 'lucide-react';
import { useState } from 'react';

interface Exam {
    id: number;
    course_id: number;
    course_name: string;
    type: 'UTS' | 'UAS';
    date: string;
    date_formatted: string;
    days_remaining: number;
    meeting_number: number;
    is_warning: boolean;
    is_critical: boolean;
}

interface ExamsByMonth {
    month: string;
    exams: Exam[];
}

interface Course {
    id: number;
    name: string;
    sks: number;
    uts_meeting: number;
    uas_meeting: number;
    current_meeting: number;
    total_meetings: number;
    uts_passed: boolean;
    uas_passed: boolean;
}

interface ChecklistItem {
    id: number;
    text: string;
}

interface Props {
    upcomingExams: Exam[];
    examsByMonth: ExamsByMonth[];
    courses: Course[];
    preparationChecklist: ChecklistItem[];
}

export default function AcademicExams({ upcomingExams, examsByMonth, courses, preparationChecklist }: Props) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleCheck = (examId: number, itemId: number) => {
        const key = `${examId}-${itemId}`;
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getCheckedCount = (examId: number) => {
        return preparationChecklist.filter(item => checkedItems[`${examId}-${item.id}`]).length;
    };

    return (
        <StudentLayout>
            <Head title="Kalender Ujian" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/user/akademik" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GraduationCap className="h-7 w-7 text-red-600" />
                            Kalender Ujian
                        </h1>
                        <p className="text-muted-foreground">Countdown UTS & UAS</p>
                    </div>
                </div>

                {/* Upcoming Exams */}
                {upcomingExams.length > 0 ? (
                    <>
                        {/* Critical/Warning Exams */}
                        {upcomingExams.filter(e => e.is_critical || e.is_warning).length > 0 && (
                            <div className="space-y-3">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    Perlu Perhatian
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {upcomingExams.filter(e => e.is_critical || e.is_warning).map((exam) => (
                                        <Card 
                                            key={exam.id} 
                                            className={`overflow-hidden ${
                                                exam.is_critical 
                                                    ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40' 
                                                    : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40'
                                            }`}
                                        >
                                            <div className={`h-1 ${exam.is_critical ? 'bg-red-500' : 'bg-amber-500'}`} />
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'}>
                                                                {exam.type}
                                                            </Badge>
                                                            {exam.is_critical && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Segera!
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h3 className="font-semibold">{exam.course_name}</h3>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{exam.date_formatted}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`text-right ${exam.is_critical ? 'text-red-600' : 'text-amber-600'}`}>
                                                        <p className="text-3xl font-bold">{exam.days_remaining}</p>
                                                        <p className="text-xs">hari lagi</p>
                                                    </div>
                                                </div>

                                                {/* Preparation Checklist */}
                                                <div className="mt-4 pt-4 border-t border-dashed">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-medium">Persiapan</p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {getCheckedCount(exam.id)}/{preparationChecklist.length}
                                                        </span>
                                                    </div>
                                                    <Progress 
                                                        value={(getCheckedCount(exam.id) / preparationChecklist.length) * 100} 
                                                        className="h-1.5 mb-3" 
                                                    />
                                                    <div className="space-y-2">
                                                        {preparationChecklist.slice(0, 3).map((item) => (
                                                            <div key={item.id} className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`${exam.id}-${item.id}`}
                                                                    checked={checkedItems[`${exam.id}-${item.id}`] || false}
                                                                    onCheckedChange={() => toggleCheck(exam.id, item.id)}
                                                                />
                                                                <label 
                                                                    htmlFor={`${exam.id}-${item.id}`}
                                                                    className={`text-sm ${checkedItems[`${exam.id}-${item.id}`] ? 'line-through text-muted-foreground' : ''}`}
                                                                >
                                                                    {item.text}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Exams by Month */}
                        <div className="space-y-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Jadwal Ujian
                            </h2>
                            {examsByMonth.map((monthData) => (
                                <Card key={monthData.month}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{monthData.month}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {monthData.exams.map((exam) => (
                                                <div 
                                                    key={exam.id} 
                                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                                        exam.is_critical 
                                                            ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' 
                                                            : exam.is_warning 
                                                                ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                                                                : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${exam.type === 'UTS' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-purple-100 dark:bg-purple-900/50'}`}>
                                                            <Target className={`h-5 w-5 ${exam.type === 'UTS' ? 'text-blue-600' : 'text-purple-600'}`} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'} className="text-xs">
                                                                    {exam.type}
                                                                </Badge>
                                                                <span className="font-medium">{exam.course_name}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{exam.date_formatted}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`text-right ${exam.is_critical ? 'text-red-600' : exam.is_warning ? 'text-amber-600' : ''}`}>
                                                        <p className="text-xl font-bold">{exam.days_remaining}</p>
                                                        <p className="text-xs text-muted-foreground">hari</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground">Belum ada ujian terjadwal</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Tambahkan mata kuliah untuk melihat jadwal ujian
                                </p>
                                <Link href="/user/akademik/matkul">
                                    <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
                                        Kelola Mata Kuliah
                                    </button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Course Progress Overview */}
                {courses.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-emerald-600" />
                                Progress Menuju Ujian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {courses.map((course) => (
                                    <div key={course.id} className="p-3 rounded-lg border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{course.name}</span>
                                            <Badge variant="outline">{course.sks} SKS</Badge>
                                        </div>
                                        <div className="relative">
                                            <Progress 
                                                value={(course.current_meeting / course.total_meetings) * 100} 
                                                className="h-3" 
                                            />
                                            {/* UTS Marker */}
                                            <div 
                                                className="absolute top-0 h-3 w-0.5 bg-amber-500"
                                                style={{ left: `${(course.uts_meeting / course.total_meetings) * 100}%` }}
                                            />
                                            {/* UAS Marker */}
                                            <div 
                                                className="absolute top-0 h-3 w-0.5 bg-red-500"
                                                style={{ left: `${(course.uas_meeting / course.total_meetings) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                            <span>P{course.current_meeting}/{course.total_meetings}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                    UTS (P{course.uts_meeting})
                                                    {course.uts_passed && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                    UAS (P{course.uas_meeting})
                                                    {course.uas_passed && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Preparation Tips */}
                <Card className="bg-gradient-to-r from-gray-900 to-black dark:from-blue-950/30 dark:to-black/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">Tips Persiapan Ujian</p>
                                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                    {preparationChecklist.map((item) => (
                                        <li key={item.id} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
