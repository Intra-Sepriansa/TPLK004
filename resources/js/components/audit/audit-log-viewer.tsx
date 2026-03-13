import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Download,
    Globe,
    MapPin,
    Search,
    Shield,
    Smartphone,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface AuditLog {
    id: number;
    timestamp: string;
    action: string;
    user: {
        name: string;
        nim?: string;
        role: 'admin' | 'mahasiswa';
    };
    details: {
        ip_address?: string;
        user_agent?: string;
        location?: {
            lat: number;
            lng: number;
            accuracy: number;
        };
        device_fingerprint?: string;
        status: 'success' | 'failed' | 'warning';
        message?: string;
        metadata?: Record<string, any>;
    };
}

interface AuditLogViewerProps {
    logs: AuditLog[];
    onExport?: () => void;
}

const actionLabels: Record<string, string> = {
    'attendance.check_in': 'Check-in Absensi',
    'attendance.check_out': 'Check-out Absensi',
    'attendance.selfie_upload': 'Upload Selfie',
    'attendance.selfie_approved': 'Selfie Disetujui',
    'attendance.selfie_rejected': 'Selfie Ditolak',
    'geofence.violation': 'Pelanggaran Geofence',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.failed': 'Login Gagal',
    'security.suspicious_activity': 'Aktivitas Mencurigakan',
    'security.device_change': 'Perubahan Perangkat',
    'security.location_jump': 'Lompatan Lokasi',
};

const statusIcons = {
    success: CheckCircle,
    failed: XCircle,
    warning: AlertTriangle,
};

const statusColors = {
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    failed: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
};

export function AuditLogViewer({ logs, onExport }: AuditLogViewerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.message
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || log.details.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const toggleExpand = (id: number) => {
        setExpandedLogs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="space-y-4">
            {/* Header & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Audit Log
                    </h3>
                    <span className="text-xs text-slate-500">
                        ({filteredLogs.length} entries)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari log..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-9"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <option value="all">Semua Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="warning">Warning</option>
                    </select>
                    {onExport && (
                        <Button variant="outline" size="sm" onClick={onExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Log List */}
            <div className="max-h-[600px] space-y-2 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                    <div className="py-12 text-center">
                        <Shield className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-500">
                            Tidak ada log yang ditemukan
                        </p>
                    </div>
                ) : (
                    filteredLogs.map((log) => {
                        const StatusIcon = statusIcons[log.details.status];
                        const isExpanded = expandedLogs.has(log.id);

                        return (
                            <div
                                key={log.id}
                                className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/70"
                            >
                                <button
                                    onClick={() => toggleExpand(log.id)}
                                    className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                >
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-full',
                                            statusColors[log.details.status],
                                        )}
                                    >
                                        <StatusIcon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {actionLabels[log.action] ||
                                                    log.action}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                                                    log.user.role === 'admin'
                                                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                                        : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
                                                )}
                                            >
                                                {log.user.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {log.user.name}
                                            {log.user.nim &&
                                                ` (${log.user.nim})`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">
                                                {new Date(
                                                    log.timestamp,
                                                ).toLocaleDateString('id-ID')}
                                            </p>
                                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {new Date(
                                                    log.timestamp,
                                                ).toLocaleTimeString('id-ID')}
                                            </p>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-slate-100 px-4 pt-0 pb-4 dark:border-slate-800">
                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            {log.details.ip_address && (
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-slate-400" />
                                                    <span className="text-slate-500">
                                                        IP:
                                                    </span>
                                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                                        {log.details.ip_address}
                                                    </span>
                                                </div>
                                            )}
                                            {log.details.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    <span className="text-slate-500">
                                                        Lokasi:
                                                    </span>
                                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                                        {log.details.location.lat.toFixed(
                                                            6,
                                                        )}
                                                        ,{' '}
                                                        {log.details.location.lng.toFixed(
                                                            6,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {log.details.device_fingerprint && (
                                                <div className="col-span-2 flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4 text-slate-400" />
                                                    <span className="text-slate-500">
                                                        Device:
                                                    </span>
                                                    <span className="truncate font-mono text-xs text-slate-700 dark:text-slate-300">
                                                        {
                                                            log.details
                                                                .device_fingerprint
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {log.details.user_agent && (
                                                <div className="col-span-2">
                                                    <p className="mb-1 text-xs text-slate-500">
                                                        User Agent:
                                                    </p>
                                                    <p className="font-mono text-xs break-all text-slate-600 dark:text-slate-400">
                                                        {log.details.user_agent}
                                                    </p>
                                                </div>
                                            )}
                                            {log.details.message && (
                                                <div className="col-span-2">
                                                    <p className="mb-1 text-xs text-slate-500">
                                                        Message:
                                                    </p>
                                                    <p className="text-slate-700 dark:text-slate-300">
                                                        {log.details.message}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
