import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Building, MapPin, Navigation, Save, X } from 'lucide-react';

interface ZonaSetupOverlayProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    onClose: () => void;
}

export default function ZonaSetupOverlay({
    formData,
    updateField,
    onClose,
}: ZonaSetupOverlayProps) {
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
                        <h2 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent">
                            Pengaturan Zona Lokasi
                        </h2>
                        <p className="text-xs text-slate-500">
                            Geofencing & Ruangan Sesi
                        </p>
                    </div>
                </div>
                <Button
                    onClick={onClose}
                    className="rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                >
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Zona
                </Button>
            </div>

            <div className="mx-auto mt-6 max-w-4xl space-y-8 p-6">
                <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <Building className="h-4 w-4" /> Ruangan / Gedung{' '}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.ruangan_id}
                            onValueChange={(v: string) =>
                                updateField('ruangan_id', v)
                            }
                        >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-black/20">
                                <SelectValue placeholder="Pilih Ruangan di Kampus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="r1">
                                    Gedung A - Ruang A101 (Kapasitas: 40)
                                </SelectItem>
                                <SelectItem value="r2">
                                    Lab Komputer Dasar (Kapasitas: 30)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:bg-emerald-900/10">
                        <div className="mb-4 flex items-center justify-between">
                            <Label className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                                <MapPin className="h-5 w-5" /> Geofencing / Peta
                                Lokasi
                            </Label>
                            <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                                <Navigation className="h-3 w-3" /> GPS Tracking
                                Aktif
                            </div>
                        </div>

                        {/* Peta Mockup Besar */}
                        <div className="relative mb-6 flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-200 dark:border-neutral-700 dark:bg-neutral-800">
                            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/15/26354/16723.png')] bg-cover bg-center opacity-80 dark:opacity-50" />

                            {/* Titik Radius */}
                            <div className="relative z-10 flex h-48 w-48 animate-pulse items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/20">
                                <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                                    <MapPin className="h-10 w-10 text-emerald-600 drop-shadow-md" />
                                    <div className="mt-1 h-1 w-3 rounded-[100%] bg-black/20 blur-[1px]"></div>
                                </div>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute right-4 bottom-4 bg-white/90 text-black shadow-lg hover:bg-white"
                            >
                                <Navigation className="mr-2 h-4 w-4" /> Update
                                ke Titik Saat Ini
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Koordinat Latitude & Longitude
                                </Label>
                                <Input
                                    defaultValue="-6.200000, 106.816666"
                                    className="h-12 border-slate-200 bg-white font-mono text-sm dark:border-neutral-800 dark:bg-black/40"
                                />
                                <p className="text-xs text-slate-500">
                                    Pusat absensi (titik keberadaan dosen)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Radius Toleransi (Meter)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={formData.zona_radius}
                                        className="h-12 flex-1 border-slate-200 bg-white dark:border-neutral-800 dark:bg-black/40"
                                        onChange={(e) =>
                                            updateField(
                                                'zona_radius',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    <div className="rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-500 dark:bg-neutral-800">
                                        M
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Jarak maksimal mahasiswa dari titik pusat.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
