import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Send, Paperclip, CheckCircle, Clock, MessageSquare, FileText,
    Upload, Target, Plus, AlertTriangle, Award, Star, ChevronRight, Download,
    UserCheck, Lock, Smile, Calendar, ListTodo, CheckCircle2, Circle, AlertCircle, File,
    MoreVertical, Edit2, Trash2, X
} from 'lucide-react';

type Member = { id: number; nama: string; nim?: string; is_leader: boolean; role?: string; contribution_points?: number };
type Message = {
    id: number;
    sender?: { id: number; nama: string };
    sender_id?: number;
    sender_name?: string;
    content: string;
    type: string;
    created_at: string;
    attachment?: { name?: string; url?: string; original_name?: string; file_path?: string } | null;
};
type GaFile = {
    id: number;
    original_name: string;
    file_size_formatted?: string;
    uploader?: { nama: string };
    uploaded_by?: string;
    download_url?: string;
    file_path?: string;
    created_at?: string;
    uploaded_at?: string;
};
type Task = {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    assignees?: { id: number; nama: string }[];
    creator?: { nama: string };
    created_by?: number;
    due_date?: string | null;
    deadline?: string | null;
};
type Group = {
    id: number;
    name: string;
    members?: Member[];
    messages?: Message[];
    files?: GaFile[];
    tasks?: Task[];
    message_count?: number;
    file_count?: number;
    submission?: { submitted_at?: string; is_late?: boolean; grade?: number | null };
};
type Assignment = {
    id: number; title: string; description: string; formation_mode: string; grading_mode: string;
    course: { nama: string }; min_members: number; max_members: number; is_locked: boolean;
    formation_deadline_display: string | null; submission_deadline_display: string | null;
    is_overdue?: boolean; peer_evaluation_enabled?: boolean;
    self_form_group_count?: number | null;
    self_form_group_size?: number | null;
};
type AvailableGroup = {
    id: number | null;
    slot_number?: number | null;
    name: string;
    member_count: number;
    max_members: number;
    leader: { nama: string };
};
type SelfFormConfig = { enabled: boolean; group_count: number; group_size: number };
type LeaderTools = {
    can_manage: boolean;
    unassigned_students: { id: number; nama: string; nim?: string | null }[];
};
type Props = {
    assignment: Assignment; myGroup: Group | null; availableGroups?: AvailableGroup[];
    messages?: Message[];
    hasSubmitted?: boolean;
    myGrade?: number | { final_grade?: number | null } | null;
    selfFormConfig?: SelfFormConfig;
    leaderTools?: LeaderTools;
    mahasiswa: { id: number; nama: string };
};

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;

const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
};
const priorityColors: Record<string, string> = { low: 'text-slate-500', medium: 'text-blue-500', high: 'text-amber-500', urgent: 'text-red-500' };

export default function UserTugasKelompokDetail({
    assignment,
    myGroup,
    availableGroups = [],
    messages = [],
    hasSubmitted = false,
    myGrade = null,
    selfFormConfig = { enabled: false, group_count: 0, group_size: 0 },
    leaderTools = { can_manage: false, unassigned_students: [] },
    mahasiswa,
}: Props) {
    const { flash, errors } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'tasks' | 'members'>('chat');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const msgForm = useForm({ content: '' });
    const fileForm = useForm<{ file: File | null }>({ file: null });
    const taskForm = useForm({ title: '', description: '', priority: 'medium', due_date: '' });
    const groupForm = useForm({ name: '' });
    const submitForm = useForm({ notes: '' });
    const conflictForm = useForm({ description: '' });
    const leaderForm = useForm({
        student_id: '',
        new_leader_id: '',
    });
    const [showConflict, setShowConflict] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);

    const normalizedMembers: Member[] = myGroup?.members ?? [];
    const normalizedMessages: Message[] = (messages.length > 0 ? messages : (myGroup?.messages ?? [])).map((msg) => ({
        ...msg,
        sender: msg.sender ?? {
            id: msg.sender_id ?? 0,
            nama: msg.sender_name ?? 'Unknown',
        },
        attachment: msg.attachment
            ? {
                  name: msg.attachment.name ?? msg.attachment.original_name,
                  url: msg.attachment.url ?? msg.attachment.file_path,
              }
            : null,
    }));
    const normalizedFiles: GaFile[] = (myGroup?.files ?? []).map((file) => ({
        ...file,
        download_url: file.download_url ?? file.file_path,
        uploader: file.uploader ?? (file.uploaded_by ? { nama: file.uploaded_by } : { nama: 'Unknown' }),
        created_at: file.created_at ?? file.uploaded_at,
    }));
    const normalizedTasks: Task[] = (myGroup?.tasks ?? []).map((task) => ({
        ...task,
        priority: task.priority ?? 'medium',
        assignees: task.assignees ?? [],
        due_date: task.due_date ?? task.deadline ?? null,
    }));
    const normalizedGrade =
        typeof myGrade === 'number'
            ? myGrade
            : (myGrade && typeof myGrade === 'object' ? myGrade.final_grade ?? null : null);
    const effectiveHasSubmitted = Boolean(hasSubmitted || myGroup?.submission);
    const isOverdue = assignment.is_overdue ?? false;

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [normalizedMessages]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((err: any) => toast.error(err));
        }
    }, [flash, errors]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        router.post(`/user/akademik/tugas-kelompok/${assignment.id}/message`, { content: newMessage }, { preserveScroll: true });
        setNewMessage('');
    };

    const uploadFile = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        router.post(`/user/akademik/tugas-kelompok/${assignment.id}/upload`, formData, { preserveScroll: true });
    };

    const tabs = [
        { key: 'chat', label: 'Chat', icon: MessageSquare, count: myGroup?.message_count ?? normalizedMessages.length },
        { key: 'files', label: 'File', icon: FileText, count: myGroup?.file_count ?? normalizedFiles.length },
        { key: 'tasks', label: 'Tugas', icon: Target, count: normalizedTasks.length },
        { key: 'members', label: 'Anggota', icon: Users, count: normalizedMembers.length },
    ];

    return (
        <StudentLayout>
            <Head title={assignment.title} />
            <motion.div className="space-y-6 p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* ═══ HEADER ═══ */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => router.visit('/user/akademik/tugas-kelompok')}
                                    className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-md border border-white/20">
                                    <ArrowLeft className="h-4 w-4" /> Kembali
                                </motion.button>
                                <div className="flex-1">
                                    <p className="text-sm text-purple-100">{assignment.course.nama}</p>
                                    <h1 className="text-lg sm:text-xl font-bold">{assignment.title}</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {myGroup && (
                                    <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                                        <Users className="h-3.5 w-3.5" />
                                        {myGroup.name}
                                    </span>
                                )}
                                {effectiveHasSubmitted && (
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/30 px-3 py-1 rounded-full text-xs backdrop-blur">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Submitted
                                    </span>
                                )}
                                {normalizedGrade !== null && (
                                    <span className="inline-flex items-center gap-1.5 bg-blue-500/30 px-3 py-1 rounded-full text-xs backdrop-blur">
                                        <Award className="h-3.5 w-3.5" />
                                        Nilai: {normalizedGrade}
                                    </span>
                                )}
                                {assignment.submission_deadline_display && (
                                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs backdrop-blur', isOverdue ? 'bg-red-500/30' : 'bg-white/20')}>
                                        <Calendar className="h-3.5 w-3.5" />
                                        {assignment.submission_deadline_display}
                                    </span>
                                )}
                                {assignment.is_locked && (
                                    <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                                        <Lock className="h-3.5 w-3.5" />
                                        Locked
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ NO GROUP — JOIN/CREATE ═══ */}
                {!myGroup && (
                    <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-purple-500" /> Pilih Kelompok</h2>

                        {assignment.formation_mode === 'self-form' && !assignment.is_locked && !isOverdue && (
                            <>
                                {selfFormConfig.group_count > 0 && (
                                    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-700/40 dark:bg-blue-900/20 p-4">
                                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                                            Total slot kelompok: {selfFormConfig.group_count}
                                        </p>
                                        <p className="text-xs text-blue-600/80 dark:text-blue-300/80">
                                            Kapasitas per kelompok: {selfFormConfig.group_size} mahasiswa
                                        </p>
                                    </div>
                                )}

                                {selfFormConfig.group_count <= 0 && (
                                    <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50/50 dark:bg-purple-900/20 p-4">
                                        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Buat Kelompok Baru</h3>
                                        <div className="flex gap-3">
                                            <Input placeholder="Nama kelompok..." value={groupForm.data.name} onChange={e => groupForm.setData('name', e.target.value)} className="flex-1" />
                                            <Button onClick={() => groupForm.post(`/user/akademik/tugas-kelompok/${assignment.id}/create-group`)}
                                                disabled={!groupForm.data.name || groupForm.processing}
                                                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"><Plus className="mr-1 h-4 w-4" /> Buat</Button>
                                        </div>
                                    </div>
                                )}

                                {/* Join group */}
                                {availableGroups.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Daftar Kelompok</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {availableGroups.map(g => (
                                                <motion.div key={`${g.slot_number ?? 'g'}-${g.id ?? g.name}`} whileHover={{ y: -2 }} className="rounded-xl border p-4 flex items-center justify-between bg-white/60 dark:bg-neutral-800/30">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{g.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {g.slot_number ? `Slot ${g.slot_number} • ` : ''}
                                                            Ketua: {g.leader.nama} • {g.member_count}/{g.max_members}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            g.slot_number
                                                                ? router.post(`/user/akademik/tugas-kelompok/${assignment.id}/join-slot/${g.slot_number}`)
                                                                : (g.id ? router.post(`/user/akademik/tugas-kelompok/${assignment.id}/join-group/${g.id}`) : null)
                                                        }
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs h-7">Gabung</Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {assignment.formation_mode === 'self-form' && isOverdue && (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 mx-auto text-red-400 mb-3" />
                                <p className="text-red-500 font-medium">Batas waktu pembentukan kelompok telah lewat.</p>
                                <p className="text-sm text-slate-400 mt-1">Silakan hubungi dosen Anda.</p>
                            </div>
                        )}

                        {(assignment.formation_mode === 'random' || assignment.formation_mode === 'manual') && (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                                <p className="text-slate-600 dark:text-slate-400">Kelompok akan dibentuk oleh {assignment.formation_mode === 'random' ? 'sistem secara acak' : 'dosen'}.</p>
                                <p className="text-sm text-slate-400 mt-1">Silakan tunggu pengumuman.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ═══ GROUP COLLABORATION WORKSPACE ═══ */}
                {myGroup && (
                    <>
                        {/* Tabs */}
                        <motion.div variants={iV}>
                            <div className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10">
                                {tabs.map(tab => {
                                    const TabIcon = tab.icon;
                                    return (
                                        <motion.button key={tab.key} layout onClick={() => setActiveTab(tab.key as any)}
                                            className={cn('relative px-4 py-2 rounded-xl text-sm font-medium transition-colors', activeTab === tab.key ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>
                                            {activeTab === tab.key && <motion.div layoutId="activeTabUser" className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm" transition={{ type: 'spring' as const, bounce: 0.2, duration: 0.6 }} />}
                                            <span className="relative z-10 flex items-center gap-1.5"><TabIcon className="h-4 w-4" /><span className="hidden sm:inline">{tab.label}</span><span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-xs">{tab.count}</span></span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {/* ── CHAT ── */}
                            {activeTab === 'chat' && (
                                <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                                    <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                                        {normalizedMessages.length === 0 ? (
                                            <div className="text-center py-12"><MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-400">Belum ada pesan. Mulai obrolan!</p></div>
                                        ) : normalizedMessages.map(msg => (
                                            <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                className={cn('flex', msg.sender?.id === mahasiswa.id ? 'justify-end' : 'justify-start')}>
                                                <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5',
                                                    msg.sender?.id === mahasiswa.id ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white' : 'bg-white dark:bg-neutral-800 border')}>
                                                    {msg.sender?.id !== mahasiswa.id && <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">{msg.sender?.nama ?? 'Unknown'}</p>}
                                                    <p className="text-sm">{msg.content}</p>
                                                    {msg.attachment && <div className="mt-1 flex items-center gap-1 text-xs opacity-75"><Paperclip className="h-3 w-3" />{msg.attachment.name ?? 'Lampiran'}</div>}
                                                    <p className={cn('text-[10px] mt-1', msg.sender?.id === mahasiswa.id ? 'text-white/60' : 'text-slate-400')}>{msg.created_at}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="border-t p-3 flex gap-2">
                                        <Input placeholder="Ketik pesan..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 bg-white/60 dark:bg-neutral-800/60" />
                                        <Button onClick={sendMessage} disabled={!newMessage.trim()} className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"><Send className="h-4 w-4" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── FILES ── */}
                            {activeTab === 'files' && (
                                <motion.div key="files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" /> File Kelompok</h3>
                                        <label className="cursor-pointer">
                                            <input type="file" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                                            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white">
                                                <Upload className="h-4 w-4" /> Upload
                                            </motion.div>
                                        </label>
                                    </div>
                                    {normalizedFiles.length === 0 ? (
                                        <div className="text-center py-8"><FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-400">Belum ada file</p></div>
                                    ) : (
                                        <div className="space-y-2">
                                            {normalizedFiles.map(f => (
                                                <div key={f.id} className="flex items-center justify-between rounded-xl border p-3 bg-white/60 dark:bg-neutral-800/30">
                                                    <div className="flex items-center gap-3"><FileText className="h-8 w-8 text-purple-500" /><div><p className="text-sm font-medium text-slate-900 dark:text-white">{f.original_name}</p><p className="text-xs text-slate-500">{f.file_size_formatted ?? '-'} • {f.uploader?.nama ?? 'Unknown'}</p></div></div>
                                                    {f.download_url ? (
                                                        <a href={f.download_url} className="text-purple-500 hover:text-purple-700"><Download className="h-4 w-4" /></a>
                                                    ) : (
                                                        <span className="text-slate-400"><Download className="h-4 w-4" /></span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ── TASKS ── */}
                            {activeTab === 'tasks' && (
                                <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Target className="h-5 w-5 text-purple-500" /> Task Board</h3>
                                        <Button size="sm" onClick={() => setShowNewTask(true)} className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"><Plus className="mr-1 h-4 w-4" /> Task</Button>
                                    </div>

                                    {showNewTask && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 rounded-2xl border p-4 bg-purple-50/50 dark:bg-purple-900/20">
                                            <div className="space-y-3">
                                                <Input placeholder="Judul task..." value={taskForm.data.title} onChange={e => taskForm.setData('title', e.target.value)} />
                                                <Textarea placeholder="Deskripsi..." value={taskForm.data.description} onChange={e => taskForm.setData('description', e.target.value)} rows={2} />
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => { taskForm.post(`/user/akademik/tugas-kelompok/${assignment.id}/task`, { onSuccess: () => setShowNewTask(false) }); }}
                                                        disabled={!taskForm.data.title || taskForm.processing} className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white">Buat</Button>
                                                    <Button size="sm" variant="outline" onClick={() => setShowNewTask(false)}>Batal</Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {normalizedTasks.length === 0 ? (
                                        <div className="text-center py-8"><Target className="h-12 w-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-400">Belum ada task</p></div>
                                    ) : (
                                        <div className="space-y-2">
                                            {normalizedTasks.map(task => (
                                                <motion.div key={task.id} whileHover={{ y: -1 }} className="rounded-xl border p-3 bg-white/60 dark:bg-neutral-800/30 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <button
                                                            onClick={() =>
                                                                router.patch(`/user/akademik/tugas-kelompok/${assignment.id}/task/${task.id}`, {
                                                                    status:
                                                                        task.status === 'completed'
                                                                            ? 'pending'
                                                                            : task.status === 'pending'
                                                                              ? 'in_progress'
                                                                              : 'completed',
                                                                })
                                                            }
                                                            className={cn(
                                                                'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                                                                task.status === 'completed'
                                                                    ? 'bg-green-500 border-green-500 text-white'
                                                                    : 'border-slate-300',
                                                            )}
                                                        >
                                                            {task.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                                                        </button>
                                                        <div>
                                                            <p className={cn('text-sm font-medium', task.status === 'completed' && 'line-through text-slate-400')}>{task.title}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', statusColors[task.status] || 'bg-slate-100 text-slate-700')}>{task.status}</span>
                                                                <span className={cn('text-[10px]', priorityColors[(task.priority ?? 'medium') as keyof typeof priorityColors] || 'text-slate-500')}>●</span>
                                                                {(task.assignees ?? []).map(a => <span key={a.id} className="text-[10px] text-slate-500">{a.nama}</span>)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ── MEMBERS ── */}
                            {activeTab === 'members' && (
                                <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-purple-500" /> Anggota Kelompok</h3>
                                    <div className="space-y-3">
                                        {normalizedMembers.map((m, i) => (
                                            <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between rounded-xl border p-4 bg-white/60 dark:bg-neutral-800/30">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                                                        m.is_leader ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-fuchsia-500')}>
                                                        {m.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                                            {m.nama}
                                                            {m.is_leader && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{m.role ?? (m.is_leader ? 'Ketua Kelompok' : m.nim ?? 'Anggota')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-purple-600">{m.contribution_points ?? 0}</p>
                                                    <p className="text-xs text-slate-400">poin</p>
                                                    {leaderTools.can_manage && !m.is_leader && (
                                                        <div className="mt-2 flex flex-col items-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.post(`/user/akademik/tugas-kelompok/${assignment.id}/leader/set-leader`, {
                                                                        student_id: m.id,
                                                                    })
                                                                }
                                                                className="h-7 px-2 text-[11px]"
                                                            >
                                                                Jadikan Ketua
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.post(`/user/akademik/tugas-kelompok/${assignment.id}/leader/remove-member`, {
                                                                        student_id: m.id,
                                                                    })
                                                                }
                                                                className="h-7 px-2 text-[11px] border-red-200 text-red-500 hover:bg-red-50"
                                                            >
                                                                Keluarkan
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {leaderTools.can_manage && (
                                        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-700/40 dark:bg-blue-900/20 p-3 space-y-2">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-200">
                                                Panel Ketua: tambahkan anggota ke kelompok
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <select
                                                    value={leaderForm.data.student_id}
                                                    onChange={(event) => leaderForm.setData('student_id', event.target.value)}
                                                    className="h-9 w-full rounded-lg border border-slate-300 bg-white/90 px-3 text-sm dark:border-slate-700 dark:bg-neutral-800"
                                                >
                                                    <option value="">Pilih mahasiswa belum berkelompok</option>
                                                    {leaderTools.unassigned_students.map((student) => (
                                                        <option key={student.id} value={String(student.id)}>
                                                            {student.nama} {student.nim ? `(${student.nim})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    size="sm"
                                                    disabled={!leaderForm.data.student_id}
                                                    onClick={() =>
                                                        router.post(`/user/akademik/tugas-kelompok/${assignment.id}/leader/add-member`, {
                                                            student_id: Number(leaderForm.data.student_id),
                                                        })
                                                    }
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                                >
                                                    Tambah Anggota
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        {!assignment.is_locked && (
                                            <Button size="sm" variant="outline" onClick={() => { if (confirm('Yakin ingin meninggalkan kelompok?')) router.post(`/user/akademik/tugas-kelompok/${assignment.id}/leave-group`); }}
                                                className="text-red-500 border-red-200 hover:bg-red-50">Keluar Kelompok</Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => setShowConflict(true)} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                                            <AlertTriangle className="mr-1 h-3 w-3" /> Laporkan Masalah
                                        </Button>
                                        {!effectiveHasSubmitted && (
                                            <Button size="sm" onClick={() => setShowSubmit(true)} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                                                <CheckCircle className="mr-1 h-3 w-3" /> Submit Tugas
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </motion.div>

            {/* ═══ SUBMIT MODAL ═══ */}
            <AnimatePresence>
                {showSubmit && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSubmit(false)} />
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4"><h2 className="text-lg font-bold text-white">Submit Tugas Kelompok</h2></div>
                            <div className="p-6 space-y-4">
                                <div><Label>Catatan Submit</Label><Textarea value={submitForm.data.notes} onChange={e => submitForm.setData('notes', e.target.value)} rows={3} className="mt-1" placeholder="Tambahkan catatan jika perlu..." /></div>
                            </div>
                            <div className="p-4 border-t flex gap-3">
                                <Button variant="outline" onClick={() => setShowSubmit(false)} className="flex-1">Batal</Button>
                                <Button onClick={() => submitForm.post(`/user/akademik/tugas-kelompok/${assignment.id}/submit`, { onSuccess: () => setShowSubmit(false) })}
                                    disabled={submitForm.processing} className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white"><CheckCircle className="mr-2 h-4 w-4" /> Submit</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ CONFLICT MODAL ═══ */}
            <AnimatePresence>
                {showConflict && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConflict(false)} />
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4"><h2 className="text-lg font-bold text-white">Laporkan Masalah</h2></div>
                            <div className="p-6 space-y-4">
                                <div><Label>Jelaskan masalah yang terjadi</Label><Textarea value={conflictForm.data.description} onChange={e => conflictForm.setData('description', e.target.value)} rows={4} className="mt-1" placeholder="Jelaskan masalah secara detail..." /></div>
                            </div>
                            <div className="p-4 border-t flex gap-3">
                                <Button variant="outline" onClick={() => setShowConflict(false)} className="flex-1">Batal</Button>
                                <Button onClick={() => conflictForm.post(`/user/akademik/tugas-kelompok/${assignment.id}/conflict`, { onSuccess: () => setShowConflict(false) })}
                                    disabled={!conflictForm.data.description || conflictForm.processing} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">Kirim Laporan</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
