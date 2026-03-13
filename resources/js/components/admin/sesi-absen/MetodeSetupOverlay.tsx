import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Camera, QrCode, Save, Settings, X } from 'lucide-react';

interface MetodeSetupOverlayProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    onClose: () => void;
}

export default function MetodeSetupOverlay({
    formData,
    updateField,
    onClose,
}: MetodeSetupOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-neutral-950"
        >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-xl font-bold text-transparent">
                            Konfigurasi Metode Absensi
                        </h2>
                        <p className="text-xs text-slate-500">
                            Atur parameter lanjutan untuk metode yang dipilih.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={onClose}
                    className="rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-700"
                >
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Konfigurasi
                </Button>
            </div>

            <div className="mx-auto mt-6 max-w-3xl space-y-8 p-6">
                {/* Fallback jika tidak ada opsi lanjutan yang dipilih */}
                {!formData.metode_absensi.includes('qr') &&
                    !formData.metode_absensi.includes('selfie') && (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
                            <Settings className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-neutral-600" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                Tidak Ada Konfigurasi Tambahan
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Pilih metode <strong>QR Code Dynamic</strong>{' '}
                                atau <strong>AI Face Selfie</strong> pada form
                                sebelumnya untuk melihat opsi lanjutan di sini.
                            </p>
                        </div>
                    )}

                {/* Konfigurasi QR Code */}
                {formData.metode_absensi.includes('qr') && (
                    <div className="animate-in rounded-3xl border border-slate-200 bg-white p-6 shadow-sm fade-in slide-in-from-bottom-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-6 dark:border-neutral-800">
                            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <QrCode className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    Parameter Dinamis QR Code
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Mencegah kecurangan mahasiswa berbagi foto
                                    QR.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Interval Refresh Otomatis (Detik)
                                </Label>
                                <Select defaultValue="30">
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-black/20">
                                        <SelectValue placeholder="Pilih Interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="static">
                                            QR Statis (Berlaku Satu Sesi Penuh)
                                        </SelectItem>
                                        <SelectItem value="15">
                                            Setiap 15 Detik
                                        </SelectItem>
                                        <SelectItem value="30">
                                            Setiap 30 Detik (Disarankan)
                                        </SelectItem>
                                        <SelectItem value="60">
                                            Setiap 60 Detik (1 Menit)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="mt-1 text-xs text-slate-500">
                                    QR akan berganti kode dan membatalkan hasil
                                    scan kode sebelumnya jika sudah kadaluarsa.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Konfigurasi AI Selfie */}
                {formData.metode_absensi.includes('selfie') && (
                    <div className="animate-in rounded-3xl border border-slate-200 bg-white p-6 shadow-sm fade-in slide-in-from-bottom-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-6 dark:border-neutral-800">
                            <div className="rounded-xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                <Camera className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    Parameter AI Face Match
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Sensitivitas pencocokan wajah dan deteksi
                                    benda palsu / foto cetak.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Tingkat Ketegasan (Strictness Level)
                                </Label>
                                <Select defaultValue="high">
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-black/20">
                                        <SelectValue placeholder="Pilih Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">
                                            Rendah (Toleransi tinggi,
                                            minimalisir gagal scan)
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            Sedang (Standard Akademik)
                                        </SelectItem>
                                        <SelectItem value="high">
                                            Tinggi (Menuntut pencahayaan &
                                            kemiringan wajah sempurna)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Anti-Spoofing (Liveness Check)
                                </Label>
                                <Select defaultValue="motion">
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-black/20">
                                        <SelectValue placeholder="Pilih Liveness Check" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Hanya Foto Statis Biasa (Kurang
                                            Aman)
                                        </SelectItem>
                                        <SelectItem value="motion">
                                            Wajib Mengedip / Tersenyum Singkat
                                            (Sangat Aman)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
