import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { biometricService } from '@/services/BiometricService'

export function BiometricSetup() {
    const [isAvailable, setIsAvailable] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    useEffect(() => {
        const check = async () => {
            const available = await biometricService.checkAvailability()
            setIsAvailable(available)
            setIsRegistered(biometricService.isRegistered())
        }
        check()
    }, [])

    const handleRegister = async () => {
        setIsLoading(true)
        setStatus('idle')
        try {
            const success = await biometricService.register('user_123')
            setStatus(success ? 'success' : 'error')
            if (success) setIsRegistered(true)
        } catch { setStatus('error') }
        finally { setIsLoading(false) }
    }

    const handleAuthenticate = async () => {
        setIsLoading(true)
        setStatus('idle')
        try {
            const success = await biometricService.authenticate()
            setStatus(success ? 'success' : 'error')
        } catch { setStatus('error') }
        finally { setIsLoading(false) }
    }

    const handleRemove = async () => {
        await biometricService.remove()
        setIsRegistered(false)
        setStatus('idle')
    }

    if (!isAvailable) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Biometric Tidak Tersedia</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Perangkat Anda tidak mendukung Face ID, Touch ID, atau fingerprint.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl"
            >
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isRegistered ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        <Fingerprint className={`w-6 h-6 ${isRegistered ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Biometric Authentication</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            {isRegistered ? 'Biometric sudah terdaftar. Gunakan untuk verifikasi cepat.' : 'Daftarkan fingerprint atau Face ID untuk keamanan tambahan.'}
                        </p>
                        <div className="flex gap-2">
                            {!isRegistered ? (
                                <Button onClick={handleRegister} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mendaftar...</> : <><Fingerprint className="w-4 h-4 mr-2" />Daftarkan Biometric</>}
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={handleAuthenticate} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifikasi...</> : <><Shield className="w-4 h-4 mr-2" />Verifikasi Sekarang</>}
                                    </Button>
                                    <Button onClick={handleRemove} variant="outline" disabled={isLoading}>Hapus</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {status !== 'idle' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"
                        >
                            {status === 'success' ? (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{isRegistered ? 'Verifikasi berhasil!' : 'Biometric berhasil didaftarkan!'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <XCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Gagal. Silakan coba lagi.</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-2">Keamanan Data</h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Data biometric disimpan di secure enclave perangkat</li>
                            <li>• Tidak ada data biometric yang dikirim ke server</li>
                            <li>• Hanya public key yang disimpan untuk verifikasi</li>
                            <li>• Mendukung Face ID, Touch ID, dan fingerprint</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
