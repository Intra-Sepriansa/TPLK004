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
import { Progress } from '@/components/ui/progress';
import { Vote, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Props {
    votings: Array<{
        id: number;
        title: string;
        description: string;
        amount: number;
        category: string;
        status: 'open' | 'approved' | 'rejected' | 'closed';
        creator: string;
        voting_deadline: string;
        is_expired: boolean;
        min_votes: number;
        approval_threshold: number;
        stats: {
            approve: number;
            reject: number;
            total: number;
            approval_percentage: number;
            is_valid: boolean;
        };
        my_vote: 'approve' | 'reject' | null;
        created_at: string;
    }>;
    stats: {
        open: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string };
}

const categories = [
    { value: 'kegiatan', label: 'Kegiatan Kelas' },
    { value: 'perlengkapan', label: 'Perlengkapan' },
    { value: 'konsumsi', label: 'Konsumsi' },
    { value: 'donasi', label: 'Donasi/Sosial' },
    { value: 'lainnya', label: 'Lainnya' },
];

export default function KasVoting({ votings, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        amount: '',
        category: 'kegiatan',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('user.kas-voting.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleVote = (votingId: number, vote: 'approve' | 'reject') => {
        router.post(route('user.kas-voting.vote', votingId), { vote });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Voting</Badge>;
            case 'approved':
                return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Disetujui</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
            case 'closed':
                return <Badge variant="outline">Ditutup</Badge>;
            default:
                return null;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <StudentLayout>
            <Head title="Voting Pengeluaran Kas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Voting Pengeluaran Kas</h1>
                        <p className="text-muted-foreground">Usulkan dan vote pengeluaran kas secara demokratis</p>
                    </div>
                    <Dialog open={showForm} onOpenChange={setShowForm}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                                <Plus className="h-4 w-4 mr-2" /> Usulkan Pengeluaran
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Usulkan Pengeluaran Kas</DialogTitle>
                                <DialogDescription>Usulan akan di-voting selama 3 hari</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Judul</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Beli spidol whiteboard"
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Jelaskan kebutuhan dan alasan..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Jumlah (Rp)</Label>
                                        <Input
                                            type="number"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="50000"
                                        />
                                        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Mengirim...' : 'Kirim Usulan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-3">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                            <p className="text-sm text-muted-foreground">Sedang Voting</p>
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

                {/* Voting List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Vote className="h-5 w-5" />
                            Daftar Voting
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={filters.status} onValueChange={(v) => router.get(route('user.kas-voting'), { status: v }, { preserveState: true })}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="open">Sedang Voting</TabsTrigger>
                                <TabsTrigger value="approved">Disetujui</TabsTrigger>
                                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
                                <TabsTrigger value="all">Semua</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.status}>
                                {votings.length > 0 ? (
                                    <div className="space-y-4">
                                        {votings.map((voting) => (
                                            <div key={voting.id} className="border rounded-lg p-4">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {getStatusBadge(voting.status)}
                                                            <Badge variant="outline">{categories.find(c => c.value === voting.category)?.label}</Badge>
                                                        </div>
                                                        <h4 className="font-semibold text-lg">{voting.title}</h4>
                                                        <p className="text-2xl font-bold text-emerald-600 my-2">{formatCurrency(voting.amount)}</p>
                                                        <p className="text-sm text-muted-foreground mb-2">{voting.description}</p>
                                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                            <span>Diusulkan oleh: {voting.creator}</span>
                                                            <span>•</span>
                                                            <span>Deadline: {voting.voting_deadline}</span>
                                                        </div>

                                                        {/* Vote Progress */}
                                                        <div className="mt-4 space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-4 w-4" />
                                                                    {voting.stats.total} votes
                                                                    {!voting.stats.is_valid && <span className="text-yellow-600">(min {voting.min_votes})</span>}
                                                                </span>
                                                                <span>{voting.stats.approval_percentage}% setuju</span>
                                                            </div>
                                                            <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                                                                <div className="bg-green-500 transition-all" style={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }} />
                                                                <div className="bg-red-500 transition-all" style={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }} />
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-green-600">{voting.stats.approve} setuju</span>
                                                                <span className="text-red-600">{voting.stats.reject} tolak</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Vote Buttons */}
                                                    {voting.status === 'open' && !voting.is_expired && (
                                                        <div className="flex flex-col gap-2">
                                                            <Button
                                                                size="sm"
                                                                className={voting.my_vote === 'approve' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}
                                                                onClick={() => handleVote(voting.id, 'approve')}
                                                                disabled={voting.my_vote === 'approve'}
                                                            >
                                                                <ThumbsUp className="h-4 w-4 mr-1" />
                                                                {voting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleVote(voting.id, 'reject')}
                                                                disabled={voting.my_vote === 'reject'}
                                                            >
                                                                <ThumbsDown className="h-4 w-4 mr-1" />
                                                                {voting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">Belum ada voting</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
