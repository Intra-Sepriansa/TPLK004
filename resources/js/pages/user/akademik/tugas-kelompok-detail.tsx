import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    Bell,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Crown,
    Download,
    File,
    FileText,
    Info,
    Lock,
    Mail,
    MessageSquare,
    Paperclip,
    Plus,
    Search,
    Send,
    Share2,
    Shield,
    Sparkles,
    Star,
    Target,
    Timer,
    TrendingUp,
    Upload,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type Member = {
    id: number;
    nama: string;
    nim?: string;
    is_leader: boolean;
    role?: string;
    contribution_points?: number;
};
type Message = {
    id: number;
    sender?: { id: number; nama: string };
    sender_id?: number;
    sender_name?: string;
    content: string;
    type: string;
    created_at: string;
    attachment?: {
        name?: string;
        url?: string;
        original_name?: string;
        file_path?: string;
    } | null;
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
    leader_id?: number;
    slot_number?: number;
    members?: Member[];
    messages?: Message[];
    files?: GaFile[];
    tasks?: Task[];
    message_count?: number;
    file_count?: number;
    submission?: {
        submitted_at?: string;
        is_late?: boolean;
        grade?: number | null;
        grading_notes?: string | null;
    } | null;
    progress?: number;
};
type Assignment = {
    id: number;
    title: string;
    description: string;
    formation_mode: string;
    grading_mode: string;
    course: { nama: string };
    min_members: number;
    max_members: number;
    is_locked: boolean;
    formation_deadline?: string | null;
    formation_deadline_display: string | null;
    submission_deadline?: string | null;
    submission_deadline_display: string | null;
    is_overdue?: boolean;
    peer_evaluation_enabled?: boolean;
    self_form_group_count?: number | null;
    self_form_group_size?: number | null;
    features?: string[];
    allow_resubmission?: boolean;
};
type AvailableGroup = {
    id: number | null;
    slot_number?: number | null;
    name: string;
    member_count: number;
    max_members: number;
    is_full?: boolean;
    is_my_group?: boolean;
    leader: { nama: string };
    members?: { id: number; nama: string; nim?: string; is_leader: boolean }[];
};
type SelfFormConfig = {
    enabled: boolean;
    group_count: number;
    group_size: number;
};
type LeaderTools = {
    can_manage: boolean;
    unassigned_students: {
        id: number;
        nama: string;
        nim?: string | null;
        kelas?: string | null;
    }[];
};
type Invitation = {
    id: number;
    group_id: number;
    group_name: string;
    inviter_name: string;
    group_member_count: number;
    group_max_members: number;
    group_members?: { nama: string; is_leader: boolean }[];
    created_at: string;
};
type SentInvitation = {
    id: number;
    invitee_id: number;
    invitee_name: string;
    invitee_nim?: string | null;
    created_at: string;
};
type ActivityLog = {
    id: number;
    type: string;
    user_name: string;
    metadata?: unknown;
    created_at: string;
    created_at_full?: string;
};
type Props = {
    assignment: Assignment;
    myGroup: Group | null;
    allGroups?: AvailableGroup[];
    messages?: Message[];
    hasSubmitted?: boolean;
    myGrade?: number | { final_grade?: number | null } | null;
    selfFormConfig?: SelfFormConfig;
    leaderTools?: LeaderTools;
    mahasiswa: { id: number; nama: string };
    pendingInvitations?: Invitation[];
    sentInvitations?: SentInvitation[];
    stats?: {
        total_students: number;
        students_with_group: number;
        students_without_group: number;
    };
    activityLogs?: ActivityLog[];
    peerEvalCompleted?: boolean;
};

const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;
const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;
const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
};

const toDateSafe = (value?: string | null): Date | null => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const direct = new Date(raw);
    if (!Number.isNaN(direct.getTime())) return direct;

    const normalized = raw
        .replace(/ WIB| WITA| WIT| UTC/gi, '')
        .replace(/\./g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    const fallback = new Date(normalized);
    if (!Number.isNaN(fallback.getTime())) return fallback;

    return null;
};

function CountdownTimer({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [urgency, setUrgency] = useState<'safe' | 'warning' | 'danger'>(
        'safe',
    );
    useEffect(() => {
        const update = () => {
            const diff = new Date(deadline).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Waktu habis');
                setUrgency('danger');
                return;
            }
            const d = Math.floor(diff / 86400000),
                h = Math.floor((diff % 86400000) / 3600000),
                m = Math.floor((diff % 3600000) / 60000),
                s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(
                d > 0
                    ? `${d}h ${h}j ${m}m`
                    : h > 0
                      ? `${h}j ${m}m ${s}d`
                      : `${m}m ${s}d`,
            );
            setUrgency(
                diff < 3600000
                    ? 'danger'
                    : diff < 86400000
                      ? 'warning'
                      : 'safe',
            );
        };
        update();
        const i = setInterval(update, 1000);
        return () => clearInterval(i);
    }, [deadline]);
    const colors = {
        safe: 'text-emerald-300',
        warning: 'text-amber-300',
        danger: 'text-red-300 animate-pulse',
    };
    return (
        <span className={cn('font-mono text-sm font-bold', colors[urgency])}>
            <Timer className="mr-1 inline h-3.5 w-3.5" />
            {timeLeft}
        </span>
    );
}

function GroupStatusBadge({
    memberCount,
    maxMembers,
    isMy,
}: {
    memberCount: number;
    maxMembers: number;
    isMy?: boolean;
}) {
    if (isMy)
        return (
            <span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                ✓ Kelompok Anda
            </span>
        );
    const pct = maxMembers > 0 ? memberCount / maxMembers : 0;
    if (pct >= 1)
        return (
            <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                <Lock className="mr-0.5 inline h-2.5 w-2.5" />
                Penuh
            </span>
        );
    if (pct >= 0.7)
        return (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                Hampir Penuh
            </span>
        );
    return (
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            Tersedia
        </span>
    );
}

export default function UserTugasKelompokDetail({
    assignment,
    myGroup,
    allGroups = [],
    messages = [],
    hasSubmitted = false,
    myGrade = null,
    selfFormConfig = { enabled: false, group_count: 0, group_size: 0 },
    leaderTools = { can_manage: false, unassigned_students: [] },
    mahasiswa,
    pendingInvitations = [],
    sentInvitations = [],
    stats = {
        total_students: 0,
        students_with_group: 0,
        students_without_group: 0,
    },
    activityLogs = [],
}: Props) {
    const { flash, errors = {} } = usePage().props as {
        flash?: { success?: string; error?: string };
        errors?: Record<string, string | string[]>;
    };
    const [activeTab, setActiveTab] = useState<
        'chat' | 'files' | 'tasks' | 'members'
    >('chat');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSearch, setInviteSearch] = useState('');
    const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
    const [showDesc, setShowDesc] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showConflict, setShowConflict] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);

    const taskForm = useForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
    });
    const groupForm = useForm({ name: '' });
    const submitForm = useForm({ notes: '' });
    const conflictForm = useForm({ description: '' });
    const leaderForm = useForm({ student_id: '' });

    const normalizedMembers = useMemo<Member[]>(
        () => myGroup?.members ?? [],
        [myGroup?.members],
    );
    const normalizedMessages: Message[] = (
        messages.length > 0 ? messages : (myGroup?.messages ?? [])
    ).map((msg) => ({
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
    const normalizedFiles: GaFile[] = (myGroup?.files ?? []).map((f) => ({
        ...f,
        download_url: f.download_url ?? f.file_path,
        uploader:
            f.uploader ??
            (f.uploaded_by ? { nama: f.uploaded_by } : { nama: 'Unknown' }),
        created_at: f.created_at ?? f.uploaded_at,
    }));
    const normalizedTasks: Task[] = (myGroup?.tasks ?? []).map((t) => ({
        ...t,
        priority: t.priority ?? 'medium',
        assignees: t.assignees ?? [],
        due_date: t.due_date ?? t.deadline ?? null,
    }));
    const normalizedGrade =
        typeof myGrade === 'number'
            ? myGrade
            : myGrade && typeof myGrade === 'object'
              ? (myGrade.final_grade ?? null)
              : null;
    const effectiveHasSubmitted = Boolean(hasSubmitted || myGroup?.submission);
    const isOverdue = assignment.is_overdue ?? false;
    const pendingInviteeIds = useMemo(
        () => new Set(sentInvitations.map((inv) => inv.invitee_id)),
        [sentInvitations],
    );
    const inviteableStudents = useMemo(
        () =>
            leaderTools.unassigned_students.filter(
                (student) => !pendingInviteeIds.has(student.id),
            ),
        [leaderTools.unassigned_students, pendingInviteeIds],
    );

    const filteredStudents = useMemo(() => {
        if (!inviteSearch.trim()) return inviteableStudents;
        const q = inviteSearch.toLowerCase();
        return inviteableStudents.filter(
            (s) =>
                s.nama.toLowerCase().includes(q) ||
                s.nim?.toLowerCase().includes(q),
        );
    }, [inviteSearch, inviteableStudents]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [normalizedMessages]);
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((errorValue) => {
                const message = Array.isArray(errorValue)
                    ? errorValue[0]
                    : errorValue;
                if (message) toast.error(String(message));
            });
        }
    }, [flash, errors]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        router.post(
            `/user/akademik/tugas-kelompok/${assignment.id}/message`,
            { content: newMessage },
            { preserveScroll: true },
        );
        setNewMessage('');
    };
    const uploadFile = (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        router.post(
            `/user/akademik/tugas-kelompok/${assignment.id}/upload`,
            fd,
            { preserveScroll: true },
        );
    };

    const tabs: Array<{
        key: 'chat' | 'files' | 'tasks' | 'members';
        label: string;
        icon: typeof MessageSquare;
        count: number;
    }> = [
        {
            key: 'chat',
            label: 'Chat',
            icon: MessageSquare,
            count: myGroup?.message_count ?? normalizedMessages.length,
        },
        {
            key: 'files',
            label: 'File',
            icon: FileText,
            count: myGroup?.file_count ?? normalizedFiles.length,
        },
        {
            key: 'tasks',
            label: 'Tugas',
            icon: Target,
            count: normalizedTasks.length,
        },
        {
            key: 'members',
            label: 'Anggota',
            icon: Users,
            count: normalizedMembers.length,
        },
    ];

    const formationProgress =
        stats.total_students > 0
            ? Math.round(
                  (stats.students_with_group / stats.total_students) * 100,
              )
            : 0;

    const formationModeLabel =
        assignment.formation_mode === 'self-form'
            ? 'Self-Form'
            : assignment.formation_mode === 'random'
              ? 'Random'
              : assignment.formation_mode === 'manual'
                ? 'Manual'
                : assignment.formation_mode;
    const gradingModeLabel =
        assignment.grading_mode === 'individual'
            ? 'Nilai Individu'
            : assignment.grading_mode === 'same'
              ? 'Nilai Sama'
              : assignment.grading_mode;
    const titleUpper = assignment.title.toLocaleUpperCase('id-ID');

    const monitoringData = useMemo(() => {
        const now = new Date();
        const HOUR = 60 * 60 * 1000;

        const completedTasks = normalizedTasks.filter(
            (task) => String(task.status).toLowerCase() === 'completed',
        ).length;
        const inProgressTasks = normalizedTasks.filter(
            (task) => String(task.status).toLowerCase() === 'in_progress',
        ).length;
        const pendingTasks = normalizedTasks.filter(
            (task) => String(task.status).toLowerCase() === 'pending',
        ).length;
        const completionRate =
            normalizedTasks.length > 0
                ? Math.round((completedTasks / normalizedTasks.length) * 100)
                : 0;

        let overdueTasks = 0;
        const upcomingTasks: Array<{
            id: number;
            title: string;
            dueLabel: string;
            dueInHours: number;
        }> = [];
        for (const task of normalizedTasks) {
            const isDone = String(task.status).toLowerCase() === 'completed';
            const dueRaw = task.due_date ?? null;
            const dueAt = toDateSafe(dueRaw);
            if (!dueAt) continue;

            const dueInHours = (dueAt.getTime() - now.getTime()) / HOUR;
            if (!isDone && dueInHours < 0) overdueTasks += 1;
            if (!isDone && dueInHours >= -48) {
                upcomingTasks.push({
                    id: task.id,
                    title: task.title,
                    dueLabel: dueRaw ?? '-',
                    dueInHours,
                });
            }
        }
        upcomingTasks.sort((a, b) => a.dueInHours - b.dueInHours);

        const messageEvents = normalizedMessages
            .map((message) => ({
                at: toDateSafe(message.created_at),
                actorId: message.sender?.id ?? null,
                actorName: (
                    message.sender?.nama ??
                    message.sender_name ??
                    ''
                ).toLowerCase(),
            }))
            .filter((event) => event.at !== null) as Array<{
            at: Date;
            actorId: number | null;
            actorName: string;
        }>;

        const fileEvents = normalizedFiles
            .map((file) => ({
                at: toDateSafe(file.created_at),
                actorName: (file.uploader?.nama ?? '').toLowerCase(),
            }))
            .filter((event) => event.at !== null) as Array<{
            at: Date;
            actorName: string;
        }>;

        const logEvents = activityLogs
            .map((log) => ({
                at: toDateSafe(log.created_at_full ?? log.created_at),
                actorName: (log.user_name ?? '').toLowerCase(),
                type: log.type,
            }))
            .filter((event) => event.at !== null) as Array<{
            at: Date;
            actorName: string;
            type: string;
        }>;

        const allEvents = [
            ...messageEvents.map((event) => ({
                at: event.at,
                actorName: event.actorName,
                type: 'message',
            })),
            ...fileEvents.map((event) => ({
                at: event.at,
                actorName: event.actorName,
                type: 'file',
            })),
            ...logEvents.map((event) => ({
                at: event.at,
                actorName: event.actorName,
                type: event.type || 'activity',
            })),
        ].sort((a, b) => b.at.getTime() - a.at.getTime());

        const countWithinHours = (
            source: Array<{ at: Date }>,
            hours: number,
        ) => {
            const windowMs = hours * HOUR;
            return source.filter((event) => {
                const diff = now.getTime() - event.at.getTime();
                return diff >= 0 && diff <= windowMs;
            }).length;
        };

        const messages24h = countWithinHours(messageEvents, 24);
        const files24h = countWithinHours(fileEvents, 24);
        const logs24h = countWithinHours(logEvents, 24);
        const activities72h = countWithinHours(allEvents, 72);
        const velocityPerDay = Number((activities72h / 3).toFixed(1));
        const collaborationPulse = Math.min(
            100,
            Math.round((messages24h + files24h * 2 + logs24h * 1.2) * 8),
        );

        const lastActivityAt = allEvents[0]?.at ?? null;
        const lastActivityHours = lastActivityAt
            ? (now.getTime() - lastActivityAt.getTime()) / HOUR
            : null;
        const lastActivityLabel =
            lastActivityHours === null
                ? 'Belum ada aktivitas'
                : lastActivityHours < 1
                  ? 'Baru saja'
                  : lastActivityHours < 24
                    ? `${Math.floor(lastActivityHours)} jam lalu`
                    : `${Math.floor(lastActivityHours / 24)} hari lalu`;

        let riskScore = 100;
        if (overdueTasks > 0) riskScore -= Math.min(45, overdueTasks * 14);
        if (normalizedTasks.length > 0 && completionRate < 40) riskScore -= 15;
        if (
            assignment.min_members > 0 &&
            normalizedMembers.length < assignment.min_members
        ) {
            riskScore -= 25;
        }
        if (lastActivityHours !== null && lastActivityHours > 36) {
            riskScore -= 20;
        }
        if (!effectiveHasSubmitted && isOverdue) {
            riskScore -= 15;
        }
        riskScore = Math.max(0, Math.min(100, riskScore));

        const riskFlags: string[] = [];
        if (overdueTasks > 0) {
            riskFlags.push(`${overdueTasks} task melewati deadline`);
        }
        if (
            assignment.min_members > 0 &&
            normalizedMembers.length < assignment.min_members
        ) {
            riskFlags.push(
                `Anggota belum memenuhi minimum (${normalizedMembers.length}/${assignment.min_members})`,
            );
        }
        if (lastActivityHours !== null && lastActivityHours > 36) {
            riskFlags.push(
                `Aktivitas tim menurun (${Math.floor(lastActivityHours)} jam terakhir pasif)`,
            );
        }
        if (!effectiveHasSubmitted && isOverdue) {
            riskFlags.push('Belum submit meski deadline utama sudah lewat');
        }
        if (riskFlags.length === 0) {
            riskFlags.push('Kondisi tim stabil, tidak ada risiko kritis');
        }

        const dayKey = (value: Date) =>
            `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`;
        const weeklyMap = new Map<string, { label: string; count: number }>();
        for (let index = 6; index >= 0; index -= 1) {
            const day = new Date(now);
            day.setHours(0, 0, 0, 0);
            day.setDate(day.getDate() - index);
            weeklyMap.set(dayKey(day), {
                label: day.toLocaleDateString('id-ID', { weekday: 'short' }),
                count: 0,
            });
        }
        for (const event of allEvents) {
            const key = dayKey(event.at);
            const day = weeklyMap.get(key);
            if (day) day.count += 1;
        }
        const weeklyActivity = Array.from(weeklyMap.values());
        const weeklyPeak = Math.max(
            1,
            ...weeklyActivity.map((day) => day.count),
        );

        const contributionMap = new Map<
            number,
            {
                id: number;
                name: string;
                messages: number;
                files: number;
                tasksDone: number;
                points: number;
                score: number;
            }
        >();
        const memberNameIndex = new Map<string, number>();
        for (const member of normalizedMembers) {
            contributionMap.set(member.id, {
                id: member.id,
                name: member.nama,
                messages: 0,
                files: 0,
                tasksDone: 0,
                points: member.contribution_points ?? 0,
                score: 0,
            });
            memberNameIndex.set(member.nama.toLowerCase(), member.id);
        }

        for (const event of messageEvents) {
            const byId = event.actorId
                ? contributionMap.get(event.actorId)
                : null;
            const byName = !byId
                ? contributionMap.get(
                      memberNameIndex.get(event.actorName) ?? -1,
                  )
                : null;
            if (byId) byId.messages += 1;
            else if (byName) byName.messages += 1;
        }

        for (const event of fileEvents) {
            const memberId = memberNameIndex.get(event.actorName);
            if (!memberId) continue;
            const row = contributionMap.get(memberId);
            if (row) row.files += 1;
        }

        for (const task of normalizedTasks) {
            if (String(task.status).toLowerCase() !== 'completed') continue;
            for (const assignee of task.assignees ?? []) {
                const row =
                    contributionMap.get(assignee.id) ??
                    contributionMap.get(
                        memberNameIndex.get(assignee.nama.toLowerCase()) ?? -1,
                    );
                if (row) row.tasksDone += 1;
            }
        }

        const leaderboard = Array.from(contributionMap.values())
            .map((row) => ({
                ...row,
                score:
                    row.messages +
                    row.files * 2 +
                    row.tasksDone * 3 +
                    Math.round(row.points / 20),
            }))
            .sort((a, b) => b.score - a.score);
        const topContributionScore = Math.max(
            1,
            ...leaderboard.map((row) => row.score),
        );

        return {
            completedTasks,
            inProgressTasks,
            pendingTasks,
            overdueTasks,
            completionRate,
            messages24h,
            files24h,
            logs24h,
            activities72h,
            velocityPerDay,
            collaborationPulse,
            riskScore,
            riskFlags,
            lastActivityLabel,
            weeklyActivity,
            weeklyPeak,
            upcomingTasks: upcomingTasks.slice(0, 4),
            leaderboard: leaderboard.slice(0, 5),
            topContributionScore,
        };
    }, [
        activityLogs,
        assignment.min_members,
        effectiveHasSubmitted,
        isOverdue,
        normalizedFiles,
        normalizedMembers,
        normalizedMessages,
        normalizedTasks,
    ]);

    return (
        <StudentLayout>
            <Head title={assignment.title} />
            <motion.div
                className="space-y-5 p-4 md:p-6"
                variants={cV}
                initial="hidden"
                animate="visible"
            >
                {/* ═══ HEADER ═══ */}
                <motion.div
                    variants={iV}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-3xl" />
                    <div className="relative">
                        <div className="flex flex-col gap-4">
                            <motion.button
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                    router.visit(
                                        '/user/akademik/tugas-kelompok',
                                    )
                                }
                                className="inline-flex w-fit items-center gap-2 text-base font-medium text-white/90 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Tugas Kelompok
                            </motion.button>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm">
                                    {assignment.course.nama}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm">
                                    {formationModeLabel}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm">
                                    <FileText className="h-3.5 w-3.5" />
                                    {gradingModeLabel}
                                </span>
                                {assignment.is_locked && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm">
                                        <Lock className="h-3.5 w-3.5" />
                                        Locked
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl leading-tight font-black tracking-wide text-white sm:text-4xl">
                                {titleUpper}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/95 sm:text-lg">
                                <span className="inline-flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {assignment.formation_deadline_display ??
                                        'Formation terbuka'}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Timer className="h-4 w-4" />
                                    {assignment.submission_deadline_display ??
                                        'Deadline belum ditentukan'}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {myGroup
                                        ? `${myGroup.name} • ${normalizedMembers.length} anggota`
                                        : 'Belum bergabung kelompok'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!assignment.formation_deadline) {
                                            toast.info(
                                                'Deadline formasi belum tersedia',
                                            );
                                            return;
                                        }
                                        toast.success(
                                            `Reminder formasi: ${assignment.formation_deadline_display ?? assignment.formation_deadline}`,
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                                >
                                    <Bell className="h-4 w-4" />
                                    Set Reminder
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (typeof window === 'undefined') {
                                            return;
                                        }
                                        if (!myGroup) {
                                            toast.error(
                                                'Anda belum punya kelompok, export belum tersedia',
                                            );
                                            return;
                                        }
                                        const exportUrl = `/user/akademik/tugas-kelompok/${assignment.id}/export-pdf`;
                                        const popup = window.open(
                                            exportUrl,
                                            '_blank',
                                        );
                                        if (!popup) {
                                            window.location.href = exportUrl;
                                        }
                                        toast.success(
                                            'Laporan PDF advanced sedang disiapkan',
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (
                                            typeof navigator !== 'undefined' &&
                                            navigator.clipboard
                                        ) {
                                            await navigator.clipboard.writeText(
                                                window.location.href,
                                            );
                                            toast.success(
                                                'Link detail berhasil disalin',
                                            );
                                            return;
                                        }
                                        toast.info(
                                            'Clipboard tidak tersedia di browser ini',
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {effectiveHasSubmitted && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3 py-1 text-xs backdrop-blur">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Submitted
                                    </span>
                                )}
                                {normalizedGrade !== null && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/30 px-3 py-1 text-xs backdrop-blur">
                                        <Award className="h-3.5 w-3.5" />
                                        Nilai: {normalizedGrade}
                                    </span>
                                )}
                                {assignment.formation_deadline &&
                                    !isOverdue && (
                                        <CountdownTimer
                                            deadline={
                                                assignment.formation_deadline
                                            }
                                        />
                                    )}
                                {isOverdue && (
                                    <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-red-500/30 px-3 py-1 text-xs backdrop-blur">
                                        <Clock className="h-3.5 w-3.5" />
                                        Deadline Lewat
                                    </span>
                                )}
                            </div>

                            {/* Formation Progress Bar */}
                            {selfFormConfig.enabled && (
                                <div className="mt-1">
                                    <div className="mb-1 flex justify-between text-xs text-purple-200">
                                        <span>
                                            <Users className="mr-1 inline h-3 w-3" />
                                            {stats.students_with_group}/
                                            {stats.total_students} mahasiswa
                                            sudah memilih
                                        </span>
                                        <span>{formationProgress}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${formationProgress}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                ease: 'easeOut',
                                            }}
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ PENDING INVITATIONS ═══ */}
                {pendingInvitations.length > 0 && (
                    <motion.div variants={iV} className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Bell className="h-4 w-4 text-amber-500" />
                            Undangan Kelompok ({pendingInvitations.length})
                        </h3>
                        {pendingInvitations.map((inv) => (
                            <motion.div
                                key={inv.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-4 shadow-lg backdrop-blur-xl dark:border-amber-700/30 dark:from-amber-900/20 dark:to-orange-900/20"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                            <Mail className="mr-1.5 inline h-3.5 w-3.5 text-amber-500" />
                                            {inv.inviter_name} mengundang ke{' '}
                                            <span className="text-purple-600 dark:text-purple-400">
                                                {inv.group_name}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {inv.group_member_count}/
                                            {inv.group_max_members} anggota •{' '}
                                            {inv.created_at}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    `/user/akademik/tugas-kelompok/${assignment.id}/invitation/${inv.id}/respond`,
                                                    { response: 'accepted' },
                                                )
                                            }
                                            className="h-8 bg-gradient-to-r from-emerald-500 to-green-500 px-3 text-xs text-white"
                                        >
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Terima
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.post(
                                                    `/user/akademik/tugas-kelompok/${assignment.id}/invitation/${inv.id}/respond`,
                                                    { response: 'rejected' },
                                                )
                                            }
                                            className="h-8 border-red-200 px-3 text-xs text-red-500"
                                        >
                                            <X className="mr-1 h-3 w-3" />
                                            Tolak
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ═══ AUTO-PLACEMENT WARNING ═══ */}
                {!myGroup &&
                    selfFormConfig.enabled &&
                    !isOverdue &&
                    !assignment.is_locked &&
                    assignment.formation_deadline && (
                        <motion.div
                            variants={iV}
                            className="rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50/80 to-orange-50/60 p-4 backdrop-blur-xl dark:border-amber-700/30 dark:from-amber-900/20 dark:to-orange-900/10"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-amber-500/20 p-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                        Pilih kelompok sebelum deadline!
                                    </p>
                                    <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/70">
                                        Jika belum memilih, Anda akan
                                        ditempatkan otomatis oleh sistem.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                {/* ═══ DESCRIPTION ═══ */}
                {assignment.description && (
                    <motion.div
                        variants={iV}
                        className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                    >
                        <button
                            onClick={() => setShowDesc(!showDesc)}
                            className="flex w-full items-center justify-between p-4 text-left"
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                <Info className="h-4 w-4 text-purple-500" />
                                Deskripsi Tugas
                            </span>
                            {showDesc ? (
                                <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                        </button>
                        <AnimatePresence>
                            {showDesc && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-4 pb-4 text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                                        {assignment.description}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ═══ GROUP GRID — ALL GROUPS ═══ */}
                {selfFormConfig.enabled && allGroups.length > 0 && (
                    <motion.div variants={iV}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                Daftar Kelompok
                            </h2>
                            <span className="text-xs text-slate-500">
                                {allGroups.filter((g) => !g.is_full).length}{' '}
                                tersedia dari {allGroups.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {allGroups.map((g, idx) => {
                                const pct =
                                    g.max_members > 0
                                        ? g.member_count / g.max_members
                                        : 0;
                                const isExpanded =
                                    expandedGroup ===
                                    (g.slot_number ?? g.id ?? idx);
                                return (
                                    <motion.div
                                        key={`${g.slot_number ?? 'g'}-${g.id ?? idx}`}
                                        variants={iV}
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        className={cn(
                                            'cursor-pointer rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all',
                                            g.is_my_group
                                                ? 'border-purple-400/50 bg-purple-50/60 ring-2 ring-purple-500/20 dark:bg-purple-900/20'
                                                : g.is_full
                                                  ? 'border-slate-200/40 bg-slate-50/40 opacity-60 dark:bg-neutral-900/20'
                                                  : 'border-white/30 bg-white/50 hover:border-purple-300/50 dark:bg-neutral-900/40',
                                        )}
                                        onClick={() =>
                                            setExpandedGroup(
                                                isExpanded
                                                    ? null
                                                    : (g.slot_number ??
                                                          g.id ??
                                                          idx),
                                            )
                                        }
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                {g.name}
                                            </h3>
                                            <GroupStatusBadge
                                                memberCount={g.member_count}
                                                maxMembers={g.max_members}
                                                isMy={g.is_my_group}
                                            />
                                        </div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <Crown className="h-3 w-3 text-amber-500" />
                                            <span className="truncate text-xs text-slate-600 dark:text-slate-400">
                                                Ketua: {g.leader.nama}
                                            </span>
                                        </div>
                                        {/* Member progress bar */}
                                        <div className="mb-2">
                                            <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
                                                <span>
                                                    {g.member_count}/
                                                    {g.max_members}
                                                </span>
                                                <span>
                                                    {Math.round(pct * 100)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/50 dark:bg-neutral-700/50">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all',
                                                        pct >= 1
                                                            ? 'bg-red-400'
                                                            : pct >= 0.7
                                                              ? 'bg-amber-400'
                                                              : 'bg-emerald-400',
                                                    )}
                                                    style={{
                                                        width: `${Math.min(pct * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {/* Expanded members */}
                                        <AnimatePresence>
                                            {isExpanded &&
                                                g.members &&
                                                g.members.length > 0 && (
                                                    <motion.div
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: 'auto',
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-2 space-y-1.5 border-t border-slate-200/50 pt-2 dark:border-neutral-700/50">
                                                            {g.members.map(
                                                                (m) => (
                                                                    <div
                                                                        key={
                                                                            m.id
                                                                        }
                                                                        className="flex items-center gap-2 text-xs"
                                                                    >
                                                                        <div
                                                                            className={cn(
                                                                                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white',
                                                                                m.is_leader
                                                                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                                                                    : 'bg-gradient-to-br from-purple-500 to-fuchsia-500',
                                                                            )}
                                                                        >
                                                                            {m.nama.charAt(
                                                                                0,
                                                                            )}
                                                                        </div>
                                                                        <span className="truncate text-slate-700 dark:text-slate-300">
                                                                            {
                                                                                m.nama
                                                                            }
                                                                        </span>
                                                                        {m.is_leader && (
                                                                            <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                        {/* Join button */}
                                        {!myGroup &&
                                            !g.is_full &&
                                            !assignment.is_locked &&
                                            !isOverdue && (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const joinUrl =
                                                            g.slot_number
                                                                ? `/user/akademik/tugas-kelompok/${assignment.id}/join-slot/${g.slot_number}`
                                                                : g.id
                                                                  ? `/user/akademik/tugas-kelompok/${assignment.id}/join-group/${g.id}`
                                                                  : null;
                                                        if (joinUrl) {
                                                            router.post(
                                                                joinUrl,
                                                            );
                                                        }
                                                    }}
                                                    className="mt-2 h-8 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-xs text-white"
                                                >
                                                    <UserPlus className="mr-1 h-3 w-3" />
                                                    Gabung
                                                </Button>
                                            )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ═══ CREATE GROUP (freeform mode) ═══ */}
                {!myGroup &&
                    selfFormConfig.enabled &&
                    selfFormConfig.group_count <= 0 &&
                    !assignment.is_locked &&
                    !isOverdue && (
                        <motion.div
                            variants={iV}
                            className="rounded-2xl border border-purple-200/50 bg-purple-50/50 p-4 backdrop-blur-xl dark:border-purple-700/30 dark:bg-purple-900/20"
                        >
                            <h3 className="mb-3 text-sm font-semibold text-purple-800 dark:text-purple-200">
                                <Plus className="mr-1 inline h-4 w-4" />
                                Buat Kelompok Baru
                            </h3>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Nama kelompok..."
                                    value={groupForm.data.name}
                                    onChange={(e) =>
                                        groupForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() =>
                                        groupForm.post(
                                            `/user/akademik/tugas-kelompok/${assignment.id}/create-group`,
                                        )
                                    }
                                    disabled={
                                        !groupForm.data.name ||
                                        groupForm.processing
                                    }
                                    className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Buat
                                </Button>
                            </div>
                        </motion.div>
                    )}

                {/* ═══ WAITING STATES ═══ */}
                {!myGroup && selfFormConfig.enabled && isOverdue && (
                    <motion.div
                        variants={iV}
                        className="rounded-2xl border border-white/20 bg-white/40 p-8 text-center shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                    >
                        <Clock className="mx-auto mb-3 h-12 w-12 text-red-400" />
                        <p className="font-medium text-red-500">
                            Batas waktu pembentukan kelompok telah lewat.
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            Silakan hubungi dosen Anda.
                        </p>
                    </motion.div>
                )}
                {!myGroup &&
                    (assignment.formation_mode === 'random' ||
                        assignment.formation_mode === 'manual') && (
                        <motion.div
                            variants={iV}
                            className="rounded-2xl border border-white/20 bg-white/40 p-8 text-center shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <Clock className="mx-auto mb-3 h-12 w-12 text-slate-400" />
                            <p className="text-slate-600 dark:text-slate-400">
                                Kelompok akan dibentuk oleh{' '}
                                {assignment.formation_mode === 'random'
                                    ? 'sistem secara acak'
                                    : 'dosen'}
                                .
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Silakan tunggu pengumuman.
                            </p>
                        </motion.div>
                    )}

                {/* ═══ GROUP COLLABORATION WORKSPACE ═══ */}
                {myGroup && (
                    <>
                        {/* My Group Card */}
                        <motion.div
                            variants={iV}
                            className="rounded-2xl border border-purple-200/40 bg-gradient-to-r from-purple-50/80 to-fuchsia-50/60 p-4 shadow-lg backdrop-blur-xl dark:border-purple-700/30 dark:from-purple-900/20 dark:to-fuchsia-900/10"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 p-2.5 text-white">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {myGroup.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {normalizedMembers.length}/
                                            {selfFormConfig.group_size ||
                                                assignment.max_members}{' '}
                                            anggota
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {leaderTools.can_manage && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setShowInviteModal(true)
                                            }
                                            className="h-8 bg-gradient-to-r from-blue-500 to-cyan-500 px-3 text-xs text-white"
                                        >
                                            <UserPlus className="mr-1 h-3 w-3" />
                                            Undang
                                            {sentInvitations.length > 0 && (
                                                <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                    {sentInvitations.length}
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                    {!assignment.is_locked && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        'Yakin ingin meninggalkan kelompok?',
                                                    )
                                                )
                                                    router.post(
                                                        `/user/akademik/tugas-kelompok/${assignment.id}/leave-group`,
                                                    );
                                            }}
                                            className="h-8 border-red-200 px-3 text-xs text-red-500 hover:bg-red-50"
                                        >
                                            Keluar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Monitor Advance */}
                        <motion.div
                            variants={iV}
                            className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                                    Monitor Advance Kelompok
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Aktivitas terakhir:{' '}
                                    {monitoringData.lastActivityLabel}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <div className="rounded-2xl border border-blue-200/50 bg-blue-50/70 p-3 dark:border-blue-800/40 dark:bg-blue-900/20">
                                    <p className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                                        <Target className="h-3.5 w-3.5" />
                                        Completion
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                                        {monitoringData.completionRate}%
                                    </p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-300/70">
                                        {monitoringData.completedTasks}/
                                        {normalizedTasks.length} task selesai
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-violet-200/50 bg-violet-50/70 p-3 dark:border-violet-800/40 dark:bg-violet-900/20">
                                    <p className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                                        <Timer className="h-3.5 w-3.5" />
                                        Velocity
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-violet-800 dark:text-violet-200">
                                        {monitoringData.velocityPerDay}/hari
                                    </p>
                                    <p className="text-[11px] text-violet-600/80 dark:text-violet-300/70">
                                        {monitoringData.activities72h} event /
                                        72 jam
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/70 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/20">
                                    <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Pulse 24 Jam
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-200">
                                        {monitoringData.collaborationPulse}
                                    </p>
                                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-300/70">
                                        {monitoringData.messages24h} chat •{' '}
                                        {monitoringData.files24h} file •{' '}
                                        {monitoringData.logs24h} log
                                    </p>
                                </div>

                                <div
                                    className={cn(
                                        'rounded-2xl border p-3',
                                        monitoringData.riskScore >= 80 &&
                                            'border-emerald-200/50 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-900/20',
                                        monitoringData.riskScore >= 50 &&
                                            monitoringData.riskScore < 80 &&
                                            'border-amber-200/50 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-900/20',
                                        monitoringData.riskScore < 50 &&
                                            'border-red-200/50 bg-red-50/70 dark:border-red-800/40 dark:bg-red-900/20',
                                    )}
                                >
                                    <p
                                        className={cn(
                                            'flex items-center gap-1 text-[11px] font-semibold',
                                            monitoringData.riskScore >= 80 &&
                                                'text-emerald-700 dark:text-emerald-300',
                                            monitoringData.riskScore >= 50 &&
                                                monitoringData.riskScore < 80 &&
                                                'text-amber-700 dark:text-amber-300',
                                            monitoringData.riskScore < 50 &&
                                                'text-red-700 dark:text-red-300',
                                        )}
                                    >
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Risk Score
                                    </p>
                                    <p
                                        className={cn(
                                            'mt-1 text-lg font-bold',
                                            monitoringData.riskScore >= 80 &&
                                                'text-emerald-800 dark:text-emerald-200',
                                            monitoringData.riskScore >= 50 &&
                                                monitoringData.riskScore < 80 &&
                                                'text-amber-800 dark:text-amber-200',
                                            monitoringData.riskScore < 50 &&
                                                'text-red-800 dark:text-red-200',
                                        )}
                                    >
                                        {monitoringData.riskScore}/100
                                    </p>
                                    <p
                                        className={cn(
                                            'text-[11px]',
                                            monitoringData.riskScore >= 80 &&
                                                'text-emerald-600/80 dark:text-emerald-300/70',
                                            monitoringData.riskScore >= 50 &&
                                                monitoringData.riskScore < 80 &&
                                                'text-amber-600/80 dark:text-amber-300/70',
                                            monitoringData.riskScore < 50 &&
                                                'text-red-600/80 dark:text-red-300/70',
                                        )}
                                    >
                                        {monitoringData.overdueTasks} overdue •{' '}
                                        {monitoringData.inProgressTasks}{' '}
                                        in-progress
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                                <div className="rounded-2xl border border-white/20 bg-white/60 p-3 dark:border-white/10 dark:bg-neutral-800/40">
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Risk & Insight
                                    </p>
                                    <div className="space-y-2">
                                        {monitoringData.riskFlags.map(
                                            (flag, index) => (
                                                <div
                                                    key={`${flag}-${index}`}
                                                    className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                                                >
                                                    <span
                                                        className={cn(
                                                            'mt-0.5 h-1.5 w-1.5 rounded-full',
                                                            monitoringData.riskScore >=
                                                                80
                                                                ? 'bg-emerald-400'
                                                                : monitoringData.riskScore >=
                                                                    50
                                                                  ? 'bg-amber-400'
                                                                  : 'bg-red-400',
                                                        )}
                                                    />
                                                    <span>{flag}</span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                                        <div className="rounded-lg bg-slate-100/80 px-2 py-1.5 dark:bg-neutral-700/60">
                                            <p className="font-bold text-slate-700 dark:text-slate-200">
                                                {monitoringData.pendingTasks}
                                            </p>
                                            <p className="text-slate-500">
                                                Pending
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-slate-100/80 px-2 py-1.5 dark:bg-neutral-700/60">
                                            <p className="font-bold text-slate-700 dark:text-slate-200">
                                                {monitoringData.inProgressTasks}
                                            </p>
                                            <p className="text-slate-500">
                                                Progress
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-slate-100/80 px-2 py-1.5 dark:bg-neutral-700/60">
                                            <p className="font-bold text-slate-700 dark:text-slate-200">
                                                {monitoringData.overdueTasks}
                                            </p>
                                            <p className="text-slate-500">
                                                Overdue
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/60 p-3 dark:border-white/10 dark:bg-neutral-800/40">
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Leaderboard Kontribusi
                                    </p>
                                    {monitoringData.leaderboard.length === 0 ? (
                                        <p className="text-xs text-slate-500">
                                            Belum ada data kontribusi anggota.
                                        </p>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {monitoringData.leaderboard.map(
                                                (member, index) => (
                                                    <div key={member.id}>
                                                        <div className="mb-1 flex items-center justify-between text-xs">
                                                            <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                                                                {index + 1}.{' '}
                                                                {member.name}
                                                            </p>
                                                            <p className="text-slate-500">
                                                                {member.score}{' '}
                                                                pts
                                                            </p>
                                                        </div>
                                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-neutral-700/70">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                                                                style={{
                                                                    width: `${Math.max(
                                                                        8,
                                                                        (member.score /
                                                                            monitoringData.topContributionScore) *
                                                                            100,
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-slate-500">
                                                            {member.messages}{' '}
                                                            chat •{' '}
                                                            {member.files} file
                                                            • {member.tasksDone}{' '}
                                                            task selesai
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-5">
                                <div className="rounded-2xl border border-white/20 bg-white/60 p-3 xl:col-span-3 dark:border-white/10 dark:bg-neutral-800/40">
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Intensitas Aktivitas 7 Hari
                                    </p>
                                    <div className="grid grid-cols-7 gap-1.5">
                                        {monitoringData.weeklyActivity.map(
                                            (day, index) => (
                                                <div
                                                    key={`${day.label}-${index}`}
                                                    className="flex flex-col items-center gap-1"
                                                >
                                                    <div className="flex h-16 w-full items-end rounded-md bg-slate-100/80 p-1 dark:bg-neutral-700/50">
                                                        <motion.div
                                                            initial={{
                                                                height: 0,
                                                            }}
                                                            animate={{
                                                                height: `${Math.max(10, (day.count / monitoringData.weeklyPeak) * 100)}%`,
                                                            }}
                                                            transition={{
                                                                duration: 0.6,
                                                                delay:
                                                                    index *
                                                                    0.05,
                                                            }}
                                                            className="w-full rounded-sm bg-gradient-to-t from-indigo-500 to-fuchsia-500"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500">
                                                        {day.label}
                                                    </p>
                                                    <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                                                        {day.count}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/60 p-3 xl:col-span-2 dark:border-white/10 dark:bg-neutral-800/40">
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Deadline Task Terdekat
                                    </p>
                                    {monitoringData.upcomingTasks.length ===
                                    0 ? (
                                        <p className="text-xs text-slate-500">
                                            Tidak ada task aktif dengan deadline
                                            terdekat.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {monitoringData.upcomingTasks.map(
                                                (task) => (
                                                    <div
                                                        key={task.id}
                                                        className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-2.5 py-2 dark:border-slate-700 dark:bg-neutral-800/60"
                                                    >
                                                        <p className="line-clamp-1 text-xs font-medium text-slate-800 dark:text-slate-100">
                                                            {task.title}
                                                        </p>
                                                        <div className="mt-1 flex items-center justify-between text-[10px]">
                                                            <span className="text-slate-500">
                                                                {task.dueLabel}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    'font-semibold',
                                                                    task.dueInHours <
                                                                        0
                                                                        ? 'text-red-500'
                                                                        : task.dueInHours <=
                                                                            24
                                                                          ? 'text-amber-500'
                                                                          : 'text-emerald-500',
                                                                )}
                                                            >
                                                                {task.dueInHours <
                                                                0
                                                                    ? 'Overdue'
                                                                    : task.dueInHours <=
                                                                        24
                                                                      ? 'Kurang dari 24 jam'
                                                                      : `${Math.ceil(task.dueInHours / 24)} hari lagi`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <motion.div variants={iV}>
                            <div className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50">
                                {tabs.map((tab) => {
                                    const I = tab.icon;
                                    return (
                                        <motion.button
                                            key={tab.key}
                                            layout
                                            onClick={() =>
                                                setActiveTab(tab.key)
                                            }
                                            className={cn(
                                                'relative rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                                                activeTab === tab.key
                                                    ? 'text-slate-900 dark:text-white'
                                                    : 'text-slate-500',
                                            )}
                                        >
                                            {activeTab === tab.key && (
                                                <motion.div
                                                    layoutId="activeTabUser"
                                                    className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                                    transition={{
                                                        type: 'spring' as const,
                                                        bounce: 0.2,
                                                        duration: 0.6,
                                                    }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center gap-1.5">
                                                <I className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {tab.label}
                                                </span>
                                                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-700">
                                                    {tab.count}
                                                </span>
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {/* CHAT */}
                            {activeTab === 'chat' && (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                                >
                                    <div className="h-[400px] space-y-3 overflow-y-auto p-4">
                                        {normalizedMessages.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                                <p className="text-slate-400">
                                                    Belum ada pesan. Mulai
                                                    obrolan!
                                                </p>
                                            </div>
                                        ) : (
                                            normalizedMessages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 5,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className={cn(
                                                        'flex',
                                                        msg.sender?.id ===
                                                            mahasiswa.id
                                                            ? 'justify-end'
                                                            : 'justify-start',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[70%] rounded-2xl px-4 py-2.5',
                                                            msg.sender?.id ===
                                                                mahasiswa.id
                                                                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                                                                : 'border bg-white dark:bg-neutral-800',
                                                        )}
                                                    >
                                                        {msg.sender?.id !==
                                                            mahasiswa.id && (
                                                            <p className="mb-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                                                                {msg.sender
                                                                    ?.nama ??
                                                                    'Unknown'}
                                                            </p>
                                                        )}
                                                        <p className="text-sm">
                                                            {msg.content}
                                                        </p>
                                                        {msg.attachment && (
                                                            <div className="mt-1 flex items-center gap-1 text-xs opacity-75">
                                                                <Paperclip className="h-3 w-3" />
                                                                {msg.attachment
                                                                    .name ??
                                                                    'Lampiran'}
                                                            </div>
                                                        )}
                                                        <p
                                                            className={cn(
                                                                'mt-1 text-[10px]',
                                                                msg.sender
                                                                    ?.id ===
                                                                    mahasiswa.id
                                                                    ? 'text-white/60'
                                                                    : 'text-slate-400',
                                                            )}
                                                        >
                                                            {msg.created_at}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="flex gap-2 border-t p-3">
                                        <Input
                                            placeholder="Ketik pesan..."
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                sendMessage()
                                            }
                                            className="flex-1 bg-white/60 dark:bg-neutral-800/60"
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim()}
                                            className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* FILES */}
                            {activeTab === 'files' && (
                                <motion.div
                                    key="files"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                            <FileText className="h-5 w-5 text-purple-500" />
                                            File Kelompok
                                        </h3>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) =>
                                                    e.target.files?.[0] &&
                                                    uploadFile(
                                                        e.target.files[0],
                                                    )
                                                }
                                            />
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Upload
                                            </motion.div>
                                        </label>
                                    </div>
                                    {normalizedFiles.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                            <p className="text-slate-400">
                                                Belum ada file
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {normalizedFiles.map((f) => (
                                                <div
                                                    key={f.id}
                                                    className="flex items-center justify-between rounded-xl border bg-white/60 p-3 dark:bg-neutral-800/30"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-8 w-8 text-purple-500" />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {
                                                                    f.original_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {f.file_size_formatted ??
                                                                    '-'}{' '}
                                                                •{' '}
                                                                {f.uploader
                                                                    ?.nama ??
                                                                    'Unknown'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {f.download_url ? (
                                                        <a
                                                            href={
                                                                f.download_url
                                                            }
                                                            className="text-purple-500 hover:text-purple-700"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            <Download className="h-4 w-4" />
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* TASKS */}
                            {activeTab === 'tasks' && (
                                <motion.div
                                    key="tasks"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                            <Target className="h-5 w-5 text-purple-500" />
                                            Task Board
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={() => setShowNewTask(true)}
                                            className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Task
                                        </Button>
                                    </div>
                                    {showNewTask && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            className="mb-4 rounded-2xl border bg-purple-50/50 p-4 dark:bg-purple-900/20"
                                        >
                                            <div className="space-y-3">
                                                <Input
                                                    placeholder="Judul task..."
                                                    value={taskForm.data.title}
                                                    onChange={(e) =>
                                                        taskForm.setData(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <Textarea
                                                    placeholder="Deskripsi..."
                                                    value={
                                                        taskForm.data
                                                            .description
                                                    }
                                                    onChange={(e) =>
                                                        taskForm.setData(
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            taskForm.post(
                                                                `/user/akademik/tugas-kelompok/${assignment.id}/task`,
                                                                {
                                                                    onSuccess:
                                                                        () =>
                                                                            setShowNewTask(
                                                                                false,
                                                                            ),
                                                                },
                                                            );
                                                        }}
                                                        disabled={
                                                            !taskForm.data
                                                                .title ||
                                                            taskForm.processing
                                                        }
                                                        className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                                    >
                                                        Buat
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setShowNewTask(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        Batal
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {normalizedTasks.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Target className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                            <p className="text-slate-400">
                                                Belum ada task
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {normalizedTasks.map((task) => (
                                                <motion.div
                                                    key={task.id}
                                                    whileHover={{ y: -1 }}
                                                    className="flex items-center justify-between rounded-xl border bg-white/60 p-3 dark:bg-neutral-800/30"
                                                >
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <button
                                                            onClick={() =>
                                                                router.patch(
                                                                    `/user/akademik/tugas-kelompok/${assignment.id}/task/${task.id}`,
                                                                    {
                                                                        status:
                                                                            task.status ===
                                                                            'completed'
                                                                                ? 'pending'
                                                                                : task.status ===
                                                                                    'pending'
                                                                                  ? 'in_progress'
                                                                                  : 'completed',
                                                                    },
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex h-6 w-6 items-center justify-center rounded-full border-2',
                                                                task.status ===
                                                                    'completed'
                                                                    ? 'border-green-500 bg-green-500 text-white'
                                                                    : 'border-slate-300',
                                                            )}
                                                        >
                                                            {task.status ===
                                                                'completed' && (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <div>
                                                            <p
                                                                className={cn(
                                                                    'text-sm font-medium',
                                                                    task.status ===
                                                                        'completed' &&
                                                                        'text-slate-400 line-through',
                                                                )}
                                                            >
                                                                {task.title}
                                                            </p>
                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                                        statusColors[
                                                                            task
                                                                                .status
                                                                        ] ||
                                                                            'bg-slate-100 text-slate-700',
                                                                    )}
                                                                >
                                                                    {
                                                                        task.status
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* MEMBERS */}
                            {activeTab === 'members' && (
                                <motion.div
                                    key="members"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                                >
                                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                        <Users className="h-5 w-5 text-purple-500" />
                                        Anggota Kelompok
                                    </h3>
                                    <div className="space-y-3">
                                        {normalizedMembers.map((m, i) => (
                                            <motion.div
                                                key={m.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between rounded-xl border bg-white/60 p-4 dark:bg-neutral-800/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white',
                                                            m.is_leader
                                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                                                : 'bg-gradient-to-br from-purple-500 to-fuchsia-500',
                                                        )}
                                                    >
                                                        {m.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                                                            {m.nama}
                                                            {m.is_leader && (
                                                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {m.is_leader
                                                                ? 'Ketua Kelompok'
                                                                : (m.nim ??
                                                                  'Anggota')}
                                                        </p>
                                                    </div>
                                                </div>
                                                {leaderTools.can_manage &&
                                                    !m.is_leader && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.post(
                                                                        `/user/akademik/tugas-kelompok/${assignment.id}/leader/set-leader`,
                                                                        {
                                                                            student_id:
                                                                                m.id,
                                                                        },
                                                                    )
                                                                }
                                                                className="h-7 px-2 text-[11px]"
                                                            >
                                                                Jadikan Ketua
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.post(
                                                                        `/user/akademik/tugas-kelompok/${assignment.id}/leader/remove-member`,
                                                                        {
                                                                            student_id:
                                                                                m.id,
                                                                        },
                                                                    )
                                                                }
                                                                className="h-7 border-red-200 px-2 text-[11px] text-red-500 hover:bg-red-50"
                                                            >
                                                                Keluarkan
                                                            </Button>
                                                        </div>
                                                    )}
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* Leader: Add member */}
                                    {leaderTools.can_manage && (
                                        <div className="mt-4 space-y-2 rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-700/40 dark:bg-blue-900/20">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-200">
                                                Panel Ketua: tambahkan anggota
                                            </p>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <select
                                                    value={
                                                        leaderForm.data
                                                            .student_id
                                                    }
                                                    onChange={(e) =>
                                                        leaderForm.setData(
                                                            'student_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-lg border border-slate-300 bg-white/90 px-3 text-sm dark:border-slate-700 dark:bg-neutral-800"
                                                >
                                                    <option value="">
                                                        Pilih mahasiswa belum
                                                        berkelompok
                                                    </option>
                                                    {leaderTools.unassigned_students.map(
                                                        (s) => (
                                                            <option
                                                                key={s.id}
                                                                value={String(
                                                                    s.id,
                                                                )}
                                                            >
                                                                {s.nama}{' '}
                                                                {s.nim
                                                                    ? `(${s.nim})`
                                                                    : ''}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <Button
                                                    size="sm"
                                                    disabled={
                                                        !leaderForm.data
                                                            .student_id
                                                    }
                                                    onClick={() =>
                                                        router.post(
                                                            `/user/akademik/tugas-kelompok/${assignment.id}/leader/add-member`,
                                                            {
                                                                student_id:
                                                                    Number(
                                                                        leaderForm
                                                                            .data
                                                                            .student_id,
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                                >
                                                    Tambah
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {leaderTools.can_manage &&
                                        sentInvitations.length > 0 && (
                                            <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-700/40 dark:bg-amber-900/20">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                                                        Undangan pending
                                                    </p>
                                                    <span className="rounded-full border border-amber-300/80 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-neutral-900/40 dark:text-amber-200">
                                                        {sentInvitations.length}{' '}
                                                        aktif
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {sentInvitations.map(
                                                        (invitation) => (
                                                            <div
                                                                key={
                                                                    invitation.id
                                                                }
                                                                className="flex items-center justify-between gap-3 rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2 dark:border-amber-800/40 dark:bg-neutral-900/40"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                                        {
                                                                            invitation.invitee_name
                                                                        }
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-500">
                                                                        {invitation.invitee_nim
                                                                            ? `${invitation.invitee_nim} • `
                                                                            : ''}
                                                                        Dikirim{' '}
                                                                        {
                                                                            invitation.created_at
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 rounded-full border border-amber-300/80 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/40 dark:text-amber-200">
                                                                    Menunggu
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    {/* Actions */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setShowConflict(true)
                                            }
                                            className="border-amber-200 text-amber-600 hover:bg-amber-50"
                                        >
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                            Laporkan Masalah
                                        </Button>
                                        {!effectiveHasSubmitted && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    setShowSubmit(true)
                                                }
                                                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                                            >
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Submit Tugas
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* ═══ ACTIVITY TIMELINE ═══ */}
                {activityLogs.length > 0 && (
                    <motion.div
                        variants={iV}
                        className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                    >
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            Aktivitas Terbaru
                        </h3>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                            {activityLogs.slice(0, 10).map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center gap-3 text-xs"
                                >
                                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {log.user_name}
                                        </span>{' '}
                                        — {log.type}
                                    </span>
                                    <span className="ml-auto shrink-0 text-slate-400">
                                        {log.created_at}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* ═══ INVITE MODAL ═══ */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowInviteModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="relative max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl dark:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                                    <UserPlus className="h-5 w-5" />
                                    Undang Mahasiswa
                                </h2>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="text-white/80 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="relative mb-3">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Cari nama atau NIM..."
                                        value={inviteSearch}
                                        onChange={(e) =>
                                            setInviteSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                {sentInvitations.length > 0 && (
                                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-700/40 dark:bg-amber-900/20">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                                                Undangan masih menunggu jawaban
                                            </p>
                                            <span className="rounded-full border border-amber-300/80 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-neutral-900/40 dark:text-amber-200">
                                                {sentInvitations.length}
                                            </span>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            {sentInvitations
                                                .slice(0, 3)
                                                .map((invitation) => (
                                                    <div
                                                        key={invitation.id}
                                                        className="flex items-center justify-between gap-3 rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2 dark:border-amber-800/40 dark:bg-neutral-900/40"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                                {
                                                                    invitation.invitee_name
                                                                }
                                                            </p>
                                                            <p className="text-[11px] text-slate-500">
                                                                {invitation.invitee_nim
                                                                    ? `${invitation.invitee_nim} • `
                                                                    : ''}
                                                                Dikirim{' '}
                                                                {
                                                                    invitation.created_at
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 rounded-full border border-amber-300/80 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/40 dark:text-amber-200">
                                                            Pending
                                                        </span>
                                                    </div>
                                                ))}
                                            {sentInvitations.length > 3 && (
                                                <p className="text-[11px] text-amber-700/80 dark:text-amber-200/80">
                                                    +{sentInvitations.length - 3}{' '}
                                                    undangan lain masih aktif.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                                    {filteredStudents.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Users className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                                            <p className="text-sm text-slate-400">
                                                {inviteableStudents.length ===
                                                0
                                                    ? 'Semua mahasiswa yang tersedia sudah diundang atau sudah berkelompok.'
                                                    : 'Tidak ada mahasiswa ditemukan.'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredStudents.map((s) => (
                                            <motion.div
                                                key={s.id}
                                                whileHover={{ x: 2 }}
                                                className="flex items-center justify-between rounded-xl border bg-white/60 p-3 dark:bg-neutral-800/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
                                                        {s.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {s.nama}
                                                        </p>
                                                        {s.nim && (
                                                            <p className="text-[10px] text-slate-500">
                                                                {s.nim}
                                                                {s.kelas
                                                                    ? ` • ${s.kelas}`
                                                                    : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        router.post(
                                                            `/user/akademik/tugas-kelompok/${assignment.id}/invite`,
                                                            {
                                                                student_id:
                                                                    s.id,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }}
                                                    className="h-7 bg-gradient-to-r from-blue-500 to-cyan-500 px-2 text-xs text-white"
                                                >
                                                    <Mail className="mr-1 h-3 w-3" />
                                                    Undang
                                                </Button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ SUBMIT MODAL ═══ */}
            <AnimatePresence>
                {showSubmit && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowSubmit(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
                        >
                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4">
                                <h2 className="text-lg font-bold text-white">
                                    Submit Tugas Kelompok
                                </h2>
                            </div>
                            <div className="space-y-4 p-6">
                                <div>
                                    <Label>Catatan Submit</Label>
                                    <Textarea
                                        value={submitForm.data.notes}
                                        onChange={(e) =>
                                            submitForm.setData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="mt-1"
                                        placeholder="Tambahkan catatan..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 border-t p-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSubmit(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() =>
                                        submitForm.post(
                                            `/user/akademik/tugas-kelompok/${assignment.id}/submit`,
                                            {
                                                onSuccess: () =>
                                                    setShowSubmit(false),
                                            },
                                        )
                                    }
                                    disabled={submitForm.processing}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Submit
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ CONFLICT MODAL ═══ */}
            <AnimatePresence>
                {showConflict && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowConflict(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
                        >
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                                <h2 className="text-lg font-bold text-white">
                                    Laporkan Masalah
                                </h2>
                            </div>
                            <div className="space-y-4 p-6">
                                <div>
                                    <Label>Jelaskan masalah yang terjadi</Label>
                                    <Textarea
                                        value={conflictForm.data.description}
                                        onChange={(e) =>
                                            conflictForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        className="mt-1"
                                        placeholder="Jelaskan masalah secara detail..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 border-t p-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConflict(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() =>
                                        conflictForm.post(
                                            `/user/akademik/tugas-kelompok/${assignment.id}/conflict`,
                                            {
                                                onSuccess: () =>
                                                    setShowConflict(false),
                                            },
                                        )
                                    }
                                    disabled={
                                        !conflictForm.data.description ||
                                        conflictForm.processing
                                    }
                                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                >
                                    Kirim Laporan
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
