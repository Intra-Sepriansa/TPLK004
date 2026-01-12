import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Settings,
    Shield,
    Bell,
    MapPin,
    Clock,
    Server,
    HardDrive,
    RefreshCw,
    Save,
    Trash2,
} from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

interface Settings {
    token_ttl_seconds: number;
    late_minutes: number;
    selfie_required: boolean;
    notify_rejected: boolean;
    notify_selfie_blur: boolean;
    geofence_lat: number;
    geofence_lng: number;
    geofence_radius: number;
    email_notifications: boolean;
    push_notifications: boolean;
    daily_report: boolean;
    weekly_report: boolean;
}

interface SystemInfo {
    php_version: string;
    laravel_version: string;
    server_time: string;
    timezone: string;
    environment: string;
    debug_mode: boolean;
}

interface StorageInfo {
    total_space: number;
    free_space: number;
    used_percentage: number;
}

interface PageProps {
    settings: Settings;
    systemInfo: SystemInfo;
    storageInfo: StorageInfo;
    flash?: { success?: string; error?: string };
}

export default function AdminPengaturan({
    settings,
    systemInfo,
    storageInfo,
    flash,
}: PageProps) {
    const securityForm = useForm({
        token_ttl_seconds: settings.token_ttl_seconds,
        late_minutes: settings.late_minutes,
        selfie_required: settings.selfie_required,
        notify_rejected: settings.notify_rejected,
        notify_selfie_blur: settings.notify_selfie_blur,
    });

    const geofenceForm = useForm({
        geofence_lat: settings.geofence_lat,
        geofence_lng: settings.geofence_lng,
        geofence_radius: settings.geofence_radius,
    });

    const notificationForm = useForm({
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        daily_report: settings.daily_report,
        weekly_report: settings.weekly_report,
    });

    const submitSecurity = (e: FormEvent) => {
        e.preventDefault();
        securityForm.patch('/admin/pengaturan', { preserveScroll: true });
    };

    const submitGeofence = (e: FormEvent) => {
        e.preventDefault();
        geofenceForm.patch('/admin/pengaturan/geofence', { preserveScroll: true });
    };

    const submitNotifications = (e: FormEvent) => {
        e.preventDefault();
        notificationForm.patch('/admin/pengaturan/notifications', { preserveScroll: true });
    };

    const clearCache = () => {
        router.post('/admin/pengaturan/clear-cache', {}, { preserveScroll: true });
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AppLayout>
            <Head title="Pengaturan" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Konfigurasi</p>
                                <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Atur preferensi absensi, keamanan, geofence, dan notifikasi
                        </p>
                    </div>
                </div>

                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div className={`rounded-xl p-4 ${flash.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {flash.success || flash.error}
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Security Settings */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Keamanan Sesi</h2>
                            </div>
                        </div>
                        <form onSubmit={submitSecurity} className="p-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Token TTL (detik)</Label>
                                    <Input
                                        type="number"
                                        min={30}
                                        max={600}
                                        value={securityForm.data.token_ttl_seconds}
                                        onChange={e => securityForm.setData('token_ttl_seconds', Number(e.target.value))}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Masa berlaku QR code (30-600 detik)</p>
                                    <InputError message={securityForm.errors.token_ttl_seconds} />
                                </div>
                                <div>
                                    <Label>Batas Terlambat (menit)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={securityForm.data.late_minutes}
                                        onChange={e => securityForm.setData('late_minutes', Number(e.target.value))}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Toleransi keterlambatan (1-60 menit)</p>
                                    <InputError message={securityForm.errors.late_minutes} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={securityForm.data.selfie_required}
                                        onCheckedChange={v => securityForm.setData('selfie_required', v === true)}
                                    />
                                    <span className="text-sm">Wajib selfie saat absen</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={securityForm.data.notify_rejected}
                                        onCheckedChange={v => securityForm.setData('notify_rejected', v === true)}
                                    />
                                    <span className="text-sm">Notifikasi jika scan ditolak</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={securityForm.data.notify_selfie_blur}
                                        onCheckedChange={v => securityForm.setData('notify_selfie_blur', v === true)}
                                    />
                                    <span className="text-sm">Notifikasi jika selfie blur</span>
                                </label>
                            </div>
                            <Button type="submit" disabled={securityForm.processing} className="w-full">
                                <Save className="h-4 w-4" />
                                Simpan Pengaturan Keamanan
                            </Button>
                        </form>
                    </div>

                    {/* Geofence Settings */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Zona Geofence</h2>
                            </div>
                        </div>
                        <form onSubmit={submitGeofence} className="p-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Latitude</Label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={geofenceForm.data.geofence_lat}
                                        onChange={e => geofenceForm.setData('geofence_lat', Number(e.target.value))}
                                    />
                                    <InputError message={geofenceForm.errors.geofence_lat} />
                                </div>
                                <div>
                                    <Label>Longitude</Label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={geofenceForm.data.geofence_lng}
                                        onChange={e => geofenceForm.setData('geofence_lng', Number(e.target.value))}
                                    />
                                    <InputError message={geofenceForm.errors.geofence_lng} />
                                </div>
                            </div>
                            <div>
                                <Label>Radius (meter)</Label>
                                <Input
                                    type="number"
                                    min={10}
                                    max={5000}
                                    value={geofenceForm.data.geofence_radius}
                                    onChange={e => geofenceForm.setData('geofence_radius', Number(e.target.value))}
                                />
                                <p className="text-xs text-slate-500 mt-1">Jarak maksimum dari titik pusat (10-5000 meter)</p>
                                <InputError message={geofenceForm.errors.geofence_radius} />
                            </div>
                            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    Lokasi saat ini: {geofenceForm.data.geofence_lat.toFixed(6)}, {geofenceForm.data.geofence_lng.toFixed(6)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Radius: {geofenceForm.data.geofence_radius} meter
                                </p>
                            </div>
                            <Button type="submit" disabled={geofenceForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                <Save className="h-4 w-4" />
                                Simpan Pengaturan Geofence
                            </Button>
                        </form>
                    </div>

                    {/* Notification Settings */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-900">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-amber-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Notifikasi</h2>
                            </div>
                        </div>
                        <form onSubmit={submitNotifications} className="p-6 space-y-4">
                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={notificationForm.data.email_notifications}
                                        onCheckedChange={v => notificationForm.setData('email_notifications', v === true)}
                                    />
                                    <span className="text-sm">Notifikasi email</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={notificationForm.data.push_notifications}
                                        onCheckedChange={v => notificationForm.setData('push_notifications', v === true)}
                                    />
                                    <span className="text-sm">Push notification</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={notificationForm.data.daily_report}
                                        onCheckedChange={v => notificationForm.setData('daily_report', v === true)}
                                    />
                                    <span className="text-sm">Laporan harian otomatis</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox
                                        checked={notificationForm.data.weekly_report}
                                        onCheckedChange={v => notificationForm.setData('weekly_report', v === true)}
                                    />
                                    <span className="text-sm">Laporan mingguan otomatis</span>
                                </label>
                            </div>
                            <Button type="submit" disabled={notificationForm.processing} className="w-full bg-amber-600 hover:bg-amber-700">
                                <Save className="h-4 w-4" />
                                Simpan Pengaturan Notifikasi
                            </Button>
                        </form>
                    </div>

                    {/* System Info */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900">
                            <div className="flex items-center gap-2">
                                <Server className="h-5 w-5 text-slate-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Sistem</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">PHP Version</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{systemInfo.php_version}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Laravel Version</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{systemInfo.laravel_version}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Server Time</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{systemInfo.server_time}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Timezone</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{systemInfo.timezone}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Environment</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${systemInfo.environment === 'production' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {systemInfo.environment}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Debug Mode</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${systemInfo.debug_mode ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {systemInfo.debug_mode ? 'ON' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <HardDrive className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-500">Storage</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div
                                        className={`h-full rounded-full ${storageInfo.used_percentage > 80 ? 'bg-red-500' : storageInfo.used_percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${storageInfo.used_percentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Used: {formatBytes(storageInfo.total_space - storageInfo.free_space)}</span>
                                    <span>Free: {formatBytes(storageInfo.free_space)}</span>
                                </div>
                            </div>
                            <Button onClick={clearCache} variant="outline" className="w-full">
                                <Trash2 className="h-4 w-4" />
                                Clear Cache
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
