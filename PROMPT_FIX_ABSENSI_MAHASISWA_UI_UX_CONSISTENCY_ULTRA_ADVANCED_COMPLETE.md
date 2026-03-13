# 🎯 PROMPT: FIX ABSENSI MAHASISWA - UI/UX CONSISTENCY & CAMERA FIX ULTRA ADVANCED COMPLETE

## 📋 EXECUTIVE SUMMARY

**Objective:** Memperbaiki dan menyesuaikan seluruh UI/UX menu Absensi Mahasiswa (`resources/js/pages/user/absen.tsx`) agar 100% konsisten dengan Dashboard Admin, termasuk memperbaiki error kamera, menghilangkan data dummy, dan melakukan inovasi pengembangan yang signifikan.

**Target File:** `resources/js/pages/user/absen.tsx`

**Complexity Level:** ⭐⭐⭐⭐⭐ (Ultra Advanced)

**Priority:** 🔴 CRITICAL - Bug Fix + UI/UX Consistency

---

## 🎨 DESIGN CONSISTENCY REQUIREMENTS

### 1. Color Scheme & Gradient (WAJIB SAMA DENGAN DASHBOARD ADMIN)

```tsx
// ═══════ GRADIENT BACKGROUND HEADER ═══════
// Sama persis dengan Dashboard Admin
const HEADER_GRADIENT = {
    background: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500",
    animatedBackground: {
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        duration: 15,
        backgroundSize: '200% 200%'
    },
    overlay: "bg-gradient-to-br from-white/5 to-transparent opacity-30",
    blurCircles: [
        "absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl",
        "absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
    ]
};

// ═══════ GLASSMORPHISM CARDS ═══════
const GLASS_CARD = "rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40";

// ═══════ STAT CARDS COLOR CONFIG ═══════
const STAT_CARD_COLORS = [
    {
        name: "QR Scan",
        from: 'from-emerald-400',
        to: 'to-teal-600',
        shadow: 'shadow-emerald-500/30',
        bg: 'bg-emerald-500',
        hoverShadow: 'hover:shadow-emerald-500/10',
        gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
    },
    {
        name: "Selfie",
        from: 'from-sky-400',
        to: 'to-indigo-600',
        shadow: 'shadow-sky-500/30',
        bg: 'bg-sky-500',
        hoverShadow: 'hover:shadow-sky-500/10',
        gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
    },
    {
        name: "Location",
        from: 'from-amber-400',
        to: 'to-orange-600',
        shadow: 'shadow-amber-500/30',
        bg: 'bg-amber-500',
        hoverShadow: 'hover:shadow-amber-500/10',
        gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
    },
    {
        name: "Submit",
        from: 'from-rose-400',
        to: 'to-pink-600',
        shadow: 'shadow-rose-500/30',
        bg: 'bg-rose-500',
        hoverShadow: 'hover:shadow-rose-500/10',
        gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
    }
];
```

### 2. Header Structure (SAMA DENGAN DASHBOARD ADMIN)


```tsx
// ═══════ HEADER COMPONENT - MATCHING DASHBOARD ADMIN ═══════
function AbsensiHeader({ mahasiswa, activeSession }: HeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
            {/* Animated Gradient Background - SAMA DENGAN DASHBOARD */}
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

            {/* Overlay & Blur Circles */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    {/* Left Section - Icon & Title */}
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                        {/* ICON - TANPA CONTAINER, LANGSUNG GAMBAR */}
                        <motion.div
                            className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                delay: 0.2,
                            }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <img
                                src={absenIcon}
                                alt="Absensi Mahasiswa"
                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                            />
                        </motion.div>

                        {/* Title & Description */}
                        <div className="mt-1 flex-1 sm:mt-0">
                            <motion.p
                                className="text-sm font-medium tracking-wide text-indigo-100"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Selamat datang, {mahasiswa.nama}
                            </motion.p>
                            <motion.h1
                                className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Absensi Mahasiswa
                            </motion.h1>
                            <motion.p
                                className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {activeSession 
                                    ? `${activeSession.courseName} - Pertemuan ${activeSession.meetingNumber}`
                                    : 'Sistem absensi berbasis QR code dinamis dan verifikasi selfie untuk kehadiran yang akurat.'
                                }
                            </motion.p>
                        </div>
                    </div>

                    {/* Right Section - Clock */}
                    <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-0 sm:w-auto sm:items-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring' }}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-2 shadow-lg backdrop-blur-xl sm:px-6 sm:py-3"
                        >
                            <div className="text-center sm:text-right">
                                <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                                    {currentTime.toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p className="text-[10px] text-indigo-200 sm:text-xs">
                                    {currentTime.toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Action Buttons - SAMA DENGAN DASHBOARD */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                    className="mt-6 flex w-full flex-nowrap gap-2 overflow-x-auto border-t border-white/10 pt-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-8 sm:gap-3 [&::-webkit-scrollbar]:hidden"
                >
                    <motion.a
                        href="/user/dashboard"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali
                    </motion.a>
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </motion.button>
                    <motion.a
                        href="/user/riwayat-absensi"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Riwayat
                    </motion.a>
                </motion.div>
            </div>
        </motion.div>
    );
}
```

### 3. Tombol Kembali (SAMA DENGAN MENU LAIN)

```tsx
// ═══════ BACK BUTTON - CONSISTENT STYLE ═══════
// Gunakan style yang sama dengan dashboard admin
<motion.a
    href="/user/dashboard"
    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
>
    <ArrowLeft className="h-3.5 w-3.5" />
    Kembali
</motion.a>
```

### 4. Responsive Mobile (SAMA DENGAN DASHBOARD ADMIN)


```tsx
// ═══════ RESPONSIVE BREAKPOINTS ═══════
// Mobile First - Sama dengan Dashboard Admin

// Header padding & spacing
className="p-4 sm:p-6 md:p-8"

// Icon size
className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24"

// Title size
className="text-xl sm:text-2xl md:text-3xl"

// Description text
className="text-xs sm:text-sm md:text-base"

// Button size
className="text-[11px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2"

// Grid layout
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"

// Card padding
className="p-3 sm:p-4 md:p-6"
```

---

## 🐛 CRITICAL BUG FIX: CAMERA ERROR

### Problem Analysis

**Error:** Kamera tidak bisa dibuka / Camera access failed

**Root Causes:**
1. Permission tidak di-check sebelum akses kamera
2. Html5Qrcode tidak di-stop dengan benar
3. Stream tidak di-cleanup saat unmount
4. Konflik antara QR scanner dan selfie camera
5. Browser compatibility issues

### Solution: Robust Camera Management

```tsx
// ═══════ CAMERA PERMISSION CHECKER ═══════
const checkCameraPermission = async (): Promise<{
    granted: boolean;
    error?: string;
}> => {
    try {
        // Method 1: Check Permissions API (if available)
        if ('permissions' in navigator) {
            try {
                const result = await navigator.permissions.query({ 
                    name: 'camera' as PermissionName 
                });
                
                if (result.state === 'denied') {
                    return {
                        granted: false,
                        error: 'Akses kamera ditolak. Silakan aktifkan di pengaturan browser.'
                    };
                }
                
                if (result.state === 'granted') {
                    return { granted: true };
                }
            } catch (permError) {
                console.warn('Permissions API not fully supported:', permError);
            }
        }
        
        // Method 2: Try to access camera directly (fallback)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true 
            });
            
            // Immediately stop the test stream
            stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            
            return { granted: true };
            
        } catch (accessError: any) {
            console.error('Camera access error:', accessError);
            
            if (accessError.name === 'NotAllowedError') {
                return {
                    granted: false,
                    error: 'Akses kamera ditolak. Klik ikon kamera di address bar untuk mengizinkan.'
                };
            }
            
            if (accessError.name === 'NotFoundError') {
                return {
                    granted: false,
                    error: 'Kamera tidak ditemukan pada perangkat ini.'
                };
            }
            
            if (accessError.name === 'NotReadableError') {
                return {
                    granted: false,
                    error: 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba lagi.'
                };
            }
            
            return {
                granted: false,
                error: `Error mengakses kamera: ${accessError.message}`
            };
        }
        
    } catch (error: any) {
        console.error('Permission check error:', error);
        return {
            granted: false,
            error: 'Tidak dapat memeriksa izin kamera. Pastikan browser Anda mendukung akses kamera.'
        };
    }
};

// ═══════ QR SCANNER WITH PROPER CLEANUP ═══════
const startQRScanner = async () => {
    try {
        // 1. Check permission first
        const permissionCheck = await checkCameraPermission();
        if (!permissionCheck.granted) {
            toast.error(permissionCheck.error || 'Akses kamera ditolak');
            setShowPermissionGuide(true);
            return;
        }

        // 2. Stop any existing scanner
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (stopError) {
                console.warn('Error stopping previous scanner:', stopError);
            }
            html5QrCodeRef.current = null;
        }

        // 3. Wait a bit for cleanup
        await wait(300);

        // 4. Initialize new scanner
        const html5QrCode = new Html5Qrcode(qrReaderDivId);
        html5QrCodeRef.current = html5QrCode;

        // 5. Start scanning with proper config
        await html5QrCode.start(
            { facingMode: 'environment' }, // Rear camera
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false,
            },
            (decodedText) => {
                handleQRSuccess(decodedText);
            },
            (errorMessage) => {
                // Silent - normal scanning errors are too frequent
            }
        );

        setCameraPhase('scanning');
        setScanState('scanning');
        setProgress(25);
        toast.success('Kamera QR aktif');

    } catch (error: any) {
        console.error('QR Scanner start error:', error);
        
        let errorMessage = 'Gagal memulai scanner QR';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Akses kamera ditolak. Silakan izinkan akses kamera.';
            setShowPermissionGuide(true);
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Kamera tidak ditemukan.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Kamera sedang digunakan aplikasi lain.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setCameraPhase('idle');
        setScanState('error');
    }
};

// ═══════ SELFIE CAMERA WITH PROPER CLEANUP ═══════
const startSelfieCamera = async () => {
    try {
        // 1. Check permission
        const permissionCheck = await checkCameraPermission();
        if (!permissionCheck.granted) {
            toast.error(permissionCheck.error || 'Akses kamera ditolak');
            setSelfieState('error');
            return;
        }

        // 2. Stop any existing video stream
        if (selfieVideoRef.current?.srcObject) {
            const oldStream = selfieVideoRef.current.srcObject as MediaStream;
            oldStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            selfieVideoRef.current.srcObject = null;
        }

        // 3. Wait for cleanup
        await wait(300);

        // 4. Request front camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // Front camera
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
            audio: false,
        });

        // 5. Attach to video element
        if (selfieVideoRef.current) {
            selfieVideoRef.current.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise<void>((resolve) => {
                if (selfieVideoRef.current) {
                    selfieVideoRef.current.onloadedmetadata = () => {
                        selfieVideoRef.current?.play();
                        resolve();
                    };
                }
            });
        }

        setSelfieState('ready');
        setProgress(75);
        toast.success('Kamera selfie aktif');

    } catch (error: any) {
        console.error('Selfie camera error:', error);
        
        let errorMessage = 'Gagal membuka kamera selfie';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Akses kamera ditolak untuk selfie.';
            setShowPermissionGuide(true);
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Kamera depan tidak ditemukan.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Kamera sedang digunakan aplikasi lain.';
        }
        
        toast.error(errorMessage);
        setSelfieState('error');
    }
};

// ═══════ CLEANUP ON UNMOUNT ═══════
useEffect(() => {
    return () => {
        // Stop QR scanner
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch(() => {});
            html5QrCodeRef.current.clear();
            html5QrCodeRef.current = null;
        }

        // Stop video stream
        if (selfieVideoRef.current?.srcObject) {
            const stream = selfieVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            selfieVideoRef.current.srcObject = null;
        }

        // Revoke blob URLs
        if (selfiePreviewUrl) {
            URL.revokeObjectURL(selfiePreviewUrl);
        }
    };
}, []);

// ═══════ CLEANUP ON PHASE CHANGE ═══════
useEffect(() => {
    // When leaving scanning phase, stop QR scanner
    if (cameraPhase !== 'scanning' && html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
    }

    // When leaving selfie phase, stop video
    if (cameraPhase !== 'selfie' && selfieVideoRef.current?.srcObject) {
        const stream = selfieVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
        });
        selfieVideoRef.current.srcObject = null;
    }
}, [cameraPhase]);
```

### Permission Guide Component


```tsx
// ═══════ PERMISSION GUIDE - SAMA STYLE DENGAN DASHBOARD ═══════
function CameraPermissionGuide() {
    const [browserType, setBrowserType] = useState<'chrome' | 'safari' | 'firefox' | 'other'>('other');

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('chrome') && !ua.includes('edg')) {
            setBrowserType('chrome');
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
            setBrowserType('safari');
        } else if (ua.includes('firefox')) {
            setBrowserType('firefox');
        }
    }, []);

    const guides = {
        chrome: [
            'Klik ikon kamera yang dicoret di address bar (kiri atas)',
            'Pilih "Selalu izinkan ... mengakses kamera"',
            'Klik "Selesai" atau "Done"',
            'Refresh halaman ini (F5 atau tombol Refresh di atas)'
        ],
        safari: [
            'Buka menu Safari → Pengaturan untuk Situs Web Ini',
            'Di bagian Kamera, pilih "Izinkan"',
            'Tutup pengaturan',
            'Refresh halaman ini'
        ],
        firefox: [
            'Klik ikon kamera yang dicoret di address bar',
            'Klik "X" untuk menghapus pemblokiran',
            'Klik "Izinkan" saat diminta',
            'Refresh halaman ini'
        ],
        other: [
            'Cari ikon kamera atau gembok di address bar',
            'Klik dan pilih "Izinkan akses kamera"',
            'Refresh halaman ini'
        ]
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                GLASS_CARD,
                "border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/20 dark:to-orange-900/20"
            )}
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                    <Camera className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                        Cara Mengaktifkan Kamera
                    </h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        Browser: {browserType.charAt(0).toUpperCase() + browserType.slice(1)}
                    </p>
                    <ol className="mt-4 space-y-2 text-sm text-amber-900 dark:text-amber-100">
                        {guides[browserType].map((step, index) => (
                            <li key={index} className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-700">
                                    {index + 1}
                                </span>
                                <span className="flex-1 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-4 flex gap-2">
                        <Button
                            onClick={() => window.location.reload()}
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Halaman
                        </Button>
                        <Button
                            onClick={() => setShowPermissionGuide(false)}
                            size="sm"
                            variant="outline"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
```

---

## 🎨 ICON & CARD CONSISTENCY

### 1. Hapus Container Icon di Header

```tsx
// ❌ JANGAN SEPERTI INI (dengan container)
<div className="rounded-xl bg-gradient-to-br from-sky-500/25 to-cyan-400/25 p-6">
    <Camera className="h-11 w-11" />
</div>

// ✅ GUNAKAN SEPERTI INI (langsung gambar, sama dengan dashboard)
<motion.div
    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
    whileHover={{ scale: 1.05, rotate: 5 }}
>
    <img
        src={absenIcon}
        alt="Absensi Mahasiswa"
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
    />
</motion.div>
```

### 2. Sesuaikan Warna Icon dengan Container Card

```tsx
// ═══════ STEP CARDS WITH MATCHING ICON COLORS ═══════
const STEP_CARDS = [
    {
        step: 1,
        title: "Scan QR Code",
        icon: QrCode,
        iconColor: "text-emerald-600", // Matching emerald container
        bgColor: "bg-emerald-500/15",
        borderColor: "border-emerald-200/70",
        gradientFrom: "from-emerald-50",
        gradientTo: "to-teal-50",
        status: scanState === 'success',
    },
    {
        step: 2,
        title: "Ambil Selfie",
        icon: Camera,
        iconColor: "text-sky-600", // Matching sky container
        bgColor: "bg-sky-500/15",
        borderColor: "border-sky-200/70",
        gradientFrom: "from-sky-50",
        gradientTo: "to-cyan-50",
        status: selfieState === 'captured',
    },
    {
        step: 3,
        title: "Verifikasi Lokasi",
        icon: MapPin,
        iconColor: "text-amber-600", // Matching amber container
        bgColor: "bg-amber-500/15",
        borderColor: "border-amber-200/70",
        gradientFrom: "from-amber-50",
        gradientTo: "to-orange-50",
        status: locationState === 'success',
    },
    {
        step: 4,
        title: "Kirim Absensi",
        icon: Send,
        iconColor: "text-rose-600", // Matching rose container
        bgColor: "bg-rose-500/15",
        borderColor: "border-rose-200/70",
        gradientFrom: "from-rose-50",
        gradientTo: "to-pink-50",
        status: submitStatus === 'success',
    },
];

// Render step cards
{STEP_CARDS.map((card) => (
    <motion.div
        key={card.step}
        className={cn(
            "rounded-2xl border p-4",
            card.borderColor,
            `bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}`,
            "dark:from-neutral-800 dark:to-neutral-900"
        )}
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
    >
        <div className="flex items-center gap-3">
            <div className={cn(
                "rounded-xl p-3",
                card.bgColor,
                card.iconColor
            )}>
                <card.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-medium tracking-[0.2em] uppercase opacity-70">
                    Step {card.step}
                </p>
                <p className="text-sm font-semibold">
                    {card.title}
                </p>
            </div>
            {card.status && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
        </div>
    </motion.div>
))}
```

### 3. Hilangkan Animasi Icon Bergerak ke Atas

```tsx
// ❌ JANGAN GUNAKAN ANIMASI FLOATING
animate={{ y: [0, -10, 0] }}

// ✅ GUNAKAN ANIMASI SEDERHANA SAJA
// Hanya scale dan rotate saat hover
whileHover={{ scale: 1.05, rotate: 5 }}
```

---

## 📱 MOBILE RESPONSIVE OPTIMIZATION

### Layout Mobile (Sama dengan Dashboard Admin)

```tsx
// ═══════ MOBILE-FIRST RESPONSIVE LAYOUT ═══════
<div className="space-y-4 sm:space-y-6">
    {/* Header - Full width, responsive padding */}
    <div className="px-4 sm:px-6 lg:px-8">
        <AbsensiHeader />
    </div>

    {/* Main Content - Responsive grid */}
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Left Column - Camera & Steps */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                {/* Unified Camera Card */}
                <UnifiedCameraCard />
                
                {/* Step Cards - 2 cols on mobile, 4 cols on desktop */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {STEP_CARDS.map(card => (
                        <StepCard key={card.step} {...card} />
                    ))}
                </div>
            </div>

            {/* Right Column - Info & Stats */}
            <div className="space-y-4 sm:space-y-6">
                {/* Location Card */}
                <LocationCard />
                
                {/* Gamification */}
                <GamificationCard />
                
                {/* Social Proof */}
                <SocialProofCard />
            </div>
        </div>
    </div>

    {/* Sticky Footer - Always at bottom */}
    <StickySubmitFooter />
</div>
```

### Button Responsive

```tsx
// ═══════ RESPONSIVE BUTTON SIZES ═══════
// Small screens: compact
// Large screens: comfortable

<Button
    className={cn(
        // Base
        "rounded-xl font-semibold shadow-lg transition-all",
        // Mobile
        "text-[11px] px-3 py-1.5 gap-1.5",
        // Tablet
        "sm:text-xs sm:px-4 sm:py-2 sm:gap-2",
        // Desktop
        "lg:text-sm lg:px-6 lg:py-3"
    )}
>
    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span>Text</span>
</Button>
```

---

## 🚫 REMOVE DUMMY DATA

### 1. Hapus Semua Data Dummy

```tsx
// ❌ JANGAN ADA DATA DUMMY
const dummyRecentAttendees = ['User 1', 'User 2', 'User 3'];
const dummyLeaderboard = [{ rank: 1, name: 'Dummy', points: 100 }];

// ✅ GUNAKAN DATA DARI PROPS ATAU KOSONGKAN
const recentAttendees = socialProof?.recentAttendees ?? [];
const leaderboard = socialProof?.leaderboard ?? [];

// Jika data kosong, tampilkan empty state
{recentAttendees.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Belum ada data kehadiran</p>
    </div>
) : (
    recentAttendees.map((attendee, index) => (
        <AttendeeItem key={index} name={attendee} />
    ))
)}
```

### 2. Empty State Components

```tsx
// ═══════ EMPTY STATE - CONSISTENT DESIGN ═══════
function EmptyState({ 
    icon: Icon, 
    title, 
    description 
}: { 
    icon: any; 
    title: string; 
    description: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
        >
            <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-400">
                {description}
            </p>
        </motion.div>
    );
}

// Usage
{gamification.achievements.length === 0 && (
    <EmptyState
        icon={Trophy}
        title="Belum Ada Pencapaian"
        description="Mulai absen secara rutin untuk membuka pencapaian pertama Anda!"
    />
)}
```

---

## ✨ INOVASI PENGEMBANGAN SIGNIFIKAN

### 1. Real-time Progress Indicator


```tsx
// ═══════ REAL-TIME PROGRESS TRACKER ═══════
function RealTimeProgressTracker({ 
    currentStep, 
    totalSteps, 
    stepDetails 
}: ProgressTrackerProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <motion.div
            className={cn(GLASS_CARD, "sticky top-4 z-10")}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Progress Absensi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentStep} dari {totalSteps} langkah selesai
                    </p>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                    {Math.round(progress)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Step Details */}
            <div className="mt-4 space-y-2">
                {stepDetails.map((step, index) => (
                    <motion.div
                        key={step.id}
                        className={cn(
                            "flex items-center gap-3 rounded-lg p-2 transition-colors",
                            step.completed 
                                ? "bg-green-50 dark:bg-green-900/20" 
                                : index === currentStep 
                                    ? "bg-indigo-50 dark:bg-indigo-900/20"
                                    : "bg-gray-50 dark:bg-gray-800/50"
                        )}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            step.completed 
                                ? "bg-green-500 text-white" 
                                : index === currentStep
                                    ? "bg-indigo-500 text-white animate-pulse"
                                    : "bg-gray-300 text-gray-600"
                        )}>
                            {step.completed ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {step.title}
                            </p>
                            {step.timestamp && (
                                <p className="text-xs text-gray-500">
                                    {new Date(step.timestamp).toLocaleTimeString('id-ID')}
                                </p>
                            )}
                        </div>
                        {index === currentStep && !step.completed && (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
```

### 2. Smart Camera Quality Indicator

```tsx
// ═══════ CAMERA QUALITY INDICATOR ═══════
function CameraQualityIndicator() {
    const [quality, setQuality] = useState<'excellent' | 'good' | 'poor'>('good');
    const [metrics, setMetrics] = useState({
        brightness: 0,
        sharpness: 0,
        faceDetected: false,
    });

    useEffect(() => {
        if (cameraPhase === 'selfie' && selfieVideoRef.current) {
            const interval = setInterval(() => {
                analyzeCameraQuality();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [cameraPhase]);

    const analyzeCameraQuality = () => {
        // Simplified quality check
        const video = selfieVideoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Calculate brightness
            let totalBrightness = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                totalBrightness += (r + g + b) / 3;
            }
            const avgBrightness = totalBrightness / (imageData.data.length / 4);
            
            // Determine quality
            if (avgBrightness > 100 && avgBrightness < 200) {
                setQuality('excellent');
            } else if (avgBrightness > 70 && avgBrightness < 220) {
                setQuality('good');
            } else {
                setQuality('poor');
            }
            
            setMetrics({
                brightness: Math.round(avgBrightness),
                sharpness: 85, // Simplified
                faceDetected: avgBrightness > 50, // Simplified
            });
        }
    };

    const qualityConfig = {
        excellent: {
            color: 'text-green-600',
            bg: 'bg-green-500/20',
            border: 'border-green-500',
            label: 'Sempurna',
            icon: CheckCircle2,
        },
        good: {
            color: 'text-amber-600',
            bg: 'bg-amber-500/20',
            border: 'border-amber-500',
            label: 'Baik',
            icon: AlertCircle,
        },
        poor: {
            color: 'text-red-600',
            bg: 'bg-red-500/20',
            border: 'border-red-500',
            label: 'Kurang',
            icon: XCircle,
        },
    };

    const config = qualityConfig[quality];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "absolute top-4 right-4 rounded-xl border-2 px-3 py-2 backdrop-blur-md",
                config.bg,
                config.border
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <div>
                    <p className={cn("text-xs font-semibold", config.color)}>
                        Kualitas: {config.label}
                    </p>
                    <div className="mt-1 flex gap-2 text-[10px]">
                        <span>Cahaya: {metrics.brightness}</span>
                        <span>•</span>
                        <span>Ketajaman: {metrics.sharpness}%</span>
                    </div>
                </div>
            </div>
            
            {quality === 'poor' && (
                <p className="mt-2 text-[10px] text-red-600">
                    💡 Perbaiki pencahayaan untuk hasil terbaik
                </p>
            )}
        </motion.div>
    );
}
```

### 3. Attendance Success Animation

```tsx
// ═══════ SUCCESS CELEBRATION ANIMATION ═══════
function SuccessCelebration({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
            >
                {/* Confetti Effect */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-3 w-3 rounded-full"
                        style={{
                            background: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 4],
                            left: '50%',
                            top: '50%',
                        }}
                        animate={{
                            x: [0, (Math.random() - 0.5) * 400],
                            y: [0, (Math.random() - 0.5) * 400],
                            opacity: [1, 0],
                            scale: [1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            delay: i * 0.05,
                            ease: 'easeOut',
                        }}
                    />
                ))}

                {/* Success Card */}
                <div className={cn(
                    GLASS_CARD,
                    "relative z-10 max-w-md p-8 text-center"
                )}>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 1,
                        }}
                        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-2xl"
                    >
                        <CheckCircle2 className="h-12 w-12" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 text-3xl font-bold text-gray-900 dark:text-white"
                    >
                        Absensi Berhasil! 🎉
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-3 text-gray-600 dark:text-gray-400"
                    >
                        Kehadiran Anda telah tercatat dalam sistem
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 flex items-center justify-center gap-4"
                    >
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">+{gamification.xpGained}</p>
                            <p className="text-xs text-gray-600">XP Earned</p>
                        </div>
                        <div className="h-12 w-px bg-gray-300" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{gamification.currentStreak}</p>
                            <p className="text-xs text-gray-600">Day Streak</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
```

### 4. Offline Mode Support

```tsx
// ═══════ OFFLINE MODE INDICATOR ═══════
function OfflineModeIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
        >
            <div className="flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 shadow-lg dark:border-amber-800 dark:bg-amber-900/50">
                <Wifi className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Mode Offline - Data akan disinkronkan saat online
                </p>
            </div>
        </motion.div>
    );
}
```

---

## 📝 PENULISAN MATERI YANG RAPI & LENGKAP

### 1. Konsistensi Penulisan

```tsx
// ═══════ NAMING CONVENTION ═══════
// Gunakan konsistensi penamaan yang sama

// Components: PascalCase
function UnifiedCameraCard() {}
function ProgressRing() {}
function StepCard() {}

// Functions: camelCase
const startQRScanner = () => {};
const captureSelfie = () => {};
const handleSubmit = () => {};

// Constants: UPPER_SNAKE_CASE
const CAMERA_FLIP_MS = 600;
const FLOW_TOTAL = 4;
const GLASS_CARD = "...";

// Types: PascalCase
type CameraPhase = 'idle' | 'scanning' | 'flipping' | 'selfie' | 'done';
type ScanState = 'idle' | 'scanning' | 'success' | 'error';

// Props: PascalCase + Props suffix
interface UnifiedCameraCardProps {}
interface ProgressRingProps {}
```

### 2. Komentar yang Informatif

```tsx
// ═══════ SECTION HEADERS ═══════
// Gunakan format yang konsisten untuk section headers

// ═══════ STATE MANAGEMENT ═══════
// ═══════ CAMERA HANDLERS ═══════
// ═══════ LOCATION HANDLERS ═══════
// ═══════ SUBMISSION HANDLERS ═══════
// ═══════ EFFECTS ═══════
// ═══════ RENDER ═══════

// Inline comments untuk logika kompleks
// 1. Check permission first
// 2. Stop any existing scanner
// 3. Wait for cleanup
// 4. Initialize new scanner
```

### 3. Error Messages yang Jelas

```tsx
// ═══════ USER-FRIENDLY ERROR MESSAGES ═══════
const ERROR_MESSAGES = {
    CAMERA_DENIED: 'Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.',
    CAMERA_NOT_FOUND: 'Kamera tidak ditemukan pada perangkat ini.',
    CAMERA_IN_USE: 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba lagi.',
    QR_SCAN_FAILED: 'Gagal memindai QR code. Pastikan QR code terlihat jelas dan coba lagi.',
    SELFIE_FAILED: 'Gagal mengambil selfie. Silakan coba lagi.',
    LOCATION_DENIED: 'Akses lokasi ditolak. Aktifkan GPS dan izinkan akses lokasi.',
    LOCATION_TIMEOUT: 'Waktu tunggu lokasi habis. Pastikan GPS aktif dan coba lagi.',
    SUBMIT_FAILED: 'Gagal mengirim absensi. Periksa koneksi internet dan coba lagi.',
    NETWORK_ERROR: 'Tidak ada koneksi internet. Data akan disimpan dan dikirim saat online.',
};

// Usage
toast.error(ERROR_MESSAGES.CAMERA_DENIED);
```

---

## 🧪 TESTING CHECKLIST

### Pre-Deployment Testing

```markdown
## Camera Functionality
- [ ] QR scanner dapat dibuka tanpa error
- [ ] QR scanner dapat mendeteksi QR code
- [ ] QR scanner dapat di-stop dengan benar
- [ ] Selfie camera dapat dibuka tanpa error
- [ ] Selfie dapat diambil dengan benar
- [ ] Camera cleanup berjalan saat unmount
- [ ] Permission guide muncul saat akses ditolak

## UI/UX Consistency
- [ ] Header gradient sama dengan dashboard admin
- [ ] Icon header tanpa container (langsung gambar)
- [ ] Warna icon matching dengan container card
- [ ] Tombol kembali sama dengan menu lain
- [ ] Responsive mobile sama dengan dashboard
- [ ] Glassmorphism cards konsisten
- [ ] Animasi smooth tanpa jank

## Data & Content
- [ ] Tidak ada data dummy
- [ ] Empty state ditampilkan dengan benar
- [ ] Data dari props ditampilkan benar
- [ ] Error messages jelas dan informatif

## Responsive Design
- [ ] Mobile (375px): Layout rapi
- [ ] Tablet (768px): Layout optimal
- [ ] Desktop (1024px+): Layout maksimal
- [ ] Landscape mode: Tidak broken

## Browser Compatibility
- [ ] Chrome: Semua fitur berfungsi
- [ ] Safari: Semua fitur berfungsi
- [ ] Firefox: Semua fitur berfungsi
- [ ] Edge: Semua fitur berfungsi

## Performance
- [ ] Camera load < 2 detik
- [ ] Flip animation smooth 60fps
- [ ] No memory leaks
- [ ] Bundle size optimal
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (URGENT)
1. ✅ Fix camera permission check
2. ✅ Fix QR scanner cleanup
3. ✅ Fix selfie camera cleanup
4. ✅ Add proper error handling
5. ✅ Add permission guide

### Phase 2: UI/UX Consistency (HIGH)
6. ✅ Update header gradient
7. ✅ Remove icon container
8. ✅ Match icon colors with cards
9. ✅ Update back button style
10. ✅ Fix mobile responsive

### Phase 3: Data & Content (HIGH)
11. ✅ Remove all dummy data
12. ✅ Add empty states
13. ✅ Update error messages
14. ✅ Add loading states

### Phase 4: Innovations (MEDIUM)
15. ✅ Add progress tracker
16. ✅ Add camera quality indicator
17. ✅ Add success celebration
18. ✅ Add offline mode support

### Phase 5: Polish (LOW)
19. ✅ Optimize animations
20. ✅ Add micro-interactions
21. ✅ Improve accessibility
22. ✅ Add analytics tracking

---

## 📚 COMPLETE CODE STRUCTURE

```
resources/js/pages/user/absen.tsx
├── Imports
├── Types & Interfaces
├── Constants
├── Helper Functions
├── Main Component
│   ├── State Management
│   ├── Permission Handlers
│   ├── Camera Handlers
│   ├── Location Handlers
│   ├── Submission Handlers
│   ├── Effects
│   └── Render
├── Sub-Components
│   ├── AbsensiHeader
│   ├── UnifiedCameraCard
│   ├── ProgressRing
│   ├── StatusRingOverlay
│   ├── StepCard
│   ├── LocationCard
│   ├── GamificationCard
│   ├── SocialProofCard
│   ├── CameraPermissionGuide
│   ├── RealTimeProgressTracker
│   ├── CameraQualityIndicator
│   ├── SuccessCelebration
│   ├── OfflineModeIndicator
│   └── StickySubmitFooter
└── Export
```

---

## ✅ FINAL CHECKLIST

### Before Commit
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] All console.logs removed (except errors)
- [ ] All dummy data removed
- [ ] All TODOs addressed
- [ ] Code formatted with Prettier
- [ ] Comments added for complex logic
- [ ] Error handling complete

### Before Deploy
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] Browser testing complete
- [ ] Mobile testing complete
- [ ] Performance optimized
- [ ] Bundle size checked
- [ ] Documentation updated

---

**Document Version**: 2.0.0  
**Last Updated**: 2026-03-12  
**Status**: ✅ Ready for Implementation  
**Priority**: 🔴 CRITICAL

