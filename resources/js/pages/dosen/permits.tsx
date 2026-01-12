import { Head, router, useForm } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Clock, CheckCircle, XCircle, Eye, Check, X } from 'lucide-react';
import { useState, FormEvent } from 'react';

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

    const rejectForm = useForm({ rejection_reason: '' });

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Menunggu</Badge>;
            case 'approved':
                return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Disetujui</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
            default:
                return null;
        }
    };

    const pendingPermits = permits.filter((p) => p.status === 'pending');

    return (
        <DosenLayout>
            <Head title="Persetujuan Izin" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Persetujuan Izin/Sakit
                        </h1>
                        <p className="text-muted-foreground">Kelola pengajuan izin dan sakit mahasiswa</p>
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={filters.session_id || 'all'}
                            onValueChange={(v) => router.get('/dosen/permits', { ...filters, session_id: v === 'all' ? null : v }, { preserveState: true })}
                        >
                            <SelectTrigger className="w-[200px]">
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
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Menunggu</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            <p className="text-sm text-muted-foreground">Disetujui</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            <p className="text-sm text-muted-foreground">Ditolak</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bulk Actions */}
                {selectedPermits.length > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                        <span className="text-sm">{selectedPermits.length} pengajuan dipilih</span>
                        <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 mr-1" /> Setujui Semua
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedPermits([])}>Batal</Button>
                    </div>
                )}

                {/* Permits List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengajuan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={filters.status} onValueChange={(v) => router.get('/dosen/permits', { ...filters, status: v }, { preserveState: true })}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="pending">Menunggu ({stats.pending})</TabsTrigger>
                                <TabsTrigger value="approved">Disetujui</TabsTrigger>
                                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
                                <TabsTrigger value="all">Semua</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.status}>
                                {permits.length > 0 ? (
                                    <div className="space-y-4">
                                        {filters.status === 'pending' && pendingPermits.length > 0 && (
                                            <div className="flex items-center gap-2 pb-2 border-b">
                                                <Checkbox
                                                    checked={selectedPermits.length === pendingPermits.length && pendingPermits.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                                <span className="text-sm text-muted-foreground">Pilih Semua</span>
                                            </div>
                                        )}
                                        {permits.map((permit) => (
                                            <div key={permit.id} className="border rounded-lg p-4">
                                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                    {permit.status === 'pending' && (
                                                        <Checkbox
                                                            checked={selectedPermits.includes(permit.id)}
                                                            onCheckedChange={() => toggleSelect(permit.id)}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <Badge variant="outline">{permit.type === 'izin' ? 'Izin' : 'Sakit'}</Badge>
                                                            {getStatusBadge(permit.status)}
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-2 mb-2">
                                                            <div>
                                                                <p className="font-medium">{permit.mahasiswa.nama}</p>
                                                                <p className="text-sm text-muted-foreground">{permit.mahasiswa.nim}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{permit.session.mata_kuliah}</p>
                                                                <p className="text-sm text-muted-foreground">{permit.session.tanggal_display}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm bg-muted/50 p-2 rounded">{permit.reason}</p>
                                                        {permit.status === 'rejected' && permit.rejection_reason && (
                                                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                                                <strong>Alasan ditolak:</strong> {permit.rejection_reason}
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-2">Diajukan: {permit.created_at}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {permit.attachment && (
                                                            <Button variant="outline" size="sm" onClick={() => setPreviewImage(permit.attachment)}>
                                                                <Eye className="h-4 w-4 mr-1" /> Lihat Surat
                                                            </Button>
                                                        )}
                                                        {permit.status === 'pending' && (
                                                            <>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(permit.id)}>
                                                                    <Check className="h-4 w-4 mr-1" /> Setujui
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => setRejectDialog({ open: true, permitId: permit.id })}>
                                                                    <X className="h-4 w-4 mr-1" /> Tolak
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">Tidak ada pengajuan</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Reject Dialog */}
                <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, permitId: open ? rejectDialog.permitId : null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tolak Pengajuan</DialogTitle>
                            <DialogDescription>Berikan alasan penolakan</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleReject} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Alasan Penolakan</Label>
                                <Textarea
                                    value={rejectForm.data.rejection_reason}
                                    onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                    placeholder="Jelaskan alasan penolakan..."
                                    rows={3}
                                />
                                {rejectForm.errors.rejection_reason && (
                                    <p className="text-sm text-red-500">{rejectForm.errors.rejection_reason}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setRejectDialog({ open: false, permitId: null })}>
                                    Batal
                                </Button>
                                <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                    {rejectForm.processing ? 'Memproses...' : 'Tolak Pengajuan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Image Preview Dialog */}
                <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Surat Keterangan</DialogTitle>
                        </DialogHeader>
                        {previewImage && (
                            previewImage.endsWith('.pdf') ? (
                                <iframe src={previewImage} className="w-full h-[500px]" />
                            ) : (
                                <img src={previewImage} alt="Surat Keterangan" className="w-full rounded" />
                            )
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DosenLayout>
    );
}
