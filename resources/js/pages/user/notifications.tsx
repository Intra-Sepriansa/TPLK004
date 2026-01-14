import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Megaphone, AlertTriangle, Award, Info, CheckCircle, ExternalLink } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: { data: Notification[]; current_page: number; last_page: number };
    unreadCount: number;
}

export default function Notifications({ notifications, unreadCount }: Props) {
    const handleMarkAsRead = (id: number) => router.post(`/user/notifications/${id}/read`);
    const handleMarkAllAsRead = () => router.post('/user/notifications/read-all');

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Clock className="h-5 w-5" />;
            case 'announcement': return <Megaphone className="h-5 w-5" />;
            case 'alert': return <AlertTriangle className="h-5 w-5" />;
            case 'achievement': return <Award className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            default: return <Info className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'reminder': return 'bg-blue-100 text-blue-700';
            case 'announcement': return 'bg-purple-100 text-purple-700';
            case 'alert': return 'bg-red-100 text-red-700';
            case 'achievement': return 'bg-yellow-100 text-yellow-700';
            case 'warning': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgent</span>;
            case 'high': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Penting</span>;
            default: return null;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <StudentLayout>
            <Head title="Notifikasi" />
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100">Pemberitahuan</p>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Notifikasi
                                        {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full text-sm bg-white/20">{unreadCount}</span>}
                                    </h1>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <Button onClick={handleMarkAllAsRead} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Tandai Semua Dibaca
                                </Button>
                            )}
                        </div>
                        <p className="mt-4 text-blue-100">Pemberitahuan dan pengumuman terbaru</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {notifications.data.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer ${!notif.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                onClick={() => !notif.read_at && handleMarkAsRead(notif.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeColor(notif.type)}`}>
                                        {getTypeIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-900 dark:text-white">{notif.title}</span>
                                            {getPriorityBadge(notif.priority)}
                                            {!notif.read_at && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-slate-500">{formatTime(notif.created_at)}</span>
                                            {notif.action_url && (
                                                <a href={notif.action_url} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                                                    Lihat Detail <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {notifications.data.length === 0 && (
                            <div className="p-12 text-center">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500">Tidak ada notifikasi</p>
                            </div>
                        )}
                    </div>
                    {notifications.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {Array.from({ length: notifications.last_page }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.get('/user/notifications', { page: i + 1 })}
                                    className={`px-3 py-1 rounded text-sm ${notifications.current_page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
