import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, CornerDownRight, Download, FileText, MessageSquare, Pin, Reply, Send, Upload, X, Sparkles, Zap, AlertTriangle, Award } from 'lucide-react';

type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    is_mine: boolean; reply_to_id: number | null; reply_to?: { sender_name: string; pesan: string } | null;
    created_at: string; time_ago: string;
};
type Submission = {
    id: number; content: string | null; file_path: string | null; file_name: string | null;
    status: string; grade: number | null; grade_letter: string | null; feedback: string | null;
    submitted_at: string | null; graded_at: string | null;
};
type Tugas = {
    id: number; judul: string; deskripsi: string; instruksi: string | null; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    allow_late_submission: boolean; late_penalty_percent: number; max_grade: number;
    course: { id: number; nama: string; dosen: string | null; dosen_id: number | null };
    created_by: string; is_overdue: boolean; days_until_deadline: number; created_at: string;
};
type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugas: Tugas; diskusi: Diskusi[]; submission: Submission | null;
};

export default function UserTugasDetail({ mahasiswa, tugas, diskusi, submission }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const submitForm = useForm({
        content: submission?.content || '',
        file: null as File | null,
    });

    useEffect(() => { setIsLoaded(true); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [diskusi]);

    const handleSubmit = () => {
        const formData = new FormData();
        if (submitForm.data.content) formData.append('content', submitForm.data.content);
        if (submitForm.data.file) formData.append('file', submitForm.data.file);

        router.post(`/user/tugas/${tugas.id}/submit`, formData, {
            forceFormData: true,
            onSuccess: () => setShowSubmitForm(false),
        });
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/user/tugas/${tugas.id}/message`, { 
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

    const getPriorityStyle = (p: string) => ({
        tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
        sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
        rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
    }[p] || 'bg-gray-100 text-gray-700');

    const getSenderStyle = (type: string) => ({
        admin: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        dosen: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

    const getReplyTarget = (replyId: number | null) => {
        if (!replyId) return null;
        return diskusi.find(d => d.id === replyId);
    };

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title={tugas.judul} />
            <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => router.visit('/user/tugas')} className={`mb-4 transition-all duration-500 hover:translate-x-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>

                <div className="grid grid-cols-3 gap-6">
                    <div className={`col-span-2 space-y-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <div className="rounded-2xl border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">{tugas.jenis}</Badge>
                                <Badge className={getPriorityStyle(tugas.prioritas)}>{tugas.prioritas}</Badge>
                                {tugas.is_overdue && <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">⚠️ Terlewat</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">{tugas.judul}</h1>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg"><BookOpen className="h-4 w-4 text-emerald-500" /> {tugas.course.nama}</span>
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
                                {tugas.late_penalty_percent > 0 && (
                                    <div className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <span className="text-amber-700 dark:text-amber-400">Penalti Terlambat</span>
                                        <span className="font-bold text-amber-600">-{tugas.late_penalty_percent}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submission Status */}
                        <div className="rounded-2xl border bg-card p-5 shadow-lg">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-500" /> Status Pengumpulan
                            </h3>
                            {submission ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        {submission.status === 'graded' ? (
                                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">✓ Dinilai</Badge>
                                        ) : submission.status === 'late' ? (
                                            <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white">⚠️ Terlambat</Badge>
                                        ) : (
                                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">📤 Dikumpulkan</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Dikumpulkan: {submission.submitted_at}
                                    </p>
                                    {submission.file_name && (
                                        <a
                                            href={submission.file_path || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-100 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="truncate">{submission.file_name}</span>
                                        </a>
                                    )}
                                    {submission.grade !== null && (
                                        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Nilai:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-indigo-600">{submission.grade}</span>
                                                    {submission.grade_letter && (
                                                        <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-sm font-bold">
                                                            {submission.grade_letter}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {submission.feedback && (
                                                <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                                                    <p className="text-xs text-muted-foreground">Feedback:</p>
                                                    <p className="text-sm mt-1">{submission.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {submission.status !== 'graded' && (
                                        <Button
                                            onClick={() => setShowSubmitForm(true)}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Upload className="h-4 w-4 mr-2" /> Update Submission
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">Belum mengumpulkan tugas</p>
                                    {(!tugas.is_overdue || tugas.allow_late_submission) && (
                                        <Button
                                            onClick={() => setShowSubmitForm(true)}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                        >
                                            <Upload className="h-4 w-4 mr-2" /> Kumpulkan Tugas
                                        </Button>
                                    )}
                                    {tugas.is_overdue && !tugas.allow_late_submission && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Deadline sudah lewat, tidak dapat mengumpulkan
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Form Dialog */}
                        {showSubmitForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Upload className="h-5 w-5 text-emerald-500" />
                                            {submission ? 'Update Submission' : 'Kumpulkan Tugas'}
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={() => setShowSubmitForm(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {tugas.is_overdue && (
                                        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Deadline sudah lewat. Nilai akan dikurangi {tugas.late_penalty_percent}%.
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Jawaban (Opsional)</Label>
                                            <Textarea
                                                value={submitForm.data.content}
                                                onChange={(e) => submitForm.setData('content', e.target.value)}
                                                placeholder="Tulis jawaban atau catatan..."
                                                rows={5}
                                            />
                                        </div>
                                        <div>
                                            <Label>Upload File (Opsional)</Label>
                                            <div className="mt-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.zip,.rar"
                                                    onChange={(e) => submitForm.setData('file', e.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {submitForm.data.file ? submitForm.data.file.name : 'Pilih File'}
                                                </Button>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Format: PDF, DOC, DOCX, ZIP, RAR (Max 10MB)
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!submitForm.data.content && !submitForm.data.file}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" /> Kirim
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
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
                            diskusi.map((d) => {
                                const replyTarget = getReplyTarget(d.reply_to_id);
                                return (
                                    <div
                                        key={d.id}
                                        className={`relative transition-all duration-300 hover:bg-muted/20 rounded-xl ${d.is_pinned ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800' : ''}`}
                                    >
                                        {/* Reply Thread Line */}
                                        {replyTarget && (
                                            <div className="ml-5 mb-2 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                                                    <CornerDownRight className="h-3 w-3 text-emerald-500" />
                                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Membalas {replyTarget.sender_name}:</span>
                                                    <span className="truncate max-w-[300px]">"{replyTarget.pesan}"</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={`flex gap-3 p-3 ${d.is_mine ? 'flex-row-reverse' : ''}`}>
                                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg flex-shrink-0">
                                                <AvatarFallback className={getSenderStyle(d.sender_type)}>{d.sender_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className={`flex-1 min-w-0 ${d.is_mine ? 'text-right' : ''}`}>
                                                <div className={`flex items-center gap-2 flex-wrap ${d.is_mine ? 'justify-end' : ''}`}>
                                                    <span className="font-semibold text-sm">{d.sender_name}</span>
                                                    <Badge variant="outline" className="text-xs capitalize">{d.sender_type}</Badge>
                                                    {d.visibility === 'private' && <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">🔒 Private</Badge>}
                                                    {d.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                                                    <span className="text-xs text-muted-foreground">{d.time_ago}</span>
                                                </div>
                                                <div className={`mt-2 p-3 rounded-2xl inline-block max-w-[85%] ${d.is_mine ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ml-auto' : 'bg-muted'}`}>
                                                    <p className="text-sm leading-relaxed">{d.pesan}</p>
                                                </div>
                                                <div className={`flex gap-1 mt-2 ${d.is_mine ? 'justify-end' : ''}`}>
                                                    <Button variant="ghost" size="sm" onClick={() => handleReply(d)} className="h-7 text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600">
                                                        <Reply className="h-3 w-3 mr-1" /> Balas
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
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <Reply className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Membalas <span className="font-semibold">{replyTo.sender_name}</span>:</span>
                                <span className="text-muted-foreground truncate max-w-[300px]">"{replyTo.pesan}"</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="h-6 w-6 p-0 hover:bg-emerald-200 dark:hover:bg-emerald-800">
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
                            <span className="text-xs text-muted-foreground self-center">{visibility === 'public' ? 'Semua orang bisa melihat' : 'Hanya dosen/admin yang bisa melihat'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Textarea 
                                ref={inputRef}
                                placeholder={replyTo ? `Balas ke ${replyTo.sender_name}...` : "Tulis pertanyaan atau komentar..."} 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                rows={2} 
                                className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-emerald-500" 
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
                            />
                            <Button onClick={sendMessage} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
