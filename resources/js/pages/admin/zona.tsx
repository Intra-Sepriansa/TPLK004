import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { MapPin, AlertTriangle, TrendingUp, Target, Navigation, Save, RefreshCw, Users, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';

interface Geofence {
    lat: number;
    lng: number;
    radius_m: number;
}

interface ViolationStats {
    total_violations: number;
    today_violations: number;
    week_violations: number;
    avg_distance: number;
}

interface DistanceData {
    range: string;
    count: number;
}

interface Violation {
    id: number;
    mahasiswa: string;
    nim: string;
    distance_m: number | null;
    course: string;
    scanned_at: string;
    lat: number | null;
    lng: number | null;
}

interface TrendData {
    date: string;
    violations: number;
}

interface Location {
    lat: number;
    lng: number;
    distance_m: number | null;
    is_violation: boolean;
}

interface PageProps {
    geofence: Geofence;
    violationStats: ViolationStats;
    distanceDistribution: DistanceData[];
    recentViolations: Violation[];
    trendData: TrendData[];
    recentLocations: Location[];
}

const ensureLeafletIcons = (() => {
    let configured = false;
    return () => {
        if (configured) return;
        
        // Custom marker icon from CDN
        const customIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
        });
        
        L.Icon.Default.prototype.options.iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
        L.Icon.Default.prototype.options.iconSize = [40, 40];
        L.Icon.Default.prototype.options.iconAnchor = [20, 40];
        L.Icon.Default.prototype.options.shadowUrl = '';
        
        configured = true;
    };
})();

export default function Zona({ geofence, violationStats, distanceDistribution, recentViolations, trendData, recentLocations }: PageProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    
    const form = useForm({ geofence_lat: geofence.lat, geofence_lng: geofence.lng, geofence_radius_m: geofence.radius_m });
    const [mapReady, setMapReady] = useState(false);
    const [locationStatus, setLocationStatus] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success, flash?.error]);

    const submit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        form.patch('/admin/zona', { 
            preserveScroll: true,
            onSuccess: () => {
                setToast({ type: 'success', message: 'Zona geofence berhasil disimpan!' });
                setTimeout(() => setToast(null), 3000);
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors).flat().join(', ') || 'Gagal menyimpan zona';
                setToast({ type: 'error', message: errorMsg });
                setTimeout(() => setToast(null), 3000);
            }
        }); 
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) { setLocationStatus('GPS tidak didukung'); return; }
        setLocationLoading(true);
        setLocationStatus('Mengambil lokasi...');
        navigator.geolocation.getCurrentPosition(
            pos => { setLocationLoading(false); form.setData('geofence_lat', Number(pos.coords.latitude.toFixed(7))); form.setData('geofence_lng', Number(pos.coords.longitude.toFixed(7))); setLocationStatus('Lokasi berhasil diambil'); },
            err => { setLocationLoading(false); setLocationStatus(err.code === err.PERMISSION_DENIED ? 'Izin lokasi ditolak' : 'Gagal mengambil lokasi'); },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        ensureLeafletIcons();
        const center: [number, number] = [geofence.lat, geofence.lng];
        const map = L.map(mapRef.current, { zoomControl: true }).setView(center, 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
        mapInstanceRef.current = map;
        markerRef.current = L.marker(center, { draggable: true }).addTo(map);
        circleRef.current = L.circle(center, { radius: geofence.radius_m, color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.2, weight: 2 }).addTo(map);

        recentLocations.forEach(loc => {
            if (loc.lat && loc.lng) {
                L.circleMarker([loc.lat, loc.lng], { radius: 4, color: loc.is_violation ? '#ef4444' : '#22c55e', fillColor: loc.is_violation ? '#ef4444' : '#22c55e', fillOpacity: 0.7, weight: 1 }).addTo(map);
            }
        });

        markerRef.current.on('dragend', () => {
            const pos = markerRef.current?.getLatLng();
            if (pos) { form.setData('geofence_lat', Number(pos.lat.toFixed(7))); form.setData('geofence_lng', Number(pos.lng.toFixed(7))); }
        });
        map.on('click', e => { form.setData('geofence_lat', Number(e.latlng.lat.toFixed(7))); form.setData('geofence_lng', Number(e.latlng.lng.toFixed(7))); });
        setMapReady(true);
        setTimeout(() => map.invalidateSize(), 0);
        return () => { map.off(); map.remove(); mapInstanceRef.current = null; };
    }, []);

    useEffect(() => {
        if (!mapReady || !markerRef.current || !circleRef.current) return;
        const pos: [number, number] = [form.data.geofence_lat, form.data.geofence_lng];
        markerRef.current.setLatLng(pos);
        circleRef.current.setLatLng(pos);
        mapInstanceRef.current?.panTo(pos, { animate: true });
    }, [form.data.geofence_lat, form.data.geofence_lng, mapReady]);

    useEffect(() => { if (mapReady && circleRef.current) circleRef.current.setRadius(form.data.geofence_radius_m); }, [form.data.geofence_radius_m, mapReady]);

    return (
        <AppLayout>
            <Head title="Zona Geofence" />
            <motion.div 
                className="p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
                                toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                        >
                            <motion.div
                                initial={{ rotate: 0, scale: 0 }}
                                animate={{ rotate: 360, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                                {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            </motion.div>
                            <span className="text-sm font-medium">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg"
                >
                    <motion.div 
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <MapPin className="h-6 w-6" />
                            </motion.div>
                            <div><p className="text-sm text-blue-100">Manajemen Lokasi</p><h1 className="text-2xl font-bold">Zona Geofence</h1></div>
                        </div>
                        <p className="mt-4 text-blue-100">Kelola titik lokasi dan radius absensi mahasiswa</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="grid gap-4 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants}><StatCard icon={AlertTriangle} label="Total Pelanggaran" value={violationStats.total_violations} color="red" /></motion.div>
                    <motion.div variants={itemVariants}><StatCard icon={Activity} label="Hari Ini" value={violationStats.today_violations} color="amber" /></motion.div>
                    <motion.div variants={itemVariants}><StatCard icon={TrendingUp} label="Minggu Ini" value={violationStats.week_violations} color="orange" /></motion.div>
                    <motion.div variants={itemVariants}><StatCard icon={Target} label="Rata-rata Jarak" value={`${violationStats.avg_distance}m`} color="blue" /></motion.div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div 
                        variants={slideInLeft}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70"
                        whileHover={{ scale: 1.01, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Peta Geofence</h2></div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Dalam zona</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Pelanggaran</span>
                            </div>
                        </div>
                        <div className="relative h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div ref={mapRef} className="h-full w-full" />
                            {!mapReady && <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800"><p className="text-slate-500">Memuat peta...</p></div>}
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50"><span className="text-slate-500">Latitude</span><span className="font-medium text-slate-900 dark:text-white">{form.data.geofence_lat}</span></div>
                            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50"><span className="text-slate-500">Longitude</span><span className="font-medium text-slate-900 dark:text-white">{form.data.geofence_lng}</span></div>
                            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50"><span className="text-slate-500">Radius</span><span className="font-medium text-blue-600">{form.data.geofence_radius_m}m</span></div>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={slideInRight}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70"
                        whileHover={{ scale: 1.01, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4"><Navigation className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Pengaturan Zona</h2></div>
                        <form onSubmit={submit} className="space-y-4">
                            <motion.div 
                                className="flex gap-2"
                                whileHover={{ scale: 1.02 }}
                            >
                                <motion.button 
                                    type="button" 
                                    onClick={useCurrentLocation} 
                                    disabled={locationLoading} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-sm font-medium transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Navigation className={`h-4 w-4 ${locationLoading ? 'animate-pulse' : ''}`} />{locationLoading ? 'Mengambil...' : 'Lokasi Saat Ini'}
                                </motion.button>
                                {locationStatus && <span className="text-xs text-slate-500 self-center">{locationStatus}</span>}
                            </motion.div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</label><input type="number" step="any" value={form.data.geofence_lat} onChange={e => form.setData('geofence_lat', parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</label><input type="number" step="any" value={form.data.geofence_lng} onChange={e => form.setData('geofence_lng', parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Radius (meter)</label><input type="number" value={form.data.geofence_radius_m} onChange={e => form.setData('geofence_radius_m', parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
                            <motion.button 
                                type="submit" 
                                disabled={form.processing} 
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Save className="h-4 w-4" />{form.processing ? 'Menyimpan...' : 'Simpan Geofence'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div 
                        variants={slideInLeft}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70"
                        whileHover={{ scale: 1.01, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Tren Pelanggaran</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><Area type="monotone" dataKey="violations" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} /></AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                    <motion.div 
                        variants={slideInRight}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70"
                        whileHover={{ scale: 1.01, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4"><Target className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Jarak</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distanceDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    whileHover={{ scale: 1.005, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Pelanggaran Terbaru</h2></div></div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50 dark:bg-slate-900/50"><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mahasiswa</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">NIM</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Jarak</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mata Kuliah</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Waktu</th></tr></thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {recentViolations.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-slate-300 mb-2" /><p className="text-slate-500">Tidak ada pelanggaran</p></td></tr>
                                ) : recentViolations.map((v, index) => (
                                    <motion.tr 
                                        key={v.id} 
                                        className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                                        whileHover={{ scale: 1.01, x: 4 }}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{v.mahasiswa}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{v.nim}</td>
                                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{v.distance_m ?? '-'}m</span></td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{v.course}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{v.scanned_at}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
    const colors: Record<string, string> = { 
        red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', 
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', 
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', 
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
    };
    
    return (
        <motion.div 
            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70"
            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="flex items-center gap-3">
                <motion.div 
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Icon className="h-5 w-5" />
                </motion.div>
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <motion.p 
                        className="text-xl font-bold text-slate-900 dark:text-white"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        {value}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
