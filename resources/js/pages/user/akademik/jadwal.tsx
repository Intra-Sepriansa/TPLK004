import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle2, ArrowLeft, Monitor, Building2 } from 'lucide-react';

interface ScheduleItem {
    id: number;
    course_name: string;
    time: string;
    meeting_number: number;
    total_meetings: number;
    mode: 'online' | 'offline';
    is_completed: boolean;
    progress: number;
}

interface Props {
    weeklySchedule: {
        [day: string]: ScheduleItem[];
    };
    currentDay: string;
    dayNames: {
        [key: string]: string;
    };
    today: {
        day: string;
        date: string;
    };
}

export default function AcademicSchedule({ weeklySchedule, currentDay, dayNames, today }: Props) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/user/akademik" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="h-7 w-7 text-blue-600" />
                            Jadwal Mingguan
                        </h1>
                        <p className="text-muted-foreground">{today.day}, {today.date}</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span>Offline (Kamis)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Selesai</span>
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="grid gap-4 md:grid-cols-5">
                    {days.map((day) => {
                        const isToday = day === currentDay;
                        const schedule = weeklySchedule[day] || [];
                        
                        return (
                            <Card 
                                key={day} 
                                className={`${isToday ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className={`text-base flex items-center justify-between ${isToday ? 'text-blue-600' : ''}`}>
                                        <span>{dayNames[day]}</span>
                                        {isToday && (
                                            <Badge variant="default" className="bg-blue-500 text-xs">
                                                Hari Ini
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {schedule.length > 0 ? (
                                        schedule.map((item) => (
                                            <div 
                                                key={item.id} 
                                                className={`p-3 rounded-lg border ${
                                                    item.is_completed 
                                                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' 
                                                        : item.mode === 'offline' 
                                                            ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/50'
                                                            : 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.mode === 'offline' ? (
                                                            <Building2 className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <Monitor className="h-4 w-4 text-blue-600" />
                                                        )}
                                                        <Badge 
                                                            variant={item.mode === 'offline' ? 'default' : 'secondary'} 
                                                            className={`text-xs ${item.mode === 'offline' ? 'bg-emerald-500' : ''}`}
                                                        >
                                                            {item.mode === 'offline' ? 'Offline' : 'Online'}
                                                        </Badge>
                                                    </div>
                                                    {item.is_completed && (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="font-medium text-sm line-clamp-2">{item.course_name}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{item.time}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span>Pertemuan {item.meeting_number}/{item.total_meetings}</span>
                                                        <span>{item.progress}%</span>
                                                    </div>
                                                    <Progress value={item.progress} className="h-1.5" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">Tidak ada jadwal</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">Jadwal Kelas 06TPLK004</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Perkuliahan online dilaksanakan Senin - Jumat. Perkuliahan offline hanya di hari Kamis.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
