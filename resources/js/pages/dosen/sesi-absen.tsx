import { Head, router, useForm } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Calendar, Play, Pause, Plus, Search, Clock, Users, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Session {
    id: number;
    course_id: number;
    course_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    logs_count: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
}

interface PageProps {
    dosen: { id: number; nama: string };
    sessions: Session[];
    courses: Course[];
}

export default function DosenSesiAbsen({ dosen, sessions, courses }: PageProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');

    const createForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
        auto_activate: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dosen/sessions', { 
            onSuccess: () => { 
                setShowCreateModal(false); 
                createForm.reset(); 
            } 
        });
    };

    const handleActivate = (id: number) => router.patch(`/dosen/sessions/${id}/activate`);
    const handleClose = (id: number) => router.patch(`/dosen/sessions/${id}/close`);

    const filteredSessions = sessions.filter(s => 
        s.course_name.toLowerCase().includes(search.toLowerCase()) ||
        s.title?.toLowerCase().includes(search.toLowerCase())
    );

    // Set default datetime values
    const now = new Date();
    const defaultStart = now.toISOString().slice(0, 16);
    const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    return (
        <DosenLayout>
            <Head title="Sesi Absen" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Sesi Absen</h1>
                                    <p className="text-indigo-100">Kelola sesi absensi mata kuliah Anda</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    createForm.setData({
                                        ...createForm.data,
                                        start_at: defaultStart,
                                        end_at: defaultEnd,
                                    });
                                    setShowCreateModal(true);
                                }} 
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Sesi Baru
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
                                <p className="text-xs text-slate-500">Total Sesi</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Play className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.filter(s => s.is_active).length}</p>
                                <p className="text-xs text-slate-500">Sesi Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.reduce((acc, s) => acc + s.logs_count, 0)}</p>
                                <p className="text-xs text-slate-500">Total Kehadiran</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.reduce((acc, s) => acc + s.late_count, 0)}</p>
                                <p className="text-xs text-slate-500">Terlambat</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari sesi atau mata kuliah..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Sessions List */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-gray-800">
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Mata Kuliah</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Pertemuan</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Waktu</th>
                                    <th className="px-4 py-3 text-center font-medium text-slate-500">Kehadiran</th>
                                    <th className="px-4 py-3 text-center font-medium text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-center font-medium text-slate-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Belum ada sesi absen
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSessions.map((session) => (
                                        <tr key={session.id} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900/50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{session.course_name}</p>
                                                    {session.title && <p className="text-xs text-slate-500">{session.title}</p>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                Pertemuan {session.meeting_number}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                <div className="text-xs">
                                                    <p>{session.start_at}</p>
                                                    <p className="text-slate-400">s/d {session.end_at}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-emerald-600">{session.present_count}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <span className="text-amber-600">{session.late_count}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <span className="text-rose-600">{session.rejected_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {session.is_active ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.get(`/dosen/sessions/${session.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {session.is_active ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-rose-600 hover:text-rose-700"
                                                            onClick={() => handleClose(session.id)}
                                                        >
                                                            <Pause className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-emerald-600 hover:text-emerald-700"
                                                            onClick={() => handleActivate(session.id)}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Buat Sesi Absen Baru</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                                    <select 
                                        value={createForm.data.course_id} 
                                        onChange={e => createForm.setData('course_id', e.target.value)} 
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                        required
                                    >
                                        <option value="">Pilih Mata Kuliah</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pertemuan Ke</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="21" 
                                            value={createForm.data.meeting_number} 
                                            onChange={e => createForm.setData('meeting_number', parseInt(e.target.value))} 
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul (Opsional)</label>
                                        <input 
                                            type="text" 
                                            value={createForm.data.title} 
                                            onChange={e => createForm.setData('title', e.target.value)} 
                                            placeholder="Materi pertemuan" 
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai</label>
                                        <input 
                                            type="datetime-local" 
                                            value={createForm.data.start_at} 
                                            onChange={e => createForm.setData('start_at', e.target.value)} 
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selesai</label>
                                        <input 
                                            type="datetime-local" 
                                            value={createForm.data.end_at} 
                                            onChange={e => createForm.setData('end_at', e.target.value)} 
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={createForm.data.auto_activate} 
                                        onChange={e => createForm.setData('auto_activate', e.target.checked)} 
                                        className="rounded border-slate-300" 
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Aktifkan langsung setelah dibuat</span>
                                </label>
                                {createForm.errors && Object.keys(createForm.errors).length > 0 && (
                                    <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                                        {Object.values(createForm.errors).map((error, i) => (
                                            <p key={i}>{error}</p>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)} 
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={createForm.processing} 
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 text-sm font-medium disabled:opacity-50"
                                    >
                                        {createForm.processing ? 'Menyimpan...' : 'Buat Sesi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DosenLayout>
    );
}
