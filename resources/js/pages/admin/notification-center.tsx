import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
    Bell, Send, Users, Trash2, Clock, CheckCircle, AlertTriangle,
    Megaphone, Info, Award, Plus
} from 'lucide-react';
import { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    notifiable_type: string;
    read_at: string | null;
    scheduled_at: string | null;
    created_at: string;
}

interface Props {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        unread: number;
        scheduled: number;
        by_type: Record<string, number>;
    };
    filters: { type: string; status: string };
    mahasiswaCount: number;
    dosenCount: number;
}

export default function NotificationCenter({ notifications, stats, filters, mahasiswaCount, dosenCount }: Props) {
    const [createModal, setCreateModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const form = useForm({
        target: 'all',
        target_ids: [] as number[],
        target_type: 'mahasiswa',
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        action_url: '',
        scheduled_at: '',
    });

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/notification-center', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleCreate = () => {
        form.post('/admin/notification-center', {
            onSuccess: () => {
                setCreateModal(false);
                form.reset();
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        router.post('/admin/notification-center/bulk-delete', { ids: selectedIds }, {
            onSuccess: () => setSelectedIds([])
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Clock className="h-4 w-4" />;
            case 'announcement': return <Megaphone className="h-4 w-4" />;
            case 'alert': return <AlertTriangle className="h-4 w-4" />;
            case 'achievement': return <Award className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
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
            case 'urgent': return <Badge variant="destructive">Urgent</Badge>;
            case 'high': return <Badge className="bg-orange-500">High</Badge>;
            case 'normal': return <Badge variant="secondary">Normal</Badge>;
            default: return <Badge variant="outline">Low</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Notification Center" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notification Center
                        </h1>
                        <p className="text-muted-foreground">Kelola notifikasi untuk mahasiswa dan dosen</p>
                    </div>
                    <Button onClick={() => setCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Kirim Notifikasi
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Bell className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Belum Dibaca</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                                </div>
                                <Info className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Terjadwal</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.scheduled}</p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Penerima</p>
                                    <p className="text-2xl font-bold">{mahasiswaCount + dosenCount}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Tipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.by_type).map(([type, count]) => (
                                <div key={type} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getTypeColor(type)}`}>
                                    {getTypeIcon(type)}
                                    <span className="capitalize">{type}: {count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters & Actions */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="achievement">Achievement</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="unread">Belum Dibaca</SelectItem>
                            <SelectItem value="read">Sudah Dibaca</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {selectedIds.length > 0 && (
                        <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="ml-auto">
                            <Trash2 className="h-4 w-4 mr-1" /> Hapus ({selectedIds.length})
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {notifications.data.map(notif => (
                                <div key={notif.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <Checkbox
                                            checked={selectedIds.includes(notif.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedIds(prev => 
                                                    checked 
                                                        ? [...prev, notif.id]
                                                        : prev.filter(id => id !== notif.id)
                                                );
                                            }}
                                        />
                                        <div className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium">{notif.title}</span>
                                                {getPriorityBadge(notif.priority)}
                                                {notif.read_at && <CheckCircle className="h-4 w-4 text-green-500" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                                                <span>•</span>
                                                <span className="capitalize">{notif.notifiable_type}</span>
                                                {notif.scheduled_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-purple-600">
                                                            Dijadwalkan: {new Date(notif.scheduled_at).toLocaleString('id-ID')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => router.delete(`/admin/notification-center/${notif.id}`)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {notifications.data.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Tidak ada notifikasi</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={createModal} onOpenChange={setCreateModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Kirim Notifikasi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Target Penerima</Label>
                            <Select value={form.data.target} onValueChange={(v) => form.setData('target', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua ({mahasiswaCount + dosenCount})</SelectItem>
                                    <SelectItem value="mahasiswa">Semua Mahasiswa ({mahasiswaCount})</SelectItem>
                                    <SelectItem value="dosen">Semua Dosen ({dosenCount})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Judul</Label>
                            <Input
                                className="mt-1"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Judul notifikasi"
                            />
                        </div>
                        <div>
                            <Label>Pesan</Label>
                            <Textarea
                                className="mt-1"
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                placeholder="Isi pesan notifikasi"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tipe</Label>
                                <Select value={form.data.type} onValueChange={(v) => form.setData('type', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reminder">Reminder</SelectItem>
                                        <SelectItem value="announcement">Announcement</SelectItem>
                                        <SelectItem value="alert">Alert</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Prioritas</Label>
                                <Select value={form.data.priority} onValueChange={(v) => form.setData('priority', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>URL Aksi (opsional)</Label>
                            <Input
                                className="mt-1"
                                value={form.data.action_url}
                                onChange={(e) => form.setData('action_url', e.target.value)}
                                placeholder="/user/absen"
                            />
                        </div>
                        <div>
                            <Label>Jadwalkan (opsional)</Label>
                            <Input
                                type="datetime-local"
                                className="mt-1"
                                value={form.data.scheduled_at}
                                onChange={(e) => form.setData('scheduled_at', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModal(false)}>Batal</Button>
                        <Button onClick={handleCreate} disabled={form.processing}>
                            <Send className="h-4 w-4 mr-2" />
                            Kirim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
