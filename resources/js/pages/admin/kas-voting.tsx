import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    Vote, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Users, 
    Eye, Gavel, AlertTriangle, BarChart3, Wallet
} from 'lucide-react';
import { useState } from 'react';

interface Voter {
    id: number;
    nama: string;
    nim: string;
}

interface VoteDetail {
    id: number;
    mahasiswa: Voter | null;
    vote: 'approve' | 'reject';
    comment: string | null;
    created_at: string;
}

interface VotingItem {
    id: number;
    title: string;
    description: string;
    amount: number;
    category: string;
    status: 'open' | 'approved' | 'rejected' | 'closed';
    creator: Voter | null;
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
    votes: VoteDetail[];
    created_at: string;
}

interface Props {
    votings: VotingItem[];
    stats: {
        total: number;
        open: number;
        approved: number;
        rejected: number;
        closed: number;
    };
    filters: { status: string };
}

const categories: Record<string, string> = {
    kegiatan: 'Kegiatan Kelas',
    perlengkapan: 'Perlengkapan',
    konsumsi: 'Konsumsi',
    donasi: 'Donasi/Sosial',
    lainnya: 'Lainnya',
};

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kas Voting', href: '/admin/kas-voting' },
];

export default function AdminKasVoting({ votings, stats, filters }: Props) {
    const [selectedVoting, setSelectedVoting] = useState<VotingItem | null>(null);
    const [showVoters, setShowVoters] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleApprove = (votingId: number) => {
        if (!confirm('Yakin ingin menyetujui voting ini? Pengeluaran kas akan langsung dicatat.')) return;
        setProcessing(true);
        router.post(`/admin/kas-voting/${votingId}/approve`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleReject = (votingId: number) => {
        setProcessing(true);
        router.post(`/admin/kas-voting/${votingId}/reject`, { reason: rejectReason }, {
            onFinish: () => {
                setProcessing(false);
                setShowRejectDialog(false);
                setRejectReason('');
            },
        });
    };

    const handleClose = (votingId: number) => {
        if (!confirm('Yakin ingin menutup voting ini tanpa keputusan?')) return;
        setProcessing(true);
        router.post(`/admin/kas-voting/${votingId}/close`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleFinalize = (votingId: number) => {
        if (!confirm('Finalisasi voting berdasarkan hasil suara saat ini?')) return;
        setProcessing(true);
        router.post(`/admin/kas-voting/${votingId}/finalize`, {}, {
            onFinish: () => setProcessing(false),
        });
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin - Kas Voting" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Manajemen Voting Kas</h1>
                    <p className="text-muted-foreground">Kelola dan pantau voting pengeluaran kas mahasiswa</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Voting</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                            <p className="text-sm text-muted-foreground">Sedang Voting</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            <p className="text-sm text-muted-foreground">Disetujui</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            <p className="text-sm text-muted-foreground">Ditolak</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                            <p className="text-2xl font-bold text-yellow-600">{stats.closed}</p>
                            <p className="text-sm text-muted-foreground">Ditutup</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Voting List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Vote className="h-5 w-5" />
                            Daftar Voting Pengeluaran
                        </CardTitle>
                        <CardDescription>Lihat detail voting dan ambil keputusan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={filters.status} onValueChange={(v) => router.get('/admin/kas-voting', { status: v }, { preserveState: true })}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">Semua</TabsTrigger>
                                <TabsTrigger value="open">Sedang Voting</TabsTrigger>
                                <TabsTrigger value="approved">Disetujui</TabsTrigger>
                                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
                                <TabsTrigger value="closed">Ditutup</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.status}>
                                {votings.length > 0 ? (
                                    <div className="space-y-4">
                                        {votings.map((voting) => (
                                            <div key={voting.id} className="border rounded-lg p-4">
                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            {getStatusBadge(voting.status)}
                                                            <Badge variant="outline">{categories[voting.category] || voting.category}</Badge>
                                                            {voting.is_expired && voting.status === 'open' && (
                                                                <Badge variant="destructive">Expired</Badge>
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-lg">{voting.title}</h4>
                                                        <p className="text-2xl font-bold text-emerald-600 my-2">{formatCurrency(voting.amount)}</p>
                                                        <p className="text-sm text-muted-foreground mb-2">{voting.description}</p>
                                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                            <span>Diusulkan oleh: {voting.creator?.nama || '-'} ({voting.creator?.nim || '-'})</span>
                                                            <span>•</span>
                                                            <span>Deadline: {voting.voting_deadline}</span>
                                                            <span>•</span>
                                                            <span>Dibuat: {voting.created_at}</span>
                                                        </div>

                                                        {/* Vote Progress */}
                                                        <div className="mt-4 space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-4 w-4" />
                                                                    {voting.stats.total} votes
                                                                    {!voting.stats.is_valid && (
                                                                        <span className="text-yellow-600">(min {voting.min_votes} untuk valid)</span>
                                                                    )}
                                                                </span>
                                                                <span className="font-medium">
                                                                    {voting.stats.approval_percentage}% setuju
                                                                    <span className="text-muted-foreground ml-1">(threshold: {voting.approval_threshold}%)</span>
                                                                </span>
                                                            </div>
                                                            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
                                                                <div 
                                                                    className="bg-green-500 transition-all flex items-center justify-center text-xs text-white font-medium" 
                                                                    style={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }}
                                                                >
                                                                    {voting.stats.approve > 0 && voting.stats.approve}
                                                                </div>
                                                                <div 
                                                                    className="bg-red-500 transition-all flex items-center justify-center text-xs text-white font-medium" 
                                                                    style={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }}
                                                                >
                                                                    {voting.stats.reject > 0 && voting.stats.reject}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-green-600 flex items-center gap-1">
                                                                    <ThumbsUp className="h-3 w-3" /> {voting.stats.approve} setuju
                                                                </span>
                                                                <span className="text-red-600 flex items-center gap-1">
                                                                    <ThumbsDown className="h-3 w-3" /> {voting.stats.reject} tolak
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2 min-w-[160px]">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedVoting(voting);
                                                                setShowVoters(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Lihat Voters
                                                        </Button>
                                                        
                                                        {voting.status === 'open' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() => handleApprove(voting.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Setujui
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        setSelectedVoting(voting);
                                                                        setShowRejectDialog(true);
                                                                    }}
                                                                    disabled={processing}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Tolak
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() => handleFinalize(voting.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <Gavel className="h-4 w-4 mr-1" />
                                                                    Finalisasi
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleClose(voting.id)}
                                                                    disabled={processing}
                                                                >
                                                                    Tutup
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
                                        <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">Belum ada voting</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Voters Dialog */}
                <Dialog open={showVoters} onOpenChange={setShowVoters}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detail Voters - {selectedVoting?.title}</DialogTitle>
                            <DialogDescription>
                                Total {selectedVoting?.stats.total} votes • {selectedVoting?.stats.approve} setuju • {selectedVoting?.stats.reject} tolak
                            </DialogDescription>
                        </DialogHeader>
                        {selectedVoting && selectedVoting.votes.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mahasiswa</TableHead>
                                        <TableHead>NIM</TableHead>
                                        <TableHead>Vote</TableHead>
                                        <TableHead>Komentar</TableHead>
                                        <TableHead>Waktu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedVoting.votes.map((vote) => (
                                        <TableRow key={vote.id}>
                                            <TableCell className="font-medium">{vote.mahasiswa?.nama || '-'}</TableCell>
                                            <TableCell>{vote.mahasiswa?.nim || '-'}</TableCell>
                                            <TableCell>
                                                {vote.vote === 'approve' ? (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <ThumbsUp className="h-3 w-3 mr-1" /> Setuju
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <ThumbsDown className="h-3 w-3 mr-1" /> Tolak
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">{vote.comment || '-'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{vote.created_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Belum ada yang vote</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tolak Voting</DialogTitle>
                            <DialogDescription>
                                Tolak voting "{selectedVoting?.title}"
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Alasan Penolakan (opsional)</Label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Masukkan alasan penolakan..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Batal</Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => selectedVoting && handleReject(selectedVoting.id)}
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : 'Tolak Voting'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
