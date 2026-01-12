import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Pin, Send, Sparkles, User, Zap } from 'lucide-react';

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
    const [isLoaded, setIsLoaded] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setIsLoaded(true); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [diskusi]);

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/user/tugas/${tugas.id}/message`, { pesan: message, visibility }, {
            onSuccess: () => setMessage(''),
            preserveScroll: true,
        });
    };

    const getPriorityStyle = (p: string) => ({
        tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
    }[p] || 'bg-gray-100 text-gray-700');

    const getSenderStyle = (type: string) => ({
        admin: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        dosen: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title={tugas.judul} />
            <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => router.visit('/user/tugas')} className={`mb-4 transition-all duration-500 hover:translate-x-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>

                <div className="grid grid-cols-3 gap-6">
                    <div className={`col-span-2 space-y-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <div className="rounded-2xl border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{tugas.jenis}</Badge>
                                <Badge className={getPriorityStyle(tugas.prioritas)}>{tugas.prioritas}</Badge>
                                {tugas.is_overdue && <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">⚠️ Terlewat</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{tugas.judul}</h1>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg"><BookOpen className="h-4 w-4 text-blue-500" /> {tugas.course.nama}</span>
                                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg"><Calendar className="h-4 w-4 text-purple-500" /> {tugas.deadline_display}</span>
                            </div>
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> Deskripsi</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{tugas.deskripsi}</p>
                            </div>
                            {tugas.instruksi && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Zap className="h-4 w-4 text-emerald-500" /> Instruksi</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{tugas.instruksi}</p>
                                </div>
                            )}
                            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                                <p>📝 Dibuat oleh: <span className="font-medium">{tugas.created_by}</span> pada {tugas.created_at}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: '200ms' }}>
                        <div className="rounded-2xl border bg-card p-5 shadow-lg">
                            <h3 className="font-semibold mb-4">📊 Informasi</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"><span className="text-muted-foreground">Dosen</span><span className="font-medium">{tugas.course.dosen || '-'}</span></div>
                                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                                    <span className="text-muted-foreground">Sisa Waktu</span>
                                    <span className={`font-bold ${tugas.is_overdue ? 'text-red-600' : tugas.days_until_deadline <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {tugas.is_overdue ? '❌ Sudah lewat' : `⏰ ${tugas.days_until_deadline} hari`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diskusi Section */}
                <div className={`rounded-2xl border bg-card shadow-lg transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-2xl">
                        <h2 className="font-semibold flex items-center gap-2 text-lg">
                            <MessageSquare className="h-5 w-5 text-emerald-500" /> Diskusi ({diskusi.length})
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Tanyakan ke dosen atau admin jika ada pertanyaan</p>
                    </div>
                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        {diskusi.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="relative mx-auto w-20 h-20 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                        <MessageSquare className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <p className="text-muted-foreground">Belum ada diskusi. Mulai bertanya!</p>
                            </div>
                        ) : (
                            diskusi.map((d, i) => (
                                <div key={d.id} className={`flex gap-3 ${d.is_mine ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                                        <AvatarFallback className={getSenderStyle(d.sender_type)}>{d.sender_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 max-w-[80%] ${d.is_mine ? 'text-right' : ''}`}>
                                        <div className={`flex items-center gap-2 flex-wrap ${d.is_mine ? 'justify-end' : ''}`}>
                                            <span className="font-semibold text-sm">{d.sender_name}</span>
                                            <Badge variant="outline" className="text-xs capitalize">{d.sender_type}</Badge>
                                            {d.visibility === 'private' && <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">🔒 Private</Badge>}
                                            {d.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                                            <span className="text-xs text-muted-foreground">{d.time_ago}</span>
                                        </div>
                                        <div className={`mt-2 p-3 rounded-2xl ${d.is_mine ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ml-auto' : 'bg-muted'}`}>
                                            <p className="text-sm leading-relaxed">{d.pesan}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t bg-muted/20">
                        <div className="flex gap-2 mb-3">
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">🌐 Public</SelectItem>
                                    <SelectItem value="private">🔒 Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground self-center">{visibility === 'public' ? 'Semua orang bisa melihat' : 'Hanya dosen/admin yang bisa melihat'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Textarea placeholder="Tulis pertanyaan atau komentar..." value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                            <Button onClick={sendMessage} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg transition-all duration-300 hover:scale-105">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
