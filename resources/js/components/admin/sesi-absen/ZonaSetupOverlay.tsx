import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Save, Navigation, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ZonaSetupOverlayProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    onClose: () => void;
}

export default function ZonaSetupOverlay({ formData, updateField, onClose }: ZonaSetupOverlayProps) {
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
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Pengaturan Zona Lokasi</h2>
                        <p className="text-xs text-slate-500">Geofencing & Ruangan Sesi</p>
                    </div>
                </div>
                <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Zona
                </Button>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-8 mt-6">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Building className="w-4 h-4" /> Ruangan / Gedung <span className="text-red-500">*</span></Label>
                        <Select value={formData.ruangan_id} onValueChange={(v: string) => updateField('ruangan_id', v)}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-neutral-800">
                                <SelectValue placeholder="Pilih Ruangan di Kampus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="r1">Gedung A - Ruang A101 (Kapasitas: 40)</SelectItem>
                                <SelectItem value="r2">Lab Komputer Dasar (Kapasitas: 30)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><MapPin className="w-5 h-5" /> Geofencing / Peta Lokasi</Label>
                            <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex gap-1 items-center">
                                <Navigation className="w-3 h-3" /> GPS Tracking Aktif
                            </div>
                        </div>

                        {/* Peta Mockup Besar */}
                        <div className="w-full h-80 bg-slate-200 dark:bg-neutral-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden relative border-2 border-slate-300 dark:border-neutral-700">
                            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/15/26354/16723.png')] bg-cover bg-center opacity-80 dark:opacity-50" />

                            {/* Titik Radius */}
                            <div className="relative z-10 w-48 h-48 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center animate-pulse">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <MapPin className="w-10 h-10 text-emerald-600 drop-shadow-md" />
                                    <div className="w-3 h-1 bg-black/20 rounded-[100%] mt-1 blur-[1px]"></div>
                                </div>
                            </div>

                            <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 bg-white/90 text-black hover:bg-white shadow-lg">
                                <Navigation className="w-4 h-4 mr-2" /> Update ke Titik Saat Ini
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Koordinat Latitude & Longitude</Label>
                                <Input defaultValue="-6.200000, 106.816666" className="h-12 text-sm font-mono bg-white dark:bg-black/40 border-slate-200 dark:border-neutral-800" />
                                <p className="text-xs text-slate-500">Pusat absensi (titik keberadaan dosen)</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Radius Toleransi (Meter)</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={formData.zona_radius}
                                        className="h-12 flex-1 bg-white dark:bg-black/40 border-slate-200 dark:border-neutral-800"
                                        onChange={e => updateField('zona_radius', Number(e.target.value))}
                                    />
                                    <div className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-xl text-sm font-bold text-slate-500">M</div>
                                </div>
                                <p className="text-xs text-slate-500">Jarak maksimal mahasiswa dari titik pusat.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
