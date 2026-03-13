import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, Focus, QrCode, XCircle, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SmartQRScannerProps {
    onScanSuccess: (token: string) => void;
    onScanError?: (error: string) => void;
    disabled?: boolean;
}

export function SmartQRScanner({
    onScanSuccess,
    onScanError,
    disabled,
}: SmartQRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
        null,
    );
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const handleSuccess = useCallback(
        (decodedText: string) => {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setScanResult('success');

            stopScanner();
            onScanSuccess(decodedText);
        },
        [onScanSuccess],
    );

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode('smart-qr-reader');
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 15,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                handleSuccess,
                () => {}, // silent fail when no QR detected
            );
            setIsScanning(true);
        } catch (error) {
            console.error('Scanner error:', error);
            onScanError?.('Gagal memulai scanner');
        }
    };

    const stopScanner = () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(() => {});
            setIsScanning(false);
        }
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="relative">
            <div className="relative overflow-hidden rounded-xl bg-neutral-900">
                <div id="smart-qr-reader" className="aspect-square w-full" />

                {/* AR Overlay */}
                <AnimatePresence>
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-0"
                        >
                            {/* Corner Guides */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative h-64 w-64">
                                    {[
                                        'top-0 left-0 border-t-4 border-l-4',
                                        'top-0 right-0 border-t-4 border-r-4',
                                        'bottom-0 left-0 border-b-4 border-l-4',
                                        'bottom-0 right-0 border-b-4 border-r-4',
                                    ].map((pos, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.4,
                                            }}
                                            className={cn(
                                                'absolute h-12 w-12 border-emerald-500',
                                                pos,
                                            )}
                                        />
                                    ))}
                                    {/* Scanning Line */}
                                    <motion.div
                                        animate={{ y: [0, 256, 0] }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                        className="absolute right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                                    />
                                </div>
                            </div>

                            {/* Focus Indicator */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                            >
                                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                                    <Focus className="h-4 w-4" />
                                    <span>Fokuskan QR Code</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scan Result Overlay */}
                <AnimatePresence>
                    {scanResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        >
                            {scanResult === 'success' ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    className="text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500">
                                        <CheckCircle className="h-12 w-12 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-bold text-white">
                                        Scan Berhasil!
                                    </h3>
                                    <p className="text-emerald-400">
                                        QR Code terverifikasi
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    animate={{ x: [-10, 10, -10, 10, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-500">
                                        <XCircle className="h-12 w-12 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-bold text-white">
                                        QR Tidak Valid
                                    </h3>
                                    <p className="text-red-400">
                                        Coba scan ulang
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-4 flex justify-center gap-4">
                {!isScanning ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startScanner}
                        disabled={disabled}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <QrCode className="h-5 w-5" />
                        Mulai Scan
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopScanner}
                        className="rounded-xl bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
                    >
                        Stop Scan
                    </motion.button>
                )}
            </div>

            {/* Tips */}
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex gap-3">
                    <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="mb-1 font-semibold">Tips Scan QR:</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Pastikan QR code terlihat jelas</li>
                            <li>• Jaga jarak 20-30 cm dari layar</li>
                            <li>• Hindari pantulan cahaya</li>
                            <li>• Tunggu hingga auto-capture</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
