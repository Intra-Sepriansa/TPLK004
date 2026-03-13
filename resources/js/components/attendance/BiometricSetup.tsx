import { Button } from '@/components/ui/button';
import { biometricService } from '@/services/BiometricService';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle,
    Fingerprint,
    Loader2,
    Shield,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function BiometricSetup() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const check = async () => {
            const available = await biometricService.checkAvailability();
            setIsAvailable(available);
            setIsRegistered(biometricService.isRegistered());
        };
        check();
    }, []);

    const handleRegister = async () => {
        setIsLoading(true);
        setStatus('idle');
        try {
            const success = await biometricService.register('user_123');
            setStatus(success ? 'success' : 'error');
            if (success) setIsRegistered(true);
        } catch {
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthenticate = async () => {
        setIsLoading(true);
        setStatus('idle');
        try {
            const success = await biometricService.authenticate();
            setStatus(success ? 'success' : 'error');
        } catch {
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        await biometricService.remove();
        setIsRegistered(false);
        setStatus('idle');
    };

    if (!isAvailable) {
        return (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex gap-3">
                    <Shield className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                    <div>
                        <h3 className="mb-1 font-semibold text-yellow-900 dark:text-yellow-100">
                            Biometric Tidak Tersedia
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Perangkat Anda tidak mendukung Face ID, Touch ID,
                            atau fingerprint.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${isRegistered ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                    >
                        <Fingerprint
                            className={`h-6 w-6 ${isRegistered ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-neutral-900 dark:text-white">
                            Biometric Authentication
                        </h3>
                        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {isRegistered
                                ? 'Biometric sudah terdaftar. Gunakan untuk verifikasi cepat.'
                                : 'Daftarkan fingerprint atau Face ID untuk keamanan tambahan.'}
                        </p>
                        <div className="flex gap-2">
                            {!isRegistered ? (
                                <Button
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Mendaftar...
                                        </>
                                    ) : (
                                        <>
                                            <Fingerprint className="mr-2 h-4 w-4" />
                                            Daftarkan Biometric
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleAuthenticate}
                                        disabled={isLoading}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifikasi...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="mr-2 h-4 w-4" />
                                                Verifikasi Sekarang
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleRemove}
                                        variant="outline"
                                        disabled={isLoading}
                                    >
                                        Hapus
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {status !== 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800"
                        >
                            {status === 'success' ? (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        {isRegistered
                                            ? 'Verifikasi berhasil!'
                                            : 'Biometric berhasil didaftarkan!'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <XCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        Gagal. Silakan coba lagi.
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex gap-3">
                    <Shield className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Keamanan Data
                        </h4>
                        <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>
                                • Data biometric disimpan di secure enclave
                                perangkat
                            </li>
                            <li>
                                • Tidak ada data biometric yang dikirim ke
                                server
                            </li>
                            <li>
                                • Hanya public key yang disimpan untuk
                                verifikasi
                            </li>
                            <li>
                                • Mendukung Face ID, Touch ID, dan fingerprint
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
