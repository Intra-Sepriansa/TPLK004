import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, FormEvent } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    FileText, Clock, CheckCircle, XCircle, Eye, Check, X, Sparkles, Filter,
    Users, Calendar, AlertTriangle, Shield, FileCheck, UserCheck, UserX,
    ChevronRight, Image, Stethoscope, CalendarOff, ClipboardCheck
} from 'lucide-react';

interface Props {
    permits: Array<{
        id: number;
        mahasiswa: { id: number; nama: string; nim: string };
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
        created_at: string;
    }>;
    sessions: Array<{
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
    }>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string; session_id: string | null };
}

export default function Permits({ permits, sessions, stats, filters }: Props) {
    const [selectedPermits, setSelectedPermits] = useState<number[]>([]);
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; permitId: number | null }>({ open: false, permitId: null });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState(filters.status || 'pending');

    const rejectForm = useForm({ rejection_reason: '' });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleApprove = (id: number) => {
        router.patch(`/dosen/permits/${id}/approve`);
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();
        if (rejectDialog.permitId) {
            rejectForm.patch(`/dosen/permits/${rejectDialog.permitId}/reject`, {
                onSuccess: () => {
                    setRejectDialog({ open: false, permitId: null });
                    rejectForm.reset();
                },
            });
        }
    };

    const handleBulkApprove = () => {
        if (selectedPermits.length === 0) return;
        router.post('/dosen/permits/bulk-approve', { permit_ids: selectedPermits }, {
            onSuccess: () => setSelectedPermits([]),
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedPermits((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const pendingIds = permits.filter((p) => p.status === 'pending').map((p) => p.id);
        if (selectedPermits.length === pendingIds.length) {
            setSelectedPermits([]);
        } else {
            setSelectedPermits(pendingIds);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/dosen/permits', { ...filters, status: tab }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; icon: any; label: string }> = {
            pending: { bg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', icon: Clock, label: 'Menunggu' },
            approved: { bg: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white', icon: CheckCircle, label: 'Disetujui' },
            rejected: { bg: 'bg-gradient-to-r from-red-500 to-rose-500 text-white', icon: XCircle, label: 'Ditolak' },
        };
        const style = styles[status] || styles.pending;
        const Icon = style.icon;
        return (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', style.bg)}>
                <Icon className="h-3 w-3" /> {style.label}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, { bg: string; icon: any; label: string }> = {
            izin: { bg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white', icon: CalendarOff, label: 'Izin' },
            sakit: { bg: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white', icon: Stethoscope, label: 'Sakit' },
        };
        const style = styles[type] || styles.izin;
        const Icon = style.icon;
        return (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', style.bg)}>
                <Icon className="h-3 w-3" /> {style.label}
            </span>
        );
    };

    const pendingPermits = permits.filter((p) => p.status === 'pending');
    const filteredPermits = activeTab === 'all' ? permits : permits.filter(p => p.status === activeTab);

    return (
        <DosenLayout>
            <Head title="Persetujuan Izin" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5 animate-bounce" style={{ animationDuration: '3s' }} />
                    
                    {/* Floating Icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[Shield, FileCheck, ClipboardCheck].map((Icon, i) => (
                            <Icon 
                                key={i}
                                className="absolute text-white/20 animate-pulse"
                                style={{
                                    left: `${15 + i * 25}%`,
                                    top: `${20 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: '2s'
                                }}
                                size={24}
                            />
                        ))}
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                                    <Shield className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-100 font-medium">Persetujuan</p>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Izin & Sakit
                                        <Sparkles className="h-6 w-6 animate-spin" style={{ animationDuration: '3s' }} />
                                    </h1>
                                </div>
                            </div>
                            <Select
                                value={filters.session_id || 'all'}
                                onValueChange={(v) => router.get('/dosen/permits', { ...filters, session_id: v === 'all' ? null : v }, { preserveState: true })}
                            >
                                <SelectTrigger className="w-[220px] bg-white/20 border-white/30 text-white">
                                    <SelectValue placeholder="Filter Sesi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Sesi</SelectItem>
                                    {sessions.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.mata_kuliah} - {s.tanggal}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="mt-4 text-emerald-100">Kelola pengajuan izin dan sakit mahasiswa</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: FileText, label: 'Total', value: stats.total, color: 'text-white' },
                                { icon: Clock, label: 'Menunggu', value: stats.pending, color: 'text-amber-200' },
                                { icon: CheckCircle, label: 'Disetujui', value: stats.approved, color: 'text-emerald-200' },
                                { icon: XCircle, label: 'Ditolak', value: stats.rejected, color: 'text-red-200' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                        <p className="text-emerald-100 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                    {[
                        { icon: FileText, label: 'Total Pengajuan', value: stats.total, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
                        { icon: Clock, label: 'Menunggu', value: stats.pending, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
                        { icon: UserCheck, label: 'Disetujui', value: stats.approved, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
                        { icon: UserX, label: 'Ditolak', value: stats.rejected, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25' },
                    ].map((stat, i) => (
                        <div 
                            key={i} 
                            className={`rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 transition-all duration-500 hover:scale-105 hover:shadow-xl group`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
                                    stat.color, stat.shadow
                                )}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bulk Actions */}
                {selectedPermits.length > 0 && (
                    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800 transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500 text-white">
                                <Users className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">{selectedPermits.length} pengajuan dipilih</span>
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <Button 
                                size="sm" 
                                onClick={handleBulkApprove} 
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
                            >
                                <Check className="h-4 w-4 mr-1" /> Setujui Semua
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedPermits([])}>Batal</Button>
                        </div>
                    </div>
                )}

                {/* Tabs & Permits List */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                    <ClipboardCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Pengajuan</h2>
                                    <p className="text-xs text-slate-500">{filteredPermits.length} pengajuan</p>
                                </div>
                            </div>
                            
                            {/* Custom Tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                {[
                                    { value: 'pending', label: 'Menunggu', count: stats.pending, icon: Clock },
                                    { value: 'approved', label: 'Disetujui', count: stats.approved, icon: CheckCircle },
                                    { value: 'rejected', label: 'Ditolak', count: stats.rejected, icon: XCircle },
                                    { value: 'all', label: 'Semua', count: stats.total, icon: FileText },
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => handleTabChange(tab.value)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                                            activeTab === tab.value
                                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        )}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className={cn(
                                            'px-1.5 py-0.5 rounded-full text-xs',
                                            activeTab === tab.value
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                        )}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        {/* Select All for Pending */}
                        {activeTab === 'pending' && pendingPermits.length > 0 && (
                            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
                                <Checkbox
                                    checked={selectedPermits.length === pendingPermits.length && pendingPermits.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Pilih Semua ({pendingPermits.length})</span>
                            </div>
                        )}
                        
                        {filteredPermits.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="relative mx-auto w-24 h-24 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Tidak ada pengajuan</p>
                                <p className="text-sm text-slate-500 mt-2">Belum ada pengajuan izin atau sakit untuk ditampilkan</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredPermits.map((permit, index) => {
                                    const isHovered = hoveredCard === permit.id;
                                    return (
                                        <div 
                                            key={permit.id}
                                            onMouseEnter={() => setHoveredCard(permit.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className={cn(
                                                'rounded-2xl border-2 p-5 transition-all duration-500 relative overflow-hidden group',
                                                permit.status === 'pending' && 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20',
                                                permit.status === 'approved' && 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-green-950/20',
                                                permit.status === 'rejected' && 'border-red-200 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:border-red-800 dark:from-red-950/20 dark:to-rose-950/20',
                                                isHovered && 'scale-[1.01] shadow-xl'
                                            )}
                                            style={{ 
                                                animationDelay: `${index * 50}ms`,
                                                animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            {/* Glow Effect */}
                                            {isHovered && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
                                            )}
                                            
                                            <div className="flex flex-col md:flex-row md:items-start gap-4 relative">
                                                {permit.status === 'pending' && (
                                                    <div className="flex items-center">
                                                        <Checkbox
                                                            checked={selectedPermits.includes(permit.id)}
                                                            onCheckedChange={() => toggleSelect(permit.id)}
                                                        />
                                                    </div>
                                                )}
                                                
                                                <div className="flex-1">
                                                    {/* Badges */}
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        {getTypeBadge(permit.type)}
                                                        {getStatusBadge(permit.status)}
                                                    </div>
                                                    
                                                    {/* Student Info */}
                                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 font-bold text-lg">
                                                                {permit.mahasiswa.nama.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white">{permit.mahasiswa.nama}</p>
                                                                <p className="text-sm text-slate-500">{permit.mahasiswa.nim}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400">
                                                                <Calendar className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white">{permit.session.mata_kuliah}</p>
                                                                <p className="text-sm text-slate-500">{permit.session.tanggal_display}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Reason */}
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-3">
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">{permit.reason}</p>
                                                    </div>
                                                    
                                                    {/* Rejection Reason */}
                                                    {permit.status === 'rejected' && permit.rejection_reason && (
                                                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                <span className="text-sm font-medium text-red-700 dark:text-red-300">Alasan Ditolak</span>
                                                            </div>
                                                            <p className="text-sm text-red-600 dark:text-red-400">{permit.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <p className="text-xs text-slate-400">Diajukan: {permit.created_at}</p>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2 md:flex-col">
                                                    {permit.attachment && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => setPreviewImage(permit.attachment)}
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" /> Lihat Surat
                                                        </Button>
                                                    )}
                                                    {permit.status === 'pending' && (
                                                        <>
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => handleApprove(permit.id)}
                                                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
                                                            >
                                                                <Check className="h-4 w-4 mr-1" /> Setujui
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="destructive" 
                                                                onClick={() => setRejectDialog({ open: true, permitId: permit.id })}
                                                                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                                            >
                                                                <X className="h-4 w-4 mr-1" /> Tolak
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reject Modal */}
                {rejectDialog.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectDialog({ open: false, permitId: null })} />
                        <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <XCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Tolak Pengajuan</h2>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setRejectDialog({ open: false, permitId: null })} 
                                        className="text-white hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <form onSubmit={handleReject}>
                                <div className="p-6 space-y-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Berikan alasan penolakan agar mahasiswa dapat memahami keputusan Anda.
                                    </p>
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Alasan Penolakan</Label>
                                        <Textarea
                                            value={rejectForm.data.rejection_reason}
                                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                            placeholder="Jelaskan alasan penolakan..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                        {rejectForm.errors.rejection_reason && (
                                            <p className="text-sm text-red-500 mt-1">{rejectForm.errors.rejection_reason}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex gap-3">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setRejectDialog({ open: false, permitId: null })} 
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={rejectForm.processing}
                                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                        >
                                            {rejectForm.processing ? 'Memproses...' : 'Tolak Pengajuan'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Image Preview Modal */}
                {previewImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
                        <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Image className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Surat Keterangan</h2>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setPreviewImage(null)} 
                                        className="text-white hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                {previewImage.endsWith('.pdf') ? (
                                    <iframe src={previewImage} className="w-full h-[500px] rounded-lg" />
                                ) : (
                                    <img src={previewImage} alt="Surat Keterangan" className="w-full rounded-lg" />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </DosenLayout>
    );
}
