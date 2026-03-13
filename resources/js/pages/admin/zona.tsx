import hariIcon from '@/assets/admin/zona/hari.png';
import iconZona from '@/assets/admin/zona/icon-zona.png';
import jarakIcon from '@/assets/admin/zona/jarak.png';
import mingguIcon from '@/assets/admin/zona/minggu.png';
import pelanggaranIcon from '@/assets/admin/zona/pelanggaran.png';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AnimatePresence,
    motion,
    useSpring,
    useTransform,
} from 'framer-motion';
import L from 'leaflet';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    ChevronDown,
    Crosshair,
    Globe,
    LocateFixed,
    MapPin,
    Maximize2,
    Navigation,
    Radar,
    RefreshCw,
    Ruler,
    Save,
    Shield,
    Target,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
            when: 'beforeChildren' as const,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 16,
            mass: 0.8,
        },
    },
};

const headerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -30 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 180,
            damping: 22,
            delay: 0.05,
        },
    },
};

const cardHover = {
    scale: 1.02,
    y: -6,
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
};

// Animated counter component
function AnimatedCounter({
    value,
    suffix = '',
}: {
    value: number | string;
    suffix?: string;
}) {
    const numVal = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const spring = useSpring(0, { stiffness: 60, damping: 20 });
    const display = useTransform(spring, (v) => {
        if (suffix === 'm') return `${v.toFixed(1)}${suffix}`;
        return `${Math.round(v)}`;
    });

    useEffect(() => {
        spring.set(numVal);
    }, [numVal, spring]);

    return <motion.span>{display}</motion.span>;
}

// Leaflet icon setup
const ensureLeafletIcons = (() => {
    let configured = false;
    return () => {
        if (configured) return;
        L.Icon.Default.prototype.options.iconUrl =
            'https://cdn-icons-png.flaticon.com/512/9446/9446953.png';
        L.Icon.Default.prototype.options.iconSize = [48, 48];
        L.Icon.Default.prototype.options.iconAnchor = [24, 48];
        L.Icon.Default.prototype.options.shadowUrl = '';
        configured = true;
    };
})();

export default function Zona({
    geofence,
    violationStats,
    distanceDistribution,
    recentViolations,
    trendData,
    recentLocations,
}: PageProps) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();
    const flash = props.flash;

    const form = useForm({
        geofence_lat: geofence.lat,
        geofence_lng: geofence.lng,
        geofence_radius_m: geofence.radius_m,
    });

    // Check if the current form data perfectly matches the original saved `geofence` props
    const isSavedLoc = useMemo(() => {
        return (
            form.data.geofence_lat === geofence.lat &&
            form.data.geofence_lng === geofence.lng &&
            form.data.geofence_radius_m === geofence.radius_m
        );
    }, [
        form.data.geofence_lat,
        form.data.geofence_lng,
        form.data.geofence_radius_m,
        geofence,
    ]);

    const [mapReady, setMapReady] = useState(false);
    const [locationStatus, setLocationStatus] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [showViolations, setShowViolations] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null); // New state for hover effect
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const formDataRef = useRef(form.data);

    // Keep ref in sync with form data
    useEffect(() => {
        formDataRef.current = form.data;
    }, [form.data]);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success, flash?.error]);

    // ✅ FIX: Use object spread to set multiple fields at once
    const submit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            form.patch('/admin/zona', {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveSuccess(true);
                    setToast({
                        type: 'success',
                        message: 'Zona geofence berhasil disimpan!',
                    });

                    const params = new URLSearchParams(window.location.search);
                    const redirectTarget = params.get('redirect');

                    if (redirectTarget) {
                        try {
                            const savedForm =
                                sessionStorage.getItem('sesiAbsenForm');
                            if (savedForm) {
                                const parsedForm = JSON.parse(savedForm);
                                // Update create.tsx form memory with the newly committed geofence
                                parsedForm.zona_lat =
                                    form.data.geofence_lat.toString();
                                parsedForm.zona_lng =
                                    form.data.geofence_lng.toString();
                                parsedForm.zona_radius =
                                    form.data.geofence_radius_m;
                                sessionStorage.setItem(
                                    'sesiAbsenForm',
                                    JSON.stringify(parsedForm),
                                );
                            }
                        } catch (e) {
                            console.error('Failed to sync session storage', e);
                        }
                        setTimeout(() => {
                            router.visit(redirectTarget);
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            setToast(null);
                            setSaveSuccess(false);
                        }, 3000);
                    }
                },
                onError: (errors) => {
                    const errorMsg =
                        Object.values(errors).flat().join(', ') ||
                        'Gagal menyimpan zona';
                    setToast({ type: 'error', message: errorMsg });
                    setTimeout(() => setToast(null), 4000);
                },
            });
        },
        [form],
    );

    // ✅ FIX: Set both lat/lng in a single setData call to avoid stale state
    const useCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationStatus('GPS tidak didukung');
            return;
        }
        setLocationLoading(true);
        setLocationStatus('Mengambil lokasi...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocationLoading(false);
                const lat = Number(pos.coords.latitude.toFixed(7));
                const lng = Number(pos.coords.longitude.toFixed(7));
                // ✅ Single setData call with all data to avoid stale state
                form.setData({
                    ...formDataRef.current,
                    geofence_lat: lat,
                    geofence_lng: lng,
                });
                setLocationStatus('Lokasi berhasil diambil');
                setTimeout(() => setLocationStatus(null), 3000);
            },
            (err) => {
                setLocationLoading(false);
                setLocationStatus(
                    err.code === err.PERMISSION_DENIED
                        ? 'Izin lokasi ditolak'
                        : 'Gagal mengambil lokasi',
                );
                setTimeout(() => setLocationStatus(null), 3000);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
        );
    }, [form]);

    // Map initialization
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        ensureLeafletIcons();
        const center: [number, number] = [geofence.lat, geofence.lng];
        const map = L.map(mapRef.current, { zoomControl: true }).setView(
            center,
            17,
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        mapInstanceRef.current = map;
        markerRef.current = L.marker(center, { draggable: true }).addTo(map);
        circleRef.current = L.circle(center, {
            radius: geofence.radius_m,
            color: '#8b5cf6',
            fillColor: '#8b5cf6',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '8 4',
        }).addTo(map);

        // Plot recent scan locations
        recentLocations.forEach((loc) => {
            if (loc.lat && loc.lng) {
                L.circleMarker([loc.lat, loc.lng], {
                    radius: 5,
                    color: loc.is_violation ? '#ef4444' : '#22c55e',
                    fillColor: loc.is_violation ? '#ef4444' : '#22c55e',
                    fillOpacity: 0.7,
                    weight: 1,
                }).addTo(map);
            }
        });

        // ✅ FIX: Use ref for current data + single setData call
        markerRef.current.on('dragend', () => {
            const pos = markerRef.current?.getLatLng();
            if (pos) {
                form.setData({
                    ...formDataRef.current,
                    geofence_lat: Number(pos.lat.toFixed(7)),
                    geofence_lng: Number(pos.lng.toFixed(7)),
                });
            }
        });

        // ✅ FIX: Same fix for map click
        map.on('click', (e) => {
            form.setData({
                ...formDataRef.current,
                geofence_lat: Number(e.latlng.lat.toFixed(7)),
                geofence_lng: Number(e.latlng.lng.toFixed(7)),
            });
        });

        setMapReady(true);
        setTimeout(() => map.invalidateSize(), 0);
        return () => {
            map.off();
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Sync map marker/circle with form data
    useEffect(() => {
        if (!mapReady || !markerRef.current || !circleRef.current) return;
        const pos: [number, number] = [
            Number(form.data.geofence_lat),
            Number(form.data.geofence_lng),
        ];
        markerRef.current.setLatLng(pos);
        circleRef.current.setLatLng(pos);
        mapInstanceRef.current?.panTo(pos, { animate: true });
    }, [form.data.geofence_lat, form.data.geofence_lng, mapReady]);

    useEffect(() => {
        if (mapReady && circleRef.current)
            circleRef.current.setRadius(form.data.geofence_radius_m);
    }, [form.data.geofence_radius_m, mapReady]);

    // Invalidate map size when expanded
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
        }
    }, [mapExpanded]);

    // Computed stats for bar chart coloring
    const maxDistCount = useMemo(
        () => Math.max(...distanceDistribution.map((d) => d.count), 1),
        [distanceDistribution],
    );
    const barColors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

    return (
        <AppLayout>
            <Head title="Zona Geofence" />
            <motion.div
                className="space-y-6 p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -30, x: 30, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, x: 30, scale: 0.85 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                            }}
                            className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl ${
                                toast.type === 'success'
                                    ? 'border-emerald-200/50 bg-emerald-50/95 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-900/80 dark:text-emerald-200'
                                    : 'border-red-200/50 bg-red-50/95 text-red-800 dark:border-red-700/50 dark:bg-red-900/80 dark:text-red-200'
                            }`}
                        >
                            <motion.div
                                initial={{ rotate: -90, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 15,
                                    delay: 0.1,
                                }}
                            >
                                {toast.type === 'success' ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                            </motion.div>
                            <span className="text-sm font-semibold">
                                {toast.message}
                            </span>
                            {/* Auto-dismiss progress bar */}
                            <motion.div
                                className={`absolute bottom-0 left-0 h-0.5 rounded-full ${
                                    toast.type === 'success'
                                        ? 'bg-emerald-500'
                                        : 'bg-red-500'
                                }`}
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 4, ease: 'linear' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {typeof window !== 'undefined' &&
                    new URLSearchParams(window.location.search).get(
                        'redirect',
                    ) && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() =>
                                router.visit(
                                    new URLSearchParams(
                                        window.location.search,
                                    ).get('redirect')!,
                                )
                            }
                            className="mb-2 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/50 px-4 py-2 text-sm font-medium text-neutral-700 backdrop-blur-md transition-colors hover:bg-neutral-100 dark:border-white/20 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Form Sesi
                        </motion.button>
                    )}

                {/* ═══════════ Header — Matching Verifikasi Selfie Style ═══════════ */}
                <motion.div
                    variants={headerVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background — same as Verifikasi Selfie */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={iconZona}
                                        alt="Zona Geofence"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Lokasi
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Zona Geofence
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola titik lokasi dan radius absensi
                                        mahasiswa. Pantau pelanggaran zona dan
                                        analisis distribusi jarak secara
                                        real-time.
                                    </motion.p>
                                </div>
                            </div>

                            {/* Quick info badges */}
                            <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-0 sm:w-auto sm:items-end">
                                <motion.div
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Radar className="h-4 w-4 text-indigo-200" />
                                    <span className="text-sm font-medium">
                                        Radius: {form.data.geofence_radius_m}m
                                    </span>
                                </motion.div>
                                <motion.div
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Globe className="h-4 w-4 text-indigo-200" />
                                    <span className="text-sm font-medium">
                                        {recentLocations.length} Titik Scan
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════ Stats Cards ═══════════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard
                        id="total"
                        iconImg={pelanggaranIcon}
                        label="Total Pelanggaran"
                        value={violationStats.total_violations}
                        color="red"
                        delay={0.1}
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <StatCard
                        id="today"
                        iconImg={hariIcon}
                        label="Hari Ini"
                        value={violationStats.today_violations}
                        color="amber"
                        delay={0.15}
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <StatCard
                        id="week"
                        iconImg={mingguIcon}
                        label="Minggu Ini"
                        value={violationStats.week_violations}
                        color="orange"
                        delay={0.2}
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <StatCard
                        id="distance"
                        iconImg={jarakIcon}
                        label="Rata-rata Jarak"
                        value={violationStats.avg_distance}
                        suffix="m"
                        color="indigo"
                        delay={0.25}
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                </motion.div>

                {/* ═══════════ Map + Settings ═══════════ */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Map Card */}
                    <motion.div
                        variants={itemVariants}
                        className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40 ${mapExpanded ? 'lg:col-span-2' : ''}`}
                        whileHover={cardHover}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <MapPin className="h-4 w-4" />
                                </motion.div>
                                <div className="flex items-center gap-3">
                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                        Peta Geofence
                                    </h2>
                                    {isSavedLoc ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300">
                                            <CheckCircle className="h-3 w-3" />
                                            Tersimpan
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300">
                                            <AlertTriangle className="h-3 w-3" />
                                            Belum Disimpan
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Dalam zona
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Pelanggaran
                                        </span>
                                    </span>
                                </div>
                                <motion.button
                                    onClick={() => setMapExpanded(!mapExpanded)}
                                    className="rounded-lg p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Maximize2 className="h-4 w-4 text-neutral-400" />
                                </motion.button>
                            </div>
                        </div>

                        <div
                            className={`relative overflow-hidden rounded-xl border border-neutral-200 transition-all duration-300 dark:border-neutral-700 ${mapExpanded ? 'h-[500px]' : 'h-80'}`}
                        >
                            <div ref={mapRef} className="h-full w-full" />
                            {!mapReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                    <motion.div
                                        className="flex flex-col items-center gap-3"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                        }}
                                    >
                                        <Globe className="h-8 w-8 text-neutral-400" />
                                        <p className="text-sm text-neutral-500">
                                            Memuat peta...
                                        </p>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Info cards below map */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            <motion.div
                                className="rounded-xl border border-neutral-200/50 bg-gradient-to-br from-neutral-50 to-neutral-100 p-3 dark:border-neutral-700/50 dark:from-neutral-900/50 dark:to-neutral-800/50"
                                whileHover={{ scale: 1.03, y: -2 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <p className="mb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                                    Latitude
                                </p>
                                <p className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                                    {form.data.geofence_lat}
                                </p>
                            </motion.div>
                            <motion.div
                                className="rounded-xl border border-neutral-200/50 bg-gradient-to-br from-neutral-50 to-neutral-100 p-3 dark:border-neutral-700/50 dark:from-neutral-900/50 dark:to-neutral-800/50"
                                whileHover={{ scale: 1.03, y: -2 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <p className="mb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                                    Longitude
                                </p>
                                <p className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                                    {form.data.geofence_lng}
                                </p>
                            </motion.div>
                            <motion.div
                                className="rounded-xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-3 dark:border-indigo-700/50 dark:from-indigo-900/30 dark:to-purple-900/30"
                                whileHover={{ scale: 1.03, y: -2 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <p className="mb-1 text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">
                                    Radius
                                </p>
                                <p className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    {form.data.geofence_radius_m}m
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Settings Card */}
                    {!mapExpanded && (
                        <motion.div
                            variants={itemVariants}
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                            whileHover={cardHover}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <motion.div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Navigation className="h-4 w-4" />
                                </motion.div>
                                <div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                        Pengaturan Zona
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Atur titik lokasi & radius
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                {/* Current Location Button */}
                                <motion.div className="flex flex-wrap items-center gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={useCurrentLocation}
                                        disabled={locationLoading}
                                        className="flex items-center gap-2 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:shadow-md hover:shadow-indigo-500/10 dark:border-indigo-700/50 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300"
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <LocateFixed
                                            className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`}
                                        />
                                        {locationLoading
                                            ? 'Mengambil...'
                                            : 'Lokasi Saat Ini'}
                                    </motion.button>
                                    <AnimatePresence>
                                        {locationStatus && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                                                    locationStatus.includes(
                                                        'berhasil',
                                                    )
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : locationStatus.includes(
                                                                'Mengambil',
                                                            )
                                                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {locationStatus}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Latitude */}
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        <Crosshair className="h-3.5 w-3.5 text-indigo-500" />
                                        Latitude
                                    </label>
                                    <motion.input
                                        type="text"
                                        inputMode="decimal"
                                        value={form.data.geofence_lat}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(
                                                ',',
                                                '.',
                                            );
                                            // Allow partial inputs (like "106.") or negative signs
                                            if (
                                                val === '' ||
                                                val === '-' ||
                                                val.endsWith('.')
                                            ) {
                                                // @ts-ignore - temporary string allowed for typing
                                                form.setData(
                                                    'geofence_lat',
                                                    val,
                                                );
                                            } else {
                                                const num = parseFloat(val);
                                                if (!isNaN(num))
                                                    form.setData(
                                                        'geofence_lat',
                                                        num,
                                                    );
                                            }
                                        }}
                                        onBlur={() => {
                                            // Ensure it's a number on blur
                                            const val =
                                                typeof form.data
                                                    .geofence_lat === 'string'
                                                    ? parseFloat(
                                                          form.data
                                                              .geofence_lat,
                                                      )
                                                    : form.data.geofence_lat;
                                            form.setData(
                                                'geofence_lat',
                                                isNaN(val) ? 0 : val,
                                            );
                                        }}
                                        className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 font-mono text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white"
                                        whileFocus={{
                                            scale: 1.01,
                                            borderColor: '#6366f1',
                                        }}
                                    />
                                    {form.errors.geofence_lat && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.geofence_lat}
                                        </p>
                                    )}
                                </div>

                                {/* Longitude */}
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        <Crosshair className="h-3.5 w-3.5 text-purple-500" />
                                        Longitude
                                    </label>
                                    <motion.input
                                        type="text"
                                        inputMode="decimal"
                                        value={form.data.geofence_lng}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(
                                                ',',
                                                '.',
                                            );
                                            // Allow partial inputs (like "106.") or negative signs
                                            if (
                                                val === '' ||
                                                val === '-' ||
                                                val.endsWith('.')
                                            ) {
                                                // @ts-ignore - temporary string allowed for typing
                                                form.setData(
                                                    'geofence_lng',
                                                    val,
                                                );
                                            } else {
                                                const num = parseFloat(val);
                                                if (!isNaN(num))
                                                    form.setData(
                                                        'geofence_lng',
                                                        num,
                                                    );
                                            }
                                        }}
                                        onBlur={() => {
                                            const val =
                                                typeof form.data
                                                    .geofence_lng === 'string'
                                                    ? parseFloat(
                                                          form.data
                                                              .geofence_lng,
                                                      )
                                                    : form.data.geofence_lng;
                                            form.setData(
                                                'geofence_lng',
                                                isNaN(val) ? 0 : val,
                                            );
                                        }}
                                        className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 font-mono text-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white"
                                        whileFocus={{
                                            scale: 1.01,
                                            borderColor: '#a855f7',
                                        }}
                                    />
                                    {form.errors.geofence_lng && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.geofence_lng}
                                        </p>
                                    )}
                                </div>

                                {/* Radius with visualisation */}
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            <Ruler className="h-3.5 w-3.5 text-pink-500" />
                                            Radius
                                        </span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            {form.data.geofence_radius_m}m
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min={10}
                                        max={1000}
                                        step={5}
                                        value={form.data.geofence_radius_m}
                                        onChange={(e) =>
                                            form.setData(
                                                'geofence_radius_m',
                                                parseInt(e.target.value) || 100,
                                            )
                                        }
                                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-indigo-500/30 [&::-webkit-slider-thumb]:active:cursor-grabbing"
                                    />
                                    <div className="flex justify-between text-[10px] font-medium text-neutral-400">
                                        <span>10m</span>
                                        <span>250m</span>
                                        <span>500m</span>
                                        <span>750m</span>
                                        <span>1000m</span>
                                    </div>
                                    <motion.input
                                        type="number"
                                        min={10}
                                        max={5000}
                                        value={form.data.geofence_radius_m}
                                        onChange={(e) =>
                                            form.setData(
                                                'geofence_radius_m',
                                                parseInt(e.target.value) || 100,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 font-mono text-sm transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white"
                                        whileFocus={{
                                            scale: 1.01,
                                            borderColor: '#ec4899',
                                        }}
                                    />
                                    {form.errors.geofence_radius_m && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.geofence_radius_m}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={form.processing}
                                    className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                        saveSuccess
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
                                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30'
                                    }`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <motion.div
                                        animate={
                                            form.processing
                                                ? { rotate: 360 }
                                                : saveSuccess
                                                  ? { scale: [1, 1.3, 1] }
                                                  : {}
                                        }
                                        transition={
                                            form.processing
                                                ? {
                                                      duration: 1,
                                                      repeat: Infinity,
                                                      ease: 'linear',
                                                  }
                                                : { duration: 0.4 }
                                        }
                                    >
                                        {saveSuccess ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : form.processing ? (
                                            <RefreshCw className="h-4 w-4" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                    </motion.div>
                                    {saveSuccess
                                        ? 'Berhasil Disimpan!'
                                        : form.processing
                                          ? 'Menyimpan...'
                                          : 'Simpan Geofence'}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </div>

                {/* ═══════════ Charts ═══════════ */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Trend Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={cardHover}
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <motion.div
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
                                whileHover={{ rotate: -15 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <TrendingUp className="h-4 w-4" />
                            </motion.div>
                            <div>
                                <h2 className="font-bold text-neutral-900 dark:text-white">
                                    Tren Pelanggaran
                                </h2>
                                <p className="text-xs text-neutral-500">
                                    7 hari terakhir
                                </p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient
                                            id="violationGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.4}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        strokeOpacity={0.5}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255,255,255,0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="violations"
                                        stroke="#ef4444"
                                        strokeWidth={2.5}
                                        fill="url(#violationGrad)"
                                        dot={{
                                            fill: '#ef4444',
                                            strokeWidth: 2,
                                            r: 4,
                                            stroke: '#fff',
                                        }}
                                        activeDot={{
                                            r: 6,
                                            fill: '#ef4444',
                                            strokeWidth: 3,
                                            stroke: '#fff',
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Distribution Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={cardHover}
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <motion.div
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25"
                                whileHover={{ rotate: 15 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Target className="h-4 w-4" />
                            </motion.div>
                            <div>
                                <h2 className="font-bold text-neutral-900 dark:text-white">
                                    Distribusi Jarak
                                </h2>
                                <p className="text-xs text-neutral-500">
                                    Sebaran jarak absensi
                                </p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distanceDistribution}>
                                    <defs>
                                        <linearGradient
                                            id="barGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#8b5cf6"
                                                stopOpacity={0.9}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#6366f1"
                                                stopOpacity={0.6}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        strokeOpacity={0.5}
                                    />
                                    <XAxis
                                        dataKey="range"
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255,255,255,0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                        {distanceDistribution.map(
                                            (_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        barColors[index] ||
                                                        '#6366f1'
                                                    }
                                                />
                                            ),
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* ═══════════ Recent Violations Table ═══════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                    whileHover={{ scale: 1.005 }}
                >
                    <motion.div
                        className="cursor-pointer border-b border-neutral-200 bg-white/30 p-5 dark:border-neutral-800 dark:bg-neutral-900/20"
                        onClick={() => setShowViolations(!showViolations)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25"
                                    whileHover={{ rotate: -10 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                    }}
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                </motion.div>
                                <div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                        Pelanggaran Terbaru
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {recentViolations.length} pelanggaran
                                        tercatat
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: showViolations ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <ChevronDown className="h-5 w-5 text-neutral-400" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {showViolations && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 25,
                                }}
                                className="overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-neutral-50/80 dark:bg-neutral-900/50">
                                                <th className="px-5 py-3.5 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    Mahasiswa
                                                </th>
                                                <th className="px-5 py-3.5 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    NIM
                                                </th>
                                                <th className="px-5 py-3.5 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    Jarak
                                                </th>
                                                <th className="px-5 py-3.5 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    Mata Kuliah
                                                </th>
                                                <th className="px-5 py-3.5 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    Waktu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                            {recentViolations.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-5 py-16 text-center"
                                                    >
                                                        <motion.div
                                                            initial={{
                                                                scale: 0.8,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                opacity: 1,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 200,
                                                            }}
                                                        >
                                                            <Shield className="mx-auto mb-3 h-12 w-12 text-emerald-300" />
                                                            <p className="font-medium text-neutral-500">
                                                                Tidak ada
                                                                pelanggaran
                                                            </p>
                                                            <p className="mt-1 text-xs text-neutral-400">
                                                                Semua absensi
                                                                dalam zona yang
                                                                ditentukan
                                                            </p>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentViolations.map(
                                                    (v, index) => (
                                                        <motion.tr
                                                            key={v.id}
                                                            className="cursor-default transition-colors hover:bg-red-50/30 dark:hover:bg-red-900/5"
                                                            initial={{
                                                                opacity: 0,
                                                                x: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.03,
                                                                type: 'spring',
                                                                stiffness: 150,
                                                            }}
                                                            whileHover={{
                                                                x: 4,
                                                            }}
                                                        >
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 text-xs font-bold text-neutral-600 dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-300">
                                                                        {v.mahasiswa
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                        {
                                                                            v.mahasiswa
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5 font-mono text-sm text-neutral-500 dark:text-neutral-400">
                                                                {v.nim}
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span
                                                                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                                                                        (v.distance_m ??
                                                                            0) >
                                                                        500
                                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                                            : (v.distance_m ??
                                                                                    0) >
                                                                                200
                                                                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                                                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                                    }`}
                                                                >
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    {v.distance_m ??
                                                                        '-'}
                                                                    m
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                                                                {v.course}
                                                            </td>
                                                            <td className="px-5 py-3.5 font-mono text-xs text-neutral-400">
                                                                {v.scanned_at}
                                                            </td>
                                                        </motion.tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

// ═══════════ Stat Card Component ═══════════
function StatCard({
    id,
    iconImg,
    label,
    value,
    color,
    suffix,
    delay = 0,
    hoveredCard,
    setHoveredCard,
}: {
    id: string;
    iconImg: any;
    label: string;
    value: number | string;
    color: string;
    suffix?: string;
    delay?: number;
    hoveredCard: string | null;
    setHoveredCard: (id: string | null) => void;
}) {
    const colorMap: Record<
        string,
        {
            hoverShadow: string;
            text: string;
            bg: string;
            glow: string;
            gradientBg: string;
        }
    > = {
        red: {
            hoverShadow: 'hover:shadow-rose-500/10',
            text: 'text-neutral-900 dark:text-white',
            bg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
            glow: 'bg-rose-500',
            gradientBg:
                'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
        },
        amber: {
            hoverShadow: 'hover:shadow-amber-500/10',
            text: 'text-neutral-900 dark:text-white',
            bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            glow: 'bg-amber-500',
            gradientBg:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
        },
        orange: {
            hoverShadow: 'hover:shadow-orange-500/10',
            text: 'text-neutral-900 dark:text-white',
            bg: 'from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10',
            glow: 'bg-orange-500',
            gradientBg:
                'from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10',
        },
        indigo: {
            hoverShadow: 'hover:shadow-indigo-500/10',
            text: 'text-neutral-900 dark:text-white',
            bg: 'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10',
            glow: 'bg-indigo-500',
            gradientBg:
                'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10',
        },
    };

    const c = colorMap[color] || colorMap.indigo;
    const numVal = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const isHovered = hoveredCard === id;

    return (
        <motion.div
            variants={itemVariants}
            className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${c.hoverShadow} dark:border-white/5`}
            onHoverStart={() => setHoveredCard(id)}
            onHoverEnd={() => setHoveredCard(null)}
            whileHover={{
                scale: 1.04,
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 15 },
            }}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`}
            />

            <motion.div
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${c.glow} blur-3xl transition-all duration-500`}
            />

            <div className="relative flex flex-row items-center gap-3 text-left sm:gap-4">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                >
                    <img
                        src={iconImg}
                        alt={label}
                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                    />
                </motion.div>
                <div>
                    <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                        {label}
                    </p>
                    <motion.div
                        className="mt-0.5 sm:mt-1"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                            delay,
                        }}
                    >
                        <span
                            className={`text-lg font-bold sm:text-2xl ${c.text}`}
                        >
                            <AnimatedCounter value={numVal} suffix={suffix} />
                        </span>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
