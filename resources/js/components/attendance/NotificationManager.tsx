import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notificationService } from '@/services/SmartNotificationService'

export function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [locationEnabled, setLocationEnabled] = useState(false)

    useEffect(() => {
        if ('Notification' in window) setPermission(Notification.permission)
    }, [])

    const requestPermission = async () => {
        const result = await Notification.requestPermission()
        setPermission(result)
    }

    const toggleLocation = () => {
        if (locationEnabled) {
            notificationService.stopLocationWatch()
            setLocationEnabled(false)
        } else {
            notificationService.startLocationWatch({ lat: -6.3384, lng: 106.7314 })
            setLocationEnabled(true)
        }
    }

    return (
        <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.005 }} className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {permission === 'granted' ? <Bell className="w-5 h-5 text-emerald-600" /> : <BellOff className="w-5 h-5 text-neutral-400" />}
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">Notifikasi</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {permission === 'granted' ? 'Aktif — Kamu akan menerima reminder' : 'Nonaktif — Aktifkan untuk reminder'}
                            </p>
                        </div>
                    </div>
                    {permission !== 'granted' && <Button onClick={requestPermission} size="sm">Aktifkan</Button>}
                </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.005 }} className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${locationEnabled ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">Notifikasi Lokasi</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {locationEnabled ? 'Aktif — Reminder saat di kampus' : 'Nonaktif — Tidak ada reminder lokasi'}
                            </p>
                        </div>
                    </div>
                    <Button onClick={toggleLocation} size="sm" variant={locationEnabled ? 'destructive' : 'default'}>
                        {locationEnabled ? 'Matikan' : 'Aktifkan'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
