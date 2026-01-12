import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Clock, CheckCircle, XCircle, Upload, Trash2, Eye } from 'lucide-react';
import { useState, FormEvent } from 'react';

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

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin membatalkan pengajuan ini?')) {
            router.delete(`/user/permit/${id}`);
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

    return (
        <StudentLayout>
            <Head title="Pengajuan Izin/Sakit" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Pengajuan Izin/Sakit</h1>
                        <p className="text-muted-foreground">Ajukan izin atau sakit dengan upload surat keterangan</p>
                    </div>
                    <Dialog open={showForm} onOpenChange={setShowForm}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                                <Plus className="h-4 w-4 mr-2" /> Ajukan Izin
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajukan Izin/Sakit</DialogTitle>
                                <DialogDescription>Isi form berikut untuk mengajukan izin atau sakit</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Sesi Perkuliahan</Label>
                                    <Select value={data.attendance_session_id} onValueChange={(v) => setData('attendance_session_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih sesi" />
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
                                    <Label>Jenis</Label>
                                    <Select value={data.type} onValueChange={(v: 'izin' | 'sakit') => setData('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="izin">Izin</SelectItem>
                                            <SelectItem value="sakit">Sakit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Alasan</Label>
                                    <Textarea
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Jelaskan alasan izin/sakit..."
                                        rows={3}
                                    />
                                    {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Surat Keterangan (Opsional)</Label>
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="attachment"
                                        />
                                        <label htmlFor="attachment" className="cursor-pointer">
                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {data.attachment ? data.attachment.name : 'Klik untuk upload (JPG, PNG, PDF max 5MB)'}
                                            </p>
                                        </label>
                                    </div>
                                    {errors.attachment && <p className="text-sm text-red-500">{errors.attachment}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </CardContent>
                    </Card>
                    <Card>
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

                {/* Permits List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Pengajuan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={filters.status} onValueChange={(v) => router.get('/user/permit', { status: v }, { preserveState: true })}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">Semua</TabsTrigger>
                                <TabsTrigger value="pending">Menunggu</TabsTrigger>
                                <TabsTrigger value="approved">Disetujui</TabsTrigger>
                                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.status}>
                                {permits.length > 0 ? (
                                    <div className="space-y-4">
                                        {permits.map((permit) => (
                                            <div key={permit.id} className="border rounded-lg p-4">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline">{permit.type === 'izin' ? 'Izin' : 'Sakit'}</Badge>
                                                            {getStatusBadge(permit.status)}
                                                        </div>
                                                        <h4 className="font-medium">{permit.session.mata_kuliah}</h4>
                                                        <p className="text-sm text-muted-foreground">{permit.session.tanggal_display}</p>
                                                        <p className="text-sm mt-2">{permit.reason}</p>
                                                        {permit.status === 'rejected' && permit.rejection_reason && (
                                                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                                                <strong>Alasan ditolak:</strong> {permit.rejection_reason}
                                                            </div>
                                                        )}
                                                        {permit.status === 'approved' && permit.approver && (
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Disetujui oleh {permit.approver} pada {permit.approved_at}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">Diajukan: {permit.created_at}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {permit.attachment && (
                                                            <Button variant="outline" size="sm" onClick={() => setPreviewImage(permit.attachment)}>
                                                                <Eye className="h-4 w-4 mr-1" /> Lihat
                                                            </Button>
                                                        )}
                                                        {permit.status === 'pending' && (
                                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(permit.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">Belum ada pengajuan</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

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
        </StudentLayout>
    );
}
