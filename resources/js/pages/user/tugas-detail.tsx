import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Pin, Send, User } from 'lucide-react';

type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    is_mine: boolean; reply_to_id: number | null; created_at: string; time_ago: string;
};
type Tugas = {
    id: number; judul: string; deskripsi: string; instruksi: string | null; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    course: { id: number; nama: string; dosen: string | null; dosen_id: number | null };
    created_by: string; is_overdue: boolean; days_until_deadline: number; created_at: string;
};
type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugas: Tugas; diskusi: Diskusi[];
};

export default function UserTugasDetail({ mahasiswa, tugas, diskusi }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/user/tugas/${tugas.id}/message`, { pesan: message, visibility }, {
            onSuccess: () => setMessage(''),
            preserveScroll: true,
        });
    };

    const getPriorityColor = (p: string) => {
        const c: Record<string, string> = { tinggi: 'bg-red-100 text-red-700', sedang: 'bg-yellow-100 text-yellow-700', rendah: 'bg-green-100 text-green-700' };
        return c[p] || 'bg-gray-100 text-gray-700';
    };

    const getSenderColor = (type: string) => {
        const c: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', dosen: 'bg-blue-100 text-blue-700', mahasiswa: 'bg-emerald-100 text-emerald-700' };
        return c[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title={tugas.judul} />
            <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => router.visit('/user/tugas')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        <div className="rounded-xl border bg-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-blue-100 text-blue-700">{tugas.jenis}</Badge>
                                <Badge className={getPriorityColor(tugas.prioritas)}>{tugas.prioritas}</Badge>
                                {tugas.is_overdue && <Badge className="bg-red-500 text-white">Terlewat</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold">{tugas.judul}</h1>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {tugas.course.nama}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {tugas.deadline_display}</span>
                            </div>
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Deskripsi</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{tugas.deskripsi}</p>
                            </div>
                            {tugas.instruksi && (
                                <div className="mt-6">
                                    <h3 className="font-semibold mb-2">Instruksi</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{tugas.instruksi}</p>
                                </div>
                            )}
                            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                                <p>Dibuat oleh: {tugas.created_by} pada {tugas.created_at}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4">
                            <h3 className="font-semibold mb-3">Informasi</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Dosen</span><span>{tugas.course.dosen || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Sisa Waktu</span>
                                    <span className={tugas.is_overdue ? 'text-red-600' : tugas.days_until_deadline <= 3 ? 'text-orange-600' : ''}>
                                        {tugas.is_overdue ? 'Sudah lewat' : `${tugas.days_until_deadline} hari`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diskusi Section */}
                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> Diskusi ({diskusi.length})
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Tanyakan ke dosen atau admin jika ada pertanyaan</p>
                    </div>
                    <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                        {diskusi.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Belum ada diskusi. Mulai bertanya!</p>
                        ) : (
                            diskusi.map((d) => (
                                <div key={d.id} className={`flex gap-3 ${d.is_pinned ? 'bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200' : ''} ${d.is_mine ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className={getSenderColor(d.sender_type)}>{d.sender_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 ${d.is_mine ? 'text-right' : ''}`}>
                                        <div className={`flex items-center gap-2 ${d.is_mine ? 'justify-end' : ''}`}>
                                            <span className="font-medium text-sm">{d.sender_name}</span>
                                            <Badge variant="outline" className="text-xs">{d.sender_type}</Badge>
                                            {d.visibility === 'private' && <Badge className="bg-orange-100 text-orange-700 text-xs">Private</Badge>}
                                            {d.is_pinned && <Pin className="h-3 w-3 text-yellow-600" />}
                                            <span className="text-xs text-muted-foreground">{d.time_ago}</span>
                                        </div>
                                        <div className={`mt-1 p-3 rounded-lg ${d.is_mine ? 'bg-emerald-100 dark:bg-emerald-900/30 ml-8' : 'bg-muted mr-8'}`}>
                                            <p className="text-sm">{d.pesan}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t">
                        <div className="flex gap-2 mb-2">
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground self-center">
                                {visibility === 'public' ? 'Semua orang bisa melihat' : 'Hanya dosen/admin yang bisa melihat'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Textarea placeholder="Tulis pertanyaan atau komentar..." value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="flex-1" />
                            <Button onClick={sendMessage} className="bg-emerald-600 hover:bg-emerald-700"><Send className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
