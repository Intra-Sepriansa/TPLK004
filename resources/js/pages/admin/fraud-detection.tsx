import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
    Shield, AlertTriangle, MapPin, Camera, Clock, Smartphone,
    Eye, CheckCircle, XCircle, Search, RefreshCw
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
            case 'medium': return 'bg-yellow-500 text-black';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline">Pending</Badge>;
            case 'investigating': return <Badge className="bg-blue-500">Investigating</Badge>;
            case 'confirmed': return <Badge variant="destructive">Confirmed</Badge>;
            case 'dismissed': return <Badge variant="secondary">Dismissed</Badge>;
            default: return <Badge>{status}</Badge>;
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
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6" />
                            Fraud Detection System
                        </h1>
                        <p className="text-muted-foreground">Deteksi kecurangan absensi</p>
                    </div>
                    <Button onClick={handleScan} disabled={scanning}>
                        <Search className="h-4 w-4 mr-2" />
                        {scanning ? 'Scanning...' : 'Jalankan Scan'}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Alert</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Shield className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Critical</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Confirmed</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.confirmed}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alert Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Tipe Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.by_type).map(([type, count]) => (
                                <Badge key={type} variant="outline" className="text-sm py-1 px-3">
                                    {getAlertIcon(type)}
                                    <span className="ml-2">{getAlertTypeName(type)}: {count}</span>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters & Actions */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.severity} onValueChange={(v) => handleFilterChange('severity', v)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Level</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="gps_spoofing">GPS Spoofing</SelectItem>
                            <SelectItem value="rapid_location_change">Perpindahan Cepat</SelectItem>
                            <SelectItem value="duplicate_selfie">Selfie Duplikat</SelectItem>
                            <SelectItem value="device_mismatch">Perangkat Berbeda</SelectItem>
                            <SelectItem value="time_anomaly">Anomali Waktu</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {selectedIds.length > 0 && (
                        <div className="flex gap-2 ml-auto">
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('dismiss')}>
                                <XCircle className="h-4 w-4 mr-1" /> Dismiss ({selectedIds.length})
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('confirm')}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Confirm ({selectedIds.length})
                            </Button>
                        </div>
                    )}
                </div>

                {/* Alerts List */}
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {alerts.data.map(alert => (
                                <div key={alert.id} className="p-4 hover:bg-muted/50 transition-colors">
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
                                                <span className="font-medium">{alert.mahasiswa?.nama}</span>
                                                <span className="text-sm text-muted-foreground">({alert.mahasiswa?.nim})</span>
                                                {getStatusBadge(alert.status)}
                                                <Badge variant="outline">{getAlertTypeName(alert.alert_type)}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
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
                                <div className="p-8 text-center text-muted-foreground">
                                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Tidak ada alert ditemukan</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {alerts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: alerts.last_page }, (_, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={alerts.current_page === i + 1 ? 'default' : 'outline'}
                                onClick={() => router.get('/admin/fraud-detection', { ...filters, page: i + 1 })}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog open={reviewModal.open} onOpenChange={(open) => setReviewModal({ open, alert: reviewModal.alert })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Alert</DialogTitle>
                    </DialogHeader>
                    {reviewModal.alert && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="font-medium">{reviewModal.alert.mahasiswa?.nama}</p>
                                <p className="text-sm text-muted-foreground">{reviewModal.alert.description}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Evidence</label>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-[150px]">
                                    {JSON.stringify(reviewModal.alert.evidence, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={reviewForm.data.status} onValueChange={(v) => reviewForm.setData('status', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="dismissed">Dismissed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Catatan</label>
                                <Textarea
                                    className="mt-1"
                                    value={reviewForm.data.notes}
                                    onChange={(e) => reviewForm.setData('notes', e.target.value)}
                                    placeholder="Tambahkan catatan..."
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewModal({ open: false, alert: null })}>
                            Batal
                        </Button>
                        <Button onClick={handleReview} disabled={reviewForm.processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
