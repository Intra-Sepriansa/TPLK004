import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    ArrowLeft, BookOpen, Calendar, CornerDownRight, MessageSquare, Pin, Reply, Send, Trash2, X, Sparkles, Zap,
} from 'lucide-react';

type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    reply_to_id: number | null; reply_to?: { sender_name: string; pesan: string } | null;
    created_at: string; time_ago: string;
};
type Tugas = {
    id: number; judul: string; deskripsi: string; instruksi: string | null; jenis: string;
    deadline: string; deadline_display: string; prioritas: string; status: string;
    course: { id: number; nama: string; dosen: string | null; dosen_id: number | null };
    created_by: string; created_by_type: string; edited_by: string | null; edited_at: string | null;
    is_overdue: boolean; days_until_deadline: number; created_at: string;
};
type Props = { tugas: Tugas; diskusi: Diskusi[] };

export default function AdminTugasDetail({ tugas, diskusi }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { setIsLoaded(true); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [diskusi]);

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/admin/tugas/${tugas.id}/message`, { 
            pesan: message, 
            visibility,
            reply_to_id: replyTo?.id || null,
        }, {
            onSuccess: () => { setMessage(''); setReplyTo(null); },
            preserveScroll: true,
        });
    };

    const handleReply = (d: Diskusi) => {
        setReplyTo(d);
        inputRef.current?.focus();
    };

    const togglePin = (id: number) => router.patch(`/admin/tugas/diskusi/${id}/pin`, {}, { preserveScroll: true });
    
    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const deleteMessage = () => {
        if (deleteDialog.id) {
            router.delete(`/admin/tugas/diskusi/${deleteDialog.id}`, { preserveScroll: true });
            setDeleteDialog({ open: false, id: null });
        }
    };

    const getPriorityStyle = (p: string) => ({
        tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
        sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
        rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
    }[p] || 'bg-gray-100 text-gray-700');

    const getStatusStyle = (s: string) => ({
        published: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        draft: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
        closed: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    }[s] || 'bg-gray-100 text-gray-700');

    const getSenderStyle = (type: string) => ({
        admin: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        dosen: 'bg-gradient-to-br from-gray-800 to-black text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

    // Find reply target for each message
    const getReplyTarget = (replyId: number | null) => {
        if (!replyId) return null;
        return diskusi.find(d => d.id === replyId);
    };

    return (
        <AppLayout>
            <Head title={tugas.judul} />
            <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => router.visit('/admin/tugas')} className={`mb-4 transition-all duration-500 hover:translate-x-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>

                <div className="grid grid-cols-3 gap-6">
                    {/* Detail Tugas */}
                    <div className={`col-span-2 space-y-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <div className="rounded-2xl border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <Badge className={getPriorityStyle(tugas.prioritas)}>{tugas.prioritas}</Badge>
                                <Badge className={getStatusStyle(tugas.status)}>{tugas.status}</Badge>
                                {tugas.is_overdue && <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">⚠️ Overdue</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">{tugas.judul}</h1>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg"><BookOpen className="h-4 w-4 text-blue-500" /> {tugas.course.nama}</span>
                                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg"><Calendar className="h-4 w-4 text-purple-500" /> {tugas.deadline_display}</span>
                            </div>
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> Deskripsi</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{tugas.deskripsi}</p>
                            </div>
                            {tugas.instruksi && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-gray-900 to-black dark:from-blue-900/20 dark:to-black/20 rounded-xl">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> Instruksi</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{tugas.instruksi}</p>
                                </div>
                            )}
                            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                                <p>📝 Dibuat oleh: <span className="font-medium">{tugas.created_by}</span> ({tugas.created_by_type}) pada {tugas.created_at}</p>
                                {tugas.edited_by && <p>✏️ Terakhir diedit oleh: <span className="font-medium">{tugas.edited_by}</span> pada {tugas.edited_at}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Info Sidebar */}
                    <div className={`space-y-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: '200ms' }}>
                        <div className="rounded-2xl border bg-card p-5 shadow-lg">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">📊 Informasi</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"><span className="text-muted-foreground">Jenis</span><Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white capitalize">{tugas.jenis}</Badge></div>
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
                    <div className="p-4 border-b bg-gradient-to-r from-gray-900 to-black dark:from-blue-900/20 dark:to-black/20 rounded-t-2xl">
                        <h2 className="font-semibold flex items-center gap-2 text-lg">
                            <MessageSquare className="h-5 w-5 text-purple-500" /> Diskusi ({diskusi.length})
                        </h2>
                    </div>
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                        {diskusi.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="relative mx-auto w-20 h-20 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
                                        <MessageSquare className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <p className="text-muted-foreground">Belum ada diskusi</p>
                            </div>
                        ) : (
                            diskusi.map((d, i) => {
                                const replyTarget = getReplyTarget(d.reply_to_id);
                                return (
                                    <div
                                        key={d.id}
                                        className={`relative transition-all duration-300 hover:bg-muted/20 rounded-xl ${d.is_pinned ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800' : ''}`}
                                    >
                                        {/* Reply Thread Line */}
                                        {replyTarget && (
                                            <div className="ml-5 mb-2 pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                                                    <CornerDownRight className="h-3 w-3 text-purple-500" />
                                                    <span className="font-medium text-purple-600 dark:text-purple-400">Membalas {replyTarget.sender_name}:</span>
                                                    <span className="truncate max-w-[300px]">"{replyTarget.pesan}"</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-3 p-3">
                                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg flex-shrink-0">
                                                <AvatarFallback className={getSenderStyle(d.sender_type)}>{d.sender_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm">{d.sender_name}</span>
                                                    <Badge variant="outline" className="text-xs capitalize">{d.sender_type}</Badge>
                                                    {d.visibility === 'private' && <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">🔒 Private</Badge>}
                                                    {d.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                                                    <span className="text-xs text-muted-foreground">{d.time_ago}</span>
                                                </div>
                                                <p className="text-sm mt-2 leading-relaxed">{d.pesan}</p>
                                                <div className="flex gap-1 mt-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleReply(d)} className="h-7 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600">
                                                        <Reply className="h-3 w-3 mr-1" /> Balas
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => togglePin(d.id)} className="h-7 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/30">
                                                        <Pin className="h-3 w-3 mr-1" /> {d.is_pinned ? 'Unpin' : 'Pin'}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(d.id)} className="h-7 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30">
                                                        <Trash2 className="h-3 w-3 mr-1" /> Hapus
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* Reply Indicator */}
                    {replyTo && (
                        <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <Reply className="h-4 w-4 text-purple-500" />
                                <span className="text-purple-600 dark:text-purple-400">Membalas <span className="font-semibold">{replyTo.sender_name}</span>:</span>
                                <span className="text-muted-foreground truncate max-w-[300px]">"{replyTo.pesan}"</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="h-6 w-6 p-0 hover:bg-purple-200 dark:hover:bg-purple-800">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
                    <div className="p-4 border-t bg-muted/20">
                        <div className="flex gap-2 mb-3">
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">🌐 Public</SelectItem>
                                    <SelectItem value="private">🔒 Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground self-center">{visibility === 'public' ? 'Semua orang bisa melihat' : 'Hanya penerima yang bisa melihat'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Textarea 
                                ref={inputRef}
                                placeholder={replyTo ? `Balas ke ${replyTo.sender_name}...` : "Tulis pesan..."} 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                rows={2} 
                                className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500" 
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
                            />
                            <Button onClick={sendMessage} className="bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Delete Message Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                    onConfirm={deleteMessage}
                    title="Hapus Pesan"
                    message="Yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </AppLayout>
    );
}
