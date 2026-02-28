import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { offlineService } from '@/services/OfflineAttendanceService'

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [queueStatus, setQueueStatus] = useState({ total: 0, pending: 0, syncing: 0, failed: 0 })

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        const interval = setInterval(() => {
            setQueueStatus(offlineService.getQueueStatus())
        }, 2000)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(interval)
        }
    }, [])

    if (isOnline && queueStatus.pending === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
            >
                <div className={`px-6 py-3 rounded-full backdrop-blur-sm shadow-lg ${isOnline ? 'bg-blue-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                    <div className="flex items-center gap-3">
                        {isOnline ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Menyinkronkan {queueStatus.pending} absensi...</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-5 h-5" />
                                <span className="font-medium">Mode Offline — {queueStatus.total} absensi tertunda</span>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
