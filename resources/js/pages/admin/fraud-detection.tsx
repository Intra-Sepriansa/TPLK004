import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
    Shield, AlertTriangle, MapPin, Camera, Clock, Smartphone,
    Eye, CheckCircle, XCircle, Search, RefreshCw, X, Filter
} from 'lucide-react';
import { useState } from 'react';

interface FraudAlert {
    id: number;
    mahasiswa_id: number;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: Record<string, any>;
    status: 'pending' | 'investigating' | 'confirmed' | 'dismissed';
    created_at: string;
    mahasiswa?: { nama: string; nim: string };
    session?: { course?: { nama: string } };
}

interface Props {
    alerts: {
        data: FraudAlert[];
        links: any;
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        pending: number;
        critical: number;
        confirmed: number;
        by_type: Record<string, number>;
    };
    filters: { status: string; severity: string; type: string };
}

export default function FraudDetection({ alerts, stats, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reviewModal, setReviewModal] = useState<{ open: boolean; alert: FraudAlert | null }>({ open: false, alert: null });
    const [scanning, setScanning] = useState(false);

    const reviewForm = useForm({ status: '', notes: '' });

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/fraud-detection', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleScan = () => {
        setScanning(true);
        router.post('/admin/fraud-detection/scan', {}, {
            onFinish: () => setScanning(false)
        });
    };

    const handleBulkAction = (action: string) => {
        if (selectedIds.length === 0) return;
        router.post('/admin/fraud-detection/bulk-action', { ids: selectedIds, action }, {
            onSuccess: () => setSelectedIds([])
        });
    };

    const handleReview = () => {
        if (!reviewModal.alert) return;
        reviewForm.patch(`/admin/fraud-detection/${reviewModal.alert.id}/review`, {
            onSuccess: () => {
                setReviewModal({ open: false, alert: null });
                reviewForm.reset();
            }
        });
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'gps_spoofing': return <MapPin className="h-4 w-4" />;
            case 'rapid_location_change': return <MapPin className="h-4 w-4" />;
            case 'duplicate_selfie': return <Camera className="h-4 w-4" />;
            case 'device_mismatch': return <Smartphone className="h-4 w-4" />;
            case 'time_anomaly': return <Clock className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-slate-900';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Pending</span>;
            case 'investigating': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Investigating</span>;
            case 'confirmed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Confirmed</span>;
            case 'dismissed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Dismissed</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    const getAlertTypeName = (type: string) => {
        const names: Record<string, string> = {
            'gps_spoofing': 'GPS Spoofing',
            'rapid_location_change': 'Perpindahan Cepat',
            'duplicate_selfie': 'Selfie Duplikat',
            'device_mismatch': 'Perangkat Berbeda',
            'time_anomaly': 'Anomali Waktu',
            'suspicious_pattern': 'Pola Mencurigakan'
        };
        return names[type] || type;
    };

    return (
        <AppLayout>
            <Head title="Fraud Detection" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-100">Keamanan</p>
                                    <h1 className="text-2xl font-bold">Fraud Detection System</h1>
                                </div>
                            </div>
                            <button
                                onClick={handleScan}
                                disabled={scanning}
                                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <Search className="h-4 w-4" />
                                {scanning ? 'Scanning...' : 'Jalankan Scan'}
                            </button>
                        </div>
                        <p className="mt-4 text-red-100">
                            Deteksi kecurangan absensi: GPS spoofing, selfie duplikat, dan anomali lainnya
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Alert</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pending</p>
                                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Critical</p>
                                <p className="text-xl font-bold text-red-600">{stats.critical}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Confirmed</p>
                                <p className="text-xl font-bold text-orange-600">{stats.confirmed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Types Distribution */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-red-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Tipe Alert</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.by_type).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                {getAlertIcon(type)}
                                <span className="text-sm text-slate-700 dark:text-slate-300">{getAlertTypeName(type)}: {count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="investigating">Investigating</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                        <select
                            value={filters.severity}
                            onChange={(e) => handleFilterChange('severity', e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black"
                        >
                            <option value="all">Semua Level</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="gps_spoofing">GPS Spoofing</option>
                            <option value="rapid_location_change">Perpindahan Cepat</option>
                            <option value="duplicate_selfie">Selfie Duplikat</option>
                            <option value="device_mismatch">Perangkat Berbeda</option>
                            <option value="time_anomaly">Anomali Waktu</option>
                        </select>
                        
                        {selectedIds.length > 0 && (
                            <div className="flex gap-2 ml-auto">
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction('dismiss')}>
                                    <XCircle className="h-4 w-4 mr-1" /> Dismiss ({selectedIds.length})
                                </Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleBulkAction('confirm')}>
                                    <CheckCircle className="h-4 w-4 mr-1" /> Confirm ({selectedIds.length})
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts List */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Alert</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {alerts.data.map(alert => (
                            <div key={alert.id} className="p-4 hover:bg-slate-50 dark:hover:bg-black/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={selectedIds.includes(alert.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedIds(prev => 
                                                checked 
                                                    ? [...prev, alert.id]
                                                    : prev.filter(id => id !== alert.id)
                                            );
                                        }}
                                    />
                                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                                        {getAlertIcon(alert.alert_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-900 dark:text-white">{alert.mahasiswa?.nama}</span>
                                            <span className="text-sm text-slate-500">({alert.mahasiswa?.nim})</span>
                                            {getStatusBadge(alert.status)}
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {getAlertTypeName(alert.alert_type)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{alert.description}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(alert.created_at).toLocaleString('id-ID')}
                                            {alert.session?.course && ` • ${alert.session.course.nama}`}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setReviewModal({ open: true, alert });
                                            reviewForm.setData({ status: alert.status, notes: '' });
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {alerts.data.length === 0 && (
                            <div className="p-12 text-center">
                                <Shield className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500">Tidak ada alert ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {alerts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: alerts.last_page }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => router.get('/admin/fraud-detection', { ...filters, page: i + 1 })}
                                className={`px-3 py-1 rounded text-sm ${
                                    alerts.current_page === i + 1 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-black">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Review Alert</h3>
                            <button onClick={() => setReviewModal({ open: false, alert: null })} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {reviewModal.alert && (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="font-medium text-slate-900 dark:text-white">{reviewModal.alert.mahasiswa?.nama}</p>
                                    <p className="text-sm text-slate-500">{reviewModal.alert.description}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Evidence</label>
                                    <pre className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs overflow-auto max-h-[150px]">
                                        {JSON.stringify(reviewModal.alert.evidence, null, 2)}
                                    </pre>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                    <select
                                        value={reviewForm.data.status}
                                        onChange={(e) => reviewForm.setData('status', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <option value="investigating">Investigating</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="dismissed">Dismissed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
                                    <Textarea
                                        className="mt-1"
                                        value={reviewForm.data.notes}
                                        onChange={(e) => reviewForm.setData('notes', e.target.value)}
                                        placeholder="Tambahkan catatan..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleReview} disabled={reviewForm.processing} className="flex-1">
                                        Simpan
                                    </Button>
                                    <Button variant="outline" onClick={() => setReviewModal({ open: false, alert: null })}>
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
