import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { QrCode, RefreshCw, Clock, Zap, Activity, CheckCircle, XCircle, Timer, Copy, Download, Play, History } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QRCode from 'qrcode';

interface Session {
    id: number;
    title: string | null;
    meeting_number: number;
    course_name: string;
    is_active: boolean;
    start_at: string | null;
    end_at: string | null;
}

interface Token {
    id: number;
    token: string;
    created_at: string;
    expires_at: string | null;
    is_expired: boolean;
    scan_count: number;
}

interface TokenStats {
    total_generated: number;
    total_today: number;
    active_tokens: number;
    expired_tokens: number;
}

interface HourlyData {
    hour: string;
    tokens: number;
}

interface ActiveSession {
    id: number;
    title: string | null;
    meeting_number: number;
    course: { nama: string; sks: number } | null;
    start_at: string | null;
    end_at: string | null;
}

interface PageProps {
    activeSession: ActiveSession | null;
    tokenTtlSeconds: number;
    recentTokens: Token[];
    sessions: Session[];
    tokenStats: TokenStats;
    hourlyData: HourlyData[];
}

const formatTtl = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '-';
    if (seconds % 60 === 0) return `${seconds / 60} menit`;
    if (seconds >= 60) {
        const m = Math.floor(seconds / 60);
        const r = seconds % 60;
        return `${m}m ${r}s`;
    }
    return `${seconds} detik`;
};

const formatCountdown = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '-';
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${s}s`;
};


export default function QrBuilder({ activeSession, tokenTtlSeconds = 180, recentTokens: initialTokens, sessions, tokenStats, hourlyData }: PageProps) {
    const [token, setToken] = useState<string | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const rotatingRef = useRef(false);
    const ttlLabel = useMemo(() => formatTtl(tokenTtlSeconds), [tokenTtlSeconds]);

    useEffect(() => {
        if (!token) { setQrUrl(null); return; }
        QRCode.toDataURL(token, { width: 300 }, (err, url) => { if (!err && url) setQrUrl(url); });
    }, [token]);

    useEffect(() => {
        if (!expiresAtMs) { setTimeLeft(null); return; }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));
        update();
        const i = window.setInterval(update, 500);
        return () => window.clearInterval(i);
    }, [expiresAtMs]);

    useEffect(() => { setToken(null); setExpiresAtMs(null); }, [activeSession?.id]);

    useEffect(() => {
        if (!expiresAtMs || !token) return;
        const t = window.setTimeout(() => void generateToken({ silent: true }), Math.max(0, expiresAtMs - Date.now() + 200));
        return () => window.clearTimeout(t);
    }, [expiresAtMs, token]);

    const generateToken = async ({ silent = false, force = false } = {}) => {
        if (!activeSession?.id || rotatingRef.current) return;
        rotatingRef.current = true;
        if (!silent) setLoading(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        try {
            const res = await fetch(`/attendance-sessions/${activeSession.id}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
                body: JSON.stringify(force ? { force: true } : {}),
            });
            if (res.ok) {
                const data = await res.json();
                setToken(data.token);
                if (typeof data.expires_at_ts === 'number') setExpiresAtMs(data.expires_at_ts * 1000);
                else if (typeof data.expires_at === 'string') {
                    const p = Date.parse(data.expires_at);
                    if (!Number.isNaN(p)) setExpiresAtMs(p);
                }
            }
        } finally { rotatingRef.current = false; if (!silent) setLoading(false); }
    };

    const copyToken = () => { if (!token) return; navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const downloadQr = () => { if (!qrUrl) return; const a = document.createElement('a'); a.download = `qr-${token}.png`; a.href = qrUrl; a.click(); };

    return (
        <AppLayout>
            <Head title="QR Builder" />
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><QrCode className="h-6 w-6" /></div>
                            <div><p className="text-sm text-blue-100">Generator Token</p><h1 className="text-2xl font-bold">QR Builder</h1></div>
                        </div>
                        <p className="mt-4 text-blue-100">Generate QR code token untuk absensi dengan rotasi otomatis setiap {ttlLabel}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard icon={QrCode} label="Total Token" value={tokenStats.total_generated} color="blue" />
                    <StatCard icon={Zap} label="Hari Ini" value={tokenStats.total_today} color="emerald" />
                    <StatCard icon={CheckCircle} label="Token Aktif" value={tokenStats.active_tokens} color="green" />
                    <StatCard icon={Clock} label="Token Expired" value={tokenStats.expired_tokens} color="amber" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">QR Code Generator</h2></div>
                            {activeSession && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><Play className="h-3 w-3" />Sesi Aktif</span>}
                        </div>
                        {!activeSession ? (
                            <div className="text-center py-12"><QrCode className="h-16 w-16 mx-auto text-slate-300 mb-4" /><p className="text-slate-500 mb-2">Belum ada sesi aktif</p><p className="text-sm text-slate-400">Aktifkan sesi di menu Sesi Absen</p></div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4">
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Mata Kuliah</span><span className="font-medium text-slate-900 dark:text-white">{activeSession.course?.nama ?? '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Pertemuan</span><span className="font-medium text-slate-900 dark:text-white">#{activeSession.meeting_number}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Token TTL</span><span className="font-medium text-blue-600">{ttlLabel}</span></div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    {qrUrl ? (
                                        <div className="relative">
                                            <img src={qrUrl} alt="QR" className="h-64 w-64 rounded-2xl border-4 border-white shadow-lg" />
                                            {timeLeft !== null && timeLeft <= 30 && <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold animate-pulse">{timeLeft}</div>}
                                        </div>
                                    ) : (
                                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                                            <div className="text-center"><QrCode className="h-12 w-12 mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-500">Klik Generate QR</p></div>
                                        </div>
                                    )}
                                </div>
                                {token && (
                                    <div className="text-center space-y-2">
                                        <p className="text-xs uppercase tracking-wider text-slate-400">Token Aktif</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <code className="px-4 py-2 rounded-lg bg-slate-900 text-white font-mono text-lg tracking-wider">{token}</code>
                                            <button onClick={copyToken} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors"><Copy className={`h-4 w-4 ${copied ? 'text-emerald-500' : 'text-slate-600'}`} /></button>
                                        </div>
                                        {timeLeft !== null && <p className="text-sm text-slate-500">Sisa: <span className={`font-medium ${timeLeft <= 30 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>{formatCountdown(timeLeft)}</span></p>}
                                    </div>
                                )}
                                <div className="flex gap-3 justify-center">
                                    <button onClick={() => void generateToken({ force: true })} disabled={loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50">
                                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Generating...' : 'Generate QR'}
                                    </button>
                                    {qrUrl && <button onClick={downloadQr} className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"><Download className="h-4 w-4" />Download</button>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-2 mb-4"><Activity className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Token per Jam</h2></div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><Bar dataKey="tokens" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><History className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Token Terbaru</h2></div></div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                                {initialTokens.length === 0 ? <div className="p-8 text-center"><QrCode className="h-10 w-10 mx-auto text-slate-300 mb-2" /><p className="text-slate-500">Belum ada token</p></div> : initialTokens.map(t => (
                                    <div key={t.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.is_expired ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>{t.is_expired ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}</div>
                                            <div><code className="text-sm font-mono text-slate-900 dark:text-white">{t.token}</code><p className="text-xs text-slate-500">{t.created_at}</p></div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${t.is_expired ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>{t.is_expired ? 'Expired' : 'Active'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><Timer className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Daftar Sesi</h2></div></div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50 dark:bg-slate-900/50"><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mata Kuliah</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Pertemuan</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Waktu</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th></tr></thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {sessions.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{s.course_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">#{s.meeting_number}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{s.start_at ?? '-'}</td>
                                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{s.is_active ? <Play className="h-3 w-3" /> : <Clock className="h-3 w-3" />}{s.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colors: Record<string, string> = { blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' };
    return (
        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p></div></div>
        </div>
    );
}
