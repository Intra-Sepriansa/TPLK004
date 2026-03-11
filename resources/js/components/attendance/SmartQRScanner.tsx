import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import { QrCode, CheckCircle, XCircle, Zap, Focus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartQRScannerProps {
    onScanSuccess: (token: string) => void
    onScanError?: (error: string) => void
    disabled?: boolean
}

export function SmartQRScanner({ onScanSuccess, onScanError, disabled }: SmartQRScannerProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
    const scannerRef = useRef<Html5Qrcode | null>(null)

    const handleSuccess = useCallback((decodedText: string) => {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        setScanResult('success')

        stopScanner()
        onScanSuccess(decodedText)
    }, [onScanSuccess])

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode('smart-qr-reader')
            scannerRef.current = scanner
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                handleSuccess,
                () => { } // silent fail when no QR detected
            )
            setIsScanning(true)
        } catch (error) {
            console.error('Scanner error:', error)
            onScanError?.('Gagal memulai scanner')
        }
    }

    const stopScanner = () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(() => { })
            setIsScanning(false)
        }
    }

    useEffect(() => {
        return () => { stopScanner() }
    }, [])

    return (
        <div className="relative">
            <div className="relative bg-neutral-900 rounded-xl overflow-hidden">
                <div id="smart-qr-reader" className="w-full aspect-square" />

                {/* AR Overlay */}
                <AnimatePresence>
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {/* Corner Guides */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-64 h-64">
                                    {[
                                        'top-0 left-0 border-t-4 border-l-4',
                                        'top-0 right-0 border-t-4 border-r-4',
                                        'bottom-0 left-0 border-b-4 border-l-4',
                                        'bottom-0 right-0 border-b-4 border-r-4',
                                    ].map((pos, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                            className={cn('absolute w-12 h-12 border-emerald-500', pos)}
                                        />
                                    ))}
                                    {/* Scanning Line */}
                                    <motion.div
                                        animate={{ y: [0, 256, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                                    />
                                </div>
                            </div>

                            {/* Focus Indicator */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                            >
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                                    <Focus className="w-4 h-4" />
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
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Scan Berhasil!</h3>
                                    <p className="text-emerald-400">QR Code terverifikasi</p>
                                </motion.div>
                            ) : (
                                <motion.div animate={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }} className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                                        <XCircle className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">QR Tidak Valid</h3>
                                    <p className="text-red-400">Coba scan ulang</p>
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
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <QrCode className="w-5 h-5" />
                        Mulai Scan
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopScanner}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
                    >
                        Stop Scan
                    </motion.button>
                )}
            </div>

            {/* Tips */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-semibold mb-1">Tips Scan QR:</p>
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
    )
}
