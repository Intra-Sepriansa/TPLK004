# 🎯 PROMPT ULTRA ADVANCED: DETAIL KEHADIRAN (NEW PAGE)
## Halaman Detail 1 Record Kehadiran - 100% Matching Admin Dashboard

---

## 📋 OVERVIEW - HALAMAN BARU

### Konsep Halaman
Halaman detail yang menampilkan informasi lengkap tentang 1 record kehadiran ketika user klik item dari daftar riwayat. Halaman ini akan menjadi halaman terpisah (bukan modal) dengan URL: `/user/history/{id}`

### ❌ YANG TIDAK ADA SAAT INI
```
❌ Tidak ada halaman detail terpisah
❌ Hanya ada modal sederhana
❌ Informasi terbatas
❌ Tidak ada map lokasi
❌ Tidak ada device info detail
❌ Tidak ada verification timeline
❌ Tidak ada related records
❌ Tidak ada action buttons (report, appeal)
```

### ✅ YANG AKAN DIBUAT (ULTRA ADVANCED)
```
✅ Halaman terpisah dengan URL routing
✅ Header gradient matching admin 100%
✅ Selfie viewer dengan zoom & fullscreen
✅ Interactive map dengan marker & radius
✅ Device information detail
✅ Verification timeline (scan → selfie → approval)
✅ Related records (same course, same day)
✅ Action buttons (Report Issue, Appeal, Share)
✅ QR Code yang di-scan (jika ada)
✅ Weather & traffic info (saat absen)
✅ Comparison dengan rata-rata kelas
✅ Download bukti kehadiran (PDF)
✅ Share to social media
✅ Print-friendly view
✅ Breadcrumb navigation
✅ Previous/Next navigation
✅ Comments/Notes section
✅ Activity log
```

---

## 🎨 DESIGN SYSTEM — EXACT ADMIN

### Color Palette
```tsx
// Header Gradient (EXACT MATCH)
from-indigo-600 via-purple-600 to-pink-500

// Container Colors
bg-white/40 dark:bg-neutral-900/40
backdrop-blur-xl
border-white/20 dark:border-white/5
shadow-xl
rounded-3xl

// Text Colors
text-neutral-900 dark:text-white
text-neutral-500 dark:text-neutral-400
```

### Animation Settings
```tsx
// Container Variants
staggerChildren: 0.04
delayChildren: 0.1

// Item Variants
stiffness: 300
damping: 20
y: 30

// Card Hover
scale: 1.04
y: -4
stiffness: 400
damping: 15
```

---

## 💻 COMPLETE IMPLEMENTATION

### 1. ROUTE SETUP

**File**: `routes/web.php`

```php
// Add this route
Route::get('user/history/{id}', [AbsensiController::class, 'historyDetail'])
    ->name('user.history.detail');
```

**File**: `app/Http/Controllers/User/AbsensiController.php`

```php
public function historyDetail($id)
{
    $record = AttendanceLog::with([
        'mahasiswa',
        'session.course.dosen',
        'selfieVerification',
        'zone'
    ])->findOrFail($id);
    
    // Get related records (same course, same day)
    $relatedRecords = AttendanceLog::where('mahasiswa_id', $record->mahasiswa_id)
        ->where('id', '!=', $id)
        ->whereDate('scanned_at', $record->scanned_at)
        ->with('session.course')
        ->get();
    
    // Get class average for this session
    $classAverage = AttendanceLog::where('session_id', $record->session_id)
        ->selectRaw('
            COUNT(*) as total,
            SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_count,
            AVG(distance) as avg_distance,
            AVG(TIMESTAMPDIFF(MINUTE, sessions.start_at, attendance_logs.scanned_at)) as avg_delay
        ')
        ->join('sessions', 'sessions.id', '=', 'attendance_logs.session_id')
        ->first();
    
    // Get verification timeline
    $timeline = [
        [
            'type' => 'scan',
            'time' => $record->scanned_at,
            'status' => 'completed',
            'description' => 'QR Code di-scan'
        ],
        [
            'type' => 'selfie',
            'time' => $record->selfieVerification?->created_at,
            'status' => $record->selfieVerification ? 'completed' : 'pending',
            'description' => 'Selfie diupload'
        ],
        [
            'type' => 'verification',
            'time' => $record->selfieVerification?->verified_at,
            'status' => $record->selfieVerification?.status ?? 'pending',
            'description' => 'Verifikasi selfie'
        ],
    ];
    
    return Inertia::render('User/HistoryDetail', [
        'record' => $record,
        'relatedRecords' => $relatedRecords,
        'classAverage' => $classAverage,
        'timeline' => $timeline,
    ]);
}
```

### 2. PAGE COMPONENT

**File**: `resources/js/pages/user/history-detail.tsx`

```tsx
import { useState, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Camera,
    Smartphone,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Share2,
    Printer,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    ZoomIn,
    ZoomOut,
    Navigation,
    Wifi,
    Battery,
    Flag,
    FileText,
    Award,
    TrendingUp,
    Users,
    Activity,
    Cloud,
    Wind,
    Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface AttendanceRecord {
    id: number;
    status: 'present' | 'late' | 'rejected';
    scanned_at: string;
    distance: number;
    lat: number;
    long: number;
    device_info: {
        model: string;
        os: string;
        browser: string;
        battery: number;
        network: string;
    };
    selfie_url: string;
    selfie_verification: {
        status: 'approved' | 'pending' | 'rejected';
        verified_at: string;
        verified_by: string;
        notes: string;
    };
    session: {
        id: number;
        meeting_number: number;
        title: string;
        start_at: string;
        end_at: string;
        course: {
            nama: string;
            kode: string;
            dosen: {
                nama: string;
            };
        };
    };
    zone: {
        nama: string;
        lat: number;
        long: number;
        radius: number;
    };
    weather: {
        condition: string;
        temperature: number;
        humidity: number;
    };
}

interface PageProps {
    record: AttendanceRecord;
    relatedRecords: AttendanceRecord[];
    classAverage: {
        total: number;
        present_count: number;
        avg_distance: number;
        avg_delay: number;
    };
    timeline: Array<{
        type: string;
        time: string;
        status: string;
        description: string;
    }>;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
} as const;

const statusConfig = {
    present: { 
        label: 'Hadir', 
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600',
        icon: CheckCircle 
    },
    late: { 
        label: 'Terlambat', 
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        gradient: 'from-amber-500 to-orange-600',
        icon: Clock 
    },
    rejected: { 
        label: 'Ditolak', 
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        gradient: 'from-rose-500 to-pink-600',
        icon: XCircle 
    },
};

export default function HistoryDetail() {
    const { props } = usePage<{ props: PageProps }>();
    const { record, relatedRecords, classAverage, timeline } = props;
    
    const [showFullscreenSelfie, setShowFullscreenSelfie] = useState(false);
    const [selfieZoom, setSelfieZoom] = useState(1);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    
    const StatusIcon = statusConfig[record.status].icon;
    
    const handleDownloadPDF = () => {
        window.open(`/user/history/${record.id}/pdf`, '_blank');
    };
    
    const handlePrint = () => {
        window.print();
    };
    
    const handleShare = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
        const url = window.location.href;
        const text = `Saya ${statusConfig[record.status].label} di ${record.session.course.nama}`;
        
        const shareUrls = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        };
        
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    };
    
    return (
        <StudentLayout>
            <Head title={`Detail Kehadiran - ${record.session.course.nama}`} />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Breadcrumb & Navigation */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/user/history">
                            <motion.button
                                whileHover={{ scale: 1.05, x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-neutral-800/60 transition-all"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </motion.button>
                        </Link>
                        
                        <div className="text-sm text-neutral-500">
                            <Link href="/user/history" className="hover:text-neutral-700 dark:hover:text-neutral-300">
                                Riwayat
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-neutral-900 dark:text-white font-semibold">
                                Detail Kehadiran
                            </span>
                        </div>
                    </div>
                    
                    {/* Previous/Next Navigation */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </motion.button>
                    </div>
                </motion.div>


                {/* HEADER CARD - ULTRA ADVANCED matching Admin */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background - EXACT ADMIN */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />
                    
                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    
                    {/* Floating Icons */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 10, 0],
                            rotate: [0, 5, -5, 0],
                            opacity: [0.15, 0.3, 0.15],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-10 right-20 text-white/15"
                    >
                        <FileText className="h-14 w-14" />
                    </motion.div>
                    
                    <div className="relative">
                        <div className="flex items-start justify-between flex-wrap gap-6">
                            <div className="flex-1">
                                {/* Status Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/25 backdrop-blur-xl mb-4"
                                >
                                    <StatusIcon className="h-5 w-5" />
                                    <span className="font-bold">{statusConfig[record.status].label}</span>
                                </motion.div>
                                
                                {/* Course Info */}
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold mb-2"
                                >
                                    {record.session.course.nama}
                                </motion.h1>
                                
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-wrap items-center gap-4 text-sm text-indigo-100"
                                >
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {record.session.course.dosen.nama}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Pertemuan #{record.session.meeting_number}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {new Date(record.scanned_at).toLocaleString('id-ID')}
                                    </span>
                                </motion.div>
                            </div>
                            
                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap gap-2"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 hover:bg-white/30 transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    PDF
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowShareModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 hover:bg-white/30 transition-all"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 hover:bg-white/30 transition-all"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowReportModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 hover:bg-rose-500/30 transition-all"
                                >
                                    <Flag className="h-4 w-4" />
                                    Report
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
                
                {/* MAIN CONTENT GRID */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* SELFIE VIEWER */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                                    >
                                        <Camera className="h-5 w-5 text-emerald-500" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                            Bukti Selfie
                                        </h2>
                                        <p className="text-xs text-neutral-500">
                                            Status: {record.selfie_verification.status}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelfieZoom(Math.min(selfieZoom + 0.5, 3))}
                                        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelfieZoom(Math.max(selfieZoom - 0.5, 1))}
                                        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowFullscreenSelfie(true)}
                                        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                            
                            <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                <motion.img
                                    src={record.selfie_url}
                                    alt="Selfie"
                                    style={{ scale: selfieZoom }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="w-full h-auto cursor-zoom-in"
                                    onClick={() => setShowFullscreenSelfie(true)}
                                />
                                
                                {/* Verification Badge Overlay */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-4 right-4"
                                >
                                    <div className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl font-bold shadow-lg",
                                        record.selfie_verification.status === 'approved' 
                                            ? "bg-emerald-500/90 text-white"
                                            : record.selfie_verification.status === 'pending'
                                                ? "bg-amber-500/90 text-white"
                                                : "bg-rose-500/90 text-white"
                                    )}>
                                        {record.selfie_verification.status === 'approved' && <CheckCircle className="h-4 w-4" />}
                                        {record.selfie_verification.status === 'pending' && <Clock className="h-4 w-4" />}
                                        {record.selfie_verification.status === 'rejected' && <XCircle className="h-4 w-4" />}
                                        {record.selfie_verification.status === 'approved' ? 'Terverifikasi' : 
                                         record.selfie_verification.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                    </div>
                                </motion.div>
                            </div>
                            
                            {/* Verification Notes */}
                            {record.selfie_verification.notes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                >
                                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                        Catatan Verifikator:
                                    </p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                        {record.selfie_verification.notes}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                        
                        {/* INTERACTIVE MAP */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20"
                                >
                                    <MapPin className="h-5 w-5 text-sky-500" />
                                </motion.div>
                                <div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Lokasi Absen
                                    </h2>
                                    <p className="text-xs text-neutral-500">
                                        Jarak: {record.distance.toFixed(0)} meter dari zona
                                    </p>
                                </div>
                            </div>
                            
                            <div className="rounded-2xl overflow-hidden h-[400px] border border-white/20">
                                <MapContainer
                                    center={[record.lat, record.long]}
                                    zoom={17}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />
                                    
                                    {/* User Location Marker */}
                                    <Marker position={[record.lat, record.long]}>
                                        <Popup>
                                            <div className="text-center">
                                                <p className="font-bold">Lokasi Anda</p>
                                                <p className="text-xs">{new Date(record.scanned_at).toLocaleTimeString('id-ID')}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    
                                    {/* Zone Center Marker */}
                                    <Marker position={[record.zone.lat, record.zone.long]}>
                                        <Popup>
                                            <div className="text-center">
                                                <p className="font-bold">{record.zone.nama}</p>
                                                <p className="text-xs">Radius: {record.zone.radius}m</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    
                                    {/* Zone Radius Circle */}
                                    <Circle
                                        center={[record.zone.lat, record.zone.long]}
                                        radius={record.zone.radius}
                                        pathOptions={{
                                            color: record.distance <= record.zone.radius ? '#10b981' : '#f43f5e',
                                            fillColor: record.distance <= record.zone.radius ? '#10b981' : '#f43f5e',
                                            fillOpacity: 0.1
                                        }}
                                    />
                                </MapContainer>
                            </div>
                            
                            {/* Location Stats */}
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                                    <p className="text-xs text-neutral-500 mb-1">Jarak</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {record.distance.toFixed(0)}m
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                                    <p className="text-xs text-neutral-500 mb-1">Akurasi</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {record.distance <= record.zone.radius ? '✓' : '✗'}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                                    <p className="text-xs text-neutral-500 mb-1">Zona</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {record.zone.radius}m
                                    </p>
                                </div>
                            </div>
                        </motion.div>


                    </div>
                    
                    {/* RIGHT COLUMN - Additional Info */}
                    <div className="space-y-6">
                        
                        {/* VERIFICATION TIMELINE */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20"
                                >
                                    <Activity className="h-5 w-5 text-violet-500" />
                                </motion.div>
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                    Timeline Verifikasi
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                {timeline.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative pl-8"
                                    >
                                        {/* Vertical Line */}
                                        {index < timeline.length - 1 && (
                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                                        )}
                                        
                                        {/* Timeline Dot */}
                                        <motion.div
                                            whileHover={{ scale: 1.2 }}
                                            className={cn(
                                                "absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center",
                                                item.status === 'completed' 
                                                    ? "bg-emerald-500 text-white"
                                                    : item.status === 'pending'
                                                        ? "bg-amber-500 text-white"
                                                        : "bg-rose-500 text-white"
                                            )}
                                        >
                                            {item.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                                            {item.status === 'pending' && <Clock className="h-4 w-4" />}
                                            {item.status === 'rejected' && <XCircle className="h-4 w-4" />}
                                        </motion.div>
                                        
                                        {/* Content */}
                                        <div>
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {item.description}
                                            </p>
                                            {item.time && (
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    {new Date(item.time).toLocaleString('id-ID')}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        
                        {/* DEVICE INFO */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                                >
                                    <Smartphone className="h-5 w-5 text-indigo-500" />
                                </motion.div>
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                    Informasi Perangkat
                                </h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Model</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {record.device_info.model}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">OS</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {record.device_info.os}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                                        <Battery className="h-4 w-4" />
                                        Battery
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {record.device_info.battery}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                                        <Wifi className="h-4 w-4" />
                                        Network
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {record.device_info.network}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* WEATHER INFO */}
                        {record.weather && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                                    >
                                        <Cloud className="h-5 w-5 text-cyan-500" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Cuaca Saat Absen
                                    </h2>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Kondisi</span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {record.weather.condition}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                                            <Wind className="h-4 w-4" />
                                            Suhu
                                        </span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {record.weather.temperature}°C
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                                            <Droplets className="h-4 w-4" />
                                            Kelembaban
                                        </span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {record.weather.humidity}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* CLASS COMPARISON */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                >
                                    <TrendingUp className="h-5 w-5 text-amber-500" />
                                </motion.div>
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                    Perbandingan Kelas
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-600 dark:text-neutral-400">Jarak Anda</span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {record.distance.toFixed(0)}m
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-600 dark:text-neutral-400">Rata-rata Kelas</span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {classAverage.avg_distance.toFixed(0)}m
                                        </span>
                                    </div>
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((record.distance / classAverage.avg_distance) * 100, 100)}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={cn(
                                                "h-full",
                                                record.distance < classAverage.avg_distance
                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                                    : "bg-gradient-to-r from-amber-500 to-orange-600"
                                            )}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-white/20">
                                    <p className="text-xs text-neutral-500 text-center">
                                        {classAverage.present_count} dari {classAverage.total} mahasiswa hadir
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* RELATED RECORDS */}
                        {relatedRecords.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20"
                                    >
                                        <FileText className="h-5 w-5 text-rose-500" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Kehadiran Lain Hari Ini
                                    </h2>
                                </div>
                                
                                <div className="space-y-2">
                                    {relatedRecords.map((related, index) => (
                                        <Link
                                            key={related.id}
                                            href={`/user/history/${related.id}`}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                                                className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-pointer transition-all"
                                            >
                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                                    {related.session.course.nama}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    {new Date(related.scanned_at).toLocaleTimeString('id-ID')}
                                                </p>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
            
            {/* FULLSCREEN SELFIE MODAL */}
            <AnimatePresence>
                {showFullscreenSelfie && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
                        onClick={() => setShowFullscreenSelfie(false)}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowFullscreenSelfie(false)}
                            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl z-10"
                        >
                            <X className="h-6 w-6 text-white" />
                        </motion.button>
                        
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={record.selfie_url}
                            alt="Selfie Fullscreen"
                            className="max-w-full max-h-full object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* SHARE MODAL */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                                Share Kehadiran
                            </h3>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleShare('whatsapp')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                                >
                                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                        <Share2 className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold">WhatsApp</span>
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleShare('twitter')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
                                >
                                    <div className="h-12 w-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
                                        <Share2 className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold">Twitter</span>
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleShare('facebook')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                                >
                                    <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                        <Share2 className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold">Facebook</span>
                                </motion.button>
                            </div>
                            
                            <Button
                                variant="outline"
                                className="w-full mt-6"
                                onClick={() => setShowShareModal(false)}
                            >
                                Tutup
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Backend Setup
```
☐ Create route: /user/history/{id}
☐ Create controller method: historyDetail
☐ Query record with relations
☐ Calculate class average
☐ Generate verification timeline
☐ Get related records
☐ Add weather API integration
☐ Create PDF export endpoint
```

### Frontend Components
```
☐ Create history-detail.tsx page
☐ Implement breadcrumb navigation
☐ Implement prev/next navigation
☐ Create header with gradient (admin style)
☐ Create selfie viewer with zoom
☐ Implement fullscreen selfie modal
☐ Integrate Leaflet map
☐ Create verification timeline
☐ Create device info card
☐ Create weather info card
☐ Create class comparison card
☐ Create related records list
☐ Implement share modal
☐ Implement report modal
☐ Add print stylesheet
```

### Features
```
☐ Zoom in/out selfie
☐ Fullscreen selfie view
☐ Interactive map with markers
☐ Zone radius visualization
☐ Timeline with status indicators
☐ Device information display
☐ Weather conditions
☐ Class average comparison
☐ Related records navigation
☐ PDF download
☐ Share to social media
☐ Print functionality
☐ Report issue
☐ Comments/notes section
```

### Styling & Animations
```
☐ Admin dashboard gradient header
☐ Glassmorphism containers
☐ Smooth animations (stiffness: 300)
☐ Hover effects
☐ Loading states
☐ Empty states
☐ Error states
☐ Responsive design
☐ Dark mode support
☐ Print-friendly styles
```

---

## 🎉 SUMMARY

Halaman Detail Kehadiran akan menjadi halaman terpisah dengan fitur:

### Core Features:
✅ URL routing: `/user/history/{id}`
✅ Header gradient 100% matching admin
✅ Selfie viewer dengan zoom & fullscreen
✅ Interactive map dengan marker & radius
✅ Verification timeline
✅ Device information detail
✅ Weather info saat absen
✅ Class comparison
✅ Related records navigation

### Advanced Features:
✅ PDF download
✅ Share to social media
✅ Print functionality
✅ Report issue
✅ Previous/Next navigation
✅ Breadcrumb navigation
✅ Fullscreen modals
✅ Smooth animations

**Estimated Time**: 8-10 hours  
**Priority**: HIGH  
**Impact**: SIGNIFICANT  
**New File**: `resources/js/pages/user/history-detail.tsx`

Halaman detail ini akan memberikan informasi super lengkap tentang 1 record kehadiran! 🚀✨

