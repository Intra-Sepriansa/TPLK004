import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    FileText, Plus, Clock, CheckCircle, XCircle, Upload, Trash2, Eye, X,
    HeartPulse, Calendar, AlertTriangle, BarChart3, Send, Sparkles, FileCheck
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

interface Props {
    permits: Array<{
        id: number;
        type: 'izin' | 'sakit';
        reason: string;
        attachment: string | null;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
        session: {
            id: number;
            mata_kuliah: string;
            tanggal: string;
            tanggal_display: string;
        };
        approver: string | null;
        approved_at: string | null;
        created_at: string;
    }>;
    availableSessions: Array<{
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
        waktu: string;
    }>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string };
}

export default function Permit({ permits, availableSessions, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    const [isLoaded, setIsLoaded] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        attendance_session_id: '',
        type: 'izin' as 'izin' | 'sakit',
        reason: '',
        attachment: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/permit', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/permit/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/user/permit', { status: tab }, { preserveState: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { icon: Clock, label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
            case 'approved': return { icon: CheckCircle, label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
            case 'rejected': return { icon: XCircle, label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
            default: return { icon: Clock, label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
        }
    };

    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

    return (
        <StudentLayout>
            <Head title="Pengajuan Izin/Sakit" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-6 text-white shadow-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                    <HeartPulse className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-100 font-medium">Administrasi</p>
                                    <h1 className="text-2xl font-bold">Pengajuan Izin/Sakit</h1>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setShowForm(true)}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur border-0 shadow-lg"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajukan Izin
                            </Button>
                        </div>
                        <p className="mt-4 text-teal-100">Ajukan izin atau sakit dengan upload surat keterangan</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="h-4 w-4 text-teal-200" />
                                    <p className="text-teal-100 text-xs font-medium">Total Pengajuan</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-teal-200" />
                                    <p className="text-teal-100 text-xs font-medium">Menunggu</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-teal-200" />
                                    <p className="text-teal-100 text-xs font-medium">Disetujui</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileCheck className="h-4 w-4 text-teal-200" />
                                    <p className="text-teal-100 text-xs font-medium">Approval Rate</p>
                                </div>
                                <p className="text-2xl font-bold">{approvalRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={`grid gap-4 grid-cols-2 md:grid-cols-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Menunggu</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Disetujui</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Ditolak</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permits List */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Pengajuan</h2>
                                <p className="text-xs text-slate-500">Lihat status pengajuan izin/sakit kamu</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua', icon: BarChart3, count: stats.total },
                                { value: 'pending', label: 'Menunggu', icon: Clock, count: stats.pending },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                            ].map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === tab.value
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                        activeTab === tab.value ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Permits Items */}
                        {permits.length > 0 ? (
                            <div className="space-y-4">
                                {permits.map((permit, index) => {
                                    const statusConfig = getStatusConfig(permit.status);
                                    const StatusIcon = statusConfig.icon;
                                    
                                    return (
                                        <div 
                                            key={permit.id} 
                                            className={`rounded-2xl border-2 p-5 bg-white dark:bg-gray-900/50 hover:shadow-lg transition-all ${
                                                permit.status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' :
                                                permit.status === 'approved' ? 'border-emerald-200 dark:border-emerald-800' :
                                                permit.status === 'rejected' ? 'border-red-200 dark:border-red-800' :
                                                'border-slate-200 dark:border-gray-700'
                                            }`}
                                            style={{ 
                                                animationDelay: `${index * 100}ms`,
                                                animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Status & Type Badges */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                                                            permit.type === 'sakit' 
                                                                ? 'bg-red-100 text-red-700' 
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {permit.type === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Course & Date */}
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{permit.session.mata_kuliah}</h4>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {permit.session.tanggal_display}
                                                    </p>
                                                    
                                                    {/* Reason */}
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                                                        {permit.reason}
                                                    </p>
                                                    
                                                    {/* Rejection Reason */}
                                                    {permit.status === 'rejected' && permit.rejection_reason && (
                                                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                                            <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                                                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                                                <span><strong>Alasan ditolak:</strong> {permit.rejection_reason}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Approval Info */}
                                                    {permit.status === 'approved' && permit.approver && (
                                                        <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Disetujui oleh {permit.approver} pada {permit.approved_at}
                                                        </p>
                                                    )}
                                                    
                                                    <p className="text-xs text-slate-400 mt-2">Diajukan: {permit.created_at}</p>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {permit.attachment && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => setPreviewImage(permit.attachment)}
                                                            className="rounded-xl"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Lihat Surat
                                                        </Button>
                                                    )}
                                                    {permit.status === 'pending' && (
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm" 
                                                            onClick={() => openDeleteDialog(permit.id)}
                                                            className="rounded-xl"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                                    <FileText className="h-10 w-10 text-teal-500" />
                                </div>
                                <p className="text-slate-500 font-medium">Belum ada pengajuan</p>
                                <p className="text-sm text-slate-400 mt-1">Klik tombol "Ajukan Izin" untuk membuat pengajuan baru</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg">
                                    <HeartPulse className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ajukan Izin/Sakit</h3>
                                    <p className="text-sm text-slate-500">Isi form berikut dengan lengkap</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Sesi Perkuliahan</Label>
                                <Select value={data.attendance_session_id} onValueChange={(v) => setData('attendance_session_id', v)}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Pilih sesi perkuliahan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSessions.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.mata_kuliah} - {s.tanggal_display}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.attendance_session_id && <p className="text-sm text-red-500">{errors.attendance_session_id}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Jenis Pengajuan</Label>
                                <Select value={data.type} onValueChange={(v: 'izin' | 'sakit') => setData('type', v)}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="izin">📝 Izin</SelectItem>
                                        <SelectItem value="sakit">🏥 Sakit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Alasan</Label>
                                <Textarea
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Jelaskan alasan izin/sakit dengan detail..."
                                    rows={4}
                                    className="rounded-xl resize-none"
                                />
                                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Surat Keterangan (Opsional)</Label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="attachment"
                                    />
                                    <label htmlFor="attachment" className="cursor-pointer">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-teal-600" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {data.attachment ? data.attachment.name : 'Klik untuk upload'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF (max 5MB)</p>
                                    </label>
                                </div>
                                {errors.attachment && <p className="text-sm text-red-500">{errors.attachment}</p>}
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
                                >
                                    {processing ? (
                                        <>Mengirim...</>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Kirim Pengajuan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Surat Keterangan</h3>
                            <button onClick={() => setPreviewImage(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        {previewImage.endsWith('.pdf') ? (
                            <iframe src={previewImage} className="w-full h-[500px] rounded-xl" />
                        ) : (
                            <img src={previewImage} alt="Surat Keterangan" className="w-full rounded-xl" />
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                onConfirm={handleDelete}
                title="Batalkan Pengajuan"
                message="Yakin ingin membatalkan pengajuan izin/sakit ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                confirmText="Ya, Batalkan"
                cancelText="Tidak"
            />
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </StudentLayout>
    );
}
