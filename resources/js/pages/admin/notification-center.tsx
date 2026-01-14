import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
    Bell, Send, Users, Trash2, Clock, CheckCircle, AlertTriangle,
    Megaphone, Info, Award, Plus, AlertCircle, X, Filter, Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
    const [detailModal, setDetailModal] = useState<{ open: boolean; notification: Notification | null }>({ open: false, notification: null });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { flash, errors: pageErrors } = usePage().props as any;

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

    useEffect(() => {
        if (flash?.success) {
            setCreateModal(false);
            form.reset();
        }
    }, [flash]);

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/notification-center', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleCreate = () => {
        form.post('/admin/notification-center', {
            onSuccess: () => {
                setCreateModal(false);
                form.reset();
            },
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
            case 'urgent': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgent</span>;
            case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">High</span>;
            case 'normal': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Normal</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500">Low</span>;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reminder': return 'Pengingat';
            case 'announcement': return 'Pengumuman';
            case 'alert': return 'Peringatan';
            case 'achievement': return 'Pencapaian';
            case 'warning': return 'Peringatan';
            default: return 'Informasi';
        }
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout>
            <Head title="Notification Center" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-100">Manajemen</p>
                                <h1 className="text-2xl font-bold">Notification Center</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-purple-100">
                            Kirim notifikasi ke mahasiswa dan dosen
                        </p>
                    </div>
                </div>

                {/* Flash Messages */}
                {(flash?.success || flash?.error || pageErrors?.message) && (
                    <div className={`rounded-xl p-4 ${flash?.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <div className="flex items-center gap-2">
                            {flash?.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            {flash?.success || flash?.error || pageErrors?.message}
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Notifikasi</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Belum Dibaca</p>
                                <p className="text-xl font-bold text-blue-600">{stats.unread}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Terjadwal</p>
                                <p className="text-xl font-bold text-amber-600">{stats.scheduled}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Penerima</p>
                                <p className="text-xl font-bold text-emerald-600">{mahasiswaCount + dosenCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Actions */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-purple-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter & Aksi</h2>
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Tipe</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="reminder">Reminder</option>
                                <option value="announcement">Pengumuman</option>
                                <option value="alert">Alert</option>
                                <option value="achievement">Achievement</option>
                                <option value="warning">Warning</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                                <option value="all">Semua Status</option>
                                <option value="unread">Belum Dibaca</option>
                                <option value="read">Sudah Dibaca</option>
                                <option value="scheduled">Terjadwal</option>
                            </select>
                        </div>
                        <div className="flex gap-2 ml-auto">
                            {selectedIds.length > 0 && (
                                <Button variant="outline" onClick={handleBulkDelete} className="text-red-600 border-red-200 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Hapus ({selectedIds.length})
                                </Button>
                            )}
                            <Button onClick={() => setCreateModal(true)} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                                <Plus className="h-4 w-4 mr-1" />
                                Buat Notifikasi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-purple-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Notifikasi</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {notifications.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500">Belum ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.data.map((notif) => (
                                <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                    <div className="flex items-start gap-4">
                                        <Checkbox
                                            checked={selectedIds.includes(notif.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedIds([...selectedIds, notif.id]);
                                                } else {
                                                    setSelectedIds(selectedIds.filter(id => id !== notif.id));
                                                }
                                            }}
                                        />
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${getTypeColor(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetailModal({ open: true, notification: notif })}>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-medium text-slate-900 dark:text-white">{notif.title}</h3>
                                                {getPriorityBadge(notif.priority)}
                                                {notif.scheduled_at && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Terjadwal
                                                    </span>
                                                )}
                                                {!notif.read_at && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Baru</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                                                <span className="capitalize">{notif.notifiable_type.split('\\').pop()}</span>
                                                <span className="text-blue-600 hover:underline">Lihat selengkapnya</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setDetailModal({ open: true, notification: notif })}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-600"
                                                onClick={() => router.delete(`/admin/notification-center/${notif.id}`)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => router.get('/admin/notification-center', { ...filters, page }, { preserveState: true })}
                                    className={`px-3 py-1 rounded text-sm ${
                                        page === notifications.current_page
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Buat Notifikasi Baru</h3>
                            <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block">Target</Label>
                                <select
                                    value={form.data.target}
                                    onChange={(e) => form.setData('target', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <option value="all">Semua Pengguna</option>
                                    <option value="mahasiswa">Semua Mahasiswa</option>
                                    <option value="dosen">Semua Dosen</option>
                                    <option value="specific">Pilih Spesifik</option>
                                </select>
                            </div>

                            {form.data.target === 'specific' && (
                                <div>
                                    <Label className="mb-2 block">Tipe Penerima</Label>
                                    <select
                                        value={form.data.target_type}
                                        onChange={(e) => form.setData('target_type', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <option value="mahasiswa">Mahasiswa</option>
                                        <option value="dosen">Dosen</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Masukkan ID {form.data.target_type} dipisahkan koma
                                    </p>
                                    <Input
                                        className="mt-2"
                                        placeholder="1, 2, 3"
                                        onChange={(e) => {
                                            const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                                            form.setData('target_ids', ids);
                                        }}
                                    />
                                </div>
                            )}

                            <div>
                                <Label className="mb-2 block">Judul</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Judul notifikasi"
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block">Pesan</Label>
                                <Textarea
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    placeholder="Isi pesan notifikasi (bisa panjang untuk menyampaikan informasi lengkap)"
                                    rows={8}
                                    className="resize-y min-h-[150px]"
                                />
                                <p className="text-xs text-slate-500 mt-1">{form.data.message.length} karakter</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block">Tipe</Label>
                                    <select
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <option value="announcement">Pengumuman</option>
                                        <option value="reminder">Reminder</option>
                                        <option value="alert">Alert</option>
                                        <option value="achievement">Achievement</option>
                                        <option value="warning">Warning</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Prioritas</Label>
                                    <select
                                        value={form.data.priority}
                                        onChange={(e) => form.setData('priority', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block">URL Aksi (opsional)</Label>
                                <Input
                                    value={form.data.action_url}
                                    onChange={(e) => form.setData('action_url', e.target.value)}
                                    placeholder="/dashboard"
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block">Jadwalkan (opsional)</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.data.scheduled_at}
                                    onChange={(e) => form.setData('scheduled_at', e.target.value)}
                                />
                            </div>

                            {Object.keys(form.errors).length > 0 && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    {Object.values(form.errors).map((error, i) => (
                                        <p key={i} className="text-sm text-red-600">{error}</p>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleCreate} disabled={form.processing} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600">
                                    <Send className="h-4 w-4 mr-1" />
                                    Kirim Notifikasi
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>
                                    Batal
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.open && detailModal.notification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getTypeColor(detailModal.notification.type)}`}>
                                    {getTypeIcon(detailModal.notification.type)}
                                </div>
                                <div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(detailModal.notification.type)}`}>
                                        {getTypeLabel(detailModal.notification.type)}
                                    </span>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                                        {detailModal.notification.title}
                                    </h3>
                                </div>
                            </div>
                            <button onClick={() => setDetailModal({ open: false, notification: null })} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="mb-4 flex items-center gap-2 flex-wrap text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            {formatFullDate(detailModal.notification.created_at)}
                            {getPriorityBadge(detailModal.notification.priority)}
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 capitalize">
                                {detailModal.notification.notifiable_type.split('\\').pop()}
                            </span>
                            {detailModal.notification.scheduled_at && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                                    Terjadwal: {formatFullDate(detailModal.notification.scheduled_at)}
                                </span>
                            )}
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                                {detailModal.notification.message}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => { 
                                    router.delete(`/admin/notification-center/${detailModal.notification!.id}`);
                                    setDetailModal({ open: false, notification: null }); 
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </Button>
                            <Button 
                                className="ml-auto"
                                onClick={() => setDetailModal({ open: false, notification: null })}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
