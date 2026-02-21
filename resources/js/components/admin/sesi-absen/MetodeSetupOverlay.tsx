import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, X, Save, QrCode, Camera, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MetodeSetupOverlayProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    onClose: () => void;
}

export default function MetodeSetupOverlay({ formData, updateField, onClose }: MetodeSetupOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-slate-50 dark:bg-neutral-950 overflow-y-auto"
        >
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">Konfigurasi Metode Absensi</h2>
                        <p className="text-xs text-slate-500">Atur parameter lanjutan untuk metode yang dipilih.</p>
                    </div>
                </div>
                <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-500/20">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Konfigurasi
                </Button>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-8 mt-6">

                {/* Fallback jika tidak ada opsi lanjutan yang dipilih */}
                {!formData.metode_absensi.includes('qr') && !formData.metode_absensi.includes('selfie') && (
                    <div className="text-center p-12 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-slate-300 dark:border-neutral-700">
                        <Settings className="w-12 h-12 text-slate-300 dark:text-neutral-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Tidak Ada Konfigurasi Tambahan</h3>
                        <p className="text-sm text-slate-500 mt-2">Pilih metode <strong>QR Code Dynamic</strong> atau <strong>AI Face Selfie</strong> pada form sebelumnya untuk melihat opsi lanjutan di sini.</p>
                    </div>
                )}

                {/* Konfigurasi QR Code */}
                {formData.metode_absensi.includes('qr') && (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-neutral-800">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Parameter Dinamis QR Code</h3>
                                <p className="text-xs text-slate-500">Mencegah kecurangan mahasiswa berbagi foto QR.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">Interval Refresh Otomatis (Detik)</Label>
                                <Select defaultValue="30">
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-neutral-800">
                                        <SelectValue placeholder="Pilih Interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="static">QR Statis (Berlaku Satu Sesi Penuh)</SelectItem>
                                        <SelectItem value="15">Setiap 15 Detik</SelectItem>
                                        <SelectItem value="30">Setiap 30 Detik (Disarankan)</SelectItem>
                                        <SelectItem value="60">Setiap 60 Detik (1 Menit)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500 mt-1">QR akan berganti kode dan membatalkan hasil scan kode sebelumnya jika sudah kadaluarsa.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Konfigurasi AI Selfie */}
                {formData.metode_absensi.includes('selfie') && (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-neutral-800">
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                                <Camera className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Parameter AI Face Match</h3>
                                <p className="text-xs text-slate-500">Sensitivitas pencocokan wajah dan deteksi benda palsu / foto cetak.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">Tingkat Ketegasan (Strictness Level)</Label>
                                <Select defaultValue="high">
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-neutral-800">
                                        <SelectValue placeholder="Pilih Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Rendah (Toleransi tinggi, minimalisir gagal scan)</SelectItem>
                                        <SelectItem value="medium">Sedang (Standard Akademik)</SelectItem>
                                        <SelectItem value="high">Tinggi (Menuntut pencahayaan & kemiringan wajah sempurna)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700 dark:text-slate-300">Anti-Spoofing (Liveness Check)</Label>
                                <Select defaultValue="motion">
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-neutral-800">
                                        <SelectValue placeholder="Pilih Liveness Check" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Hanya Foto Statis Biasa (Kurang Aman)</SelectItem>
                                        <SelectItem value="motion">Wajib Mengedip / Tersenyum Singkat (Sangat Aman)</SelectItem>
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
