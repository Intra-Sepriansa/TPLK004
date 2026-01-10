import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Image,
    MapPin,
    AlertCircle,
    Search,
    BadgeCheck,
    User,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
}

interface PendingVerification {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    meeting_number: number;
    selfie_url: string | null;
    scanned_at: string;
    distance: number | null;
}

interface RecentVerification {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    status: 'approved' | 'rejected';
    verified_by: string;
    verified_by_type: 'admin' | 'dosen';
    verified_at: string;
}

interface Stats {
    pending: number;
    approvedToday: number;
    rejectedToday: number;
}

interface PageProps {
    dosen: DosenInfo;
    pendingVerifications: {
        data: PendingVerification[];
        links: any;
    };
    recentVerifications: RecentVerification[];
    stats: Stats;
}

export default function DosenVerify({ dosen, pendingVerifications, recentVerifications, stats }: PageProps) {
    const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = (id: number) => {
        router.patch(`/dosen/verify/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => setSelectedVerification(null),
        });
    };

    const handleReject = (id: number) => {
        router.patch(`/dosen/verify/${id}/reject`, { reason: rejectReason }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedVerification(null);
                setShowRejectModal(false);
                setRejectReason('');
            },
        });
    };

    const filteredPending = pendingVerifications.data.filter(v =>
        v.mahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DosenLayout>
            <Head title="Verifikasi Selfie" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <BadgeCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100">Verifikasi</p>
                                <h1 className="text-2xl font-bold">Selfie Kehadiran</h1>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">Pending</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-xs">Disetujui Hari Ini</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.approvedToday}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-xs">Ditolak Hari Ini</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.rejectedToday}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Pending List */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-slate-900 dark:text-white">Menunggu Verifikasi</h2>
                                <span className="text-sm text-slate-500">{filteredPending.length} item</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Cari mahasiswa, NIM, atau mata kuliah..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                            {filteredPending.length === 0 ? (
                                <div className="p-12 text-center">
                                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                                    <p className="text-slate-500">Semua selfie sudah diverifikasi!</p>
                                </div>
                            ) : (
                                filteredPending.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVerification(v)}
                                        className={cn(
                                            'w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left',
                                            selectedVerification?.id === v.id && 'bg-indigo-50 dark:bg-indigo-900/20'
                                        )}
                                    >
                                        {v.selfie_url ? (
                                            <img src={v.selfie_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                                        ) : (
                                            <div className="h-14 w-14 rounded-xl bg-slate-200 flex items-center justify-center dark:bg-slate-700">
                                                <Image className="h-6 w-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{v.mahasiswa}</p>
                                            <p className="text-sm text-slate-500">{v.nim}</p>
                                            <p className="text-xs text-slate-400 mt-1">{v.course} • Pertemuan {v.meeting_number}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-slate-500">{v.scanned_at}</p>
                                            {v.distance !== null && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    <MapPin className="h-3 w-3 inline mr-1" />
                                                    {Math.round(v.distance)}m
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preview & Actions */}
                    <div className="space-y-6">
                        {selectedVerification ? (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Preview Selfie</h3>
                                
                                {selectedVerification.selfie_url ? (
                                    <img
                                        src={selectedVerification.selfie_url}
                                        alt="Selfie"
                                        className="w-full aspect-square rounded-xl object-cover mb-4"
                                    />
                                ) : (
                                    <div className="w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-800">
                                        <Image className="h-12 w-12 text-slate-400" />
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <User className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Mahasiswa</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{selectedVerification.mahasiswa}</p>
                                            <p className="text-sm text-slate-500">{selectedVerification.nim}</p>
                                        </div>
                                    </div>
                                    {selectedVerification.distance !== null && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                            <MapPin className="h-5 w-5 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Jarak dari Lokasi</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{Math.round(selectedVerification.distance)} meter</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                        onClick={() => handleApprove(selectedVerification.id)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Setujui
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => setShowRejectModal(true)}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Tolak
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="text-center py-8 text-slate-500">
                                    <Image className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                    <p>Pilih selfie untuk melihat preview</p>
                                </div>
                            </div>
                        )}

                        {/* Recent Verifications */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Verifikasi Terbaru</h3>
                            {recentVerifications.length === 0 ? (
                                <p className="text-center py-4 text-slate-500 text-sm">Belum ada verifikasi</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentVerifications.map(v => (
                                        <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg">
                                            <div className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-full',
                                                v.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            )}>
                                                {v.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{v.mahasiswa}</p>
                                                <p className="text-xs text-slate-500">
                                                    oleh {v.verified_by_type === 'admin' ? 'Admin' : 'Dosen'}: {v.verified_by}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-400">{v.verified_at}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedVerification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Tolak Selfie</h3>
                                <p className="text-sm text-slate-500">{selectedVerification.mahasiswa}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Alasan Penolakan (opsional)</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                                    rows={3}
                                    placeholder="Contoh: Wajah tidak terlihat jelas..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
                                    Batal
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedVerification.id)}>
                                    Tolak Selfie
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}
