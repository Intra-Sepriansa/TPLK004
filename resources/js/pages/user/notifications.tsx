import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Bell, Clock, Megaphone, AlertTriangle, Award, Info, 
    CheckCircle, ExternalLink
} from 'lucide-react';

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
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
    };
    unreadCount: number;
}

export default function Notifications({ notifications, unreadCount }: Props) {
    const handleMarkAsRead = (id: number) => {
        router.post(`/user/notifications/${id}/read`);
    };

    const handleMarkAllAsRead = () => {
        router.post('/user/notifications/read-all');
    };

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
            case 'reminder': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'announcement': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'alert': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
            case 'achievement': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
            case 'warning': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
            case 'high': return <Badge className="bg-orange-500 text-xs">Penting</Badge>;
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
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notifikasi
                            {unreadCount > 0 && (
                                <Badge variant="destructive">{unreadCount}</Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground">Pemberitahuan dan pengumuman</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {notifications.data.map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notif.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    onClick={() => !notif.read_at && handleMarkAsRead(notif.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium">{notif.title}</span>
                                                {getPriorityBadge(notif.priority)}
                                                {!notif.read_at && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                                {notif.action_url && (
                                                    <a 
                                                        href={notif.action_url}
                                                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                                                    >
                                                        Lihat Detail <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {notifications.data.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Tidak ada notifikasi</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: notifications.last_page }, (_, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={notifications.current_page === i + 1 ? 'default' : 'outline'}
                                onClick={() => router.get('/user/notifications', { page: i + 1 })}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
